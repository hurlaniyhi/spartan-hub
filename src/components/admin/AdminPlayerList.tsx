"use client";

import { Users } from "lucide-react";
import { usePlayerFilters } from "@/hooks/usePlayerFilters";
import { PlayerFilterBar } from "@/components/players/PlayerFilterBar";
import { AdminPlayerCard } from "@/components/admin/AdminPlayerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import type { RosterEntry } from "@/lib/stats";

export function AdminPlayerList({ roster }: { roster: RosterEntry[] }) {
  const filters = usePlayerFilters(roster, "all");

  if (roster.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No players yet"
        description="Add the first Spartan FC player to get started."
        action={
          <Button href="/admin/players/new" variant="accent" leftIcon={<UserPlus className="size-4" />}>
            Add Player
          </Button>
        }
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
        <EmptyState icon={Users} title="No players match your search" description="Try a different name, position or status." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filters.filtered.map((player) => (
            <AdminPlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
