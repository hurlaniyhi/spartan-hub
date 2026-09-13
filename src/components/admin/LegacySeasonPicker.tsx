"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { currentSeason } from "@/lib/slugify";

/**
 * Unlike SeasonSwitcher, this isn't limited to seasons that already have a
 * session — the whole point here is entering totals for a season that may
 * not exist in the app yet. It's still capped at the current year, though —
 * there's nothing to import for a season that hasn't happened yet.
 */
export function LegacySeasonPicker({ season }: { season: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const maxYear = currentSeason();
  const [value, setValue] = useState(season);

  const go = (typed: string) => {
    if (!/^\d{4}$/.test(typed)) return;
    const clamped = Number(typed) > Number(maxYear) ? maxYear : typed;
    setValue(clamped);
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", clamped);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/5 py-1 pl-3 pr-2 ring-1 ring-white/10">
      <CalendarRange className="size-4 text-white/50" />
      <input
        type="number"
        inputMode="numeric"
        max={maxYear}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => go(value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") go(value);
        }}
        aria-label="Season year"
        className="w-16 bg-transparent text-sm font-semibold text-white focus:outline-none"
      />
      <span className="text-sm font-medium text-white/50">Season</span>
    </div>
  );
}
