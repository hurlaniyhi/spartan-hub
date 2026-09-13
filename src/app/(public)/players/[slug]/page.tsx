import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, SportShoe } from "lucide-react";
import { SoccerBallIcon } from "@/components/icons/SoccerBallIcon";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { SeasonSwitcher } from "@/components/statistics/SeasonSwitcher";
import { BackButton } from "@/components/ui/BackButton";
import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { getPlayerTotals, getPlayerRecentActivity, getAvailableSeasons } from "@/lib/stats";
import { displayName, formatSessionDate, formatDecimal, formatPercent, getJerseyLabel } from "@/lib/format";
import { currentSeason, isValidSeasonSelection, resolveSeasonFilter } from "@/lib/slugify";

export const dynamic = "force-dynamic";

async function getPlayer(slug: string) {
  await connectToDatabase();
  const player = await PlayerModel.findOne({ slug }).lean();
  return player;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) return { title: "Player Not Found" };
  return {
    title: `${displayName(player)} — Spartan FC`,
    description: `${displayName(player)}'s Spartan FC stats: appearances, goals and assists.`,
  };
}

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { slug } = await params;
  const { season: requestedSeason } = await searchParams;
  const player = await getPlayer(slug);
  if (!player) notFound();

  const playerId = player._id.toString();
  const seasons = await getAvailableSeasons();
  const season = isValidSeasonSelection(requestedSeason, seasons) ? requestedSeason : currentSeason();
  const totals = await getPlayerTotals(playerId, "overall", resolveSeasonFilter(season));
  const recentActivity = await getPlayerRecentActivity(playerId, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BackButton fallbackHref="/squad" label="Back to Squad" className="mb-4" />
      <Card className="overflow-hidden">
        <div className="bg-brand-dark px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <PlayerAvatar photoUrl={player.photoUrl} name={displayName(player)} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-3xl font-bold text-white">{displayName(player)}</h1>
                <span className="font-display text-2xl font-bold text-white/40">
                  #{getJerseyLabel(player)}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-white/70">{player.position}</p>
              <Badge
                variant={player.status === "active" ? "success" : "neutral"}
                className="mt-2"
              >
                {player.status}
              </Badge>
            </div>
            <div className="sm:self-start">
              <SeasonSwitcher seasons={seasons} current={season} />
            </div>
          </div>
        </div>

        <CardBody className="grid grid-cols-3 gap-4 border-b border-white/10 text-center">
          <StatTile value={totals.appearances} label="Appearances" className="items-center" />
          <StatTile value={totals.goals} label="Goals" accent className="items-center" />
          <StatTile value={totals.assists} label="Assists" accent className="items-center" />
        </CardBody>

        <CardBody className="grid grid-cols-3 gap-4 border-b border-white/10 text-center">
          <StatTile value={totals.wins} label="Wins" tone="success" className="items-center" />
          <StatTile value={totals.draws} label="Draws" tone="neutral" className="items-center" />
          <StatTile value={totals.losses} label="Losses" tone="accent" className="items-center" />
        </CardBody>

        <CardBody className="grid grid-cols-3 gap-4 border-b border-white/10 text-center text-sm">
          <div>
            <p className="font-display text-lg font-bold text-white">
              {formatDecimal(totals.goalsPerAppearance)}
            </p>
            <p className="text-xs text-white/40">Goals / App</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">
              {formatDecimal(totals.assistsPerAppearance)}
            </p>
            <p className="text-xs text-white/40">Assists / App</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">
              {formatPercent(totals.attendancePercentage)}
            </p>
            <p className="text-xs text-white/40">Attendance</p>
          </div>
        </CardBody>

        {player.bio && (
          <CardBody className="border-b border-white/10">
            <p className="text-sm leading-relaxed text-white/60">{player.bio}</p>
          </CardBody>
        )}

        <CardBody>
          <h2 className="mb-4 font-display text-base font-bold text-white">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No sessions recorded yet"
              description={`${displayName(player)} hasn't featured in a training session or match yet.`}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-white/10">
              {recentActivity.map((entry) => (
                <li key={entry.sessionId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={entry.type === "match" ? "accent" : "brand"}>{entry.type}</Badge>
                    <span className="text-sm text-white/50">{formatSessionDate(entry.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span
                      className={
                        entry.attended ? "font-medium text-emerald-400" : "text-white/30"
                      }
                    >
                      {entry.attended ? "Present" : "Absent"}
                    </span>
                    {entry.attended && (
                      <>
                        <span className="flex items-center gap-1 text-white/50">
                          <SoccerBallIcon className="size-3.5" /> {entry.goals}
                        </span>
                        <span className="flex items-center gap-1 text-white/50">
                          <SportShoe className="size-3.5" /> {entry.assists}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
