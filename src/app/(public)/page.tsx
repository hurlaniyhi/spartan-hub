import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, CalendarDays, Users, SportShoe } from "lucide-react";
import { SoccerBallIcon } from "@/components/icons/SoccerBallIcon";
import { Button } from "@/components/ui/Button";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlayerCard } from "@/components/players/PlayerCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { SeasonSwitcher } from "@/components/statistics/SeasonSwitcher";
import {
  getTeamSnapshot,
  getLeaderboard,
  getSessionSummaries,
  getPlayerRoster,
  getAvailableSeasons,
} from "@/lib/stats";
import { formatSessionDate } from "@/lib/format";
import { currentSeason, isValidSeasonSelection, resolveSeasonFilter } from "@/lib/slugify";

// Team stats change every time the admin records a session, so this page
// is always rendered fresh rather than statically cached at build time.
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requestedSeason } = await searchParams;
  const seasons = await getAvailableSeasons();
  const season = isValidSeasonSelection(requestedSeason, seasons) ? requestedSeason : currentSeason();
  const seasonFilter = resolveSeasonFilter(season);

  // Sequential rather than Promise.all — see the comment in getTeamSnapshot.
  const snapshot = await getTeamSnapshot(seasonFilter);
  const topScorers = await getLeaderboard("goals", "overall", 1, seasonFilter);
  const topAssisters = await getLeaderboard("assists", "overall", 1, seasonFilter);
  const latestSessions = await getSessionSummaries(1);
  const roster = await getPlayerRoster();

  const topScorer = topScorers[0];
  const topAssister = topAssisters[0];
  const latestSession = latestSessions[0];
  const squadPreview = roster.filter((p) => p.status === "active").slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/team-2.jpeg"
            alt="Spartan FC squad"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/50" />
        </div>
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:py-28">
          <Image
            src="/images/spartan-logo.jpeg"
            alt="Spartan FC crest"
            width={92}
            height={92}
            priority
            className="mb-6 rounded-full shadow-lg ring-4 ring-white/20"
          />
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            SPARTAN FC
          </h1>
          <p className="mt-3 text-lg font-medium text-white/80">More Than a Team.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/squad" variant="accent" size="lg">
              View Squad
            </Button>
            <Button href="/statistics" variant="inverse" size="lg">
              View Statistics
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-white">Season Overview</h2>
          <SeasonSwitcher seasons={seasons} current={season} />
        </div>
        <Card>
          <CardBody className="grid grid-cols-2 gap-6 border-b border-white/10 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile value={snapshot.activePlayers} label="Active Players" icon={<Users className="size-4" />} />
            <StatTile
              value={snapshot.trainingSessions}
              label="Training Sessions"
              icon={<CalendarDays className="size-4" />}
            />
            <StatTile value={snapshot.matches} label="Matches" icon={<Trophy className="size-4" />} />
            <StatTile
              value={snapshot.totalGoals}
              label="Total Goals"
              icon={<SoccerBallIcon className="size-4" />}
              accent
            />
            <StatTile
              value={snapshot.totalAssists}
              label="Total Assists"
              icon={<SportShoe className="size-4" />}
              accent
            />
          </CardBody>
          <CardBody className="grid grid-cols-3 gap-6">
            <StatTile value={snapshot.wins} label="Wins" tone="success" />
            <StatTile value={snapshot.draws} label="Draws" tone="neutral" />
            <StatTile value={snapshot.losses} label="Losses" tone="accent" />
          </CardBody>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-4 font-display text-base font-bold text-white">Top Performers</h2>
            <div className="flex flex-col gap-4">
              <PerformerRow
                icon={<Trophy className="size-5" />}
                label="Top Scorer"
                player={topScorer}
                statLabel="Goals"
              />
              <PerformerRow
                icon={<SportShoe className="size-5" />}
                label="Top Assister"
                player={topAssister}
                statLabel="Assists"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-4 font-display text-base font-bold text-white">Latest Session</h2>
            {latestSession ? (
              <Link
                href={`/sessions/${latestSession.sessionId}`}
                className="group flex flex-col gap-3 rounded-xl border border-white/10 p-4 transition-[color,background-color,border-color,transform] active:scale-[0.98] hover:border-brand-light/40 hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={latestSession.type === "match" ? "accent" : "brand"}>
                    {latestSession.type}
                  </Badge>
                  <span className="text-sm text-white/40">{formatSessionDate(latestSession.date)}</span>
                </div>
                {latestSession.opponent && (
                  <p className="text-sm font-semibold text-white">
                    Spartan FC vs {latestSession.opponent}
                    {latestSession.result && <span className="text-white/50"> · {latestSession.result}</span>}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>{latestSession.playersPresent} Present</span>
                  <span>{latestSession.goals} Goals</span>
                  <span>{latestSession.assists} Assists</span>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-violet-300">
                  View Session <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ) : (
              <p className="text-sm text-white/50">
                No sessions recorded yet. Check back after the next training or match.
              </p>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">Squad Preview</h2>
          <Link href="/squad" className="flex items-center gap-1 text-sm font-semibold text-violet-300">
            View Full Squad <ArrowRight className="size-4" />
          </Link>
        </div>
        {squadPreview.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {squadPreview.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">The squad list is being put together — check back soon.</p>
        )}
      </section>
    </>
  );
}

function PerformerRow({
  icon,
  label,
  statLabel,
  player,
}: {
  icon: React.ReactNode;
  label: string;
  statLabel: string;
  player?: { name: string; photoUrl?: string; slug: string; value: number };
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-red-300">
        {icon}
      </div>
      {player ? (
        <Link href={`/players/${player.slug}`} className="flex flex-1 items-center gap-3">
          <PlayerAvatar photoUrl={player.photoUrl} name={player.name} size="sm" />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
            <p className="text-sm font-bold text-white">{player.name}</p>
          </div>
          <p className="font-display text-lg font-bold text-white">
            {player.value} <span className="text-xs font-medium text-white/40">{statLabel}</span>
          </p>
        </Link>
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
          <p className="text-sm text-white/50">No {statLabel.toLowerCase()} recorded yet.</p>
        </div>
      )}
    </div>
  );
}
