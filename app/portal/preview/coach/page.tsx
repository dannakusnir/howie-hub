import { DraftQueue } from "@/components/portal/CoachScreens";
import Shell from "@/components/portal/Shell";
import { SAMPLE_QUEUE } from "@/lib/portal/sample";
import { previewOnly, SAMPLE_NOTICE } from "../gate";

export default function PreviewCoach() {
  previewOnly();
  return (
    <Shell
      homeHref="/portal/preview/coach"
      who="Howie Zales"
      notice={SAMPLE_NOTICE}
      nav={[
        { label: "Review", href: "/portal/preview/coach", current: true },
        { label: "Client view", href: "/portal/preview" },
      ]}
    >
      <DraftQueue drafts={SAMPLE_QUEUE} sessionBase="/portal/preview/coach" />
    </Shell>
  );
}
