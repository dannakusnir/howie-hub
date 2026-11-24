// Operator CLI for the per-session routine: one JSON file + local asset files in,
// one DRAFT session in the portal out. It can never publish; Howie does that.
//
//   PORTAL_BASE_URL=https://... PORTAL_INGEST_TOKEN=... \
//   npx tsx --conditions=react-server scripts/portal-ingest.mts session.json [--dry-run]
//
// Optional: --base-url-env NAME and --token-env NAME pick other variable NAMES. Values
// are read from the environment and never printed.
//
// session.json is the ingest payload (lib/portal/ingest-schema.ts) with two differences:
//   - "orgId": the organisation's uuid (needed to build the blob pathname prefix)
//   - every asset is { "kind", "file", "label", "contentType"? } instead of
//     pathname / bytes / sha256, which this script computes from the local file.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { upload as blobUpload } from "@vercel/blob/client";
import { z } from "zod";
import { ASSET_KIND_LIST } from "../lib/portal/asset-kinds";
import { assetPrefix } from "../lib/portal/data/ingest";
import { ingestPayloadSchema, type IngestPayload } from "../lib/portal/ingest-schema";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

const MULTIPART_THRESHOLD = 100 * 1024 * 1024;

const cliAssetSchema = z
  .object({
    kind: z.enum(ASSET_KIND_LIST),
    file: z.string().min(1),
    label: z.string().max(200).nullable(),
    contentType: z.string().min(1).max(100).optional(),
  })
  .strict();

export type PlannedAsset = {
  readonly file: string;
  readonly kind: (typeof ASSET_KIND_LIST)[number];
  readonly contentType: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly pathname: string;
  readonly body: Buffer;
};

export type Plan = {
  readonly orgId: string;
  readonly payload: IngestPayload;
  readonly assets: readonly PlannedAsset[];
};

export class PlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanError";
  }
}

/** Read and validate the input file and the local assets. No network. */
export function buildPlan(inputPath: string): Plan {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (e) {
    throw new PlanError(`cannot read ${inputPath} as JSON: ${e instanceof Error ? e.message : "error"}`);
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new PlanError("input must be a JSON object");
  }
  const { orgId, assets: rawAssets, ...rest } = raw as Record<string, unknown>;
  const orgIdParsed = z.uuid().safeParse(orgId);
  if (!orgIdParsed.success) throw new PlanError('"orgId" must be the organisation uuid');
  const assetsParsed = z.array(cliAssetSchema).max(60).safeParse(rawAssets ?? []);
  if (!assetsParsed.success) {
    throw new PlanError(
      `assets: ${assetsParsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  }

  // sessionNumber is validated by the full schema below; it is needed first for the prefix.
  const sessionNumber = (rest as { sessionNumber?: unknown }).sessionNumber;
  if (typeof sessionNumber !== "number" || !Number.isInteger(sessionNumber)) {
    throw new PlanError('"sessionNumber" must be an integer');
  }
  const prefix = assetPrefix(orgIdParsed.data, sessionNumber);
  const baseDir = dirname(resolve(inputPath));

  const planned: PlannedAsset[] = assetsParsed.data.map((a) => {
    const file = resolve(baseDir, a.file);
    let body: Buffer;
    try {
      body = readFileSync(file);
    } catch {
      throw new PlanError(`asset file not found or unreadable: ${a.file}`);
    }
    const contentType = a.contentType ?? CONTENT_TYPES[extname(file).toLowerCase()];
    if (contentType === undefined) {
      throw new PlanError(`cannot infer a content type for ${a.file}; set "contentType"`);
    }
    const sha256 = createHash("sha256").update(body).digest("hex");
    // Content-addressed name: the same bytes always land on the same pathname, so a re-run
    // never needs to overwrite (the server forbids overwriting) and changed bytes get a new name.
    const safe = basename(file).replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^[._]+/, "") || "file";
    return {
      file,
      kind: a.kind,
      contentType,
      bytes: body.byteLength,
      sha256,
      pathname: `${prefix}${sha256.slice(0, 16)}-${safe}`,
      body,
    };
  });

  const candidate = {
    ...rest,
    assets: planned.map((p, i) => ({
      kind: p.kind,
      pathname: p.pathname,
      contentType: p.contentType,
      bytes: p.bytes,
      sha256: p.sha256,
      label: assetsParsed.data[i]?.label ?? null,
    })),
  };
  const parsed = ingestPayloadSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new PlanError(
      `invalid session file: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ")}`,
    );
  }
  return { orgId: orgIdParsed.data, payload: parsed.data, assets: planned };
}

export type UploadFn = typeof blobUpload;

export type Io = {
  readonly log: (line: string) => void;
  readonly error: (line: string) => void;
  readonly fetch?: typeof fetch;
  readonly upload?: UploadFn;
};

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

/** Returns the process exit code. */
export async function run(argv: string[], env: Record<string, string | undefined>, io: Io): Promise<number> {
  const dryRun = argv.includes("--dry-run");
  const baseEnvName = flag(argv, "--base-url-env") ?? "PORTAL_BASE_URL";
  const tokenEnvName = flag(argv, "--token-env") ?? "PORTAL_INGEST_TOKEN";
  const valueFlags = new Set(["--base-url-env", "--token-env"]);
  const positional = argv.filter((a, i) => !a.startsWith("--") && !valueFlags.has(argv[i - 1] ?? ""));
  const inputPath = positional[0];
  if (inputPath === undefined) {
    io.error("usage: portal-ingest.mts <session.json> [--dry-run] [--base-url-env NAME] [--token-env NAME]");
    return 2;
  }

  const baseUrl = env[baseEnvName];
  const token = env[tokenEnvName];
  const missing = [
    ...(baseUrl === undefined || baseUrl === "" ? [baseEnvName] : []),
    ...(token === undefined || token === "" ? [tokenEnvName] : []),
  ];
  if (missing.length > 0 || baseUrl === undefined || token === undefined) {
    io.error(`refusing to run: environment variable(s) not set: ${missing.join(", ")}`);
    return 2;
  }

  let plan: Plan;
  try {
    plan = buildPlan(inputPath);
  } catch (e) {
    io.error(e instanceof PlanError ? e.message : `unexpected error: ${e instanceof Error ? e.name : "error"}`);
    return 1;
  }

  io.log(
    `session ${plan.payload.org}/${plan.payload.program} #${plan.payload.sessionNumber}: "${plan.payload.title}"`,
  );
  io.log(`${plan.payload.tasks.length} task(s), ${plan.payload.nextTime.length} next-time item(s), ${plan.assets.length} asset(s)`);
  for (const a of plan.assets) {
    io.log(`  ${a.kind}  ${a.contentType}  ${a.bytes} bytes  sha256 ${a.sha256.slice(0, 12)}...  -> ${a.pathname}`);
  }
  if (dryRun) {
    io.log("dry run: nothing was uploaded or sent.");
    return 0;
  }

  const base = baseUrl.replace(/\/+$/, "");
  const doFetch = io.fetch ?? fetch;
  const doUpload = io.upload ?? blobUpload;

  for (const a of plan.assets) {
    try {
      await doUpload(a.pathname, a.body, {
        access: "private",
        handleUploadUrl: `${base}/api/portal/upload`,
        headers: { Authorization: `Bearer ${token}` },
        contentType: a.contentType,
        multipart: a.bytes > MULTIPART_THRESHOLD,
        clientPayload: JSON.stringify({
          orgId: plan.orgId,
          sessionNumber: plan.payload.sessionNumber,
          kind: a.kind,
          contentType: a.contentType,
          bytes: a.bytes,
        }),
      });
      io.log(`uploaded ${a.pathname}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      // Same bytes -> same pathname, so "already exists" means a previous run uploaded it.
      if (/already exists|overwrite/i.test(msg)) {
        io.log(`already uploaded ${a.pathname}`);
        continue;
      }
      io.error(`upload failed for ${a.file}: ${msg.replace(/https?:\/\/\S+/g, "<url>")}`);
      return 1;
    }
  }

  const res = await doFetch(`${base}/api/portal/ingest/session`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(plan.payload),
  });
  const text = await res.text();
  if (!res.ok) {
    io.error(`ingest refused: HTTP ${res.status} ${text.slice(0, 500)}`);
    return 1;
  }
  const body = JSON.parse(text) as { sessionId: string; status: string; result: string; editUrl: string };
  io.log(`result: ${body.result} (${body.status})`);
  io.log(`edit and publish: ${body.editUrl}`);
  return 0;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(process.argv.slice(2), process.env, {
    log: (l) => console.log(l),
    error: (l) => console.error(l),
  }).then(
    (code) => {
      process.exitCode = code;
    },
    (e: unknown) => {
      console.error(`failed: ${e instanceof Error ? e.message : "error"}`);
      process.exitCode = 1;
    },
  );
}
