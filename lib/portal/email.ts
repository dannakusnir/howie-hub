import "server-only";
import { Resend } from "resend";
import { authResendKey, portalEmailFrom } from "./env";

// Sign-in email. Plain and branded: one sentence of context, one link, one line of
// reassurance. No em dashes. Sending goes through an injectable `Mailer`, so tests (and
// anything else that must not reach the network) pass a fake.

export type MailMessage = {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

export type Mailer = (message: MailMessage) => Promise<void>;

/** Real mailer: Resend. The key is read when a message is sent, never at import. */
export const resendMailer: Mailer = async (message) => {
  const { error } = await new Resend(authResendKey()).emails.send({
    from: message.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  if (error) throw new Error(`Resend refused the sign-in email: ${error.name}`);
};

export const portalFrom = (): string => portalEmailFrom();

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The page the emailed link opens. It only shows a button; pressing it (a POST) is what
 * signs the person in, so mail scanners that fetch the link do not use up the token.
 */
export function verifyPageUrl(origin: string, token: string, email: string): string {
  const url = new URL("/portal/login/verify", origin);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return url.toString();
}

export function buildSignInEmail(input: { to: string; from: string; url: string; minutes: number }): MailMessage {
  const subject = "Your sign-in link for the Howie Zales client portal";
  const text = [
    "Here is your sign-in link for the Howie Zales client portal.",
    "",
    input.url,
    "",
    `It works once and expires in ${input.minutes} minutes. If you did not ask for it, ignore this email and nothing happens.`,
    "",
    "Howie Zales",
  ].join("\n");
  const url = escapeHtml(input.url);
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:32px 16px;background:#050505;font-family:Inter,Arial,sans-serif;color:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;text-align:left">
<tr><td style="font-family:'Courier New',monospace;font-size:12px;letter-spacing:4px;color:#00ff88;font-weight:bold;padding-bottom:24px">HZ &middot; CLIENT PORTAL</td></tr>
<tr><td style="font-size:22px;font-weight:800;line-height:1.25;padding-bottom:16px">Your sign-in link.</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#d4d4d4;padding-bottom:28px">Press the button, then press it again on the page that opens. It works once and expires in ${input.minutes} minutes.</td></tr>
<tr><td style="padding-bottom:28px"><a href="${url}" style="display:inline-block;background:#00ff88;color:#000000;font-weight:bold;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:10px">Open the portal</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#8a8a8a">If the button does not work, copy this address into your browser:<br><span style="word-break:break-all">${url}</span></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#8a8a8a;padding-top:24px">If you did not ask for this, ignore this email and nothing happens.</td></tr>
</table></td></tr></table>
</body></html>`;
  return { from: input.from, to: input.to, subject, text, html };
}
