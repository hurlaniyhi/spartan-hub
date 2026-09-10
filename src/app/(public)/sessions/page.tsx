import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionSummaries } from "@/lib/stats";
import { formatSessionDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Spartan FC training and match history.",
};

export default async function SessionsPage() {
  const sessions = await getSessionSummaries();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Sessions</h1>
        <p className="mt-1 text-sm text-gray-500">Every Spartan FC training session and match, in one place.</p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No sessions yet"
          description="Spartan FC's first training session or match hasn't been recorded yet."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Link key={session.sessionId} href={`/sessions/${session.sessionId}`} className="group block">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardBody className="flex items-center justify-between gap-4">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge variant={session.type === "match" ? "accent" : "brand"}>
                        {session.type}
                      </Badge>
                      <span className="text-sm font-medium text-gray-400">
                        {formatSessionDate(session.date)}
                      </span>
                    </div>
                    {session.opponent ? (
                      <p className="font-display text-base font-bold text-gray-900">
                        Spartan FC vs {session.opponent}
                        {session.result && (
                          <span className="ml-2 font-sans text-sm font-medium text-gray-500">
                            {session.result}
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="font-display text-base font-bold text-gray-900">Training Session</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      {session.playersPresent} Present · {session.goals} Goals · {session.assists} Assists
                    </p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-gray-300 transition-colors group-hover:text-brand" />
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
