// Test-only helpers. Principals are branded types whose real constructors arrive with
// the auth ticket; this factory exists ONLY here and must never move into lib/.
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { assetPrefix } from "../../lib/portal/data/ingest";
import type { ClientPrincipal, StaffPrincipal } from "../../lib/portal/data/dto";
import type { PortalDb } from "../../lib/portal/db/client";
import * as schema from "../../lib/portal/db/schema";
import type { IngestPayload } from "../../lib/portal/ingest-schema";

export function testOnlyClientPrincipal(userId: string, orgId: string): ClientPrincipal {
  return { userId, orgId } as unknown as ClientPrincipal;
}

export function testOnlyStaffPrincipal(
  userId: string,
  role: "coach" | "admin",
): StaffPrincipal {
  return { userId, role } as unknown as StaffPrincipal;
}

export async function freshDb(): Promise<{ db: PortalDb; pg: PGlite }> {
  const pg = new PGlite();
  const raw = drizzle(pg, { schema });
  await migrate(raw, { migrationsFolder: new URL("../../drizzle", import.meta.url).pathname });
  return { db: raw as unknown as PortalDb, pg };
}

export const SHA = "a".repeat(64);

export function payload(
  orgSlug: string,
  programSlug: string,
  orgId: string,
  number: number,
  overrides: Partial<IngestPayload> = {},
): IngestPayload {
  return {
    schemaVersion: 1,
    org: orgSlug,
    program: programSlug,
    sessionNumber: number,
    heldOn: "2026-12-01",
    title: `Session ${number} title for ${orgSlug}`,
    summaryMd: `Summary of session ${number} for ${orgSlug}`,
    tasks: [{ text: `task one ${orgSlug}` }, { text: `task two ${orgSlug}` }],
    nextTime: [{ text: `next time ${orgSlug}` }],
    assets: [
      {
        kind: "slides_pdf",
        pathname: `${assetPrefix(orgId, number)}slides.pdf`,
        contentType: "application/pdf",
        bytes: 1234,
        sha256: SHA,
        label: "Slides",
      },
    ],
    source: { driveFolderId: "drive-folder", contentHash: "h1" },
    ...overrides,
  };
}

export const uid = () => randomUUID();

/** Message of an error plus its driver cause (Drizzle wraps Postgres errors). */
export function fullMessage(e: unknown): string {
  const parts: string[] = [];
  let cur: unknown = e;
  while (cur instanceof Error && parts.length < 5) {
    parts.push(cur.message);
    cur = (cur as { cause?: unknown }).cause;
  }
  return parts.join(" | ");
}
