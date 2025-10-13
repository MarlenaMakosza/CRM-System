import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { visits, leads } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user!;
  const leadIdParam = url.searchParams.get("leadId");
  const fromActivity = url.searchParams.get("fromActivity");

  if (!leadIdParam) {
    throw redirect(302, "/leads");
  }

  const leadId = parseInt(leadIdParam);
  if (isNaN(leadId)) {
    throw redirect(302, "/leads");
  }

  // Get lead details
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId));

  if (!lead) {
    throw redirect(302, "/leads");
  }

  // Permission check: PH can only add visits to their own leads
  if (user.role === "PH" && lead.assignedTo !== user.id) {
    throw redirect(302, "/leads");
  }

  return {
    lead,
    fromActivity: fromActivity === "true",
  };
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const user = locals.user!;
    const leadIdParam = url.searchParams.get("leadId");

    if (!leadIdParam) {
      return fail(400, { error: "Lead ID is required" });
    }

    const leadId = parseInt(leadIdParam);
    const formData = await request.formData();

    const scheduledDate = formData.get("scheduledDate") as string;
    const scheduledTime = formData.get("scheduledTime") as string;
    const address = formData.get("address") as string;

    // Validation
    if (!scheduledDate) {
      return fail(400, {
        error: "Data wizyty jest wymagana",
        scheduledDate,
        scheduledTime,
        address,
      });
    }

    if (!scheduledTime) {
      return fail(400, {
        error: "Godzina wizyty jest wymagana",
        scheduledDate,
        scheduledTime,
        address,
      });
    }

    if (!address || address.trim().length === 0) {
      return fail(400, {
        error: "Adres wizyty jest wymagany",
        scheduledDate,
        scheduledTime,
        address,
      });
    }

    // Verify lead exists and user has access
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId));

    if (!lead) {
      return fail(404, { error: "Lead nie został znaleziony" });
    }

    if (user.role === "PH" && lead.assignedTo !== user.id) {
      return fail(403, { error: "Brak dostępu do tego leada" });
    }

    // Combine date and time into timestamp
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

    // Check for time conflicts (same user, same time, status PLANNED)
    const conflictingVisits = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.userId, user.id),
          eq(visits.scheduledAt, scheduledAt),
          eq(visits.status, "PLANNED")
        )!
      );

    if (conflictingVisits.length > 0) {
      return fail(400, {
        error: "Masz już zaplanowaną wizytę o tej godzinie",
        scheduledDate,
        scheduledTime,
        address,
      });
    }

    // Insert visit
    await db.insert(visits).values({
      leadId,
      userId: user.id,
      scheduledAt,
      address: address.trim(),
      status: "PLANNED",
    });

    // Redirect back to lead details
    throw redirect(303, `/leads/${leadId}`);
  },
};
