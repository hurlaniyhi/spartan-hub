"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, FileDown, History, Images } from "lucide-react";
import { cn } from "@/lib/cn";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reports", label: "Reports", icon: FileDown },
  { href: "/admin/legacy-stats", label: "Legacy Stats", icon: History },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4",
              active
                ? "bg-brand text-white shadow-[0_0_16px_2px_rgba(41,5,163,0.5)]"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
