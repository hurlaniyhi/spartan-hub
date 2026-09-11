import { cn } from "@/lib/cn";

type Tone = "brand" | "accent" | "success" | "neutral";

const ICON_TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-gradient-to-br from-brand to-brand-dark",
  accent: "bg-gradient-to-br from-accent to-accent-dark",
  success: "bg-gradient-to-br from-emerald-400 to-emerald-600",
  neutral: "bg-gradient-to-br from-gray-400 to-gray-600",
};

const VALUE_TONE_CLASSES: Record<Tone, string> = {
  brand: "text-brand-dark",
  accent: "text-accent-dark",
  success: "text-emerald-600",
  neutral: "text-gray-500",
};

export function StatTile({
  value,
  label,
  icon,
  accent = false,
  tone,
  className,
}: {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  /** Shorthand for tone="accent" — kept for existing call sites. */
  accent?: boolean;
  tone?: Tone;
  className?: string;
}) {
  const resolvedTone: Tone = tone ?? (accent ? "accent" : "brand");

  return (
    <div className={cn("flex flex-col items-center text-center sm:items-start sm:text-left", className)}>
      {icon && (
        <div
          className={cn(
            "mb-1.5 flex size-9 items-center justify-center rounded-full text-white shadow-sm",
            ICON_TONE_CLASSES[resolvedTone]
          )}
        >
          {icon}
        </div>
      )}
      <span
        className={cn(
          "font-display text-3xl font-bold tracking-tight sm:text-4xl",
          VALUE_TONE_CLASSES[resolvedTone]
        )}
      >
        {value}
      </span>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
  );
}
