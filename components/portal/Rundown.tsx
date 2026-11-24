import Link from "next/link";
import type { RoadmapEntry } from "@/lib/portal/data/dto";
import { Tally } from "./Hud";
import { formatDay, Readout } from "./Shell";

/** The program as a run of show: every session in order, with where the client is in it. */
export default function Rundown({
  sessions,
  sessionHref,
}: {
  sessions: readonly RoadmapEntry[];
  sessionHref: (id: string) => string;
}) {
  const done = sessions.filter((s) => s.state === "done").length;

  return (
    <section aria-labelledby="rundown-title">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 mb-6">
        <h2 id="rundown-title" className="text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[0.95]">
          Twelve sessions<span className="text-green">.</span>
        </h2>
        <Readout>
          {done} of {sessions.length} sessions complete
        </Readout>
      </div>

      {/* One segment per session. Width is the count, so this is the data, not an ornament. */}
      <div className="flex gap-1 mb-8" aria-hidden="true">
        {sessions.map((s) => (
          <span
            key={s.number}
            className={`h-1.5 flex-1 rounded-full ${
              s.state === "done" ? "bg-green" : s.state === "next" ? "bg-white" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      <ol className="border-t border-[var(--p-line)]">
        {sessions.map((s) => {
          const number = <span className="font-mono text-sm text-[var(--p-dim)] w-8 shrink-0">{String(s.number).padStart(2, "0")}</span>;
          if (s.state === "done") {
            return (
              <li key={s.number} className="border-b border-[var(--p-line)]">
                <Link
                  href={sessionHref(s.id)}
                  className="group flex items-baseline gap-4 py-4 hover:bg-white/[0.03] transition-colors duration-200 -mx-3 px-3 rounded-lg"
                >
                  {number}
                  <span className="flex-1 text-base md:text-lg font-semibold text-white group-hover:text-green transition-colors duration-200">
                    {s.title}
                  </span>
                  {s.heldOn && <Readout>{formatDay(s.heldOn)}</Readout>}
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" /><Readout tone="green">Open</Readout></span>
                </Link>
              </li>
            );
          }
          return (
            <li key={s.number} className="border-b border-[var(--p-line)] flex items-baseline gap-4 py-4">
              {number}
              <span className={`flex-1 text-base md:text-lg ${s.state === "next" ? "text-white font-semibold" : "text-white/45"}`}>
                {s.state === "next" ? "Your next session" : `Session ${s.number}`}
              </span>
              {s.scheduledAt && <Readout>{formatDay(s.scheduledAt)}</Readout>}
              <span className="flex items-center gap-2">{s.state === "next" && <Tally tone="amber" />}<Readout tone={s.state === "next" ? "amber" : "dim"}>{s.state === "next" ? "Up next" : "Later"}</Readout></span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
