import { format } from "date-fns";

type NamedPlayer = { firstName: string; lastName?: string | null; nickname?: string | null };

/** The name shown everywhere in the UI: nickname if set, otherwise first + last. */
export function displayName(player: NamedPlayer): string {
  return player.nickname?.trim() || fullName(player);
}

export function fullName(player: NamedPlayer): string {
  return [player.firstName, player.lastName].filter(Boolean).join(" ").trim();
}

export function formatSessionDate(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy");
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy");
}

export function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

/** "00" is the traditional placeholder for a player with no jersey number assigned yet. */
export function formatJerseyNumber(jerseyNumber?: number | null): string {
  return jerseyNumber !== undefined && jerseyNumber !== null ? String(jerseyNumber) : "00";
}

/** A coach's bio can carry a non-numeric squad number (e.g. "Unique number: 8+1")
 * for whenever the plain numeric jerseyNumber field doesn't fit. */
export function extractUniqueNumberFromBio(bio?: string | null): string | undefined {
  if (!bio) return undefined;
  return bio.match(/unique\s*number\s*:?\s*(\S+)/i)?.[1];
}

/**
 * The jersey label to display for a player: their explicit number if set,
 * otherwise — for a coach only — whatever "unique number" their bio
 * specifies, otherwise the "00" placeholder.
 */
export function getJerseyLabel(player: {
  jerseyNumber?: number | null;
  position?: string;
  bio?: string | null;
}): string {
  if (player.jerseyNumber !== undefined && player.jerseyNumber !== null) {
    return String(player.jerseyNumber);
  }
  if (player.position === "Coach") {
    const unique = extractUniqueNumberFromBio(player.bio);
    if (unique) return unique;
  }
  return "00";
}
