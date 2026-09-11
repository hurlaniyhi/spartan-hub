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
