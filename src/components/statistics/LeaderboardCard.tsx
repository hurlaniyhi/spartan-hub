import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { LeaderboardEntry } from "@/lib/stats";
import type { LucideIcon } from "lucide-react";
import { Trophy } from "lucide-react";

const RANK_STYLES = [
  "bg-amber-100 text-amber-700", // gold
  "bg-gray-200 text-gray-600", // silver
  "bg-orange-100 text-orange-700", // bronze
];

export function LeaderboardCard({
  title,
  icon: Icon,
  entries,
  valueLabel,
  formatValue = (value) => String(value),
}: {
  title: string;
  icon: LucideIcon;
  entries: LeaderboardEntry[];
  valueLabel: string;
  formatValue?: (value: number) => string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent-light text-accent">
            <Icon className="size-4" />
          </div>
          <h2 className="font-display text-base font-bold text-gray-900">{title}</h2>
        </div>

        {entries.length === 0 ? (
          <EmptyState icon={Trophy} title="No data yet" description="Recorded sessions will populate this leaderboard." />
        ) : (
          <ol className="flex flex-col gap-1">
            {entries.map((entry, index) => (
              <li key={entry.playerId}>
                <Link
                  href={`/players/${entry.slug}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                      index < 3 ? RANK_STYLES[index] : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {index + 1}
                  </span>
                  <PlayerAvatar photoUrl={entry.photoUrl} name={entry.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{entry.name}</p>
                    <p className="truncate text-xs text-gray-400">{entry.position}</p>
                  </div>
                  <p className="font-display text-base font-bold text-gray-900">
                    {formatValue(entry.value)}
                    <span className="ml-1 text-xs font-medium text-gray-400">{valueLabel}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
