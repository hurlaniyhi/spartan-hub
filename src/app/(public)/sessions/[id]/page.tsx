import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Target, Users as UsersIcon, Check } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { getSessionDetail } from "@/lib/stats";
import { formatSessionDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await getSessionDetail(id).catch(() => null);
  if (!session) return { title: "Session Not Found" };
  const title = session.opponent
    ? `Spartan FC vs ${session.opponent} — ${formatSessionDate(session.date)}`
    : `Training — ${formatSessionDate(session.date)}`;
  return { title };
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionDetail(id).catch(() => null);
  if (!session) notFound();

  const present = session.performances.filter((p) => p.attended);
  const totalGoals = present.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = present.reduce((sum, p) => sum + p.assists, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Card>
        <CardBody className="border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={session.type === "match" ? "accent" : "brand"}>{session.type}</Badge>
            <span className="text-sm font-medium text-gray-400">{formatSessionDate(session.date)}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-gray-900">
            {session.opponent ? `Spartan FC vs ${session.opponent}` : "Training Session"}
          </h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {session.result && <span>Result: {session.result}</span>}
            {session.venue && <span>Venue: {session.venue}</span>}
          </div>
          {session.notes && <p className="mt-3 text-sm leading-relaxed text-gray-600">{session.notes}</p>}
        </CardBody>

        <CardBody className="grid grid-cols-3 gap-4 border-b border-gray-100 text-center">
          <StatTile value={present.length} label="Present" className="items-center" />
          <StatTile value={totalGoals} label="Goals" accent className="items-center" />
          <StatTile value={totalAssists} label="Assists" accent className="items-center" />
        </CardBody>

        <CardBody>
          <h2 className="mb-3 font-display text-base font-bold text-gray-900">Player Performance</h2>
          {session.performances.length === 0 ? (
            <p className="text-sm text-gray-500">No performance was recorded for this session.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {session.performances.map((performance) => (
                <li key={performance.playerId} className="flex items-center justify-between gap-3 py-3">
                  <Link
                    href={`/players/${performance.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <PlayerAvatar photoUrl={performance.photoUrl} name={performance.name} size="sm" />
                    <span className="truncate text-sm font-semibold text-gray-900">{performance.name}</span>
                  </Link>
                  <div className="flex items-center gap-4 text-sm">
                    {performance.attended ? (
                      <span className="flex items-center gap-1 font-medium text-emerald-600">
                        <Check className="size-3.5" /> Present
                      </span>
                    ) : (
                      <span className="text-gray-400">Absent</span>
                    )}
                    {performance.attended && (
                      <>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Target className="size-3.5" /> {performance.goals}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <UsersIcon className="size-3.5" /> {performance.assists}
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
