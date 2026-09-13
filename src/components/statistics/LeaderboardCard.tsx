import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { LeaderboardEntry } from "@/lib/stats";
import type { LucideIcon } from "lucide-react";
import { Trophy } from "lucide-react";

const RANK_STYLES = [
  "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm shadow-amber-500/40", // gold
  "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm shadow-gray-400/40", // silver
  "bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-sm shadow-orange-500/30", // bronze
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
    <Card className="overflow-hidden">
      <CardBody>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
            <Icon className="size-4" />
          </div>
          <h2 className="font-display text-base font-bold text-white">{title}</h2>
        </div>

        {entries.length === 0 ? (
          <EmptyState icon={Trophy} title="No data yet" description="Recorded sessions will populate this leaderboard." />
        ) : (
          <ol className="flex flex-col gap-1">
            {entries.map((entry, index) => (
              <li key={entry.playerId}>
                <Link
                  href={`/players/${entry.slug}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-white/5",
                    index === 0 && "bg-amber-400/10"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                      index < 3 ? RANK_STYLES[index] : "bg-white/10 text-white/40"
                    )}
                  >
                    {index + 1}
                  </span>
                  <PlayerAvatar photoUrl={entry.photoUrl} name={entry.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
                    <p className="truncate text-xs text-white/40">{entry.position}</p>
                  </div>
                  <p className="font-display text-base font-bold text-red-300">
                    {formatValue(entry.value)}
                    <span className="ml-1 text-xs font-medium text-white/40">{valueLabel}</span>
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
