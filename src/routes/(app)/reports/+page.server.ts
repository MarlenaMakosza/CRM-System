import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users, visits, activities, contracts } from "$lib/server/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user!;

  // Only managers can access reports
  if (user.role !== "MANAGER") {
    throw error(403, "Brak dostępu - tylko dla kierowników");
  }

  // Get filter parameters
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const phFilter = url.searchParams.get("ph");

  // Get all PH users
  const phUsers = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      territory: users.territory,
    })
    .from(users)
    .where(eq(users.role, "PH"));

  // Build date conditions
  const dateConditions = [];
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    dateConditions.push(gte(visits.scheduledAt, fromDate));
  }
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    dateConditions.push(lte(visits.scheduledAt, toDate));
  }

  // Calculate statistics for each PH
  const stats = await Promise.all(
    phUsers.map(async (ph) => {
      // Skip if filtering by specific PH
      if (phFilter && parseInt(phFilter) !== ph.id) {
        return null;
      }

      // Count visits (DONE status only)
      const visitConditions = [
        eq(visits.userId, ph.id),
        eq(visits.status, "DONE"),
        ...dateConditions,
      ];

      const [visitsCount] = await db
        .select({ count: count() })
        .from(visits)
        .where(and(...visitConditions)!);

      // Count phone calls
      const activityConditions = [eq(activities.userId, ph.id)];
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        activityConditions.push(gte(activities.createdAt, fromDate));
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        activityConditions.push(lte(activities.createdAt, toDate));
      }

      const [callsCount] = await db
        .select({ count: count() })
        .from(activities)
        .where(and(...activityConditions)!);

      // Count contracts
      const contractConditions = [eq(contracts.userId, ph.id)];
      if (dateFrom) {
        contractConditions.push(gte(contracts.signedAt, dateFrom));
      }
      if (dateTo) {
        contractConditions.push(lte(contracts.signedAt, dateTo));
      }

      const [contractsCount] = await db
        .select({ count: count() })
        .from(contracts)
        .where(and(...contractConditions)!);

      // Count planned visits (future only)
      const now = new Date();
      const [plannedVisitsCount] = await db
        .select({ count: count() })
        .from(visits)
        .where(
          and(
            eq(visits.userId, ph.id),
            eq(visits.status, "PLANNED"),
            gte(visits.scheduledAt, now)
          )!
        );

      return {
        ph,
        stats: {
          completedVisits: visitsCount?.count || 0,
          phoneCalls: callsCount?.count || 0,
          contracts: contractsCount?.count || 0,
          plannedVisits: plannedVisitsCount?.count || 0,
        },
      };
    })
  );

  // Filter out nulls (from PH filter)
  const filteredStats = stats.filter((s) => s !== null);

  return {
    stats: filteredStats,
    phUsers,
    filters: {
      dateFrom,
      dateTo,
      ph: phFilter,
    },
  };
};
