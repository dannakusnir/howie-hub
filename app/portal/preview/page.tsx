import { ClientHome } from "@/components/portal/ClientScreens";
import Shell from "@/components/portal/Shell";
import { SAMPLE_PROGRAM, SAMPLE_SESSION, sampleAssetHref } from "@/lib/portal/sample";
import { previewToggle } from "./actions";
import { previewOnly, SAMPLE_NOTICE } from "./gate";

export default function PreviewHome() {
  previewOnly();
  return (
    <Shell
      homeHref="/portal/preview"
      who="Sample client"
      notice={SAMPLE_NOTICE}
      nav={[
        { label: "Overview", href: "/portal/preview", current: true },
        { label: "Coach view", href: "/portal/preview/coach" },
        { label: "Sign-in", href: "/portal/preview/login" },
      ]}
    >
      <ClientHome
        program={SAMPLE_PROGRAM}
        latest={SAMPLE_SESSION}
        now={new Date("2026-12-24T15:00:00Z")}
        toggle={previewToggle}
        assetHref={sampleAssetHref}
        sessionHref={(sessionId) => `/portal/preview/session/${sessionId}`}
      />
    </Shell>
  );
}
