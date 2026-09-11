import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { SessionModel } from "@/models/Session";
import { PlayerSessionPerformanceModel } from "@/models/PlayerSessionPerformance";
import { displayName } from "@/lib/format";
import { ALL_SEASONS } from "@/lib/slugify";

export interface ReportRow {
  name: string;
  appearances: number;
  goals: number;
  assists: number;
  goalInvolvements: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface ReportData {
  cutoffDate: Date;
  /** "2026" for a specific season, or "All Seasons" when no season filter applies. */
  seasonLabel: string;
  rows: ReportRow[];
}

/**
 * Statistics "as of" a session/date — only sessions up to and including the
 * cutoff are counted, so the export reflects the standings as they existed
 * at that point in time, not today's totals. Shared by both the CSV and PDF
 * export routes so the two formats can never drift apart.
 *
 * `season` additionally sets the lower bound: a specific year (e.g. "2026")
 * only counts sessions from 1 January of that year onward, while omitting it
 * (or passing the ALL_SEASONS sentinel) counts every session ever recorded.
 */
export async function getStatisticsAsOf(params: {
  sessionId?: string | null;
  date?: string | null;
  season?: string | null;
}): Promise<ReportData | null> {
  await connectToDatabase();

  let cutoffDate: Date;

  if (params.sessionId) {
    const sessionDoc = await SessionModel.findById(params.sessionId).lean();
    if (!sessionDoc) return null;
    cutoffDate = sessionDoc.date;
  } else if (params.date) {
    cutoffDate = new Date(params.date);
  } else {
    cutoffDate = new Date();
  }

  const season = params.season && params.season !== ALL_SEASONS ? params.season : undefined;
  const sessionMatch: Record<string, unknown> = season
    ? { date: { $gte: new Date(Number(season), 0, 1), $lte: cutoffDate } }
    : { date: { $lte: cutoffDate } };

  const sessionsUpToCutoff = await SessionModel.find(sessionMatch).select("_id").lean();
  const sessionIds = sessionsUpToCutoff.map((s) => s._id);

  const totals = await PlayerSessionPerformanceModel.aggregate([
    { $match: { sessionId: { $in: sessionIds } } },
    {
      $lookup: {
        from: "sessions",
        localField: "sessionId",
        foreignField: "_id",
        as: "session",
      },
    },
    { $unwind: "$session" },
    {
      $group: {
        _id: "$playerId",
        appearances: { $sum: { $cond: ["$attended", 1, 0] } },
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
        // A win/draw/loss only counts for a session the player actually
        // attended, and only when the admin chose to record an outcome —
        // mirrors WIN_LOSS_DRAW_ACCUMULATORS in lib/stats.ts.
        wins: { $sum: { $cond: [{ $and: ["$attended", { $eq: ["$session.outcome", "win"] }] }, 1, 0] } },
        draws: { $sum: { $cond: [{ $and: ["$attended", { $eq: ["$session.outcome", "draw"] }] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $and: ["$attended", { $eq: ["$session.outcome", "loss"] }] }, 1, 0] } },
      },
    },
  ]);

  const players = await PlayerModel.find({ _id: { $in: totals.map((t) => t._id) } }).lean();
  const playerById = new Map(players.map((p) => [p._id.toString(), p]));

  const rows: ReportRow[] = totals
    .map((t) => {
      const player = playerById.get(t._id.toString());
      if (!player) return null;
      return {
        name: displayName(player),
        appearances: t.appearances,
        goals: t.goals,
        assists: t.assists,
        goalInvolvements: t.goals + t.assists,
        wins: t.wins,
        draws: t.draws,
        losses: t.losses,
      };
    })
    .filter((row): row is ReportRow => row !== null)
    .sort(
      (a, b) =>
        b.goalInvolvements - a.goalInvolvements ||
        b.goals - a.goals ||
        a.name.localeCompare(b.name)
    );

  return { cutoffDate, seasonLabel: season ? `${season} Season` : "All Seasons", rows };
}
