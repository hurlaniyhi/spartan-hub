import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PlayerForm } from "@/components/admin/PlayerForm";
import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { displayName } from "@/lib/format";
import type { Position } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectToDatabase();
  const player = await PlayerModel.findById(id).lean().catch(() => null);
  if (!player) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Edit Player</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">Update {displayName(player)}&apos;s details.</p>
      <PlayerForm
        existingPlayer={{
          id: player._id.toString(),
          name: displayName(player),
          firstName: player.firstName,
          lastName: player.lastName,
          nickname: player.nickname ?? undefined,
          jerseyNumber: player.jerseyNumber ?? undefined,
          position: player.position as Position,
          status: player.status as "active" | "inactive",
          dateJoined: format(new Date(player.dateJoined), "yyyy-MM-dd"),
          bio: player.bio ?? undefined,
          photoUrl: player.photoUrl ?? undefined,
        }}
      />
    </div>
  );
}
