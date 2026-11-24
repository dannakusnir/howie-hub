import { notFound, redirect } from "next/navigation";
import { ClientSession } from "@/components/portal/ClientScreens";
import Shell from "@/components/portal/Shell";
import { toggleItem } from "@/lib/portal/actions/client";
import { shellProps } from "@/lib/portal/actions/shell";
import { forClient } from "@/lib/portal/data/client";
import { requireClient, signedIn } from "@/lib/portal/principal";
import { ROLE_HOME } from "@/lib/portal/roles";

export default async function PortalSession({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await signedIn();
  if (user.role !== "client") redirect(ROLE_HOME[user.role]);
  const session = await forClient(await requireClient()).session(sessionId);
  // Not yours, not published and not a real id all look the same: a 404.
  if (session === null) notFound();

  return (
    <Shell {...shellProps(user, "overview")}>
      <ClientSession
        session={session}
        homeHref="/portal"
        toggle={toggleItem}
        assetHref={(assetId) => `/api/portal/assets/${assetId}`}
      />
    </Shell>
  );
}
