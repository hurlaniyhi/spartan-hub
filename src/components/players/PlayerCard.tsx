import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { POSITION_GROUP_STYLES } from "@/lib/position-colors";
import { getJerseyLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { RosterEntry } from "@/lib/stats";
import type { AnyPositionGroup } from "@/lib/constants";

export function PlayerCard({ player }: { player: RosterEntry }) {
  const style = POSITION_GROUP_STYLES[player.positionGroup as AnyPositionGroup];

  return (
    <Link href={`/players/${player.slug}`} className="group block transition-transform active:scale-[0.98]">
      <Card className="h-full overflow-hidden transition-colors group-hover:border-white/20">
        <div className={`h-1.5 w-full ${style.bar}`} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <PlayerAvatar
              photoUrl={player.photoUrl}
              name={player.name}
              size="lg"
              isCaptain={player.isCaptain}
              className={cn("ring-4", style.ring, style.glow)}
            />
            <span className="font-display text-3xl font-bold text-white/20 transition-colors group-hover:text-white/40">
              #{getJerseyLabel(player)}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="font-display text-lg font-bold text-white">{player.name}</h3>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
            >
              {player.position}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span>
              <strong className="font-display text-white">{player.appearances}</strong>{" "}
              <span className="text-white/40">Apps</span>
            </span>
            <span>
              <strong className="font-display text-violet-300">{player.goals}</strong>{" "}
              <span className="text-white/40">Goals</span>
            </span>
            <span>
              <strong className="font-display text-red-300">{player.assists}</strong>{" "}
              <span className="text-white/40">Assists</span>
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge variant={player.status === "active" ? "success" : "neutral"}>
              {player.status}
            </Badge>
            <span className="flex items-center gap-1 text-sm font-semibold text-violet-300 opacity-0 transition-opacity group-hover:opacity-100">
              View Profile <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
