"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/cn";
import { PUBLIC_NAV_ITEMS } from "@/components/layout/nav-items";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 sm:flex">
          {PUBLIC_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
        >
          <ShieldCheck className="size-4" />
          <span>Admin</span>
        </Link>
      </div>
    </header>
  );
}
