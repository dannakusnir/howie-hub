import type { AssetKind } from "../asset-kinds";
import type { Role } from "../roles";

// Types only. Principal constructors live with the auth code (a later ticket); tests
// build principals with a clearly named factory of their own.

declare const principalBrand: unique symbol;

export type ClientPrincipal = {
  readonly userId: string;
  readonly orgId: string;
} & { readonly [principalBrand]: "client" };

export type StaffPrincipal = {
  readonly userId: string;
  readonly role: Exclude<Role, "client">;
} & { readonly [principalBrand]: "staff" };

// ── Client-facing ───────────────────────────────────────────────────────────

/** Published session on the roadmap. */
export type RoadmapPublished = {
  readonly id: string;
  readonly number: number;
  readonly scheduledAt: Date | null;
  readonly heldOn: string | null;
  readonly title: string | null;
  readonly state: "done";
};

/** Unpublished session: ONLY these three keys. No title, no summary, no id. */
export type RoadmapUnpublished = {
  readonly number: number;
  readonly scheduledAt: Date | null;
  readonly state: "next" | "later";
};

export type RoadmapEntry = RoadmapPublished | RoadmapUnpublished;

export type RoadmapProgram = {
  readonly programSlug: string;
  readonly programName: string;
  readonly sessions: readonly RoadmapEntry[];
};

export type ItemDto = {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
  readonly doneAt: Date | null;
  /** Who ticked it (name, else the part of the email before the @). Always set by the data
   *  layer; optional only so the design-preview sample data, which this layer does not own,
   *  still type-checks. */
  readonly doneByName: string | null;
};

export type ClientAssetDto = {
  readonly id: string;
  readonly kind: AssetKind;
  readonly label: string | null;
  readonly contentType: string;
  readonly bytes: number;
  readonly position: number;
};

export type ClientSessionDto = {
  readonly id: string;
  readonly number: number;
  readonly title: string | null;
  readonly summaryMd: string | null;
  readonly heldOn: string | null;
  readonly scheduledAt: Date | null;
  readonly publishedAt: Date;
  readonly programName: string;
  readonly tasks: readonly ItemDto[];
  readonly nextTime: readonly ItemDto[];
  readonly assets: readonly ClientAssetDto[];
};

/** What an authenticated asset route needs to stream a blob. */
export type AssetFileDto = {
  readonly id: string;
  readonly sessionId: string;
  readonly orgId: string;
  readonly kind: AssetKind;
  readonly blobPathname: string;
  readonly contentType: string;
  readonly bytes: number;
  readonly label: string | null;
};

// ── Staff-facing ────────────────────────────────────────────────────────────

export type OrgSummary = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly engagements: readonly { readonly id: string; readonly programSlug: string }[];
  readonly users: readonly {
    readonly id: string;
    readonly email: string;
    readonly name: string | null;
    readonly disabled: boolean;
  }[];
};

export type DraftQueueEntry = {
  readonly id: string;
  readonly orgSlug: string;
  readonly orgName: string;
  readonly programSlug: string;
  readonly number: number;
  readonly title: string | null;
  readonly lastIngestedAt: Date | null;
  readonly editedAt: Date | null;
};

export type PublishedSessionEntry = {
  readonly id: string;
  readonly orgSlug: string;
  readonly orgName: string;
  readonly programSlug: string;
  readonly number: number;
  readonly title: string | null;
  readonly publishedAt: Date;
  readonly openItems: number;
  readonly doneItems: number;
};

/** Who should hear about a freshly published session: the enabled client users of that
 *  session's own organisation (resolved from the database, never from the browser). */
export type PublishRecipients = {
  readonly orgId: string;
  readonly number: number;
  readonly clients: readonly { readonly email: string; readonly name: string | null }[];
};

export type StaffAssetDto = AssetFileDto & { readonly position: number; readonly sha256: string };

export type StaffSessionDto = {
  readonly id: string;
  readonly orgId: string;
  readonly orgSlug: string;
  /** Always set by the data layer; optional only for the design-preview sample data. */
  readonly orgName: string;
  readonly programSlug: string;
  readonly number: number;
  readonly status: "draft" | "published";
  readonly title: string | null;
  readonly summaryMd: string | null;
  readonly heldOn: string | null;
  readonly scheduledAt: Date | null;
  readonly publishedAt: Date | null;
  readonly publishedBy: string | null;
  readonly lastIngestedAt: Date | null;
  readonly editedAt: Date | null;
  readonly editedBy: string | null;
  readonly tasks: readonly ItemDto[];
  readonly nextTime: readonly ItemDto[];
  readonly assets: readonly StaffAssetDto[];
};

/** A signed-in user as the auth layer sees them (session -> user -> organisation). */
export type PrincipalUser = {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly role: Role;
  readonly orgId: string | null;
  readonly orgName: string | null;
  readonly disabledAt: Date | null;
};

/** Why a sign-in link request may or may not go ahead. Only "ok" sends mail. */
export type LoginVerdict = "ok" | "unknown" | "disabled" | "rate_limited";

export type Refusal<R extends string> = { readonly ok: false; readonly reason: R };
export type Ok<T> = { readonly ok: true } & T;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ids from the browser are checked before they reach a uuid column: a malformed id is
 *  "not found" (null), exactly like an unknown one, never a database error. */
export function isUuid(v: string): boolean {
  return UUID_RE.test(v);
}
