"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0">
        <Image
          src="/images/team-3.jpeg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/80 to-brand-dark" />
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Player View
      </Link>

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/images/spartan-logo.jpeg"
            alt="Spartan FC crest"
            width={64}
            height={64}
            className="mb-3 rounded-full shadow-md"
          />
          <h1 className="font-display text-xl font-bold text-white">Admin Sign In</h1>
          <p className="mt-1 text-sm text-white/50">Manage the Spartan FC squad and sessions.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <Input id="email" name="email" type="email" label="Email" autoComplete="username" required />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
          />

          {state && !state.success && (
            <div className="flex items-center gap-2 rounded-xl bg-accent/15 px-3 py-2.5 text-sm font-medium text-red-300">
              <AlertCircle className="size-4 shrink-0" />
              {state.message}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={pending}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
