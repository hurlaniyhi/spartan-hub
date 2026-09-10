import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { requireAdmin } from "@/lib/require-admin";
import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { SessionModel } from "@/models/Session";
import { PlayerSessionPerformanceModel } from "@/models/PlayerSessionPerformance";
import { fullName } from "@/lib/format";
import { toCsv } from "@/lib/csv";

/**
 * Statistics "as of" a session/date — only sessions up to and including the
 * cutoff are counted, so the export reflects the standings as they existed
 * at that point in time, not today's totals.
 */
export async function GET(request: NextRequest) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const dateParam = searchParams.get("date");

  let cutoffDate: Date;

  if (sessionId) {
    const sessionDoc = await SessionModel.findById(sessionId).lean();
    if (!sessionDoc) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    cutoffDate = sessionDoc.date;
  } else if (dateParam) {
    cutoffDate = new Date(dateParam);
  } else {
    cutoffDate = new Date();
  }

  const sessionsUpToCutoff = await SessionModel.find({ date: { $lte: cutoffDate } })
    .select("_id")
    .lean();
  const sessionIds = sessionsUpToCutoff.map((s) => s._id);

  const totals = await PlayerSessionPerformanceModel.aggregate([
    { $match: { sessionId: { $in: sessionIds } } },
    {
      $group: {
        _id: "$playerId",
        appearances: { $sum: { $cond: ["$attended", 1, 0] } },
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
      },
    },
  ]);

  const players = await PlayerModel.find({ _id: { $in: totals.map((t) => t._id) } }).lean();
  const playerById = new Map(players.map((p) => [p._id.toString(), p]));

  const rows = totals
    .map((t) => ({ player: playerById.get(t._id.toString()), ...t }))
    .filter((row): row is typeof row & { player: NonNullable<typeof row.player> } => !!row.player)
    .sort((a, b) => b.goals - a.goals || fullName(a.player).localeCompare(fullName(b.player)));

  const cutoffLabel = format(cutoffDate, "yyyy-MM-dd");
  const csv = toCsv([
    [`Spartan FC Statistics — ${format(cutoffDate, "d MMMM yyyy")}`],
    [],
    ["Player", "Appearances", "Goals", "Assists"],
    ...rows.map((row) => [fullName(row.player), row.appearances, row.goals, row.assists]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="spartan-fc-statistics-${cutoffLabel}.csv"`,
    },
  });
}
