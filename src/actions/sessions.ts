"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/models/Session";
import { PlayerSessionPerformanceModel } from "@/models/PlayerSessionPerformance";
import { sessionSaveSchema, type SessionSavePayload } from "@/lib/validation/session";
import type { ActionResult } from "@/lib/action-result";

function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path.filter((p) => typeof p === "string").pop() ?? issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function revalidateEverythingAffected(sessionId: string) {
  revalidatePath("/admin/sessions");
  revalidatePath(`/admin/sessions/${sessionId}`);
  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/statistics");
  revalidatePath("/squad");
  revalidatePath("/players/[slug]", "page");
  revalidatePath("/");
}

export async function saveSession(
  sessionId: string | null,
  payload: SessionSavePayload
): Promise<ActionResult<{ id: string }>> {
  const authSession = await auth();
  if (!authSession?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  const parsed = sessionSaveSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  await connectToDatabase();

  const { session: sessionFields, performances } = parsed.data;

  const sessionDoc = sessionId
    ? await SessionModel.findByIdAndUpdate(sessionId, sessionFields, {
        returnDocument: "after",
        runValidators: true,
      })
    : await SessionModel.create(sessionFields);

  if (!sessionDoc) {
    return { success: false, message: "That session couldn't be found." };
  }

  if (performances.length > 0) {
    await PlayerSessionPerformanceModel.bulkWrite(
      performances.map((performance) => ({
        updateOne: {
          filter: { playerId: performance.playerId, sessionId: sessionDoc._id },
          update: {
            $set: {
              attended: performance.attended,
              goals: performance.goals,
              assists: performance.assists,
            },
          },
          upsert: true,
        },
      }))
    );
  }

  const id = sessionDoc._id.toString();
  revalidateEverythingAffected(id);

  return { success: true, data: { id } };
}
