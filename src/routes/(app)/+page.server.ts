import { db } from "$lib/server/db";
import { leads, visits, activities } from "$lib/server/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user!;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get week start (Monday)
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  if (user.role === "PH") {
    // PH Dashboard: my leads, today's visits, this week's contacts

    // Count my leads
    const [myLeadsCount] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.assignedTo, user.id));

    // Count today's visits
    const [todayVisitsCount] = await db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          eq(visits.userId, user.id),
          gte(visits.scheduledAt, today),
          lte(visits.scheduledAt, tomorrow),
          eq(visits.status, "PLANNED")
        )!
      );

    // Count this week's contacts
    const [weekContactsCount] = await db
      .select({ count: count() })
      .from(activities)
      .where(
        and(
          eq(activities.userId, user.id),
          gte(activities.createdAt, weekStart)
        )!
      );

    // Get today's visits for display
    const todayVisits = await db
      .select({
        visit: visits,
        lead: {
          id: leads.id,
          companyName: leads.companyName,
          city: leads.city,
          contactPerson: leads.contactPerson,
        },
      })
      .from(visits)
      .leftJoin(leads, eq(visits.leadId, leads.id))
      .where(
        and(
          eq(visits.userId, user.id),
          gte(visits.scheduledAt, today),
          lte(visits.scheduledAt, tomorrow),
          eq(visits.status, "PLANNED")
        )!
      )
      .orderBy(visits.scheduledAt);

    // Get recent leads (last 5)
    const recentLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.assignedTo, user.id))
      .orderBy(leads.createdAt)
      .limit(5);

    return {
      stats: {
        leadsCount: myLeadsCount?.count || 0,
        todayVisitsCount: todayVisitsCount?.count || 0,
        weekContactsCount: weekContactsCount?.count || 0,
      },
      todayVisits,
      recentLeads,
    };
  } else {
    // MANAGER Dashboard: all stats

    // Count all leads
    const [allLeadsCount] = await db
      .select({ count: count() })
      .from(leads);

    // Count all today's visits
    const [allTodayVisitsCount] = await db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          gte(visits.scheduledAt, today),
          lte(visits.scheduledAt, tomorrow),
          eq(visits.status, "PLANNED")
        )!
      );

    // Count this week's contacts
    const [allWeekContactsCount] = await db
      .select({ count: count() })
      .from(activities)
      .where(gte(activities.createdAt, weekStart));

    return {
      stats: {
        leadsCount: allLeadsCount?.count || 0,
        todayVisitsCount: allTodayVisitsCount?.count || 0,
        weekContactsCount: allWeekContactsCount?.count || 0,
      },
      todayVisits: [],
      recentLeads: [],
    };
  }
};
