"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PUBLIC_NAV_ITEMS } from "@/components/layout/nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-ink/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
      {PUBLIC_NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-white/40 transition-transform active:scale-[0.95]"
          >
            {active && <span className="absolute top-0 h-0.5 w-6 rounded-full bg-accent" />}
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                active && "bg-white/10 shadow-[0_0_12px_2px_rgba(219,38,29,0.35)]"
              )}
            >
              <Icon className={cn("size-5", active ? "text-white" : "text-white/40")} />
            </span>
            <span className={active ? "font-semibold text-white" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
