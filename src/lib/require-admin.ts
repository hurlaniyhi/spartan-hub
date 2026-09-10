import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";

/**
 * Guards a mutating route handler server-side, independent of the
 * middleware page redirect — the API must never trust that the UI hid
 * the button.
 */
export async function requireAdmin(): Promise<
  | { session: Session; unauthorized: null }
  | { session: null; unauthorized: NextResponse }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      unauthorized: NextResponse.json(
        { error: "You must be signed in as an admin to do that." },
        { status: 401 }
      ),
    };
  }
  return { session, unauthorized: null };
}
