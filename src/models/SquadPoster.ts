import { Schema, model, models, type InferSchemaType } from "mongoose";
import { POSITIONS, ALL_POSITION_GROUPS } from "@/lib/constants";

/**
 * A snapshot of the active roster at the moment it was generated — fields
 * are denormalized (copied), not referenced, so a past season's poster
 * stays exactly as it looked even if a player's name/photo/number changes
 * later. See lib/squad-poster.ts for the regenerate-vs-freeze rule.
 */
const squadPosterPlayerSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    jerseyNumber: { type: Number },
    position: { type: String, enum: POSITIONS, required: true },
    positionGroup: { type: String, enum: ALL_POSITION_GROUPS, required: true },
    photoUrl: { type: String },
    bio: { type: String },
    isCaptain: { type: Boolean },
  },
  { _id: false }
);

const squadPosterSchema = new Schema(
  {
    season: { type: String, required: true, unique: true },
    players: { type: [squadPosterPlayerSchema], default: [] },
    generatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export type SquadPoster = InferSchemaType<typeof squadPosterSchema>;

export const SquadPosterModel = models.SquadPoster ?? model("SquadPoster", squadPosterSchema);
