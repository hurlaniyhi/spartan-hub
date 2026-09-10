"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent-light text-accent">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h2 className="font-display text-lg font-semibold text-gray-900">Something went wrong</h2>
      <p className="max-w-sm text-sm text-gray-500">
        This page couldn&apos;t load. Please try again — if it keeps happening, check the database connection.
      </p>
      <Button onClick={reset} variant="primary" className="mt-2">
        Try again
      </Button>
    </div>
  );
}
