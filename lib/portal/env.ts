import "server-only";

// One accessor per environment variable. Each reads lazily (never at import or build
// time) and throws an Error that names the missing variable. Values are never logged.

function required(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === "") {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return v;
}

export const databaseUrl = () => required("DATABASE_URL");
export const databaseUrlUnpooled = () => required("DATABASE_URL_UNPOOLED");
export const portalBlobReadWriteToken = () => required("PORTAL_BLOB_READ_WRITE_TOKEN");
export const authSecret = () => required("AUTH_SECRET");
export const authResendKey = () => required("AUTH_RESEND_KEY");
export const portalEmailFrom = () => required("PORTAL_EMAIL_FROM");
export const portalIngestToken = () => required("PORTAL_INGEST_TOKEN");
