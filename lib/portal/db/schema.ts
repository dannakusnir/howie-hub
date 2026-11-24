import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { ASSET_KIND_LIST } from "../asset-kinds";
import { ROLES } from "../roles";

const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const roleEnum = pgEnum("portal_role", ROLES);
export const sessionStatusEnum = pgEnum("portal_session_status", ["draft", "published"]);
export const itemKindEnum = pgEnum("portal_item_kind", ["task", "next_time"]);
export const assetKindEnum = pgEnum("portal_asset_kind", ASSET_KIND_LIST);
export const actorKindEnum = pgEnum("portal_actor_kind", ["user", "ingest"]);

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: tstz("created_at").notNull().defaultNow(),
});

// Property names id/name/email/emailVerified/image are what @auth/drizzle-adapter reads.
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Stored lowercased (CHECK) and unique on lower(email) (index).
    email: text("email").notNull(),
    name: text("name"),
    emailVerified: tstz("email_verified"),
    image: text("image"),
    // No default: a self-created user (adapter createUser) cannot satisfy the CHECK below.
    role: roleEnum("role").notNull(),
    orgId: uuid("org_id").references(() => organisations.id),
    invitedBy: uuid("invited_by").references((): AnyPgColumn => users.id),
    invitedAt: tstz("invited_at"),
    disabledAt: tstz("disabled_at"),
  },
  (t) => [
    uniqueIndex("users_email_lower_key").on(sql`lower(${t.email})`),
    check("users_email_lowercase", sql`${t.email} = lower(${t.email})`),
    check("users_client_has_org", sql`(${t.role} = 'client') = (${t.orgId} IS NOT NULL)`),
  ],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email" | "webauthn">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: tstz("expires").notNull(),
});

export const authVerificationTokens = pgTable(
  "auth_verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: tstz("expires").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.identifier, t.token] }),
    index("auth_verification_tokens_identifier_expires_idx").on(t.identifier, t.expires),
  ],
);

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sessionCount: integer("session_count").notNull(),
}, (t) => [check("programs_session_count_positive", sql`${t.sessionCount} > 0`)]);

export const engagements = pgTable(
  "engagements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organisations.id),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id),
    startsOn: date("starts_on", { mode: "string" }),
  },
  (t) => [
    unique("engagements_org_program_key").on(t.orgId, t.programId),
    unique("engagements_id_org_key").on(t.id, t.orgId),
  ],
);

export const coachingSessions = pgTable(
  "coaching_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organisations.id),
    engagementId: uuid("engagement_id").notNull(),
    number: integer("number").notNull(),
    scheduledAt: tstz("scheduled_at"),
    heldOn: date("held_on", { mode: "string" }),
    title: text("title"),
    summaryMd: text("summary_md"),
    status: sessionStatusEnum("status").notNull().default("draft"),
    publishedAt: tstz("published_at"),
    publishedBy: uuid("published_by").references(() => users.id),
    ingestHash: text("ingest_hash"),
    lastIngestedAt: tstz("last_ingested_at"),
    editedAt: tstz("edited_at"),
    editedBy: uuid("edited_by").references(() => users.id),
    createdAt: tstz("created_at").notNull().defaultNow(),
    updatedAt: tstz("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("coaching_sessions_engagement_number_key").on(t.engagementId, t.number),
    unique("coaching_sessions_id_org_key").on(t.id, t.orgId),
    foreignKey({
      name: "coaching_sessions_engagement_org_fk",
      columns: [t.engagementId, t.orgId],
      foreignColumns: [engagements.id, engagements.orgId],
    }),
    check("coaching_sessions_number_positive", sql`${t.number} > 0`),
    // The draft gate: a row cannot be published without a publisher and a timestamp,
    // and cannot carry either while a draft. Automation has no way to satisfy this.
    check(
      "coaching_sessions_published_gate",
      sql`(${t.status} = 'published') = (${t.publishedAt} IS NOT NULL AND ${t.publishedBy} IS NOT NULL)`,
    ),
  ],
);

export const sessionItems = pgTable(
  "session_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organisations.id),
    sessionId: uuid("session_id").notNull(),
    kind: itemKindEnum("kind").notNull(),
    position: integer("position").notNull(),
    text: text("text").notNull(),
    doneAt: tstz("done_at"),
    doneBy: uuid("done_by").references(() => users.id),
  },
  (t) => [
    foreignKey({
      name: "session_items_session_org_fk",
      columns: [t.sessionId, t.orgId],
      foreignColumns: [coachingSessions.id, coachingSessions.orgId],
    }).onDelete("cascade"),
    check("session_items_done_pair", sql`(${t.doneAt} IS NULL) = (${t.doneBy} IS NULL)`),
    index("session_items_session_kind_position_idx").on(t.sessionId, t.kind, t.position),
  ],
);

export const sessionAssets = pgTable(
  "session_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organisations.id),
    sessionId: uuid("session_id").notNull(),
    kind: assetKindEnum("kind").notNull(),
    position: integer("position").notNull(),
    blobPathname: text("blob_pathname").notNull().unique(),
    contentType: text("content_type").notNull(),
    bytes: bigint("bytes", { mode: "number" }).notNull(),
    sha256: text("sha256").notNull(),
    label: text("label"),
    createdAt: tstz("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "session_assets_session_org_fk",
      columns: [t.sessionId, t.orgId],
      foreignColumns: [coachingSessions.id, coachingSessions.orgId],
    }).onDelete("cascade"),
    index("session_assets_session_kind_position_idx").on(t.sessionId, t.kind, t.position),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: tstz("at").notNull().defaultNow(),
    actorKind: actorKindEnum("actor_kind").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    orgId: uuid("org_id"),
    sessionId: uuid("session_id"),
    detail: jsonb("detail"),
  },
  (t) => [
    check("audit_log_actor_pair", sql`(${t.actorKind} = 'user') = (${t.actorUserId} IS NOT NULL)`),
    index("audit_log_session_at_idx").on(t.sessionId, t.at),
  ],
);
