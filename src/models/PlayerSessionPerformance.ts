import { Schema, model, models, type InferSchemaType } from "mongoose";

const playerSessionPerformanceSchema = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    attended: { type: Boolean, required: true, default: false },
    goals: { type: Number, required: true, default: 0, min: 0 },
    assists: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// One performance record per player per session — this is what lets us
// safely upsert when the admin edits an already-saved session.
playerSessionPerformanceSchema.index(
  { playerId: 1, sessionId: 1 },
  { unique: true }
);

export type PlayerSessionPerformance = InferSchemaType<
  typeof playerSessionPerformanceSchema
>;

export const PlayerSessionPerformanceModel =
  models.PlayerSessionPerformance ??
  model("PlayerSessionPerformance", playerSessionPerformanceSchema);
