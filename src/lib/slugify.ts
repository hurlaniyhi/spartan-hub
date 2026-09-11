export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Derives a season label from a date — a plain calendar year, e.g. "2026". */
export function seasonForDate(date: Date): string {
  return String(date.getFullYear());
}

/** The season (calendar year) a fresh page load should default to. */
export function currentSeason(): string {
  return String(new Date().getFullYear());
}

/** Sentinel season value meaning "every season" — no season filter applied. */
export const ALL_SEASONS = "all";

/** Resolves a season-switcher value into the `season` arg the stats
 * functions expect: `undefined` for ALL_SEASONS (no filter), otherwise the
 * year itself. */
export function resolveSeasonFilter(season: string): string | undefined {
  return season === ALL_SEASONS ? undefined : season;
}

/** Whether a season value from a request is one the switcher can land on:
 * either the "All Seasons" sentinel or a season that actually has data. */
export function isValidSeasonSelection(value: string | undefined, seasons: string[]): value is string {
  return value !== undefined && (value === ALL_SEASONS || seasons.includes(value));
}
