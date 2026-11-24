"use server";

import type { CoachResult, DraftInput } from "@/components/portal/CoachScreens";
import type { LoginResult } from "@/components/portal/LoginForm";
import type { ToggleResult } from "@/components/portal/TickList";

// Design preview only: these actions touch nothing and say so.

export async function previewToggle(itemId: string, done: boolean): Promise<ToggleResult> {
  void itemId;
  void done;
  return { ok: true };
}

export async function previewSave(input: DraftInput): Promise<CoachResult> {
  void input;
  return { ok: false, message: "Preview only: nothing was saved." };
}

export async function previewPublish(): Promise<CoachResult> {
  return { ok: false, message: "Preview only: nothing was published." };
}

export async function previewLogin(email: string): Promise<LoginResult> {
  void email;
  return { ok: true };
}
