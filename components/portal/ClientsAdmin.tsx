"use client";

import { useState, useTransition } from "react";
import type { OrgSummary } from "@/lib/portal/data/dto";
import { type CoachResult, field } from "./CoachScreens";
import { Brackets, HudStrip, Kicker } from "./Hud";
import { Readout } from "./Shell";

export type InviteAction = (orgId: string, input: { email: string; name: string }) => Promise<CoachResult>;
export type DisableAction = (userId: string) => Promise<CoachResult>;

function Status({ result }: { result: CoachResult | null }) {
  return (
    <p role="status" className={`text-sm min-h-5 ${result?.ok === false ? "text-red" : "text-green"}`}>
      {result?.message}
    </p>
  );
}

function InviteForm({ org, invite }: { org: OrgSummary; invite: InviteAction }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 grid gap-3 md:grid-cols-[1fr_1.4fr_auto] md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        setResult(null);
        startTransition(async () => {
          const r = await invite(org.id, { email, name });
          setResult(r);
          if (r.ok) {
            setName("");
            setEmail("");
          }
        });
      }}
    >
      <div>
        <label htmlFor={`invite-name-${org.id}`} className="block text-sm font-semibold mb-2">
          Name
        </label>
        <input
          id={`invite-name-${org.id}`}
          className={field}
          required
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`invite-email-${org.id}`} className="block text-sm font-semibold mb-2">
          Email
        </label>
        <input
          id={`invite-email-${org.id}`}
          type="email"
          className={field}
          required
          autoComplete="off"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-6 py-3.5 hover:shadow-[0_0_40px_rgba(0,255,136,0.35)] transition-shadow duration-300 disabled:opacity-40 cursor-pointer"
      >
        {pending ? "Inviting" : "Invite"}
      </button>
      <div className="md:col-span-3">
        <Status result={result} />
      </div>
    </form>
  );
}

function UserRow({ user, disable }: { user: OrgSummary["users"][number]; disable: DisableAction }) {
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li className="border-b border-[var(--p-line)] py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="text-lg font-semibold break-words">{user.name ?? "No name"}</p>
          <p className="text-sm text-[var(--p-dim)] break-all">{user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Readout tone={user.disabled ? "amber" : "green"}>{user.disabled ? "Disabled" : "Can sign in"}</Readout>
          {!user.disabled &&
            (confirming ? (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const r = await disable(user.id);
                      setResult(r);
                      setConfirming(false);
                    })
                  }
                  className="border border-red/50 text-red font-bold text-xs tracking-wide uppercase rounded-xl px-4 py-2.5 hover:bg-red hover:text-black transition-colors duration-200 disabled:opacity-40 cursor-pointer"
                >
                  {pending ? "Working" : "Yes, disable"}
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="text-sm text-white/60 hover:text-white cursor-pointer">
                  Not yet
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setConfirming(true);
                }}
                className="border border-white/20 text-white/80 font-bold text-xs tracking-wide uppercase rounded-xl px-4 py-2.5 hover:border-red hover:text-red transition-colors duration-200 cursor-pointer"
              >
                Disable
              </button>
            ))}
        </div>
      </div>
      {result && (
        <div className="mt-2">
          <Status result={result} />
        </div>
      )}
    </li>
  );
}

/** Client organisations and the people invited to each. Invite by email + name, disable a person. */
export default function ClientsAdmin({
  orgs,
  invite,
  disable,
}: {
  orgs: readonly OrgSummary[];
  invite: InviteAction;
  disable: DisableAction;
}) {
  return (
    <section aria-labelledby="clients-title" className="relative px-6 py-8 md:px-12 md:py-12">
      <Brackets />
      <HudStrip left="Coach desk" right={`${orgs.length} ${orgs.length === 1 ? "organisation" : "organisations"}`} />
      <div className="mt-12" />
      <Kicker>Invite only</Kicker>
      <h1 id="clients-title" className="text-5xl md:text-6xl font-black tracking-[-0.035em] leading-[0.95]">
        Clients<span className="text-green">.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--p-dim)]">
        Only people on this list can sign in. Inviting adds them; they then request their own sign-in link at the login page.
        Disabling ends their sessions straight away.
      </p>

      {orgs.length === 0 ? (
        <p className="mt-10 text-amber">
          No client organisation exists yet. Organisations are created by the setup script, not from this page.
        </p>
      ) : (
        <div className="mt-12 space-y-16">
          {orgs.map((org) => (
            <div key={org.id}>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <h2 className="text-3xl font-black tracking-[-0.03em]">{org.name}</h2>
                <Readout>{org.engagements.length === 0 ? "No program yet" : org.engagements.map((e) => e.programSlug).join(", ")}</Readout>
              </div>
              {org.users.length === 0 ? (
                <p className="mt-4 text-[var(--p-dim)]">Nobody has been invited to {org.name} yet.</p>
              ) : (
                <ul className="mt-4 border-t border-[var(--p-line)]">
                  {org.users.map((u) => (
                    <UserRow key={u.id} user={u} disable={disable} />
                  ))}
                </ul>
              )}
              <InviteForm org={org} invite={invite} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
