import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { POSITION_GROUP_STYLES } from "@/lib/position-colors";
import type { RosterEntry } from "@/lib/stats";
import type { PositionGroup } from "@/lib/constants";

export function PlayerCard({ player }: { player: RosterEntry }) {
  const style = POSITION_GROUP_STYLES[player.positionGroup as PositionGroup];

  return (
    <Link href={`/players/${player.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className={`h-1.5 w-full ${style.bar}`} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <PlayerAvatar photoUrl={player.photoUrl} name={player.name} size="lg" />
            {player.jerseyNumber !== undefined && (
              <span className="font-display text-3xl font-bold text-gray-300 transition-colors group-hover:text-brand-light">
                #{player.jerseyNumber}
              </span>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-display text-lg font-bold text-gray-900">{player.name}</h3>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
            >
              {player.position}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span>
              <strong className="font-display text-gray-900">{player.appearances}</strong>{" "}
              <span className="text-gray-400">Apps</span>
            </span>
            <span>
              <strong className="font-display text-brand-dark">{player.goals}</strong>{" "}
              <span className="text-gray-400">Goals</span>
            </span>
            <span>
              <strong className="font-display text-accent-dark">{player.assists}</strong>{" "}
              <span className="text-gray-400">Assists</span>
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge variant={player.status === "active" ? "success" : "neutral"}>
              {player.status}
            </Badge>
            <span className="flex items-center gap-1 text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
              View Profile <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
