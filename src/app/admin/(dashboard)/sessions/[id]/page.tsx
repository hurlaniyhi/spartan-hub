import { notFound } from "next/navigation";
import { format } from "date-fns";
import { SessionForm, type RosterPlayer } from "@/components/admin/SessionForm";
import { BackButton } from "@/components/ui/BackButton";
import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/models/Session";
import { PlayerModel } from "@/models/Player";
import { PlayerSessionPerformanceModel } from "@/models/PlayerSessionPerformance";
import { getActivePlayers } from "@/lib/stats";
import { displayName } from "@/lib/format";
import type { MatchOutcome } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectToDatabase();
  const session = await SessionModel.findById(id).lean().catch(() => null);
  if (!session) notFound();

  const activeRoster = await getActivePlayers();
  const existingPerformances = await PlayerSessionPerformanceModel.find({ sessionId: id }).lean();

  const activeIds = new Set(activeRoster.map((p) => p.id));
  const missingPlayerIds = existingPerformances
    .map((p) => p.playerId.toString())
    .filter((playerId) => !activeIds.has(playerId));

  const extraPlayers = missingPlayerIds.length
    ? await PlayerModel.find({ _id: { $in: missingPlayerIds } }).lean()
    : [];

  const roster: RosterPlayer[] = [
    ...activeRoster,
    ...extraPlayers.map((player) => ({
      id: player._id.toString(),
      name: `${displayName(player)} (inactive)`,
      photoUrl: player.photoUrl ?? undefined,
      position: player.position,
    })),
  ];

  const performances: Record<string, { attended: boolean; goals: number; assists: number }> = {};
  for (const performance of existingPerformances) {
    performances[performance.playerId.toString()] = {
      attended: performance.attended,
      goals: performance.goals,
      assists: performance.assists,
    };
  }

  return (
    <div>
      <BackButton fallbackHref="/admin/sessions" label="Back to Sessions" className="mb-4" />
      <h1 className="mb-1 font-display text-2xl font-bold text-white">Edit Session</h1>
      <p className="mb-6 text-sm text-white/50">Update attendance, goals and assists for this session.</p>
      <SessionForm
        roster={roster}
        existingSession={{
          id: session._id.toString(),
          type: session.type,
          date: format(new Date(session.date), "yyyy-MM-dd"),
          opponent: session.opponent,
          venue: session.venue,
          result: session.result,
          outcome: session.outcome as MatchOutcome | undefined,
          notes: session.notes,
          performances,
        }}
      />
    </div>
  );
}
