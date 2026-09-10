"use client";

import { Users } from "lucide-react";
import { usePlayerFilters } from "@/hooks/usePlayerFilters";
import { PlayerFilterBar } from "@/components/players/PlayerFilterBar";
import { PlayerCard } from "@/components/players/PlayerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RosterEntry } from "@/lib/stats";

export function SquadGrid({ roster }: { roster: RosterEntry[] }) {
  const filters = usePlayerFilters(roster, "active");

  if (roster.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="The squad list is being put together"
        description="Spartan FC players will appear here once the admin adds them."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PlayerFilterBar
        search={filters.search}
        onSearchChange={filters.setSearch}
        positionGroup={filters.positionGroup}
        onPositionGroupChange={filters.setPositionGroup}
        status={filters.status}
        onStatusChange={filters.setStatus}
      />

      {filters.filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No players match your search"
          description="Try a different name, position or status."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filters.filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
