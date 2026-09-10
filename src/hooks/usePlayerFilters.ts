import { useMemo, useState } from "react";
import type { RosterEntry } from "@/lib/stats";

export function usePlayerFilters(roster: RosterEntry[], defaultStatus: "all" | "active" | "inactive" = "active") {
  const [search, setSearch] = useState("");
  const [positionGroup, setPositionGroup] = useState<string>("all");
  const [status, setStatus] = useState<string>(defaultStatus);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roster.filter((player) => {
      if (status !== "all" && player.status !== status) return false;
      if (positionGroup !== "all" && player.positionGroup !== positionGroup) return false;
      if (
        query &&
        !player.name.toLowerCase().includes(query) &&
        !player.position.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [roster, search, positionGroup, status]);

  return { filtered, search, setSearch, positionGroup, setPositionGroup, status, setStatus };
}
