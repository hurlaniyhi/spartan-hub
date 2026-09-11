import { LegacySeasonPicker } from "@/components/admin/LegacySeasonPicker";
import { LegacyStatsTable, type LegacyRow } from "@/components/admin/LegacyStatsTable";
import { Card, CardBody } from "@/components/ui/Card";
import { getPlayerRoster, getLegacyTotalsForSeason } from "@/lib/stats";
import { currentSeason } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export default async function AdminLegacyStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requestedSeason } = await searchParams;
  const season = requestedSeason && /^\d{4}$/.test(requestedSeason) ? requestedSeason : currentSeason();

  const roster = await getPlayerRoster();
  const legacyTotals = await getLegacyTotalsForSeason(season);
  const legacyByPlayer = new Map(legacyTotals.map((t) => [t.playerId, t]));

  const rows: LegacyRow[] = roster.map((player) => {
    const legacy = legacyByPlayer.get(player.id);
    return {
      playerId: player.id,
      name: player.name,
      photoUrl: player.photoUrl,
      appearances: legacy?.appearances ?? 0,
      goals: legacy?.goals ?? 0,
      assists: legacy?.assists ?? 0,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Legacy Stats</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">
            One-time import for stats from before Spartan Hub — appearances, goals and assists entered
            here get folded straight into each player&apos;s totals, leaderboards and reports for the
            season, same as any recorded session.
          </p>
        </div>
        <LegacySeasonPicker season={season} />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span>
          Make sure these totals don&apos;t already include any training or match you&apos;ve recorded
          in Spartan Hub for {season} — otherwise those sessions will be double-counted.
        </span>
      </div>

      <Card>
        <CardBody>
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No players yet — add players first.</p>
          ) : (
            <>
              <div className="mb-1 hidden grid-cols-[1fr_auto_auto] gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid">
                <span>Player</span>
                <span className="pr-1 text-center">Appearances · Goals · Assists</span>
                <span />
              </div>
              <LegacyStatsTable key={season} season={season} rows={rows} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
