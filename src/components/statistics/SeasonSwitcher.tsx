"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/cn";
import { ALL_SEASONS } from "@/lib/slugify";

export function SeasonSwitcher({
  seasons,
  current,
  variant = "dark",
}: {
  seasons: string[];
  current: string;
  /** "dark" for navy/brand headers (default), "light" for white/light sections. */
  variant?: "dark" | "light";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full py-1 pl-3 pr-2 ring-1",
        variant === "dark" ? "bg-white/10 ring-white/15" : "bg-gray-100 ring-gray-200"
      )}
    >
      <CalendarRange className={cn("size-4", variant === "dark" ? "text-white/70" : "text-gray-500")} />
      <select
        value={current}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Season"
        className={cn(
          "appearance-none bg-transparent py-1 pr-1 text-sm font-semibold focus:outline-none [&>option]:text-gray-900",
          variant === "dark" ? "text-white" : "text-gray-900"
        )}
      >
        <option value={ALL_SEASONS}>All Seasons</option>
        {seasons.map((season) => (
          <option key={season} value={season}>
            {season} Season
          </option>
        ))}
      </select>
    </div>
  );
}
