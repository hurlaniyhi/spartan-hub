import Link from "next/link";
import { CalendarPlus, Swords, CalendarDays } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionSummaries } from "@/lib/stats";
import { formatSessionDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = await getSessionSummaries();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="mt-1 text-sm text-gray-500">Record and review training sessions and matches.</p>
        </div>
        <div className="flex gap-2">
          <Button
            href="/admin/sessions/new?type=training"
            variant="primary"
            leftIcon={<CalendarPlus className="size-4" />}
          >
            Record Training
          </Button>
          <Button href="/admin/sessions/new?type=match" variant="accent" leftIcon={<Swords className="size-4" />}>
            Record Match
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No sessions yet"
          description="Record your first Spartan FC training session or match to get started."
          action={
            <Button href="/admin/sessions/new?type=training" variant="accent" leftIcon={<CalendarPlus className="size-4" />}>
              Record Training
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Link key={session.sessionId} href={`/admin/sessions/${session.sessionId}`} className="group block">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardBody className="flex items-center justify-between gap-4">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge variant={session.type === "match" ? "accent" : "brand"}>{session.type}</Badge>
                      <span className="text-sm font-medium text-gray-400">
                        {formatSessionDate(session.date)}
                      </span>
                    </div>
                    <p className="font-display text-base font-bold text-gray-900">
                      {session.opponent ? `Spartan FC vs ${session.opponent}` : "Training Session"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {session.playersPresent} Present · {session.goals} Goals · {session.assists} Assists
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    Edit
                  </span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
