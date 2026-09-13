"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function AttendanceToggle({
  present,
  onChange,
}: {
  present: boolean;
  onChange: (present: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!present)}
      aria-pressed={present}
      className={cn(
        "flex h-11 min-w-28 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-[color,background-color,transform] active:scale-[0.97]",
        present
          ? "bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/30"
          : "bg-white/10 text-white/50 hover:bg-white/15"
      )}
    >
      {present && <Check className="size-4" />}
      {present ? "Present" : "Absent"}
    </button>
  );
}
