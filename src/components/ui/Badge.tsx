import { cn } from "@/lib/cn";

type Variant = "brand" | "accent" | "success" | "neutral";

const variantClasses: Record<Variant, string> = {
  brand: "bg-brand/25 text-violet-200",
  accent: "bg-accent text-white",
  success: "bg-emerald-400/20 text-emerald-300",
  neutral: "bg-white/10 text-white/60",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
