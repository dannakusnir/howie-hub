import Image from "next/image";
import AudioWaveform from "@/components/AudioWaveform";
import ScanLineOverlay from "@/components/ScanLineOverlay";
import type { ClientAssetDto } from "@/lib/portal/data/dto";
import { Tally } from "./Hud";
import type { AssetHref } from "./SessionMaterials";

function MonitorCorners() {
  const c = "absolute w-7 h-7 border-green pointer-events-none z-10";
  return (
    <>
      <span className={`${c} top-3 left-3 border-t-2 border-l-2 rounded-tl-lg`} />
      <span className={`${c} top-3 right-3 border-t-2 border-r-2 rounded-tr-lg`} />
      <span className={`${c} bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg`} />
      <span className={`${c} bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg`} />
    </>
  );
}

/**
 * Athena on a broadcast monitor, the same treatment the site gives her: green duotone,
 * scan lines, viewfinder corners. She carries the session recap: video if there is one,
 * otherwise audio, otherwise an honest "not attached yet".
 */
export default function AthenaMonitor({
  assets,
  href,
  sessionNumber,
  compact = false,
}: {
  assets: readonly ClientAssetDto[];
  href: AssetHref;
  sessionNumber: number;
  compact?: boolean;
}) {
  const video = assets.find((a) => a.kind === "recap_video");
  const audio = assets.find((a) => a.kind === "recap_audio");

  return (
    <section aria-labelledby="athena-title" className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-green/5 blur-2xl pointer-events-none" aria-hidden="true" />
      <div className={`relative rounded-3xl overflow-hidden border border-green/40 bg-black ${video ? "aspect-video" : compact ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
        {video ? (
          <video controls preload="metadata" playsInline poster="/athena-podcast-poster.jpg" className="absolute inset-0 w-full h-full object-cover" src={href(video.id)}>
            <a href={href(video.id)}>Download Athena&rsquo;s recap</a>
          </video>
        ) : (
          <>
            <div className="absolute inset-0">
              <Image
                src="/athena-close.webp"
                alt="Athena, Howie's AI operator"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover object-[50%_18%]"
                style={{ filter: "grayscale(0.6) contrast(1.15) brightness(0.75) sepia(0.25) hue-rotate(80deg) saturate(1.8)" }}
              />
              <div className="absolute inset-0 mix-blend-color" style={{ backgroundColor: "rgba(0,255,136,0.35)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            <ScanLineOverlay intensity={0.7} />
            <div className="absolute inset-0 pointer-events-none opacity-15" aria-hidden="true">
              <div className="absolute inset-y-0 left-1/3 w-px bg-green" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-green" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-green" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-green" />
            </div>
            <MonitorCorners />
            <div className="absolute bottom-5 left-5 right-5 z-10">
              {audio && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[9px] tracking-[0.3em] text-green/70 uppercase">Voice</span>
                    <span className="flex-1 h-px bg-green/20" />
                  </div>
                  <AudioWaveform bars={32} height={22} />
                </div>
              )}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-green/70 mb-1">Session {String(sessionNumber).padStart(2, "0")} recap</p>
                  <h2 id="athena-title" className="text-white text-2xl md:text-3xl font-black tracking-tight">
                    ATHENA<span className="text-green">.</span>
                  </h2>
                </div>
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-green">
                  <Tally />
                  {audio ? "Recap ready" : "Standing by"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative mt-5">
        {video && (
          <h2 id="athena-title" className="text-xl font-black tracking-tight mb-1">
            ATHENA<span className="text-green">.</span>{" "}
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/80 align-middle ml-2">Session {String(sessionNumber).padStart(2, "0")} recap</span>
          </h2>
        )}
        {audio && !video && (
          <audio controls preload="none" src={href(audio.id)}>
            <a href={href(audio.id)}>Download Athena&rsquo;s recap</a>
          </audio>
        )}
        <p className="mt-2 text-sm leading-6 text-[var(--p-dim)]">
          {video || audio
            ? "Athena sat in on the session. This is her short recap, from the summary Howie approved."
            : "Athena sat in on the session. Her recap has not been attached to this one yet."}
        </p>
      </div>
    </section>
  );
}
