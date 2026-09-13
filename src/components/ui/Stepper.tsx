"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stepper({
  value,
  onChange,
  label,
  disabled,
  accent = false,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", disabled && "opacity-40")}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition-[color,background-color,transform] active:scale-[0.93] hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span
        className={cn(
          "w-6 text-center font-display text-base font-bold tabular-nums",
          accent ? "text-accent" : "text-white"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] active:scale-[0.93] disabled:pointer-events-none disabled:opacity-40",
          accent ? "bg-accent hover:bg-accent-dark" : "bg-brand hover:bg-brand-dark"
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
