import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/portal/auth";
import { buildConsumeRequest, LOGIN_PATH } from "@/lib/portal/auth-config";

// The button on /portal/login/verify posts here. This is the only place a sign-in token is
// consumed. A GET (a mail scanner, a link preview) is a 405 and touches nothing.

export async function POST(request: NextRequest) {
  const consume = buildConsumeRequest(await request.formData(), request.url, request.headers);
  if (consume === null) {
    return NextResponse.redirect(new URL(`${LOGIN_PATH}?error=Verification`, request.url), 303);
  }
  return handlers.GET(new NextRequest(consume));
}
