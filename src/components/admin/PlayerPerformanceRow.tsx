"use client";

import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { AttendanceToggle } from "@/components/ui/AttendanceToggle";
import { Stepper } from "@/components/ui/Stepper";

export type PerformanceState = { attended: boolean; goals: number; assists: number };

export function PlayerPerformanceRow({
  player,
  performance,
  onChange,
}: {
  player: { id: string; name: string; photoUrl?: string; position: string };
  performance: PerformanceState;
  onChange: (next: PerformanceState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <PlayerAvatar photoUrl={player.photoUrl} name={player.name} size="sm" />
        <div>
          <p className="text-sm font-semibold text-gray-900">{player.name}</p>
          <p className="text-xs text-gray-400">{player.position}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-5">
        <AttendanceToggle
          present={performance.attended}
          onChange={(attended) =>
            onChange({
              attended,
              goals: attended ? performance.goals : 0,
              assists: attended ? performance.assists : 0,
            })
          }
        />
        <Stepper
          label="goals"
          value={performance.goals}
          disabled={!performance.attended}
          accent
          onChange={(goals) => onChange({ ...performance, goals })}
        />
        <Stepper
          label="assists"
          value={performance.assists}
          disabled={!performance.attended}
          onChange={(assists) => onChange({ ...performance, assists })}
        />
      </div>
    </div>
  );
}
