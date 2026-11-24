import Link from "next/link";
import SectionSlate from "@/components/SectionSlate";
import type { ClientSessionDto, RoadmapProgram } from "@/lib/portal/data/dto";
import AthenaMonitor from "./AthenaMonitor";
import { Brackets, countdown, HowieBackdrop, HudStrip, Kicker } from "./Hud";
import Rundown from "./Rundown";
import { Files, Summary, type AssetHref } from "./SessionMaterials";
import { formatDay, formatDayTime, Readout } from "./Shell";
import TickList, { type ToggleAction } from "./TickList";

type Common = {
  toggle: ToggleAction;
  assetHref: AssetHref;
  sessionHref: (id: string) => string;
};

const two = (n: number) => String(n).padStart(2, "0");

const cta =
  "inline-flex items-center justify-center bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-7 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow duration-300";

/** The client's landing screen. First thing on it: what to do before the next session. */
export function ClientHome({
  program,
  latest,
  now,
  toggle,
  assetHref,
  sessionHref,
}: Common & {
  program: RoadmapProgram;
  /** The most recently published session, or null before the first one is published. */
  latest: ClientSessionDto | null;
  /** Request time, passed in so the countdown is computed once on the server. */
  now: Date;
}) {
  const next = program.sessions.find((s) => s.state === "next");
  const open = latest ? [...latest.tasks, ...latest.nextTime].filter((i) => !i.done).length : 0;

  return (
    <div>
      {/* Scene one: the viewfinder. Howie in the back, the next session on the record. */}
      <section aria-labelledby="next-title" className="relative px-6 py-8 md:px-12 md:py-12">
        <HowieBackdrop />
        <Brackets />
        <div className="relative">
          <HudStrip
            tone={next ? "amber" : "green"}
            left={next ? `Session ${two(next.number)} up next` : program.programName}
            right={next?.scheduledAt ? countdown(next.scheduledAt, now) : undefined}
          />

          <div className="mt-14 md:mt-20 max-w-3xl">
            <Kicker>{program.programName}</Kicker>
            <h1 id="next-title" className="text-5xl md:text-7xl font-black tracking-[-0.035em] leading-[0.95] text-balance">
              {latest ? (
                open > 0 ? (
                  next ? (
                    <>
                      Before session <span className="text-green">{next.number}.</span>
                    </>
                  ) : (
                    <>
                      Still <span className="text-green">open.</span>
                    </>
                  )
                ) : (
                  <>
                    You are <span className="text-green">clear.</span>
                  </>
                )
              ) : (
                <>
                  Your first session is <span className="text-green">coming up.</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--p-dim)] max-w-xl">
              {latest
                ? open > 0
                  ? `${open} ${open === 1 ? "thing" : "things"} to close out before you and Howie meet again.`
                  : "Everything from your last session is done. Walk in ready."
                : "After each session, Howie's summary, your actions, the slides and a recap from Athena land here."}
            </p>
            <p className="mt-6 pb-4 flex flex-wrap gap-x-8 gap-y-2">
              {next?.scheduledAt ? (
                <Readout tone="amber">Next session: {formatDayTime(next.scheduledAt)}</Readout>
              ) : next ? (
                <Readout>Next session: date to be confirmed</Readout>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      {latest && (
        <section className="mt-16 md:mt-20 grid gap-x-16 gap-y-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-14">
            <div>
              <Kicker>Your actions</Kicker>
              <TickList items={latest.tasks} toggle={toggle} emptyText="No actions came out of this session." />
            </div>
            <div>
              <Kicker>Bring to the next session</Kicker>
              <TickList items={latest.nextTime} toggle={toggle} emptyText="Nothing to prepare this time." />
            </div>
          </div>

          <aside className="space-y-10">
            <AthenaMonitor assets={latest.assets} href={assetHref} sessionNumber={latest.number} />
            <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--p-panel)] p-6 md:p-7">
              <Readout tone="green">
                Session {two(latest.number)}
                {latest.heldOn ? ` · ${formatDay(latest.heldOn)}` : ""}
              </Readout>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] leading-tight text-balance">{latest.title}</h2>
              <Link href={sessionHref(latest.id)} className={`${cta} mt-6 w-full`}>
                Read Howie&rsquo;s summary
              </Link>
            </div>
          </aside>
        </section>
      )}

      <div className="mt-24 md:mt-32 -mx-6 md:-mx-10">
        <SectionSlate scene="THE PROGRAM" take={two(program.sessions.filter((s) => s.state === "done").length)} cam={two(program.sessions.length)} label={program.programName} />
      </div>
      <div className="mt-12">
        <Rundown sessions={program.sessions} sessionHref={sessionHref} />
      </div>
    </div>
  );
}

/** One published session, in full. */
export function ClientSession({
  session,
  homeHref,
  toggle,
  assetHref,
}: Omit<Common, "sessionHref"> & { session: ClientSessionDto; homeHref: string }) {
  return (
    <article>
      <header className="relative px-6 py-8 md:px-12 md:py-12">
        <HowieBackdrop />
        <Brackets />
        <div className="relative">
          <HudStrip left={`Session ${two(session.number)} on the record`} right={session.heldOn ? formatDay(session.heldOn) : undefined} />
          <div className="mt-12 md:mt-16 max-w-3xl pb-4">
            <Link href={homeHref} className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/60 hover:text-green transition-colors duration-200">
              &larr; Back to overview
            </Link>
            <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-[-0.035em] leading-[0.98] text-balance">{session.title}</h1>
            <p className="mt-5">
              <Readout>
                Session {session.number} · {session.programName}
              </Readout>
            </p>
          </div>
        </div>
      </header>

      <div className="mt-16 grid gap-x-16 gap-y-16 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="summary-title">
          <Kicker>From Howie</Kicker>
          <h2 id="summary-title" className="text-3xl md:text-4xl font-black tracking-[-0.03em] leading-[0.98] mb-8">
            What I took from this one<span className="text-green">.</span>
          </h2>
          <Summary markdown={session.summaryMd} />
        </section>

        <div className="space-y-14">
          <AthenaMonitor assets={session.assets} href={assetHref} sessionNumber={session.number} />
          <section>
            <Kicker>Your actions</Kicker>
            <TickList items={session.tasks} toggle={toggle} emptyText="No actions came out of this session." />
          </section>
          <section>
            <Kicker>Bring to the next session</Kicker>
            <TickList items={session.nextTime} toggle={toggle} emptyText="Nothing to prepare this time." />
          </section>
          <Files assets={session.assets} href={assetHref} />
        </div>
      </div>
    </article>
  );
}
