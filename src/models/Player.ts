import { Schema, model, models, type InferSchemaType } from "mongoose";
import {
  POSITIONS,
  ALL_POSITION_GROUPS,
  PLAYER_STATUSES,
  POSITION_TO_GROUP,
} from "@/lib/constants";

const playerSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    nickname: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    photoUrl: { type: String },
    jerseyNumber: { type: Number, min: 0, max: 99 },
    position: { type: String, enum: POSITIONS, required: true },
    positionGroup: { type: String, enum: ALL_POSITION_GROUPS, required: true },
    status: {
      type: String,
      enum: PLAYER_STATUSES,
      default: "active",
      index: true,
    },
    dateJoined: { type: Date, required: true, default: Date.now },
    bio: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

playerSchema.index({ firstName: "text", lastName: "text", nickname: "text" });

// Keep positionGroup in sync with position whenever it changes, so it never
// has to be set manually and can't drift out of sync.
playerSchema.pre("validate", function syncPositionGroup() {
  if (this.position) {
    this.positionGroup = POSITION_TO_GROUP[this.position as keyof typeof POSITION_TO_GROUP];
  }
});

export type Player = InferSchemaType<typeof playerSchema>;

export const PlayerModel = models.Player ?? model("Player", playerSchema);
