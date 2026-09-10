"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/images/spartan-logo.jpeg"
            alt="Spartan FC crest"
            width={64}
            height={64}
            className="mb-3 rounded-full"
          />
          <h1 className="font-display text-xl font-bold text-gray-900">Admin Sign In</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the Spartan FC squad and sessions.</p>
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
            <div className="flex items-center gap-2 rounded-xl bg-accent-light px-3 py-2.5 text-sm font-medium text-accent-dark">
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
