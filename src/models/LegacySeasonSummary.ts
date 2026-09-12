import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Team-level pre-launch totals for a season — how many trainings/matches
 * were held and the resulting win/draw/loss record — entered as plain
 * numbers on the admin Legacy Stats screen since there's no per-session
 * breakdown to reconstruct. One document per season.
 */
const legacySeasonSummarySchema = new Schema(
  {
    season: { type: String, required: true, unique: true },
    trainingSessions: { type: Number, required: true, default: 0, min: 0 },
    matches: { type: Number, required: true, default: 0, min: 0 },
    wins: { type: Number, required: true, default: 0, min: 0 },
    draws: { type: Number, required: true, default: 0, min: 0 },
    losses: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type LegacySeasonSummary = InferSchemaType<typeof legacySeasonSummarySchema>;

export const LegacySeasonSummaryModel =
  models.LegacySeasonSummary ?? model("LegacySeasonSummary", legacySeasonSummarySchema);
