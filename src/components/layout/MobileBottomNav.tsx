"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PUBLIC_NAV_ITEMS } from "@/components/layout/nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
      {PUBLIC_NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
              active ? "text-brand" : "text-gray-400"
            )}
          >
            <Icon className={cn("size-5", active && "text-brand")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
