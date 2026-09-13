/**
 * The app-wide ambient background — the same dot-grid + blurred color blobs
 * recipe as the Squad Poster screen (src/components/players/SquadPosterView.tsx),
 * lifted here so every other page shares one canonical copy instead of each
 * page/band hand-rolling a slightly different dot size and blob opacity.
 * Mounted once in the root layout as a fixed, viewport-anchored layer behind
 * all page content.
 */
export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute -right-24 top-0 size-72 rounded-full bg-brand/30 blur-3xl" />
      <div className="absolute -left-24 top-1/3 size-72 rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}
