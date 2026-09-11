"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PUBLIC_NAV_ITEMS } from "@/components/layout/nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,4,84,0.06)] backdrop-blur sm:hidden">
      {PUBLIC_NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-gray-400 transition-colors"
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                active && "bg-brand-light"
              )}
            >
              <Icon className={cn("size-5", active ? "text-brand" : "text-gray-400")} />
            </span>
            <span className={active ? "font-semibold text-brand" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
