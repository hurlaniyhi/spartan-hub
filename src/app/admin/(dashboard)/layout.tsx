import Image from "next/image";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/actions/auth";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/images/spartan-logo.jpeg"
              alt="Spartan FC crest"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-display text-base font-bold text-brand-dark">Spartan Hub Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              prefetch={false}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 sm:flex"
            >
              <ExternalLink className="size-4" />
              View Site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
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
