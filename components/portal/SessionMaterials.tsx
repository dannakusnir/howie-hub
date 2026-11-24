import ReactMarkdown from "react-markdown";
import { ASSET_KINDS, type AssetKind } from "@/lib/portal/asset-kinds";
import type { ClientAssetDto } from "@/lib/portal/data/dto";
import { Readout } from "./Shell";

export type AssetHref = (assetId: string) => string;

/** Howie's summary. Markdown only: react-markdown drops raw HTML by default. */
export function Summary({ markdown }: { markdown: string | null }) {
  if (!markdown || markdown.trim() === "") {
    return <p className="text-[var(--p-dim)]">Howie has not added a written summary for this session.</p>;
  }
  return (
    <div className="p-prose">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

function ofKind(assets: readonly ClientAssetDto[], ...kinds: AssetKind[]) {
  return assets.filter((a) => kinds.includes(a.kind)).sort((a, b) => a.position - b.position);
}

function size(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Slides, the call recording and its transcript, as files the client can open. */
export function Files({ assets, href }: { assets: readonly ClientAssetDto[]; href: AssetHref }) {
  const slideImages = ofKind(assets, "slide_image");
  const files = ofKind(assets, "slides_pdf", "audio", "transcript");
  if (slideImages.length === 0 && files.length === 0) return null;

  return (
    <section aria-labelledby="files-title">
      <h2 id="files-title" className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-5">
        From the session
      </h2>
      {slideImages.length > 0 && (
        <ol className="grid grid-cols-2 gap-3 mb-5">
          {slideImages.map((slide, i) => (
            <li key={slide.id}>
              <a href={href(slide.id)} className="block rounded-xl overflow-hidden border border-[var(--p-line)] hover:border-green transition-colors duration-200">
                {/* Private, authenticated bytes: next/image cannot fetch these. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={href(slide.id)} alt={slide.label ?? `Slide ${i + 1}`} loading="lazy" className="w-full aspect-video object-cover bg-black" />
              </a>
            </li>
          ))}
        </ol>
      )}
      <ul className="border-t border-[var(--p-line)]">
        {files.map((file) => (
          <li key={file.id} className="border-b border-[var(--p-line)]">
            {ASSET_KINDS[file.kind].render === "audio" ? (
              <div className="py-4">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <span className="font-semibold">{file.label ?? ASSET_KINDS[file.kind].label}</span>
                  <Readout>{size(file.bytes)}</Readout>
                </div>
                <audio controls preload="none" src={href(file.id)}>
                  <a href={href(file.id)}>Download the recording</a>
                </audio>
              </div>
            ) : (
              <a href={href(file.id)} className="group flex items-baseline justify-between gap-4 py-4">
                <span className="font-semibold group-hover:text-green transition-colors duration-200">
                  {file.label ?? ASSET_KINDS[file.kind].label}
                </span>
                <Readout>{size(file.bytes)}</Readout>
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
