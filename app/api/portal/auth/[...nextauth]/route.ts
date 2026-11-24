import { NextResponse, type NextRequest } from "next/server";
import { verifyRedirectFor } from "@/lib/portal/auth-config";

// Auth.js endpoints are not exposed over HTTP. Sign-in and sign-out run server-side from
// server actions, and the only token-consuming call is the POST in ../verify/route.ts.
// This catch-all exists to answer the one URL that used to be the emailed link (Auth.js's
// own callback): a GET there never consumes the token, it forwards to the button page.
// Everything else (csrf, session, providers, raw sign-in POSTs that would reveal which
// addresses are invited) is a plain 404.

export function GET(request: NextRequest) {
  const forward = verifyRedirectFor(request.nextUrl);
  if (forward === null) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(forward, 303);
}

export function POST() {
  return new NextResponse(null, { status: 404 });
}
