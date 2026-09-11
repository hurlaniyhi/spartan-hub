import type { PositionGroup } from "@/lib/constants";

/** A small, tasteful color identity per position group — used as accents on
 * player cards so the squad grid reads at a glance, not just a wall of text. */
export const POSITION_GROUP_STYLES: Record<
  PositionGroup,
  { bar: string; text: string; bg: string }
> = {
  Goalkeeper: { bar: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  Defender: { bar: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
  Midfielder: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  Forward: { bar: "bg-accent", text: "text-accent-dark", bg: "bg-accent-light" },
};
