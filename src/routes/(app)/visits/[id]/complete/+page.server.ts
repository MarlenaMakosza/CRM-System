import { error, fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { visits, leads } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user!;
  const visitId = parseInt(params.id);

  if (isNaN(visitId)) {
    throw error(400, "Invalid visit ID");
  }

  // Get visit with lead info
  const [visitData] = await db
    .select({
      visit: visits,
      lead: leads,
    })
    .from(visits)
    .leftJoin(leads, eq(visits.leadId, leads.id))
    .where(eq(visits.id, visitId));

  if (!visitData) {
    throw error(404, "Wizyta nie została znaleziona");
  }

  // Permission check: PH can only complete their own visits
  if (user.role === "PH" && visitData.visit.userId !== user.id) {
    throw error(403, "Brak dostępu do tej wizyty");
  }

  // Check if visit is already completed
  if (visitData.visit.status !== "PLANNED") {
    throw redirect(303, `/visits`);
  }

  return {
    visit: visitData.visit,
    lead: visitData.lead,
  };
};

export const actions: Actions = {
  complete: async ({ request, params, locals }) => {
    const user = locals.user!;
    const visitId = parseInt(params.id);
    const formData = await request.formData();

    const visitNotes = formData.get("visitNotes") as string;
    const competitorPrices = (formData.get("competitorPrices") as string) || null;

    // Validation
    if (!visitNotes || visitNotes.trim().length === 0) {
      return fail(400, {
        error: "Notatka z wizyty jest wymagana",
        visitNotes,
        competitorPrices,
      });
    }

    // Verify visit exists and user has access
    const [visit] = await db
      .select()
      .from(visits)
      .where(eq(visits.id, visitId));

    if (!visit) {
      return fail(404, { error: "Wizyta nie została znaleziona" });
    }

    if (user.role === "PH" && visit.userId !== user.id) {
      return fail(403, { error: "Brak dostępu do tej wizyty" });
    }

    // Update visit
    await db
      .update(visits)
      .set({
        status: "DONE",
        visitNotes: visitNotes.trim(),
        competitorPrices: competitorPrices?.trim() || null,
      })
      .where(eq(visits.id, visitId));

    // Redirect to visits list
    throw redirect(303, `/visits`);
  },

  cancel: async ({ params, locals }) => {
    const user = locals.user!;
    const visitId = parseInt(params.id);

    // Verify visit exists and user has access
    const [visit] = await db
      .select()
      .from(visits)
      .where(eq(visits.id, visitId));

    if (!visit) {
      return fail(404, { error: "Wizyta nie została znaleziona" });
    }

    if (user.role === "PH" && visit.userId !== user.id) {
      return fail(403, { error: "Brak dostępu do tej wizyty" });
    }

    // Cancel visit
    await db
      .update(visits)
      .set({
        status: "CANCELLED",
      })
      .where(eq(visits.id, visitId));

    throw redirect(303, `/visits`);
  },
};
