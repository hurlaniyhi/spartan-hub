"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { playerFormSchema } from "@/lib/validation/player";
import { slugify } from "@/lib/slugify";
import { savePlayerPhoto, deletePlayerPhoto } from "@/lib/upload-photo";
import type { ActionResult } from "@/lib/action-result";
import type { PlayerStatus } from "@/lib/constants";

function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "player";
  let attempt = 1;
  while (
    await PlayerModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

export async function savePlayer(
  playerId: string | null,
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") || undefined,
    nickname: formData.get("nickname") || undefined,
    jerseyNumber: formData.get("jerseyNumber")
      ? Number(formData.get("jerseyNumber"))
      : undefined,
    position: formData.get("position"),
    status: formData.get("status") || "active",
    dateJoined: formData.get("dateJoined"),
    bio: formData.get("bio") || undefined,
  };

  const parsed = playerFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  await connectToDatabase();

  const existing = playerId ? await PlayerModel.findById(playerId) : null;
  if (playerId && !existing) {
    return { success: false, message: "That player couldn't be found." };
  }

  // Soft check only — a retired number can be reissued, so this isn't a
  // hard database constraint, just guidance for the admin.
  if (parsed.data.jerseyNumber !== undefined && parsed.data.status === "active") {
    const clash = await PlayerModel.findOne({
      jerseyNumber: parsed.data.jerseyNumber,
      status: "active",
      ...(playerId ? { _id: { $ne: playerId } } : {}),
    });
    if (clash) {
      return {
        success: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: {
          jerseyNumber: `Number ${parsed.data.jerseyNumber} is already worn by an active player.`,
        },
      };
    }
  }

  let photoUrl = existing?.photoUrl;
  const photoFile = formData.get("photo");
  if (photoFile instanceof File && photoFile.size > 0) {
    try {
      photoUrl = await savePlayerPhoto(photoFile);
      if (existing?.photoUrl) await deletePlayerPhoto(existing.photoUrl);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Couldn't save that photo.",
        fieldErrors: { photo: error instanceof Error ? error.message : "Upload failed." },
      };
    }
  }

  const slugSource = [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join("-");
  const slug = existing?.slug ?? (await uniqueSlug(slugify(slugSource)));

  if (existing) {
    existing.set({ ...parsed.data, photoUrl });
    await existing.save();
  } else {
    await PlayerModel.create({ ...parsed.data, photoUrl, slug });
  }

  revalidatePath("/admin/players");
  revalidatePath("/squad");
  revalidatePath("/");
  revalidatePath(`/players/${slug}`);

  return { success: true, data: { slug } };
}

export async function setPlayerStatus(
  playerId: string,
  status: PlayerStatus
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  await connectToDatabase();
  const player = await PlayerModel.findByIdAndUpdate(
    playerId,
    { status },
    { returnDocument: "after" }
  );
  if (!player) {
    return { success: false, message: "That player couldn't be found." };
  }

  revalidatePath("/admin/players");
  revalidatePath("/squad");
  revalidatePath("/");
  revalidatePath(`/players/${player.slug}`);

  return { success: true, data: undefined };
}
