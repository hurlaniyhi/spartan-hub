import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Users, Zap, SportShoe, BarChart3 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { LeaderboardCard } from "@/components/statistics/LeaderboardCard";
import { SeasonSwitcher } from "@/components/statistics/SeasonSwitcher";
import { cn } from "@/lib/cn";
import { getLeaderboard, getAvailableSeasons, type StatsScope } from "@/lib/stats";
import { formatDecimal } from "@/lib/format";
import { currentSeason, isValidSeasonSelection, resolveSeasonFilter } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Spartan FC leaderboards — top scorers, assists, appearances and more.",
};

const SCOPES: { value: StatsScope; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "training", label: "Training" },
  { value: "match", label: "Match" },
];

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; season?: string }>;
}) {
  const { scope: rawScope, season: requestedSeason } = await searchParams;
  const scope: StatsScope = ["overall", "training", "match"].includes(rawScope ?? "")
    ? (rawScope as StatsScope)
    : "overall";

  const seasons = await getAvailableSeasons();
  const season = isValidSeasonSelection(requestedSeason, seasons) ? requestedSeason : currentSeason();
  const seasonFilter = resolveSeasonFilter(season);

  // Sequential rather than Promise.all — see the comment in getTeamSnapshot.
  const topScorers = await getLeaderboard("goals", scope, 10, seasonFilter);
  const topAssisters = await getLeaderboard("assists", scope, 10, seasonFilter);
  const mostAppearances = await getLeaderboard("appearances", scope, 10, seasonFilter);
  const bestGoalsPerAppearance = await getLeaderboard("goalsPerAppearance", scope, 10, seasonFilter);
  const mostWins = await getLeaderboard("wins", scope, 10, seasonFilter);

  const scopeLink = (value: StatsScope) => {
    const params = new URLSearchParams();
    if (value !== "overall") params.set("scope", value);
    if (season !== currentSeason()) params.set("season", season);
    const query = params.toString();
    return query ? `/statistics?${query}` : "/statistics";
  };

  return (
    <div>
      <PageHero
        icon={BarChart3}
        title="Statistics"
        subtitle="Spartan FC's leaderboards, updated after every session."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <SeasonSwitcher seasons={seasons} current={season} />
            <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
              {SCOPES.map((option) => (
                <Link
                  key={option.value}
                  href={scopeLink(option.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    scope === option.value ? "bg-white text-brand-dark shadow-sm" : "text-white/70 hover:text-white"
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <LeaderboardCard title="Top Scorers" icon={Trophy} entries={topScorers} valueLabel="Goals" />
          <LeaderboardCard title="Top Assists" icon={SportShoe} entries={topAssisters} valueLabel="Assists" />
          <LeaderboardCard
            title="Most Appearances"
            icon={Users}
            entries={mostAppearances}
            valueLabel="Apps"
          />
          <LeaderboardCard
            title="Best Goals / Appearance"
            icon={Zap}
            entries={bestGoalsPerAppearance}
            valueLabel="G/App"
            formatValue={(value) => formatDecimal(value)}
          />
          <LeaderboardCard title="Most Wins" icon={Trophy} entries={mostWins} valueLabel="Wins" />
        </div>
      </div>
    </div>
  );
}
