import { notFound } from "next/navigation";
import { DraftEditor } from "@/components/portal/CoachScreens";
import Shell from "@/components/portal/Shell";
import { SAMPLE_DRAFT } from "@/lib/portal/sample";
import { previewPublish, previewSave } from "../../actions";
import { previewOnly, SAMPLE_NOTICE } from "../../gate";

export default async function PreviewDraft({ params }: { params: Promise<{ id: string }> }) {
  previewOnly();
  const { id } = await params;
  if (id !== SAMPLE_DRAFT.id) notFound();
  return (
    <Shell homeHref="/portal/preview/coach" who="Howie Zales" notice={SAMPLE_NOTICE} nav={[{ label: "Review", href: "/portal/preview/coach", current: true }]}>
      <DraftEditor session={SAMPLE_DRAFT} queueHref="/portal/preview/coach" save={previewSave} publish={previewPublish} unpublish={previewPublish} />
    </Shell>
  );
}
