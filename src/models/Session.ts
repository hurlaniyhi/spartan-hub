import { Schema, model, models, type InferSchemaType } from "mongoose";
import { SESSION_TYPES } from "@/lib/constants";
import { seasonForDate } from "@/lib/slugify";

const sessionSchema = new Schema(
  {
    type: { type: String, enum: SESSION_TYPES, required: true },
    date: { type: Date, required: true, index: true },
    opponent: { type: String, trim: true },
    venue: { type: String, trim: true },
    result: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    season: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

sessionSchema.index({ season: 1, type: 1 });

sessionSchema.pre("validate", function syncSeason() {
  if (this.date) {
    this.season = seasonForDate(this.date);
  }
});

export type Session = InferSchemaType<typeof sessionSchema>;

export const SessionModel = models.Session ?? model("Session", sessionSchema);
