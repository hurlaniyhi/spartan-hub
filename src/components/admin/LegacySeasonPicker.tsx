"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { currentSeason } from "@/lib/slugify";

const YEARS_BACK = 20;

/**
 * Unlike SeasonSwitcher, this isn't limited to seasons that already have a
 * session — the whole point here is entering totals for a season that may
 * not exist in the app yet. It's still capped at the current year, though —
 * there's nothing to import for a season that hasn't happened yet. A plain
 * number input here made it too easy to miss that the value was editable at
 * all, so this renders as a dropdown, same as every other season picker.
 */
export function LegacySeasonPicker({ season }: { season: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const maxYear = Number(currentSeason());

  const years = Array.from({ length: YEARS_BACK }, (_, i) => String(maxYear - i));
  if (!years.includes(season)) years.push(season);
  years.sort((a, b) => Number(b) - Number(a));

  const go = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-3 pr-2 ring-1 ring-white/15">
      <CalendarRange className="size-4 text-white/70" />
      <select
        value={season}
        onChange={(event) => go(event.target.value)}
        aria-label="Season year"
        className="appearance-none bg-transparent py-1 pr-1 text-sm font-semibold text-white focus:outline-none [&>option]:text-gray-900"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year} Season
          </option>
        ))}
      </select>
    </div>
  );
}
