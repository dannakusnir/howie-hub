import { notFound } from "next/navigation";

export const SAMPLE_NOTICE = "Design preview. Sample data, nothing here is real or saved.";

/** The preview is a design, not the product: it does not exist on the production deployment. */
export function previewOnly(): void {
  if (process.env.VERCEL_ENV === "production") notFound();
}
