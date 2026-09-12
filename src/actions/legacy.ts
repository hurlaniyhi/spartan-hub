"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/models/Session";
import { PlayerSessionPerformanceModel } from "@/models/PlayerSessionPerformance";
import { LegacySeasonSummaryModel } from "@/models/LegacySeasonSummary";
import type { ActionResult } from "@/lib/action-result";
import { currentSeason } from "@/lib/slugify";

const LEGACY_NOTE = "Legacy record — carried over from before Spartan Hub launch.";
// A generous ceiling against fat-fingered input (e.g. an extra zero) rather
// than any real limit on a season's length.
const MAX_LEGACY_APPEARANCES = 60;

export interface LegacyRecordInput {
  playerId: string;
  season: string;
  appearances: number;
  goals: number;
  assists: number;
}

/**
 * Every legacy session for a season is shared across all players — one
 * pool, reused — so importing 20 players' 2025 totals doesn't create 20x
 * duplicate placeholder sessions. Grows the pool if a player needs more
 * legacy "appearances" than currently exist; never shrinks it.
 */
async function getOrGrowLegacyPool(season: string, count: number) {
  const existing = await SessionModel.find({ season, isLegacy: true })
    .sort({ createdAt: 1 })
    .select("_id")
    .lean();

  if (existing.length >= count) {
    return existing.slice(0, count).map((s) => s._id);
  }

  const need = count - existing.length;
  const legacyDate = new Date(Number(season), 0, 1);
  const created = await SessionModel.insertMany(
    Array.from({ length: need }, () => ({
      type: "training" as const,
      date: legacyDate,
      season,
      notes: LEGACY_NOTE,
      isLegacy: true,
    }))
  );

  return [...existing.map((s) => s._id), ...created.map((s) => s._id)];
}

export async function saveLegacyRecord(
  input: LegacyRecordInput
): Promise<ActionResult<{ appearances: number }>> {
  const authSession = await auth();
  if (!authSession?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  if (!/^\d{4}$/.test(input.season) || Number(input.season) > Number(currentSeason())) {
    return { success: false, message: "That season isn't valid." };
  }

  const appearances = Math.min(MAX_LEGACY_APPEARANCES, Math.max(0, Math.floor(input.appearances || 0)));
  const goals = Math.max(0, Math.floor(input.goals || 0));
  const assists = Math.max(0, Math.floor(input.assists || 0));

  await connectToDatabase();

  const priorLegacyIds = (
    await SessionModel.find({ season: input.season, isLegacy: true }).select("_id").lean()
  ).map((s) => s._id);

  // Clear this player's previous legacy record for the season first, so
  // re-submitting a correction doesn't leave stale rows behind.
  if (priorLegacyIds.length > 0) {
    await PlayerSessionPerformanceModel.deleteMany({
      playerId: input.playerId,
      sessionId: { $in: priorLegacyIds },
    });
  }

  if (appearances === 0 && goals === 0 && assists === 0) {
    revalidateLegacy();
    return { success: true, data: { appearances: 0 } };
  }

  // Goals/assists without at least one appearance doesn't make sense —
  // fall back to a single legacy session so the numbers aren't orphaned.
  const effectiveAppearances = appearances > 0 ? appearances : 1;
  const poolIds = await getOrGrowLegacyPool(input.season, effectiveAppearances);

  await PlayerSessionPerformanceModel.bulkWrite(
    poolIds.map((sessionId, index) => ({
      updateOne: {
        filter: { playerId: input.playerId, sessionId },
        update: {
          $set: {
            attended: true,
            // All of the player's goals/assists land on the first legacy
            // session; the rest just mark additional appearances.
            goals: index === 0 ? goals : 0,
            assists: index === 0 ? assists : 0,
          },
        },
        upsert: true,
      },
    }))
  );

  revalidateLegacy();
  return { success: true, data: { appearances: effectiveAppearances } };
}

export interface LegacyTeamSummaryInput {
  season: string;
  trainingSessions: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
}

export async function saveLegacyTeamSummary(input: LegacyTeamSummaryInput): Promise<ActionResult> {
  const authSession = await auth();
  if (!authSession?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  if (!/^\d{4}$/.test(input.season) || Number(input.season) > Number(currentSeason())) {
    return { success: false, message: "That season isn't valid." };
  }

  const clamp = (value: number) => Math.max(0, Math.floor(value || 0));

  await connectToDatabase();
  await LegacySeasonSummaryModel.findOneAndUpdate(
    { season: input.season },
    {
      $set: {
        trainingSessions: clamp(input.trainingSessions),
        matches: clamp(input.matches),
        wins: clamp(input.wins),
        draws: clamp(input.draws),
        losses: clamp(input.losses),
      },
    },
    { upsert: true }
  );

  revalidateLegacy();
  return { success: true, data: undefined };
}

function revalidateLegacy() {
  revalidatePath("/admin/legacy-stats");
  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/statistics");
  revalidatePath("/squad");
  revalidatePath("/players/[slug]", "page");
  revalidatePath("/");
}
