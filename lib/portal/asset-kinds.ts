// Asset kinds attached to a coaching session. ASSET_KIND_LIST is the single source for
// the DB enum, the AssetKind union and (via Record<AssetKind, ...>) the spec table:
// add a member to the list without an ASSET_KINDS entry and `tsc` fails.

export const ASSET_KIND_LIST = [
  "slides_pdf",
  "slide_image",
  "audio",
  "transcript",
  "recap_audio",
  "recap_video",
] as const;
export type AssetKind = (typeof ASSET_KIND_LIST)[number];

/** How the client screen presents the asset. */
export type AssetRender = "pdf" | "image" | "audio" | "text" | "video";

export type AssetKindSpec = {
  readonly label: string;
  /** Allowed MIME types. */
  readonly accept: readonly string[];
  readonly maxBytes: number;
  readonly render: AssetRender;
};

const MB = 1024 * 1024;

export const ASSET_KINDS: Record<AssetKind, AssetKindSpec> = {
  slides_pdf: {
    label: "Slides (PDF)",
    accept: ["application/pdf"],
    maxBytes: 50 * MB,
    render: "pdf",
  },
  slide_image: {
    label: "Slide image",
    accept: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: 10 * MB,
    render: "image",
  },
  audio: {
    label: "Session audio",
    accept: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav"],
    maxBytes: 200 * MB,
    render: "audio",
  },
  transcript: {
    label: "Transcript",
    accept: ["text/plain", "text/markdown", "application/pdf"],
    maxBytes: 5 * MB,
    render: "text",
  },
  recap_audio: {
    label: "Athena's recap (audio)",
    accept: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav"],
    maxBytes: 50 * MB,
    render: "audio",
  },
  recap_video: {
    label: "Athena's recap (video)",
    accept: ["video/mp4", "video/quicktime"],
    maxBytes: 500 * MB,
    render: "video",
  },
};
