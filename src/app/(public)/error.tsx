"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent/20 text-red-300">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h2 className="font-display text-lg font-semibold text-white">
        Something went wrong loading this page
      </h2>
      <p className="text-sm text-white/50">
        Spartan FC&apos;s data couldn&apos;t be loaded right now. Please try again.
      </p>
      <Button onClick={reset} variant="primary" className="mt-2">
        Try again
      </Button>
    </div>
  );
}
