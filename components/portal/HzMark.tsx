/**
 * Basic HZ monogram for the portal, made 2026-11-24 because no HZ logo file exists.
 * Built from the site's own vocabulary: viewfinder corners and a green tally light,
 * the same family as the VES "Tally" mark. Letters are drawn as geometry, so the mark
 * does not depend on a font being loaded.
 */
export default function HzMark({ className = "h-7 w-auto", title = "Howie Zales" }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 76 40" fill="none" role="img" aria-label={title}>
      <path d="M1.5 13V1.5H13" stroke="#00FF88" strokeWidth="2" strokeLinecap="square" />
      <path d="M74.5 27V38.5H63" stroke="#00FF88" strokeWidth="2" strokeLinecap="square" />
      {/* H */}
      <path d="M13 10h7v7.2h8V10h7v20h-7v-7.2h-8V30h-7z" fill="#fff" />
      {/* Z */}
      <path d="M40 10h21v5.6L49.4 24.2H61V30H40v-5.6l11.6-8.6H40z" fill="#fff" />
      <circle cx="69.5" cy="6.5" r="3.5" fill="#00FF88" />
    </svg>
  );
}
