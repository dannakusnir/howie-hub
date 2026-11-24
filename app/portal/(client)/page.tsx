import { redirect } from "next/navigation";
import { ClientHome } from "@/components/portal/ClientScreens";
import Shell from "@/components/portal/Shell";
import { toggleItem } from "@/lib/portal/actions/client";
import { shellProps } from "@/lib/portal/actions/shell";
import { forClient } from "@/lib/portal/data/client";
import { requireClient, signedIn } from "@/lib/portal/principal";
import { ROLE_HOME } from "@/lib/portal/roles";

export default async function PortalHome() {
  // Staff who open /portal land on their own desk. Only then is a client principal required.
  const user = await signedIn();
  if (user.role !== "client") redirect(ROLE_HOME[user.role]);
  const dal = forClient(await requireClient());

  const [program] = await dal.roadmap();
  if (program === undefined) {
    return (
      <Shell {...shellProps(user, "overview")}>
        <section className="px-6 py-12 md:px-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[0.98]">
            Your program is <span className="text-amber">not set up yet.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--p-dim)]">
            You are signed in, but no program has been attached to your organisation. Tell Howie, and he will sort it out.
          </p>
        </section>
      </Shell>
    );
  }
  const latest = await dal.latestPublished(program.programSlug);

  return (
    <Shell {...shellProps(user, "overview")}>
      <ClientHome
        program={program}
        latest={latest}
        now={new Date()}
        toggle={toggleItem}
        assetHref={(assetId) => `/api/portal/assets/${assetId}`}
        sessionHref={(sessionId) => `/portal/sessions/${sessionId}`}
      />
    </Shell>
  );
}
