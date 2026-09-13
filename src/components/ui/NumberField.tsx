"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const clamp = (next: number) => {
    let clamped = next;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition-[color,background-color,transform] active:scale-[0.93] hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          aria-label={label}
          onFocus={(event) => event.target.select()}
          onChange={(event) => onChange(clamp(Number(event.target.value) || 0))}
          className={cn(
            "h-9 w-14 rounded-lg border border-white/10 bg-white/5 text-center text-sm font-semibold text-white",
            "focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-brand/30",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={max !== undefined && value >= max}
          onClick={() => onChange(clamp(value + step))}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-[background-color,transform] active:scale-[0.93] hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </label>
  );
}
