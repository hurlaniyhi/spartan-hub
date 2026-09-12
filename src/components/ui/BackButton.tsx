"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Goes to the previous screen the visitor was actually on (browser history),
 * not always the same fixed list page — a player's profile might have been
 * reached from Squad, Statistics, the homepage, or a session's roster.
 * Falls back to `fallbackHref` only when there's no history to go back to
 * (e.g. the page was opened directly from a shared link).
 */
export function BackButton({
  fallbackHref,
  label = "Back",
  variant = "default",
  className,
}: {
  fallbackHref: string;
  label?: string;
  /** "default" for light backgrounds, "inverse" for dark/photo backgrounds. */
  variant?: "default" | "inverse";
  className?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
        variant === "inverse" ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900",
        className
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
