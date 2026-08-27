# howiezales.com

Marketing site for Howie Zales: HJZ Productions, Viridity Athena, the Operator Mindset podcast, press, and speaking/booking.

- Next.js (App Router), deployed on Vercel (project `howie-hub`)
- Lead forms (newsletter / podcast guest / booking) POST to `/api/lead`, which upserts the contact in GoHighLevel and adds tags additively
- Secrets (`GHL_LOCATION_ID`, `GHL_PIT_TOKEN`) live only in Vercel env vars, never in this repo

Pushes to `main` deploy to production.
