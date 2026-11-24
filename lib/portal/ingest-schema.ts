import { z } from "zod";
import { ASSET_KIND_LIST, ASSET_KINDS } from "./asset-kinds";

// Wire contract of POST /api/portal/ingest/session. `.strict()` at every level: an
// unknown key (status, publishedAt, ...) fails parsing and the issue names the key.

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,62}$/, "must be a lowercase slug");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");
const lineItem = z.object({ text: z.string().trim().min(1).max(500) }).strict();

const assetSchema = z
  .object({
    kind: z.enum(ASSET_KIND_LIST),
    pathname: z
      .string()
      .min(1)
      .max(500)
      .refine((p) => !p.includes("..") && !p.includes("//") && !p.startsWith("/"), {
        message: "pathname must be relative and free of '..' and '//'",
      }),
    contentType: z.string().min(1).max(100),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[0-9a-f]{64}$/, "must be a lowercase hex sha256"),
    label: z.string().max(200).nullable(),
  })
  .strict()
  .superRefine((a, ctx) => {
    const spec = ASSET_KINDS[a.kind];
    if (!spec.accept.includes(a.contentType)) {
      ctx.addIssue({
        code: "custom",
        path: ["contentType"],
        message: `${a.kind} accepts ${spec.accept.join(", ")}`,
      });
    }
    if (a.bytes > spec.maxBytes) {
      ctx.addIssue({
        code: "custom",
        path: ["bytes"],
        message: `${a.kind} is limited to ${spec.maxBytes} bytes`,
      });
    }
  });

export const ingestPayloadSchema = z
  .object({
    schemaVersion: z.literal(1),
    org: slug,
    program: slug,
    sessionNumber: z.number().int().min(1).max(999),
    heldOn: isoDate,
    title: z.string().trim().min(1).max(200),
    summaryMd: z.string().min(1).max(40_000),
    tasks: z.array(lineItem).max(50),
    nextTime: z.array(lineItem).max(50),
    assets: z.array(assetSchema).max(60),
    source: z
      .object({
        driveFolderId: z.string().min(1).max(200),
        contentHash: z.string().min(1).max(200),
      })
      .strict(),
    force: z.boolean().optional(),
  })
  .strict();

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;
