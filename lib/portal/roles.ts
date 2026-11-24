// Roles and what each may do. ROLES is the single source for the DB enum, the Role
// union and (via Record<Role, ...>) the capability table: add a member to ROLES
// without a ROLE_CAPABILITIES entry and `tsc` fails.

export const ROLES = ["client", "coach", "admin"] as const;
export type Role = (typeof ROLES)[number];

export type Capabilities = {
  /** Sees only published sessions of their own organisation. */
  readonly viewPublishedOwnOrg: boolean;
  /** May tick tasks / checklist items of their own organisation. */
  readonly toggleOwnItems: boolean;
  /** Sees drafts and every organisation. */
  readonly viewAllOrgs: boolean;
  readonly editDrafts: boolean;
  readonly publish: boolean;
  /** Invite / disable client users. */
  readonly manageClients: boolean;
  /** Create organisations and engagements. */
  readonly manageOrgs: boolean;
};

export const ROLE_CAPABILITIES: Record<Role, Capabilities> = {
  client: {
    viewPublishedOwnOrg: true,
    toggleOwnItems: true,
    viewAllOrgs: false,
    editDrafts: false,
    publish: false,
    manageClients: false,
    manageOrgs: false,
  },
  coach: {
    viewPublishedOwnOrg: false,
    toggleOwnItems: false,
    viewAllOrgs: true,
    editDrafts: true,
    publish: true,
    manageClients: true,
    manageOrgs: false,
  },
  admin: {
    viewPublishedOwnOrg: false,
    toggleOwnItems: false,
    viewAllOrgs: true,
    editDrafts: true,
    publish: true,
    manageClients: true,
    manageOrgs: true,
  },
};

export function can(role: Role, capability: keyof Capabilities): boolean {
  return ROLE_CAPABILITIES[role][capability];
}

// Where each role lands and what its top bar offers. Record<Role, ...> again: a role added
// to ROLES without an entry here fails `tsc`, so no role can exist without a home and a nav.

export type NavKey = "overview" | "review" | "clients";
export type NavEntry = { readonly key: NavKey; readonly label: string; readonly href: string };

export const ROLE_HOME: Record<Role, string> = {
  client: "/portal",
  coach: "/portal/coach",
  admin: "/portal/coach",
};

const COACH_NAV: readonly NavEntry[] = [
  { key: "review", label: "Review", href: "/portal/coach" },
  { key: "clients", label: "Clients", href: "/portal/coach/clients" },
];

export const ROLE_NAV: Record<Role, readonly NavEntry[]> = {
  client: [{ key: "overview", label: "Overview", href: "/portal" }],
  coach: COACH_NAV,
  admin: COACH_NAV,
};
