"use client";

import Link from "next/link";

/**
 * Explicit opt-in. Never pre-checked. Required before any marketing send.
 * The value is passed to /api/lead as `consent` and the route rejects `false`.
 */
export default function ConsentCheckbox({
  checked,
  onChange,
  label = "Yes, add me to the Field Notes newsletter. I can unsubscribe anytime.",
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  id: string;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="flex items-start gap-3 cursor-pointer group select-none"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0 appearance-none rounded border border-white/25 bg-white/[0.03] checked:border-green checked:bg-green transition-colors cursor-pointer relative
            after:content-[''] after:absolute after:left-[4px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:opacity-0 checked:after:opacity-100"
        />
        <span className="text-[13px] leading-6 text-white/55 group-hover:text-white/75 transition-colors">
          {label}
        </span>
      </label>
      <p className="text-[11px] leading-5 text-white/35 pl-7">
        By submitting you agree to our{" "}
        <Link
          href="/privacy"
          className="text-white/55 hover:text-green underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          className="text-white/55 hover:text-green underline underline-offset-2 transition-colors"
        >
          Terms of Use
        </Link>
        . We never sell your information.
      </p>
    </div>
  );
}
