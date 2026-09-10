import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Target, Users as UsersIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { getPlayerTotals, getPlayerRecentActivity } from "@/lib/stats";
import { displayName, formatSessionDate, formatDecimal, formatPercent } from "@/lib/format";

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) notFound();

  const playerId = player._id.toString();
  const totals = await getPlayerTotals(playerId);
  const recentActivity = await getPlayerRecentActivity(playerId, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card className="overflow-hidden">
        <div className="bg-brand-dark px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <PlayerAvatar photoUrl={player.photoUrl} name={displayName(player)} size="xl" />
            <div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-3xl font-bold text-white">{displayName(player)}</h1>
                {player.jerseyNumber !== undefined && player.jerseyNumber !== null && (
                  <span className="font-display text-2xl font-bold text-white/40">
                    #{player.jerseyNumber}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-white/70">{player.position}</p>
              <Badge
                variant={player.status === "active" ? "success" : "neutral"}
                className="mt-2"
              >
                {player.status}
              </Badge>
            </div>
          </div>
        </div>

        <CardBody className="grid grid-cols-3 gap-4 border-b border-gray-100 text-center">
          <StatTile value={totals.appearances} label="Appearances" className="items-center" />
          <StatTile value={totals.goals} label="Goals" accent className="items-center" />
          <StatTile value={totals.assists} label="Assists" accent className="items-center" />
        </CardBody>

        <CardBody className="grid grid-cols-3 gap-4 border-b border-gray-100 text-center text-sm">
          <div>
            <p className="font-display text-lg font-bold text-gray-900">
              {formatDecimal(totals.goalsPerAppearance)}
            </p>
            <p className="text-xs text-gray-500">Goals / App</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-gray-900">
              {formatDecimal(totals.assistsPerAppearance)}
            </p>
            <p className="text-xs text-gray-500">Assists / App</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-gray-900">
              {formatPercent(totals.attendancePercentage)}
            </p>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
        </CardBody>

        {player.bio && (
          <CardBody className="border-b border-gray-100">
            <p className="text-sm leading-relaxed text-gray-600">{player.bio}</p>
          </CardBody>
        )}

        <CardBody>
          <h2 className="mb-4 font-display text-base font-bold text-gray-900">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No sessions recorded yet"
              description={`${displayName(player)} hasn't featured in a training session or match yet.`}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {recentActivity.map((entry) => (
                <li key={entry.sessionId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={entry.type === "match" ? "accent" : "brand"}>{entry.type}</Badge>
                    <span className="text-sm text-gray-600">{formatSessionDate(entry.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span
                      className={
                        entry.attended ? "font-medium text-emerald-600" : "text-gray-400"
                      }
                    >
                      {entry.attended ? "Present" : "Absent"}
                    </span>
                    {entry.attended && (
                      <>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Target className="size-3.5" /> {entry.goals}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <UsersIcon className="size-3.5" /> {entry.assists}
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
