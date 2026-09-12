import {
  UserPlus,
  CalendarPlus,
  Swords,
  BarChart3,
  FileDown,
  Users,
  UserX,
  CalendarDays,
  Trophy,
  SportShoe,
  History,
} from "lucide-react";
import { SoccerBallIcon } from "@/components/icons/SoccerBallIcon";
import { Card, CardBody } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { SeasonSwitcher } from "@/components/statistics/SeasonSwitcher";
import { getTeamSnapshot, getAvailableSeasons } from "@/lib/stats";
import { currentSeason, isValidSeasonSelection, resolveSeasonFilter } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requestedSeason } = await searchParams;
  const seasons = await getAvailableSeasons();
  const season = isValidSeasonSelection(requestedSeason, seasons) ? requestedSeason : currentSeason();
  const snapshot = await getTeamSnapshot(resolveSeasonFilter(season));

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl bg-brand-dark px-6 py-6 sm:px-8">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Spartan FC Dashboard</h1>
            <p className="mt-1 text-sm text-white/70">A quick overview of the squad and season so far.</p>
          </div>
          <SeasonSwitcher seasons={seasons} current={season} />
        </div>
      </div>

      <Card>
        <CardBody className="grid grid-cols-2 gap-6 border-b border-gray-100 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile value={snapshot.activePlayers} label="Active Players" icon={<Users className="size-4" />} />
          <StatTile value={snapshot.inactivePlayers} label="Inactive Players" icon={<UserX className="size-4" />} />
          <StatTile value={snapshot.trainingSessions} label="Training Sessions" icon={<CalendarDays className="size-4" />} />
          <StatTile value={snapshot.matches} label="Matches" icon={<Trophy className="size-4" />} />
          <StatTile value={snapshot.totalGoals} label="Total Goals" icon={<SoccerBallIcon className="size-4" />} accent />
          <StatTile value={snapshot.totalAssists} label="Total Assists" icon={<SportShoe className="size-4" />} accent />
        </CardBody>
        <CardBody className="grid grid-cols-3 gap-6">
          <StatTile value={snapshot.wins} label="Wins" tone="success" />
          <StatTile value={snapshot.draws} label="Draws" tone="neutral" />
          <StatTile value={snapshot.losses} label="Losses" tone="accent" />
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-base font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Button href="/admin/players/new" variant="accent" leftIcon={<UserPlus className="size-4" />}>
            Add Player
          </Button>
          <Button
            href="/admin/sessions/new?type=training"
            variant="primary"
            leftIcon={<CalendarPlus className="size-4" />}
          >
            Record Training
          </Button>
          <Button
            href="/admin/sessions/new?type=match"
            variant="primary"
            leftIcon={<Swords className="size-4" />}
          >
            Record Match
          </Button>
          <Button href="/statistics" variant="outline" leftIcon={<BarChart3 className="size-4" />}>
            View Statistics
          </Button>
          <Button href="/admin/reports" variant="outline" leftIcon={<FileDown className="size-4" />}>
            Export Report
          </Button>
          <Button href="/admin/legacy-stats" variant="outline" leftIcon={<History className="size-4" />}>
            Legacy Stats
          </Button>
        </div>
      </div>
    </div>
  );
}
