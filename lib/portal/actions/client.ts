"use server";

import { revalidatePath } from "next/cache";
import type { ToggleResult } from "../../../components/portal/TickList";
import { forClient } from "../data/client";
import { requireClient } from "../principal";
import { createClientActions } from "./client-core";

const actions = createClientActions({ requireClient, dal: (p) => forClient(p) });

export async function toggleItem(itemId: string, done: boolean): Promise<ToggleResult> {
  const result = await actions.toggleItem(itemId, done);
  if (result.ok) revalidatePath("/portal", "layout");
  return result;
}
