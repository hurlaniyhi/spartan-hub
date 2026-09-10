import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Target, Users, Zap } from "lucide-react";
import { LeaderboardCard } from "@/components/statistics/LeaderboardCard";
import { cn } from "@/lib/cn";
import { getLeaderboard, type StatsScope } from "@/lib/stats";
import { formatDecimal } from "@/lib/format";

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
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: rawScope } = await searchParams;
  const scope: StatsScope = ["overall", "training", "match"].includes(rawScope ?? "")
    ? (rawScope as StatsScope)
    : "overall";

  // Sequential rather than Promise.all — see the comment in getTeamSnapshot.
  const topScorers = await getLeaderboard("goals", scope, 10);
  const topAssisters = await getLeaderboard("assists", scope, 10);
  const mostAppearances = await getLeaderboard("appearances", scope, 10);
  const bestGoalsPerAppearance = await getLeaderboard("goalsPerAppearance", scope, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="mt-1 text-sm text-gray-500">Spartan FC&apos;s leaderboards, updated after every session.</p>
        </div>
        <div className="flex items-center gap-1 self-start rounded-full bg-gray-100 p-1">
          {SCOPES.map((option) => (
            <Link
              key={option.value}
              href={option.value === "overall" ? "/statistics" : `/statistics?scope=${option.value}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                scope === option.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <LeaderboardCard title="Top Scorers" icon={Trophy} entries={topScorers} valueLabel="Goals" />
        <LeaderboardCard title="Top Assists" icon={Target} entries={topAssisters} valueLabel="Assists" />
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
      </div>
    </div>
  );
}
