import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import type { RosterEntry } from "@/lib/stats";

export function PlayerCard({ player }: { player: RosterEntry }) {
  return (
    <Link href={`/players/${player.slug}`} className="group block">
      <Card className="h-full p-5 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between">
          <PlayerAvatar photoUrl={player.photoUrl} name={player.name} size="lg" />
          {player.jerseyNumber !== undefined && (
            <span className="font-display text-2xl font-bold text-gray-200">
              {player.jerseyNumber}
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-display text-lg font-bold text-gray-900">{player.name}</h3>
          <p className="text-sm text-gray-500">{player.position}</p>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span>
            <strong className="font-display text-gray-900">{player.appearances}</strong>{" "}
            <span className="text-gray-400">Apps</span>
          </span>
          <span>
            <strong className="font-display text-gray-900">{player.goals}</strong>{" "}
            <span className="text-gray-400">Goals</span>
          </span>
          <span>
            <strong className="font-display text-gray-900">{player.assists}</strong>{" "}
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
      </Card>
    </Link>
  );
}
