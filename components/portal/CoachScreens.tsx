"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ASSET_KINDS } from "@/lib/portal/asset-kinds";
import type { DraftQueueEntry, StaffSessionDto } from "@/lib/portal/data/dto";
import Image from "next/image";
import { Brackets, HudStrip, Kicker } from "./Hud";
import { formatDay, Readout } from "./Shell";

export type CoachResult = { readonly ok: true; readonly message: string } | { readonly ok: false; readonly message: string };

const DAY_TIME = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });

/** Drafts waiting for the coach. */
/** `sessionBase` is a path prefix; the session id is appended. */
export function DraftQueue({ drafts, sessionBase }: { drafts: readonly DraftQueueEntry[]; sessionBase: string }) {
  return (
    <section aria-labelledby="queue-title" className="relative px-6 py-8 md:px-12 md:py-12">
      <Brackets />
      <HudStrip tone={drafts.length > 0 ? "amber" : "green"} left="Coach desk" right={drafts.length > 0 ? "Awaiting your review" : "All clear"} />
      <div className="mt-12" />
      <Kicker>Drafted by Athena</Kicker>
      <h1 id="queue-title" className="text-5xl md:text-6xl font-black tracking-[-0.035em] leading-[0.95]">
        {drafts.length === 0 ? "Nothing waiting for you" : drafts.length === 1 ? "1 session to review" : `${drafts.length} sessions to review`}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--p-dim)]">
        Clients see nothing until you publish. Read the draft, fix what is off, then publish.
      </p>

      {drafts.length > 0 && (
        <ul className="mt-10 border-t border-[var(--p-line)]">
          {drafts.map((d) => (
            <li key={d.id} className="border-b border-[var(--p-line)]">
              <Link href={`${sessionBase}/${d.id}`} className="group grid gap-x-6 gap-y-1 py-5 md:grid-cols-[10rem_1fr_auto] md:items-baseline hover:bg-white/[0.03] -mx-3 px-3 rounded-lg transition-colors duration-200">
                <Readout>
                  {d.orgName}, session {d.number}
                </Readout>
                <span className="text-lg font-semibold group-hover:text-green transition-colors duration-200">
                  {d.title ?? "Untitled draft"}
                </span>
                <Readout tone={d.editedAt ? "dim" : "amber"}>
                  {d.editedAt
                    ? `Edited ${DAY_TIME.format(d.editedAt)}`
                    : d.lastIngestedAt
                      ? `Drafted ${DAY_TIME.format(d.lastIngestedAt)}`
                      : "Empty"}
                </Readout>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export type DraftInput = {
  readonly title: string;
  readonly summaryMd: string;
  readonly tasks: readonly string[];
  readonly nextTime: readonly string[];
};

export const field =
  "w-full bg-white/[0.03] border border-white/10 focus:border-green/60 rounded-xl px-4 py-3 text-white text-base placeholder:text-white/30 outline-none transition-colors duration-200";

function ItemsEditor({ label, hint, value, onChange }: { label: string; hint: string; value: string[]; onChange: (next: string[]) => void }) {
  return (
    <fieldset>
      <legend className="text-lg font-extrabold tracking-[-0.02em]">{label}</legend>
      <p className="mt-1 mb-4 text-sm text-[var(--p-dim)]">{hint}</p>
      <ul className="space-y-2">
        {value.map((text, i) => (
          <li key={i} className="flex gap-2">
            <textarea
              aria-label={`${label} ${i + 1}`}
              rows={2}
              className={`${field} leading-6 resize-y`}
              value={text}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="shrink-0 px-3 rounded-xl border border-white/10 text-sm text-white/60 hover:text-red hover:border-red/50 transition-colors duration-200 cursor-pointer"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="mt-3 font-mono text-[11px] tracking-[0.2em] uppercase text-green hover:text-white transition-colors duration-200 cursor-pointer"
      >
        Add a line
      </button>
    </fieldset>
  );
}

/** Review, edit and publish one session. */
export function DraftEditor({
  session,
  queueHref,
  save,
  publish,
  unpublish,
}: {
  session: StaffSessionDto;
  queueHref: string;
  save: (input: DraftInput) => Promise<CoachResult>;
  publish: () => Promise<CoachResult>;
  unpublish: () => Promise<CoachResult>;
}) {
  const [title, setTitle] = useState(session.title ?? "");
  const [summaryMd, setSummaryMd] = useState(session.summaryMd ?? "");
  const [tasks, setTasks] = useState(session.tasks.map((t) => t.text));
  const [nextTime, setNextTime] = useState(session.nextTime.map((t) => t.text));
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [pending, startTransition] = useTransition();

  const published = session.status === "published";
  const orgLabel = session.orgName ?? session.orgSlug.toUpperCase();
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
    setResult(null);
    setConfirming(false);
  };

  const run = (action: () => Promise<CoachResult>, after?: () => void) =>
    startTransition(async () => {
      const r = await action();
      setResult(r);
      if (r.ok) after?.();
    });

  const clean = (lines: string[]) => lines.map((l) => l.trim()).filter((l) => l !== "");

  return (
    <div>
      <Link href={queueHref} className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-green transition-colors duration-200">
        Back to review queue
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <p className="flex items-center gap-3 mb-5">
            <span className="relative h-9 w-9 rounded-full overflow-hidden border border-green/50 shrink-0">
              <Image src="/athena-close.webp" alt="" fill sizes="36px" className="object-cover object-[50%_15%]" style={{ filter: "grayscale(0.6) contrast(1.15) sepia(0.25) hue-rotate(80deg) saturate(1.8)" }} />
            </span>
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-green">Drafted by Athena from your call and debrief</span>
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[0.98]">
            {orgLabel}, session {session.number}<span className="text-green">.</span>
          </h1>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <Readout tone={published ? "green" : "amber"}>{published ? "Published: clients can see this" : "Draft: clients cannot see this"}</Readout>
            {session.heldOn && <Readout>Held {formatDay(session.heldOn)}</Readout>}
          </p>
        </div>
      </header>

      <form
        className="mt-10 grid gap-x-16 gap-y-12 lg:grid-cols-[1.35fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => save({ title: title.trim(), summaryMd, tasks: clean(tasks), nextTime: clean(nextTime) }), () => setDirty(false));
        }}
      >
        <div className="space-y-8">
          <div>
            <label htmlFor="draft-title" className="block text-lg font-extrabold tracking-[-0.02em] mb-3">
              Session title
            </label>
            <input id="draft-title" className={field} value={title} onChange={(e) => touch(setTitle)(e.target.value)} />
          </div>
          <div>
            <label htmlFor="draft-summary" className="block text-lg font-extrabold tracking-[-0.02em]">
              Your summary
            </label>
            <p className="mt-1 mb-3 text-sm text-[var(--p-dim)]">
              Written in your voice from the call and your debrief. Edit freely; this is what the client reads.
            </p>
            <textarea
              id="draft-summary"
              rows={20}
              className={`${field} leading-7 resize-y font-sans`}
              value={summaryMd}
              onChange={(e) => touch(setSummaryMd)(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-10">
          <ItemsEditor label="Client actions" hint="What they do before the next session." value={tasks} onChange={touch(setTasks)} />
          <ItemsEditor label="Bring to the next session" hint="What they should have ready when you meet." value={nextTime} onChange={touch(setNextTime)} />

          <section aria-labelledby="attached-title">
            <h2 id="attached-title" className="text-lg font-extrabold tracking-[-0.02em] mb-3">
              Attached
            </h2>
            {session.assets.length === 0 ? (
              <p className="text-amber text-sm">No slides, recap or recording are attached to this session yet.</p>
            ) : (
              <ul className="border-t border-[var(--p-line)]">
                {session.assets.map((a) => (
                  <li key={a.id} className="border-b border-[var(--p-line)] py-3 flex items-baseline justify-between gap-4">
                    <span>{a.label ?? ASSET_KINDS[a.kind].label}</span>
                    <Readout>{ASSET_KINDS[a.kind].label}</Readout>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="lg:col-span-2 border-t border-[var(--p-line)] pt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending || !dirty}
            className="border border-white/20 text-white font-bold text-sm tracking-wide uppercase rounded-xl px-6 py-3.5 hover:border-green hover:text-green transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {pending ? "Working" : dirty ? "Save changes" : "Saved"}
          </button>

          {published ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(unpublish)}
              className="border border-red/50 text-red font-bold text-sm tracking-wide uppercase rounded-xl px-6 py-3.5 hover:bg-red hover:text-black transition-colors duration-200 disabled:opacity-40 cursor-pointer"
            >
              Unpublish
            </button>
          ) : confirming ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(publish, () => setConfirming(false))}
                className="bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-6 py-3.5 hover:shadow-[0_0_40px_rgba(0,255,136,0.35)] transition-shadow duration-300 disabled:opacity-40 cursor-pointer"
              >
                Yes, publish to {orgLabel}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="text-sm text-white/60 hover:text-white cursor-pointer">
                Not yet
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={pending || dirty}
              onClick={() => setConfirming(true)}
              className="bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-6 py-3.5 hover:shadow-[0_0_40px_rgba(0,255,136,0.35)] transition-shadow duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Publish to client
            </button>
          )}

          {dirty && !published && <span className="text-sm text-[var(--p-dim)]">Save your changes before publishing.</span>}
          <p role="status" className={`text-sm ${result?.ok === false ? "text-red" : "text-green"}`}>
            {result?.message}
          </p>
        </div>
      </form>
    </div>
  );
}
