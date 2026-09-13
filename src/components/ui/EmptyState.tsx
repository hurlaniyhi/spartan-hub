import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/70">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
