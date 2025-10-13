import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { contracts, leads } from "$lib/server/db/schema";
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

  // Permission check: PH can only add contracts to their own leads
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

    const signedAt = formData.get("signedAt") as string;
    const products = (formData.get("products") as string) || null;
    const terms = (formData.get("terms") as string) || null;
    const contractValue = formData.get("contractValue") as string;

    // Validation
    if (!signedAt) {
      return fail(400, {
        error: "Data podpisania jest wymagana",
        signedAt,
        products,
        terms,
        contractValue,
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

    // Insert contract
    await db.insert(contracts).values({
      leadId,
      userId: user.id,
      signedAt,
      products: products?.trim() || null,
      terms: terms?.trim() || null,
      contractValue: contractValue || null,
    });

    // Update lead status to ACTIVE
    await db
      .update(leads)
      .set({
        status: "ACTIVE",
      })
      .where(eq(leads.id, leadId));

    // Redirect back to lead details
    throw redirect(303, `/leads/${leadId}`);
  },
};
