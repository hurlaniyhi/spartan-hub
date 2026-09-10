"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { POSITION_GROUPS } from "@/lib/constants";

export function PlayerFilterBar({
  search,
  onSearchChange,
  positionGroup,
  onPositionGroupChange,
  status,
  onStatusChange,
  showStatusFilter = true,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  positionGroup: string;
  onPositionGroupChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  showStatusFilter?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search players..."
          className="h-11 w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip active={positionGroup === "all"} onClick={() => onPositionGroupChange("all")}>
          All Positions
        </Chip>
        {POSITION_GROUPS.map((group) => (
          <Chip key={group} active={positionGroup === group} onClick={() => onPositionGroupChange(group)}>
            {group}s
          </Chip>
        ))}

        {showStatusFilter && (
          <div className="ml-auto flex items-center gap-1 rounded-full bg-gray-100 p-1">
            {(["active", "inactive", "all"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onStatusChange(option)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                  status === option ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      )}
    >
      {children}
    </button>
  );
}
