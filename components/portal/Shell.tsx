import Link from "next/link";
import HzMark from "./HzMark";

export type ShellNavItem = { readonly label: string; readonly href: string; readonly current?: boolean };

/** Top bar and page frame shared by the client and coach screens. */
export default function Shell({
  homeHref,
  nav,
  who,
  signOut,
  notice,
  children,
}: {
  homeHref: string;
  nav: readonly ShellNavItem[];
  /** Who is signed in, e.g. "Jordan · Acme". */
  who: string;
  /** Sign-out control, supplied by the caller so this file stays auth-agnostic. */
  signOut?: React.ReactNode;
  /** A standing banner, e.g. the sample-data label on preview screens. */
  notice?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {notice && (
        <p className="bg-amber text-black text-center font-mono text-[11px] font-bold tracking-[0.18em] uppercase px-4 py-2">
          {notice}
        </p>
      )}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center gap-6">
          <Link href={homeHref} className="flex items-center gap-3 shrink-0 group">
            <HzMark className="h-7 w-auto" />
            <span className="hidden sm:inline text-white/60 font-mono text-[10px] tracking-[0.3em] uppercase group-hover:text-white/90 transition-colors">
              Howie Zales
            </span>
            <span className="hidden sm:inline border border-green/50 text-green rounded-full px-3 py-1 font-mono text-[9px] font-bold tracking-[0.25em] uppercase">
              Client Portal
            </span>
          </Link>
          <nav aria-label="Portal" className="flex items-center gap-5 md:gap-8 overflow-x-auto ml-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={`relative font-mono text-xs tracking-[0.2em] uppercase whitespace-nowrap py-2 transition-colors duration-300 ${
                  item.current ? "text-green" : "text-white/60 hover:text-green"
                }`}
              >
                {item.label}
                {item.current && <span className="absolute bottom-0.5 left-0 right-0 h-px bg-green" />}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 min-w-0">
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.25em] uppercase text-white/60 truncate">{who}</span>
            {signOut}
          </div>
        </div>
      </header>
      <main className="relative max-w-7xl mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-28">{children}</main>
    </>
  );
}

/** Small mono label used for dates, states and counts. Data, not decoration. */
export function Readout({ children, tone = "dim" }: { children: React.ReactNode; tone?: "dim" | "green" | "amber" }) {
  const color = tone === "green" ? "text-green" : tone === "amber" ? "text-amber" : "text-[var(--p-dim)]";
  return <span className={`font-mono text-[11px] tracking-[0.16em] uppercase ${color}`}>{children}</span>;
}

const DATE = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });
const TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" });

export function formatDay(d: Date | string): string {
  // A bare YYYY-MM-DD is a calendar date, not an instant: pin it to noon UTC so it never shifts a day.
  const date = typeof d === "string" ? new Date(`${d}T12:00:00Z`) : d;
  return DATE.format(date);
}

export function formatDayTime(d: Date): string {
  return `${DATE.format(d)}, ${TIME.format(d)}`;
}
