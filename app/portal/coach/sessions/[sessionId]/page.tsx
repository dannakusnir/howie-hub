import { notFound } from "next/navigation";
import { DraftEditor } from "@/components/portal/CoachScreens";
import Shell from "@/components/portal/Shell";
import { publishSession, saveDraft, unpublishSession } from "@/lib/portal/actions/coach";
import { shellProps } from "@/lib/portal/actions/shell";
import { forStaff } from "@/lib/portal/data/staff";
import { requireStaff, signedIn } from "@/lib/portal/principal";

export default async function CoachSession({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = await requireStaff();
  const user = await signedIn();
  const session = await forStaff(principal).session(sessionId);
  if (session === null) notFound();

  return (
    <Shell {...shellProps(user, "review")}>
      <DraftEditor
        // A new session id is a new editor: its text state must not carry over.
        key={session.id}
        session={session}
        queueHref="/portal/coach"
        save={saveDraft.bind(null, session.id)}
        publish={publishSession.bind(null, session.id)}
        unpublish={unpublishSession.bind(null, session.id)}
      />
    </Shell>
  );
}
