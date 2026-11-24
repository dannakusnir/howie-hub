import "server-only";
import type { CoachResult, DraftInput } from "../../../components/portal/CoachScreens";
import type { StaffPrincipal } from "../data/dto";
import type { forStaff } from "../data/staff";

export type CoachActionDeps = {
  requireStaff: () => Promise<StaffPrincipal>;
  dal: (p: StaffPrincipal) => ReturnType<typeof forStaff>;
};

const MAX_TITLE = 300;
const MAX_SUMMARY = 40_000;
const MAX_LINES = 40;
const MAX_LINE = 1_000;
const MAX_NAME = 200;

const NOT_UNDERSTOOD: CoachResult = { ok: false, message: "That request was not understood. Reload the page and try again." };
const NOT_FOUND: CoachResult = { ok: false, message: "That session no longer exists. Go back to the review queue." };

function lines(v: unknown): string[] | null {
  if (!Array.isArray(v) || v.length > MAX_LINES) return null;
  const out: string[] = [];
  for (const l of v) {
    if (typeof l !== "string" || l.length > MAX_LINE) return null;
    out.push(l);
  }
  return out;
}

function parseDraft(v: unknown): DraftInput | null {
  if (typeof v !== "object" || v === null) return null;
  const { title, summaryMd, tasks, nextTime } = v as Record<string, unknown>;
  const t = lines(tasks);
  const n = lines(nextTime);
  if (typeof title !== "string" || title.length > MAX_TITLE) return null;
  if (typeof summaryMd !== "string" || summaryMd.length > MAX_SUMMARY) return null;
  if (t === null || n === null) return null;
  return { title, summaryMd, tasks: t, nextTime: n };
}

/**
 * Every coach action calls requireStaff() FIRST. A client, a signed-out visitor or a
 * disabled user never reaches the data layer: they are redirected or get a 404 before any
 * argument is even looked at.
 */
export function createCoachActions(deps: CoachActionDeps) {
  return {
    async saveDraft(sessionId: unknown, input: unknown): Promise<CoachResult> {
      const principal = await deps.requireStaff();
      const draft = parseDraft(input);
      if (typeof sessionId !== "string" || draft === null) return NOT_UNDERSTOOD;
      const dal = deps.dal(principal);
      const saved = await dal.saveDraft(sessionId, { title: draft.title, summaryMd: draft.summaryMd });
      if (saved === null) return NOT_FOUND;
      if (!saved.ok) return { ok: false, message: "This session is published. Unpublish it before editing." };
      const items = await dal.replaceItems(sessionId, { tasks: draft.tasks, nextTime: draft.nextTime });
      if (items === null) return NOT_FOUND;
      if (!items.ok) return { ok: false, message: "This session is published. Unpublish it before editing." };
      return { ok: true, message: "Saved." };
    },

    async publish(sessionId: unknown): Promise<CoachResult> {
      const principal = await deps.requireStaff();
      if (typeof sessionId !== "string") return NOT_UNDERSTOOD;
      const r = await deps.dal(principal).publish(sessionId);
      if (r === null) return NOT_FOUND;
      if (r.ok) return { ok: true, message: "Published. Clients can see it now." };
      return r.reason === "incomplete"
        ? { ok: false, message: "Add a title and a written summary before publishing." }
        : { ok: false, message: "This session is already published." };
    },

    async unpublish(sessionId: unknown): Promise<CoachResult> {
      const principal = await deps.requireStaff();
      if (typeof sessionId !== "string") return NOT_UNDERSTOOD;
      const r = await deps.dal(principal).unpublish(sessionId);
      if (r === null) return NOT_FOUND;
      if (r.ok) return { ok: true, message: "Unpublished. Clients can no longer see it." };
      return { ok: false, message: "This session is not published." };
    },

    async inviteClient(orgId: unknown, input: unknown): Promise<CoachResult> {
      const principal = await deps.requireStaff();
      if (typeof orgId !== "string" || typeof input !== "object" || input === null) return NOT_UNDERSTOOD;
      const { email, name } = input as Record<string, unknown>;
      if (typeof email !== "string" || typeof name !== "string" || name.length > MAX_NAME) return NOT_UNDERSTOOD;
      const trimmed = name.trim();
      if (trimmed === "") return { ok: false, message: "Add the person's name." };
      const r = await deps.dal(principal).inviteClient({ orgId, email, name: trimmed });
      if (r === null) return { ok: false, message: "That organisation no longer exists. Reload the page." };
      if (r.ok) {
        return {
          ok: true,
          message: `Invited ${email.trim().toLowerCase()}. They can sign in now at /portal/login with that address.`,
        };
      }
      return r.reason === "invalid_email"
        ? { ok: false, message: "That does not look like an email address." }
        : { ok: false, message: "That email already has an account." };
    },

    async disableUser(userId: unknown): Promise<CoachResult> {
      const principal = await deps.requireStaff();
      if (typeof userId !== "string") return NOT_UNDERSTOOD;
      const r = await deps.dal(principal).disableUser(userId);
      if (r === null) return { ok: false, message: "No such client. Reload the page." };
      if (r.ok) return { ok: true, message: "Disabled. They are signed out and cannot sign in." };
      return { ok: false, message: "You cannot disable your own account." };
    },
  };
}
