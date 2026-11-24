"use server";

import { revalidatePath } from "next/cache";
import type { CoachResult, DraftInput } from "../../../components/portal/CoachScreens";
import { forStaff } from "../data/staff";
import { syncContact } from "../ghl";
import { requireStaff } from "../principal";
import { createCoachActions } from "./coach-core";

const actions = createCoachActions({ requireStaff, dal: (p) => forStaff(p), ghl: (c) => syncContact(c) });

function refreshed(result: CoachResult): CoachResult {
  if (result.ok) revalidatePath("/portal/coach", "layout");
  return result;
}

export async function saveDraft(sessionId: string, input: DraftInput): Promise<CoachResult> {
  return refreshed(await actions.saveDraft(sessionId, input));
}

export async function publishSession(sessionId: string): Promise<CoachResult> {
  const result = await actions.publish(sessionId);
  if (result.ok) revalidatePath("/portal", "layout");
  return result;
}

export async function unpublishSession(sessionId: string): Promise<CoachResult> {
  const result = await actions.unpublish(sessionId);
  if (result.ok) revalidatePath("/portal", "layout");
  return result;
}

export async function inviteClient(orgId: string, input: { email: string; name: string }): Promise<CoachResult> {
  return refreshed(await actions.inviteClient(orgId, input));
}

export async function disableUser(userId: string): Promise<CoachResult> {
  return refreshed(await actions.disableUser(userId));
}
