"use client";

import { useTransition } from "react";
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { useToast } from "@/components/ui/Toast";
import { setPlayerStatus } from "@/actions/players";
import type { RosterEntry } from "@/lib/stats";

export function AdminPlayerCard({ player }: { player: RosterEntry }) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

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
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <PlayerAvatar photoUrl={player.photoUrl} name={player.name} size="md" />
          <div>
            <p className="font-display text-base font-bold text-gray-900">{player.name}</p>
            <p className="text-sm text-gray-500">
              {player.position}
              {player.jerseyNumber !== undefined ? ` · #${player.jerseyNumber}` : ""}
            </p>
          </div>
        </div>
        <Badge variant={player.status === "active" ? "success" : "neutral"}>{player.status}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span>
          <strong className="text-gray-900">{player.appearances}</strong> Apps
        </span>
        <span>
          <strong className="text-gray-900">{player.goals}</strong> Goals
        </span>
        <span>
          <strong className="text-gray-900">{player.assists}</strong> Assists
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
    </Card>
  );
}
