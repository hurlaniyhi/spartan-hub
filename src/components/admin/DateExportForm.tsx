"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileDown, FileText } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ALL_SEASONS } from "@/lib/slugify";

/**
 * The caller must render this with `key={season}` — that's what resets the
 * date state (via useState's initializer, not an effect) whenever the
 * season switcher changes, instead of leaving a stale out-of-range date.
 */
export function DateExportForm({ season }: { season: string }) {
  const isAllSeasons = season === ALL_SEASONS;
  const today = format(new Date(), "yyyy-MM-dd");
  const seasonStart = isAllSeasons ? undefined : `${season}-01-01`;
  // Never selectable past today — there's nothing to report on yet — even
  // for a season whose calendar year (e.g. this one) isn't over.
  const seasonYearEnd = `${season}-12-31`;
  const seasonEnd = isAllSeasons ? today : seasonYearEnd < today ? seasonYearEnd : today;

  const clampToSeason = (value: string) => {
    if (seasonStart && value < seasonStart) return seasonStart;
    if (value > seasonEnd) return seasonEnd;
    return value;
  };

  const [date, setDate] = useState(() => clampToSeason(today));

  const seasonParam = isAllSeasons ? "" : `&season=${season}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          id="export-date"
          type="date"
          label="As of date"
          value={date}
          min={seasonStart}
          max={seasonEnd}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          href={`/api/reports/export?date=${date}${seasonParam}`}
          native
          variant="outline"
          leftIcon={<FileDown className="size-4" />}
        >
          CSV
        </Button>
        <Button
          href={`/api/reports/export/pdf?date=${date}${seasonParam}`}
          native
          variant="accent"
          leftIcon={<FileText className="size-4" />}
        >
          PDF
        </Button>
      </div>
    </div>
  );
}
