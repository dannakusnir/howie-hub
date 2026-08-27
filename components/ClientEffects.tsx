"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const BootSequence = dynamic(() => import("./BootSequence"), { ssr: false });
const StickyHUD = dynamic(() => import("./StickyHUD"), { ssr: false });
const HUDPlayground = dynamic(() => import("./HUDPlayground"), { ssr: false });

export default function ClientEffects() {
  return (
    <>
      <BootSequence />
      <HUDPlayground />
      <CustomCursor />
      <StickyHUD />
    </>
  );
}
