"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import type { ActionResult } from "@/lib/action-result";

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, message: "Please enter your email and password." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: "Incorrect email or password." };
    }
    throw error;
  }

  return { success: true, data: undefined };
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/admin/login");
}
