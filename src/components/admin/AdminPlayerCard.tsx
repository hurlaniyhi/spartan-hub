"use client";

import { useTransition } from "react";
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { useToast } from "@/components/ui/Toast";
import { setPlayerStatus } from "@/actions/players";
import { POSITION_GROUP_STYLES } from "@/lib/position-colors";
import { getJerseyLabel } from "@/lib/format";
import type { RosterEntry } from "@/lib/stats";
import type { AnyPositionGroup } from "@/lib/constants";

export function AdminPlayerCard({ player }: { player: RosterEntry }) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const style = POSITION_GROUP_STYLES[player.positionGroup as AnyPositionGroup];

  const toggleStatus = () => {
    const nextStatus = player.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      const result = await setPlayerStatus(player.id, nextStatus);
      if (result.success) {
        showToast(`${player.name} marked ${nextStatus}.`);
      } else {
        showToast(result.message, "error");
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 w-full ${style.bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar photoUrl={player.photoUrl} name={player.name} size="md" />
            <div>
              <p className="font-display text-base font-bold text-gray-900">{player.name}</p>
              <span
                className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
              >
                {player.position} · #{getJerseyLabel(player)}
              </span>
            </div>
          </div>
          <Badge variant={player.status === "active" ? "success" : "neutral"}>{player.status}</Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>
            <strong className="text-gray-900">{player.appearances}</strong> Apps
          </span>
          <span>
            <strong className="text-brand-dark">{player.goals}</strong> Goals
          </span>
          <span>
            <strong className="text-accent-dark">{player.assists}</strong> Assists
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button href={`/admin/players/${player.id}/edit`} variant="outline" size="sm" leftIcon={<Pencil className="size-3.5" />}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleStatus} loading={pending}>
            Mark {player.status === "active" ? "Inactive" : "Active"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
