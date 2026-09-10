import { UserPlus, CalendarPlus, Swords, BarChart3, FileDown } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { getTeamSnapshot } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const snapshot = await getTeamSnapshot();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Spartan FC Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">A quick overview of the squad and season so far.</p>
      </div>

      <Card>
        <CardBody className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile value={snapshot.activePlayers} label="Active Players" />
          <StatTile value={snapshot.inactivePlayers} label="Inactive Players" />
          <StatTile value={snapshot.trainingSessions} label="Training Sessions" />
          <StatTile value={snapshot.matches} label="Matches" />
          <StatTile value={snapshot.totalGoals} label="Total Goals" accent />
          <StatTile value={snapshot.totalAssists} label="Total Assists" accent />
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-base font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
        </div>
      </div>
    </div>
  );
}
