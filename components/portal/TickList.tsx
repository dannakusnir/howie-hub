"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { ItemDto } from "@/lib/portal/data/dto";

export type ToggleResult = { readonly ok: true } | { readonly ok: false; readonly message: string };
export type ToggleAction = (itemId: string, done: boolean) => Promise<ToggleResult>;

/** A list the client ticks off. Ticks are shared by everyone in the client's organisation. */
export default function TickList({
  items,
  toggle,
  emptyText,
}: {
  items: readonly ItemDto[];
  toggle: ToggleAction;
  emptyText: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    items,
    (current, change: { id: string; done: boolean }) =>
      current.map((item) => (item.id === change.id ? { ...item, done: change.done } : item)),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-[var(--p-dim)] text-base">{emptyText}</p>;
  }

  const onToggle = (item: ItemDto) => {
    const done = !item.done;
    setError(null);
    startTransition(async () => {
      setOptimistic({ id: item.id, done });
      const result = await toggle(item.id, done);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <div>
      <ul className="divide-y divide-[var(--p-line)] border-y border-[var(--p-line)]">
        {optimistic.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              data-done={item.done}
              onClick={() => onToggle(item)}
              className="p-row w-full flex items-start gap-4 py-4 text-left cursor-pointer"
            >
              <span className="p-tick mt-0.5" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M3 8.5l3.2 3.2L13 5" />
                </svg>
              </span>
              <span className="p-row-text text-[1.0625rem] leading-7 text-white transition-colors duration-200">
                {item.text}
              </span>
              {item.done && item.doneByName ? (
                <span className="ml-auto shrink-0 self-center pl-3 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--p-dim)]">
                  Done by {item.doneByName}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <p role="alert" className="mt-3 text-sm text-red min-h-5">
        {error}
      </p>
    </div>
  );
}
