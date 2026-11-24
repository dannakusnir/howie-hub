import { DraftQueue, PublishedList } from "@/components/portal/CoachScreens";
import Shell from "@/components/portal/Shell";
import { shellProps } from "@/lib/portal/actions/shell";
import { forStaff } from "@/lib/portal/data/staff";
import { requireStaff, signedIn } from "@/lib/portal/principal";

export default async function CoachHome() {
  const principal = await requireStaff();
  const user = await signedIn();
  const staff = forStaff(principal);
  const [drafts, published] = await Promise.all([staff.draftQueue(), staff.publishedSessions()]);

  return (
    <Shell {...shellProps(user, "review")}>
      <DraftQueue drafts={drafts} sessionBase="/portal/coach/sessions" />
      <PublishedList sessions={published} sessionBase="/portal/coach/sessions" />
    </Shell>
  );
}
