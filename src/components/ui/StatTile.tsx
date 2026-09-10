import { cn } from "@/lib/cn";

export function StatTile({
  value,
  label,
  icon,
  accent = false,
  className,
}: {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center sm:items-start sm:text-left", className)}>
      {icon && (
        <div
          className={cn(
            "mb-1.5 flex size-9 items-center justify-center rounded-full",
            accent ? "bg-accent-light text-accent" : "bg-brand-light text-brand"
          )}
        >
          {icon}
        </div>
      )}
      <span className="font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {value}
      </span>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
  );
}
