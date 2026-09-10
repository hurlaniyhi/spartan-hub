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
        "flex h-11 min-w-28 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
        present
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      )}
    >
      {present && <Check className="size-4" />}
      {present ? "Present" : "Absent"}
    </button>
  );
}
