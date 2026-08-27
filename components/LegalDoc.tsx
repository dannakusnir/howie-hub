import type { ReactNode } from "react";

export function LegalSection({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-32" id={`s-${n}`}>
      <div className="flex items-baseline gap-4 mb-5">
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-green shrink-0">
          {n}
        </span>
        <h2 className="text-2xl md:text-3xl font-black tracking-[-0.02em] text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4 pl-0 md:pl-12">{children}</div>
    </section>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-[15px] md:text-base text-white/70 leading-8">{children}</p>;
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] md:text-base text-white/70 leading-8">
          <span className="text-green shrink-0 mt-[2px]">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalNote({ children }: { children: ReactNode }) {
  return (
    <div className="border border-green/25 bg-green/[0.04] rounded-xl p-5 md:p-6">
      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-green mb-3">
        · Important
      </div>
      <p className="text-[15px] text-white/80 leading-8">{children}</p>
    </div>
  );
}

export function LegalTable({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8">
      {rows.map((r) => (
        <div
          key={r.k}
          className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 py-3 border-b border-white/5"
        >
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-dim shrink-0 md:w-64">
            {r.k}
          </span>
          <span className="text-[15px] text-white/80 md:text-right md:flex-1">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

export function LegalShell({
  updated,
  toc,
  children,
}: {
  updated: string;
  toc: { n: string; title: string }[];
  children: ReactNode;
}) {
  return (
    <section className="relative py-16 md:py-20 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-text-dim/70 mb-12">
          Last updated · {updated}
        </div>

        <nav className="mb-16 border border-white/8 rounded-2xl p-6 md:p-8 bg-[#080808]">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-green mb-5">
            · Contents
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {toc.map((t) => (
              <li key={t.n}>
                <a
                  href={`#s-${t.n}`}
                  className="group flex gap-3 text-sm text-white/60 hover:text-green transition-colors"
                >
                  <span className="font-mono text-[11px] text-text-dim/60 shrink-0">
                    {t.n}
                  </span>
                  <span>{t.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-14">{children}</div>
      </div>
    </section>
  );
}
