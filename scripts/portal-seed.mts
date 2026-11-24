// Seeds the portal: staff users, one program, one organisation and its engagement
// (which pre-creates every session as a draft). Idempotent. Refuses to run without
// explicit arguments, and writes nothing unless --apply is given.
//
//   npx tsx --conditions=react-server scripts/portal-seed.mts \
//     --db-env DATABASE_URL_UNPOOLED \
//     --program-file ./program.json \
//     --staff howie@example.com:coach --staff danna@example.com:admin \
//     --org acme:"Acme Arts" --starts-on 2026-12-08 \
//     --apply
//
// program.json: { "slug": "yes-causing-course", "name": "...", "sessionCount": 12 }
// The file carries no session titles on purpose: titles of unreleased sessions must not
// sit in the database before they are written and published.
//
// --db-env names the environment variable that holds the connection string. The value
// is read, never printed.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { z } from "zod";
import type { StaffPrincipal } from "../lib/portal/data/dto";
import { forStaff } from "../lib/portal/data/staff";
import type { PortalDb } from "../lib/portal/db/client";
import * as schema from "../lib/portal/db/schema";

const programFileSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,62}$/),
    name: z.string().min(1),
    sessionCount: z.number().int().min(1).max(100),
  })
  .strict();

export type SeedPlan = {
  program: z.infer<typeof programFileSchema>;
  staff: { email: string; role: "coach" | "admin" }[];
  org: { slug: string; name: string };
  startsOn: string | null;
};

export async function seed(db: PortalDb, plan: SeedPlan, log: (line: string) => void): Promise<void> {
  for (const s of plan.staff) {
    const email = s.email.trim().toLowerCase();
    const [created] = await db
      .insert(schema.users)
      .values({ email, role: s.role })
      .onConflictDoNothing()
      .returning({ id: schema.users.id });
    log(`staff ${s.role} ${email}: ${created ? "created" : "already present"}`);
  }

  const [program] = await db
    .insert(schema.programs)
    .values({ slug: plan.program.slug, name: plan.program.name, sessionCount: plan.program.sessionCount })
    .onConflictDoNothing()
    .returning({ id: schema.programs.id });
  log(`program ${plan.program.slug}: ${program ? "created" : "already present"}`);

  const [admin] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "admin")).limit(1);
  if (admin === undefined) throw new Error("seed needs at least one --staff entry with role admin (or one already in the database)");
  const asAdmin = forStaff({ userId: admin.id, role: "admin" } as unknown as StaffPrincipal, db);

  const org = await asAdmin.createOrg(plan.org);
  let orgId: string;
  if (org.ok) {
    orgId = org.orgId;
    log(`org ${plan.org.slug}: created`);
  } else if (org.reason === "slug_taken") {
    const [existing] = await db.select({ id: schema.organisations.id }).from(schema.organisations).where(eq(schema.organisations.slug, plan.org.slug));
    if (existing === undefined) throw new Error("org slug reported taken but not found");
    orgId = existing.id;
    log(`org ${plan.org.slug}: already present`);
  } else {
    throw new Error(`org ${plan.org.slug}: ${org.reason}`);
  }

  const eng = await asAdmin.createEngagement({ orgId, programSlug: plan.program.slug, startsOn: plan.startsOn });
  if (eng === null) throw new Error("engagement: org or program not found");
  log(eng.ok ? `engagement: created with ${eng.sessionCount} draft sessions` : "engagement: already present");
}

function usage(): never {
  console.error(
    "portal-seed refuses to run without explicit arguments.\n" +
      "Required: --db-env <ENV_VAR_NAME> --program-file <json> --org <slug:Name> and at least one --staff <email:coach|admin>.\n" +
      "Add --apply to write; without it only the plan is printed. Optional: --starts-on YYYY-MM-DD.",
  );
  process.exit(2);
}

function parseArgs(argv: string[]) {
  const staff: string[] = [];
  const single: Record<string, string> = {};
  let apply = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (a === "--apply") apply = true;
    else if (a === "--staff") staff.push(argv[++i] ?? usage());
    else if (["--db-env", "--program-file", "--org", "--starts-on"].includes(a)) single[a] = argv[++i] ?? usage();
    else usage();
  }
  return { staff, single, apply };
}

async function main() {
  const { staff, single, apply } = parseArgs(process.argv.slice(2));
  const dbEnv = single["--db-env"];
  const programFile = single["--program-file"];
  const orgArg = single["--org"];
  if (!dbEnv || !programFile || !orgArg || staff.length === 0) usage();

  const program = programFileSchema.parse(JSON.parse(readFileSync(programFile, "utf8")));
  const [orgSlug, ...orgNameParts] = orgArg.split(":");
  const orgName = orgNameParts.join(":");
  if (!orgSlug || !orgName) throw new Error("--org must look like slug:Name");
  const staffPlan = staff.map((s): SeedPlan["staff"][number] => {
    const [email, role] = s.split(":");
    if (!email || (role !== "coach" && role !== "admin")) throw new Error("--staff must look like email:coach or email:admin");
    return { email, role };
  });
  const startsOn = single["--starts-on"] ?? null;
  if (startsOn !== null && !/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) throw new Error("--starts-on must be YYYY-MM-DD");
  const plan: SeedPlan = { program, staff: staffPlan, org: { slug: orgSlug, name: orgName }, startsOn };

  console.log(JSON.stringify({ apply, dbEnv, plan }, null, 2));
  if (!apply) {
    console.log("dry run: nothing written (add --apply)");
    return;
  }
  const url = process.env[dbEnv];
  if (!url) throw new Error(`environment variable ${dbEnv} is not set`);
  const pool = new Pool({ connectionString: url });
  try {
    const db = drizzle(pool, { schema }) as unknown as PortalDb;
    await seed(db, plan, (l) => console.log(l));
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
