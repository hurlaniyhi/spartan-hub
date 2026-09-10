import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { PlayerModel } from "@/models/Player";
import { SessionModel } from "@/models/Session";
import { PlayerSessionPerformanceModel } from "@/models/PlayerSessionPerformance";
import { displayName } from "@/lib/format";
import type { SessionType, PlayerStatus } from "@/lib/constants";

/**
 * All player/team statistics are derived here, on read, from the raw
 * PlayerSessionPerformance log — nothing is pre-aggregated or cached, so
 * totals can never drift from the session-by-session record.
 */
export type StatsScope = "overall" | SessionType;

function sessionTypeMatchStage(scope: StatsScope) {
  return scope === "overall" ? [] : [{ $match: { "session.type": scope } }];
}

export interface PlayerTotals {
  appearances: number;
  goals: number;
  assists: number;
  eligibleSessions: number;
  attendancePercentage: number;
  goalsPerAppearance: number;
  assistsPerAppearance: number;
}

export async function getPlayerTotals(
  playerId: string,
  scope: StatsScope = "overall"
): Promise<PlayerTotals> {
  await connectToDatabase();

  const sessionMatch = scope === "overall" ? {} : { type: scope };
  const eligibleSessions = await SessionModel.countDocuments(sessionMatch);

  const [agg] = await PlayerSessionPerformanceModel.aggregate([
    { $match: { playerId: new Types.ObjectId(playerId) } },
    {
      $lookup: {
        from: "sessions",
        localField: "sessionId",
        foreignField: "_id",
        as: "session",
      },
    },
    { $unwind: "$session" },
    ...sessionTypeMatchStage(scope),
    {
      $group: {
        _id: null,
        appearances: { $sum: { $cond: ["$attended", 1, 0] } },
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
      },
    },
  ]);

  const appearances = agg?.appearances ?? 0;
  const goals = agg?.goals ?? 0;
  const assists = agg?.assists ?? 0;

  return {
    appearances,
    goals,
    assists,
    eligibleSessions,
    attendancePercentage:
      eligibleSessions > 0 ? Math.round((appearances / eligibleSessions) * 100) : 0,
    goalsPerAppearance: appearances > 0 ? goals / appearances : 0,
    assistsPerAppearance: appearances > 0 ? assists / appearances : 0,
  };
}

export interface RecentActivityEntry {
  sessionId: string;
  date: Date;
  type: SessionType;
  opponent?: string;
  attended: boolean;
  goals: number;
  assists: number;
}

export async function getPlayerRecentActivity(
  playerId: string,
  limit = 5
): Promise<RecentActivityEntry[]> {
  await connectToDatabase();

  const rows = await PlayerSessionPerformanceModel.aggregate([
    { $match: { playerId: new Types.ObjectId(playerId) } },
    {
      $lookup: {
        from: "sessions",
        localField: "sessionId",
        foreignField: "_id",
        as: "session",
      },
    },
    { $unwind: "$session" },
    { $sort: { "session.date": -1 } },
    { $limit: limit },
    {
      $project: {
        sessionId: "$session._id",
        date: "$session.date",
        type: "$session.type",
        opponent: "$session.opponent",
        attended: 1,
        goals: 1,
        assists: 1,
      },
    },
  ]);

  return rows.map((row) => ({
    sessionId: row.sessionId.toString(),
    date: row.date,
    type: row.type,
    opponent: row.opponent,
    attended: row.attended,
    goals: row.goals,
    assists: row.assists,
  }));
}

export type LeaderboardMetric =
  | "goals"
  | "assists"
  | "appearances"
  | "goalsPerAppearance";

export interface LeaderboardEntry {
  playerId: string;
  slug: string;
  name: string;
  photoUrl?: string;
  position: string;
  value: number;
}

export async function getLeaderboard(
  metric: LeaderboardMetric,
  scope: StatsScope = "overall",
  limit = 10
): Promise<LeaderboardEntry[]> {
  await connectToDatabase();

  const rows = await PlayerSessionPerformanceModel.aggregate([
    {
      $lookup: {
        from: "sessions",
        localField: "sessionId",
        foreignField: "_id",
        as: "session",
      },
    },
    { $unwind: "$session" },
    ...sessionTypeMatchStage(scope),
    {
      $group: {
        _id: "$playerId",
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
        appearances: { $sum: { $cond: ["$attended", 1, 0] } },
      },
    },
    { $match: { appearances: { $gt: 0 } } },
    {
      $addFields: {
        goalsPerAppearance: {
          $cond: [{ $gt: ["$appearances", 0] }, { $divide: ["$goals", "$appearances"] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "players",
        localField: "_id",
        foreignField: "_id",
        as: "player",
      },
    },
    { $unwind: "$player" },
    { $sort: { [metric]: -1, "player.firstName": 1 } },
    { $limit: limit },
  ]);

  return rows.map((row) => ({
    playerId: row._id.toString(),
    slug: row.player.slug,
    name: displayName(row.player),
    photoUrl: row.player.photoUrl,
    position: row.player.position,
    value: metric === "goalsPerAppearance" ? row.goalsPerAppearance : row[metric],
  }));
}

export interface TeamSnapshot {
  activePlayers: number;
  inactivePlayers: number;
  trainingSessions: number;
  matches: number;
  totalGoals: number;
  totalAssists: number;
  totalAppearances: number;
}

export async function getTeamSnapshot(): Promise<TeamSnapshot> {
  await connectToDatabase();

  // Sequential, not Promise.all: firing several queries concurrently right
  // after a connection is established has been observed to intermittently
  // return empty results (a MongoDB driver/connection-pool race), which is
  // far worse than the extra ~100ms this costs on a low-traffic site.
  const activePlayers = await PlayerModel.countDocuments({ status: "active" });
  const inactivePlayers = await PlayerModel.countDocuments({ status: "inactive" });
  const trainingSessions = await SessionModel.countDocuments({ type: "training" });
  const matches = await SessionModel.countDocuments({ type: "match" });
  const totalsAgg = await PlayerSessionPerformanceModel.aggregate([
    {
      $group: {
        _id: null,
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
        appearances: { $sum: { $cond: ["$attended", 1, 0] } },
      },
    },
  ]);

  const totals = totalsAgg[0] ?? { goals: 0, assists: 0, appearances: 0 };

  return {
    activePlayers,
    inactivePlayers,
    trainingSessions,
    matches,
    totalGoals: totals.goals,
    totalAssists: totals.assists,
    totalAppearances: totals.appearances,
  };
}

export interface SessionSummary {
  sessionId: string;
  date: Date;
  type: SessionType;
  opponent?: string;
  result?: string;
  playersPresent: number;
  goals: number;
  assists: number;
}

export async function getSessionSummaries(limit?: number): Promise<SessionSummary[]> {
  await connectToDatabase();

  const sessions = await SessionModel.find()
    .sort({ date: -1 })
    .limit(limit ?? 0)
    .lean();

  if (sessions.length === 0) return [];

  const summaries = await PlayerSessionPerformanceModel.aggregate([
    { $match: { sessionId: { $in: sessions.map((s) => s._id) } } },
    {
      $group: {
        _id: "$sessionId",
        playersPresent: { $sum: { $cond: ["$attended", 1, 0] } },
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
      },
    },
  ]);

  const bySessionId = new Map(summaries.map((s) => [s._id.toString(), s]));

  return sessions.map((session) => {
    const summary = bySessionId.get(session._id.toString());
    return {
      sessionId: session._id.toString(),
      date: session.date,
      type: session.type,
      opponent: session.opponent,
      result: session.result,
      playersPresent: summary?.playersPresent ?? 0,
      goals: summary?.goals ?? 0,
      assists: summary?.assists ?? 0,
    };
  });
}

export interface SimplePlayer {
  id: string;
  name: string;
  photoUrl?: string;
  position: string;
}

/** The roster offered on the "Record Session" screen — active players only. */
export async function getActivePlayers(): Promise<SimplePlayer[]> {
  await connectToDatabase();
  const players = await PlayerModel.find({ status: "active" })
    .sort({ firstName: 1, lastName: 1 })
    .lean();
  return players.map((player) => ({
    id: player._id.toString(),
    name: displayName(player),
    photoUrl: player.photoUrl ?? undefined,
    position: player.position,
  }));
}

export interface SessionDetail {
  id: string;
  type: SessionType;
  date: Date;
  opponent?: string;
  venue?: string;
  result?: string;
  notes?: string;
  performances: {
    playerId: string;
    slug: string;
    name: string;
    photoUrl?: string;
    attended: boolean;
    goals: number;
    assists: number;
  }[];
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  await connectToDatabase();

  const session = await SessionModel.findById(sessionId).lean();
  if (!session) return null;

  const performances = await PlayerSessionPerformanceModel.find({ sessionId }).lean();
  const players = await PlayerModel.find({
    _id: { $in: performances.map((p) => p.playerId) },
  }).lean();
  const playerById = new Map(players.map((p) => [p._id.toString(), p]));

  const rows = performances
    .map((performance) => {
      const player = playerById.get(performance.playerId.toString());
      if (!player) return null;
      return {
        playerId: performance.playerId.toString(),
        slug: player.slug,
        name: displayName(player),
        photoUrl: player.photoUrl ?? undefined,
        attended: performance.attended,
        goals: performance.goals,
        assists: performance.assists,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => {
      if (a.attended !== b.attended) return a.attended ? -1 : 1;
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name);
    });

  return {
    id: session._id.toString(),
    type: session.type,
    date: session.date,
    opponent: session.opponent,
    venue: session.venue,
    result: session.result,
    notes: session.notes,
    performances: rows,
  };
}

export interface RosterEntry {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  name: string;
  photoUrl?: string;
  jerseyNumber?: number;
  position: string;
  positionGroup: string;
  status: PlayerStatus;
  appearances: number;
  goals: number;
  assists: number;
}

/**
 * The full squad with career totals attached, in a single pass — avoids an
 * N+1 aggregation per player on the squad/admin list pages.
 */
export async function getPlayerRoster(): Promise<RosterEntry[]> {
  await connectToDatabase();

  const players = await PlayerModel.find().sort({ firstName: 1, lastName: 1 }).lean();
  const totals = await PlayerSessionPerformanceModel.aggregate([
    {
      $group: {
        _id: "$playerId",
        goals: { $sum: "$goals" },
        assists: { $sum: "$assists" },
        appearances: { $sum: { $cond: ["$attended", 1, 0] } },
      },
    },
  ]);

  const totalsByPlayer = new Map(totals.map((t) => [t._id.toString(), t]));

  return players.map((player) => {
    const playerTotals = totalsByPlayer.get(player._id.toString());
    return {
      id: player._id.toString(),
      slug: player.slug,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname ?? undefined,
      name: displayName(player),
      photoUrl: player.photoUrl ?? undefined,
      jerseyNumber: player.jerseyNumber ?? undefined,
      position: player.position,
      positionGroup: player.positionGroup,
      status: player.status as PlayerStatus,
      appearances: playerTotals?.appearances ?? 0,
      goals: playerTotals?.goals ?? 0,
      assists: playerTotals?.assists ?? 0,
    };
  });
}
