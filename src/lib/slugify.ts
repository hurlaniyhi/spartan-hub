export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Derives a season label from a date, e.g. Sep 2026 -> "2026/27" (season runs Jul–Jun). */
export function seasonForDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const startYear = month >= 6 ? year : year - 1; // July (6) onward starts the new season
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}/${endYearShort}`;
}
