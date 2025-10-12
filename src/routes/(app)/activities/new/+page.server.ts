import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { activities, leads } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user!;
  const leadIdParam = url.searchParams.get("leadId");

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

  // Permission check: PH can only add activities to their own leads
  if (user.role === "PH" && lead.assignedTo !== user.id) {
    throw redirect(302, "/leads");
  }

  return {
    lead,
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

    const activityDate = formData.get("activityDate") as string;
    const contactPersonName = (formData.get("contactPersonName") as string) || null;
    const outcome = formData.get("outcome") as string;
    const notes = formData.get("notes") as string;

    // Validation
    if (!activityDate) {
      return fail(400, {
        error: "Data kontaktu jest wymagana",
        activityDate,
        contactPersonName,
        outcome,
        notes,
      });
    }

    if (!outcome) {
      return fail(400, {
        error: "Wynik rozmowy jest wymagany",
        activityDate,
        contactPersonName,
        outcome,
        notes,
      });
    }

    if (!notes || notes.trim().length === 0) {
      return fail(400, {
        error: "Notatka jest wymagana",
        activityDate,
        contactPersonName,
        outcome,
        notes,
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

    // Insert activity
    await db.insert(activities).values({
      leadId,
      userId: user.id,
      activityDate: activityDate, // Already in YYYY-MM-DD format from form
      contactPersonName,
      outcome,
      notes: notes.trim(),
    });

    // If meeting was set, redirect to visit planning
    if (outcome === "MEETING_SET") {
      throw redirect(303, `/visits/new?leadId=${leadId}&fromActivity=true`);
    }

    // Otherwise redirect back to lead details
    throw redirect(303, `/leads/${leadId}`);
  },
};
