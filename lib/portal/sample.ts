// SAMPLE DATA FOR THE DESIGN PREVIEW ONLY (/portal/preview).
// Everything here (titles, names, dates, summary, actions) is invented to show the layout.
// Never seed a database from this file.

import type { ClientSessionDto, DraftQueueEntry, RoadmapProgram, StaffSessionDto } from "./data/dto";

const TITLES = [
  "Sample session one",
  "Sample session two",
  "Sample session three",
  "Sample session four",
  "Sample session five",
  "Sample session six",
  "Sample session seven",
  "Sample session eight",
  "Sample session nine",
  "Sample session ten",
  "Sample session eleven",
  "Sample session twelve",
] as const;

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (iso: string) => new Date(iso);

export const SAMPLE_RECAP_ID = id(303);
/** Preview-only asset resolver. */
export const sampleAssetHref = (assetId: string) => (assetId === SAMPLE_RECAP_ID ? "/athena-podcast.mp4" : `/api/portal/assets/${assetId}`);

export const SAMPLE_PROGRAM: RoadmapProgram = {
  programSlug: "yes-causing-course",
  programName: "Yes Causing Course",
  sessions: TITLES.map((title, i) => {
    const number = i + 1;
    if (number <= 2) {
      return { id: id(number), number, scheduledAt: null, heldOn: number === 1 ? "2026-12-01" : "2026-12-15", title, state: "done" as const };
    }
    return {
      number,
      scheduledAt: number === 3 ? at("2026-12-29T19:00:00Z") : null,
      state: number === 3 ? ("next" as const) : ("later" as const),
    };
  }),
};

const SUMMARY = `You both walked in thinking this was going to be about pitching. It is not. The work we did today was about who is in the room before anyone says a word.

## What I heard

You are carrying the whole story of the organisation in your heads, and when a donor asks a simple question you answer with all of it at once. I did the same thing for years on a sideline with a producer in my ear. More information felt safer. It was not.

## What changed in the room

When you each told me why you personally said yes to this work, it took under a minute and I believed every word. That is the version a funder needs to hear first.

- Lead with your own yes before the organisation's history.
- One reason, said plainly, then stop talking.
- Ask them a question before you offer a second reason.

## Where we go next

Next session we take that one-minute version into a real conversation structure, so you know what comes after the opening.`;

export const SAMPLE_SESSION: ClientSessionDto = {
  id: id(2),
  number: 2,
  title: TITLES[1],
  summaryMd: SUMMARY,
  heldOn: "2026-12-15",
  scheduledAt: null,
  publishedAt: at("2026-12-15T21:30:00Z"),
  programName: "Yes Causing Course",
  tasks: [
    { id: id(101), text: "Write your own one-minute \"why I said yes\" and say it out loud twice.", done: true, doneAt: at("2026-12-17T15:00:00Z"), doneByName: "Sample client" },
    { id: id(102), text: "List the five people whose yes would change the next six months for your organisation.", done: false, doneAt: null, doneByName: null },
    { id: id(103), text: "Have one conversation this week where you ask before you explain.", done: false, doneAt: null, doneByName: null },
  ],
  nextTime: [
    { id: id(201), text: "Your list of five names, in priority order.", done: false, doneAt: null, doneByName: null },
    { id: id(202), text: "One conversation that went well and one that did not, in a sentence each.", done: false, doneAt: null, doneByName: null },
  ],
  assets: [
    { id: id(301), kind: "slides_pdf", label: "Session 2 slides", contentType: "application/pdf", bytes: 2_400_000, position: 0 },
    { id: id(302), kind: "transcript", label: "Session transcript", contentType: "text/plain", bytes: 48_000, position: 1 },
    // Preview maps this id to the Athena clip already on the public site.
    { id: SAMPLE_RECAP_ID, kind: "recap_video", label: "Athena's recap", contentType: "video/mp4", bytes: 0, position: 2 },
  ],
};

export const SAMPLE_QUEUE: readonly DraftQueueEntry[] = [
  {
    id: id(3),
    orgSlug: "sample-org",
    orgName: "Sample client",
    programSlug: "yes-causing-course",
    number: 3,
    title: TITLES[2],
    lastIngestedAt: at("2026-12-29T20:40:00Z"),
    editedAt: null,
  },
];

export const SAMPLE_DRAFT: StaffSessionDto = {
  id: id(3),
  orgId: id(900),
  orgSlug: "sample-org",
  orgName: "Sample client",
  programSlug: "yes-causing-course",
  number: 3,
  status: "draft",
  title: TITLES[2],
  summaryMd: SUMMARY,
  heldOn: "2026-12-29",
  scheduledAt: at("2026-12-29T19:00:00Z"),
  publishedAt: null,
  publishedBy: null,
  lastIngestedAt: at("2026-12-29T20:40:00Z"),
  editedAt: null,
  editedBy: null,
  tasks: SAMPLE_SESSION.tasks.map((t) => ({ ...t, done: false, doneAt: null, doneByName: null })),
  nextTime: SAMPLE_SESSION.nextTime,
  assets: [],
};
