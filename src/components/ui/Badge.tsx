import { cn } from "@/lib/cn";

type Variant = "brand" | "accent" | "success" | "neutral";

const variantClasses: Record<Variant, string> = {
  brand: "bg-brand-light text-brand-dark",
  accent: "bg-accent-light text-accent-dark",
  success: "bg-emerald-50 text-emerald-700",
  neutral: "bg-gray-100 text-gray-600",
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
