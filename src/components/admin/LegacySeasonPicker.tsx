"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";

/**
 * Unlike SeasonSwitcher, this isn't limited to seasons that already have a
 * session — the whole point here is entering totals for a season that may
 * not exist in the app yet.
 */
export function LegacySeasonPicker({ season }: { season: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(season);

  const go = (next: string) => {
    if (!/^\d{4}$/.test(next)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", next);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pl-3 pr-2 ring-1 ring-gray-200">
      <CalendarRange className="size-4 text-gray-500" />
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => go(value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") go(value);
        }}
        aria-label="Season year"
        className="w-16 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
      />
      <span className="text-sm font-medium text-gray-500">Season</span>
    </div>
  );
}
