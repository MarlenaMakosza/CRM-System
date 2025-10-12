import { db } from "$lib/server/db";
import { visits, leads, users } from "$lib/server/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user!;

  // Get filter parameters
  const statusFilter = url.searchParams.get("status");
  const dateFilter = url.searchParams.get("date");

  // Build query conditions
  const conditions = [];

  // PH sees only their visits, Manager sees all
  if (user.role === "PH") {
    conditions.push(eq(visits.userId, user.id));
  }

  if (statusFilter) {
    conditions.push(eq(visits.status, statusFilter));
  }

  if (dateFilter) {
    // Filter by specific date
    const startOfDay = new Date(dateFilter);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateFilter);
    endOfDay.setHours(23, 59, 59, 999);

    conditions.push(
      and(
        gte(visits.scheduledAt, startOfDay),
        lte(visits.scheduledAt, endOfDay)
      )!
    );
  }

  // Fetch visits with lead and user info
  const visitsData = await db
    .select({
      visit: visits,
      lead: {
        id: leads.id,
        companyName: leads.companyName,
        city: leads.city,
        contactPerson: leads.contactPerson,
        phone: leads.phone,
      },
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        territory: users.territory,
      },
    })
    .from(visits)
    .leftJoin(leads, eq(visits.leadId, leads.id))
    .leftJoin(users, eq(visits.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(visits.scheduledAt));

  // Get today's date for default filter
  const today = new Date().toISOString().split("T")[0];

  return {
    visits: visitsData,
    filters: {
      status: statusFilter,
      date: dateFilter,
    },
    today,
  };
};
