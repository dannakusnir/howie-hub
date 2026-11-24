import "server-only";

// GoHighLevel contact + tag sync for the portal. Contacts and tags only: no email, no
// calendar, no workflows. Same LeadConnector v2 pattern as app/api/lead/route.ts:
// /contacts/upsert does NOT carry tags (it REPLACES the tag array of an existing contact),
// so tags go through the additive /contacts/{id}/tags endpoint.
//
// Contract: syncContact never throws for a GHL failure and never logs or returns the token.

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const TIMEOUT_MS = 8_000;
const MAX_DETAIL = 300;

export type GhlFailureReason = "not_configured" | "http_error" | "network";

export type GhlResult =
  | { readonly ok: true; readonly contactId: string }
  | { readonly ok: false; readonly reason: GhlFailureReason; readonly detail: string };

export type GhlContactInput = {
  readonly email: string;
  readonly name: string | null;
  readonly tags: readonly string[];
};

export type GhlDeps = {
  readonly fetch?: typeof fetch;
  /** Defaults to process.env, read when syncContact runs, never at import time. */
  readonly env?: { readonly GHL_PIT_TOKEN?: string; readonly GHL_LOCATION_ID?: string };
  readonly timeoutMs?: number;
};

/** The shape the coach actions depend on, so tests can swap in a fake. */
export type SyncContact = (input: GhlContactInput) => Promise<GhlResult>;

function clip(s: string, token: string): string {
  const scrubbed = token === "" ? s : s.split(token).join("[redacted]");
  return scrubbed.length > MAX_DETAIL ? `${scrubbed.slice(0, MAX_DETAIL)}...` : scrubbed;
}

async function messageOf(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (typeof body === "object" && body !== null) {
      const m = (body as Record<string, unknown>).message;
      if (typeof m === "string") return m;
      if (Array.isArray(m) && m.every((x) => typeof x === "string")) return m.join("; ");
    }
  } catch {
    // Not JSON: the status code alone is the detail.
  }
  return "";
}

export async function syncContact(input: GhlContactInput, deps: GhlDeps = {}): Promise<GhlResult> {
  const env = deps.env ?? process.env;
  const token = env.GHL_PIT_TOKEN ?? "";
  const locationId = env.GHL_LOCATION_ID ?? "";
  if (token === "" || locationId === "") {
    const missing = [token === "" ? "GHL_PIT_TOKEN" : null, locationId === "" ? "GHL_LOCATION_ID" : null]
      .filter((m) => m !== null)
      .join(" and ");
    return { ok: false, reason: "not_configured", detail: `${missing} not set` };
  }

  const doFetch = deps.fetch ?? fetch;
  const timeoutMs = deps.timeoutMs ?? TIMEOUT_MS;
  const headers = {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const email = input.email.trim().toLowerCase();
  const fullName = (input.name ?? "").trim();
  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ");

  const post = (path: string, body: unknown) =>
    doFetch(`${GHL_API_BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

  try {
    const up = await post("/contacts/upsert", {
      locationId,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      name: fullName || undefined,
      source: "howie-portal",
    });
    if (!up.ok) {
      const m = await messageOf(up);
      return { ok: false, reason: "http_error", detail: clip(`upsert: HTTP ${up.status}${m ? ` ${m}` : ""}`, token) };
    }
    const data: unknown = await up.json().catch(() => null);
    const root = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    const contact = typeof root.contact === "object" && root.contact !== null ? (root.contact as Record<string, unknown>) : root;
    const contactId = contact.id;
    if (typeof contactId !== "string" || contactId === "") {
      return { ok: false, reason: "http_error", detail: "upsert: response carried no contact id" };
    }

    const tagged = await post(`/contacts/${encodeURIComponent(contactId)}/tags`, { tags: input.tags });
    if (!tagged.ok) {
      const m = await messageOf(tagged);
      return { ok: false, reason: "http_error", detail: clip(`tags: HTTP ${tagged.status}${m ? ` ${m}` : ""}`, token) };
    }
    return { ok: true, contactId };
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    const what = timedOut ? `timed out after ${timeoutMs} ms` : e instanceof Error ? `${e.name}: ${e.message}` : "unknown error";
    return { ok: false, reason: "network", detail: clip(what, token) };
  }
}
