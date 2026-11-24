import { notFound } from "next/navigation";
import { ClientSession } from "@/components/portal/ClientScreens";
import Shell from "@/components/portal/Shell";
import { SAMPLE_SESSION, sampleAssetHref } from "@/lib/portal/sample";
import { previewToggle } from "../../actions";
import { previewOnly, SAMPLE_NOTICE } from "../../gate";

export default async function PreviewSession({ params }: { params: Promise<{ id: string }> }) {
  previewOnly();
  const { id } = await params;
  if (id !== SAMPLE_SESSION.id) notFound();
  return (
    <Shell homeHref="/portal/preview" who="Sample client" notice={SAMPLE_NOTICE} nav={[{ label: "Overview", href: "/portal/preview" }]}>
      <ClientSession
        session={SAMPLE_SESSION}
        homeHref="/portal/preview"
        toggle={previewToggle}
        assetHref={sampleAssetHref}
      />
    </Shell>
  );
}
