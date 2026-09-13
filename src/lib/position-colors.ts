import type { AnyPositionGroup } from "@/lib/constants";

/** A small, tasteful color identity per position group — used as accents on
 * player cards so the squad grid reads at a glance, not just a wall of text.
 * `ring`/`glow` mirror the Squad Poster's own neon-halo motif
 * (src/components/players/SquadPosterView.tsx's `GROUP_STYLE`) so avatar
 * rings elsewhere in the app share the same look, without importing from
 * that (untouched) file directly. */
export const POSITION_GROUP_STYLES: Record<
  AnyPositionGroup,
  { bar: string; text: string; bg: string; ring: string; glow: string }
> = {
  Goalkeeper: {
    bar: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-400/15",
    ring: "ring-amber-400/70",
    glow: "shadow-[0_0_16px_2px_rgba(251,191,36,0.35)]",
  },
  Defender: {
    bar: "bg-sky-400",
    text: "text-sky-300",
    bg: "bg-sky-400/15",
    ring: "ring-sky-400/70",
    glow: "shadow-[0_0_16px_2px_rgba(56,189,248,0.35)]",
  },
  Midfielder: {
    bar: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-400/15",
    ring: "ring-emerald-400/70",
    glow: "shadow-[0_0_16px_2px_rgba(52,211,153,0.35)]",
  },
  Forward: {
    bar: "bg-accent",
    text: "text-red-300",
    bg: "bg-accent/20",
    ring: "ring-accent/70",
    glow: "shadow-[0_0_16px_2px_rgba(219,38,29,0.4)]",
  },
  Staff: {
    bar: "bg-violet-400",
    text: "text-violet-300",
    bg: "bg-violet-400/15",
    ring: "ring-violet-400/70",
    glow: "shadow-[0_0_16px_2px_rgba(167,139,250,0.35)]",
  },
};
