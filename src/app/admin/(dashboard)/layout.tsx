import Image from "next/image";
import Link from "next/link";
import { LogOut, Eye } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/actions/auth";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-white/10 bg-ink/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/images/spartan-logo.jpeg"
              alt="Spartan FC crest"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden font-display text-base font-bold text-white sm:inline">
              Spartan Hub Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              prefetch={false}
              title="Switch to the public player view"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Eye className="size-4" />
              Player View
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
