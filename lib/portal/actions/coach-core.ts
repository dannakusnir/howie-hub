import "server-only";
import type { CoachResult, DraftInput } from "../../../components/portal/CoachScreens";
import type { StaffPrincipal } from "../data/dto";
import type { forStaff } from "../data/staff";
import type { GhlResult, SyncContact } from "../ghl";

export type CoachActionDeps = {
  requireStaff: () => Promise<StaffPrincipal>;
  dal: (p: StaffPrincipal) => ReturnType<typeof forStaff>;
  /** GoHighLevel contact + tag sync. Required (no default) so no caller can skip it silently. */
  ghl: SyncContact;
};

type StaffDal = ReturnType<typeof forStaff>;

const GHL_REASON: Record<Extract<GhlResult, { ok: false }>["reason"] | "no_recipients" | "lookup_failed", string> = {
  not_configured: "not configured",
  http_error: "GoHighLevel refused the request",
  network: "could not reach GoHighLevel",
  no_recipients: "no enabled client in this organisation",
  lookup_failed: "could not read the client list",
};

/**
 * Runs the sync AFTER the database write has committed. A GHL failure never throws and
 * never undoes the write: it is recorded in audit_log and returned as a warning for the
 * coach to read next to the success message.
 */
async function syncAndRecord(
  dal: StaffDal,
  ref: { orgId: string; sessionId?: string },
  kind: "invite" | "publish",
  contacts: readonly { email: string; name: string | null; tags: readonly string[] }[],
  deps: Pick<CoachActionDeps, "ghl">,
): Promise<string | null> {
  const failures: { reason: keyof typeof GHL_REASON; detail: string }[] = [];
  let synced = 0;
  for (const c of contacts) {
    let r: GhlResult;
    try {
      r = await deps.ghl(c);
    } catch (e) {
      // syncContact promises not to throw; a fake or future change might. Still not fatal.
      r = { ok: false, reason: "network", detail: e instanceof Error ? e.name : "unknown error" };
    }
    if (r.ok) synced += 1;
    else failures.push({ reason: r.reason, detail: r.detail });
  }
  if (contacts.length === 0) failures.push({ reason: "no_recipients", detail: "no enabled client to tag" });

  const ok = failures.length === 0;
  const first = failures[0];
  let recordError: string | null = null;
  try {
    await dal.recordGhlSync({
      ...ref,
      ok,
      detail: {
        kind,
        contacts: contacts.length,
        synced,
        failed: failures.length,
        ...(first === undefined ? {} : { reason: first.reason, detail: first.detail }),
      },
    });
  } catch (e) {
    recordError = e instanceof Error ? e.name : "unknown error";
  }
  if (ok && recordError === null) return null;
  const parts: string[] = [];
  if (first !== undefined) {
    parts.push(
      `GoHighLevel was not updated: ${GHL_REASON[first.reason]}${failures.length > 1 ? ` (${failures.length} of ${contacts.length} contacts failed)` : ""}.`,
    );
  }
  if (recordError !== null) parts.push(`The sync result could not be recorded in the audit log (${recordError}).`);
  return parts.join(" ");
}

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

/** Tags every enabled client of the session's organisation: first tag triggers Danna's GHL workflow. */
async function syncPublished(
  dal: StaffDal,
  sessionId: string,
  deps: Pick<CoachActionDeps, "ghl">,
): Promise<string | null> {
  let to: Awaited<ReturnType<StaffDal["publishRecipients"]>>;
  try {
    to = await dal.publishRecipients(sessionId);
  } catch (e) {
    return `GoHighLevel was not updated: ${GHL_REASON.lookup_failed} (${e instanceof Error ? e.name : "unknown error"}).`;
  }
  if (to === null) return `GoHighLevel was not updated: ${GHL_REASON.lookup_failed}.`;
  const nn = String(to.number).padStart(2, "0");
  const tags = ["portal-session-published", `portal-session-${nn}-published`];
  return syncAndRecord(
    dal,
    { orgId: to.orgId, sessionId },
    "publish",
    to.clients.map((c) => ({ email: c.email, name: c.name, tags })),
    deps,
  );
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
      const dal = deps.dal(principal);
      const r = await dal.publish(sessionId);
      if (r === null) return NOT_FOUND;
      if (r.ok) {
        const message = "Published. Clients can see it now.";
        const warning = await syncPublished(dal, sessionId, deps);
        return warning === null ? { ok: true, message } : { ok: true, message, warning };
      }
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
      const dal = deps.dal(principal);
      const r = await dal.inviteClient({ orgId, email, name: trimmed });
      if (r === null) return { ok: false, message: "That organisation no longer exists. Reload the page." };
      if (r.ok) {
        const address = email.trim().toLowerCase();
        const message = `Invited ${address}. They can sign in now at /portal/login with that address.`;
        const warning = await syncAndRecord(
          dal,
          { orgId },
          "invite",
          [{ email: address, name: trimmed, tags: ["coaching-client", "portal-invited"] }],
          deps,
        );
        return warning === null ? { ok: true, message } : { ok: true, message, warning };
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
