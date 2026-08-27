import { NextResponse } from "next/server";

const GHL_PIT_TOKEN = process.env.GHL_PIT_TOKEN ?? "";
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID ?? "";
const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

function tagsForSource(source: string): string[] {
  if (source === "howie-podcast-guest") return ["podcast-applicant", "howie-hub"];
  if (source === "howie-newsletter") return ["newsletter-subscriber", "howie-hub"];
  if (source.startsWith("book-howie-")) {
    const intent = source.slice("book-howie-".length);
    return [`booking-${intent || "general"}`, "booking-inquiry", "howie-hub"];
  }
  return ["howie-hub-inquiry", "howie-hub"];
}

/**
 * Sources that put the contact on a marketing list. These REQUIRE an explicit
 * opt-in. Reply-to-my-inquiry sources do not, because replying to someone who
 * wrote to us is not marketing.
 */
const MARKETING_SOURCES = new Set(["howie-newsletter"]);

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  pitch?: string;
  links?: string;
  source?: string;
  consent?: boolean;
};

export async function POST(request: Request) {
  if (!GHL_PIT_TOKEN || !GHL_LOCATION_ID) {
    return NextResponse.json(
      { success: false, error: "GHL credentials not configured" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as LeadBody;

  const fullName = (body.name ?? "").trim();
  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ");

  if (!body.email) {
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 400 },
    );
  }

  const source = body.source ?? "howie-hub";

  // Explicit opt-in is required before anyone joins a marketing list.
  // Fail loudly: a missing consent flag must never silently subscribe someone.
  if (MARKETING_SOURCES.has(source) && body.consent !== true) {
    return NextResponse.json(
      { success: false, error: "Explicit consent is required to subscribe" },
      { status: 400 },
    );
  }

  const tags = tagsForSource(source);
  if (body.consent === true) tags.push("consent-given");

  const customFields: { key: string; field_value: string }[] = [];
  if (body.role) customFields.push({ key: "role", field_value: body.role });
  if (body.pitch) customFields.push({ key: "pitch", field_value: body.pitch });
  if (body.links) customFields.push({ key: "links", field_value: body.links });
  if (body.consent === true) {
    customFields.push({
      key: "consent_timestamp",
      field_value: new Date().toISOString(),
    });
  }

  // NOTE: `tags` is deliberately NOT sent here.
  // Verified against the live API on 2026-08-27: /contacts/upsert REPLACES the
  // tag array on an existing contact rather than merging it. Sending tags here
  // would wipe a newsletter-subscriber's tag the moment they apply as a guest.
  // Tags are added separately below, via the additive tags endpoint.
  const ghlPayload = {
    locationId: GHL_LOCATION_ID,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    name: fullName || undefined,
    email: body.email,
    phone: body.phone || undefined,
    companyName: body.company || undefined,
    source,
    customFields: customFields.length ? customFields : undefined,
  };

  const ghlHeaders = {
    Authorization: `Bearer ${GHL_PIT_TOKEN}`,
    Version: GHL_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Upsert, not create. This location rejects duplicate contacts, so the plain
  // create endpoint 400s for anyone who has already given us their email and
  // the lead is thrown away.
  const ghlRes = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: ghlHeaders,
    body: JSON.stringify(ghlPayload),
  });

  const ghlData = await ghlRes.json().catch(() => ({}));

  if (!ghlRes.ok) {
    return NextResponse.json(
      { success: false, status: ghlRes.status, error: ghlData },
      { status: 502 },
    );
  }

  const contact = ghlData?.contact ?? ghlData;
  const contactId: string | undefined = contact?.id;
  const isNewContact: boolean = ghlData?.new === true;

  // Merge tags onto whatever the contact already had. This endpoint is additive
  // and idempotent, so a returning contact ends up with both their old tags and
  // the ones this submission earned.
  let tagsApplied = false;
  let tagError: unknown = null;

  if (contactId) {
    const tagRes = await fetch(`${GHL_API_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify({ tags }),
    });
    tagsApplied = tagRes.ok;
    if (!tagRes.ok) {
      tagError = await tagRes.json().catch(() => ({}));
    }
  } else {
    tagError = "upsert returned no contact id";
  }

  // The lead itself is captured at this point, so this is still a success for
  // the visitor. But never report a partial write as a clean one: surface the
  // tagging failure so it shows up instead of disappearing.
  if (!tagsApplied) {
    console.error("[lead] contact saved but tagging failed", {
      contactId,
      source,
      tags,
      tagError,
    });
  }

  return NextResponse.json({
    success: true,
    created: isNewContact,
    tagsApplied,
    contact: ghlData,
  });
}
