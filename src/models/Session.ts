import { Schema, model, models, type InferSchemaType } from "mongoose";
import { SESSION_TYPES, MATCH_OUTCOMES } from "@/lib/constants";
import { seasonForDate } from "@/lib/slugify";

const sessionSchema = new Schema(
  {
    type: { type: String, enum: SESSION_TYPES, required: true },
    date: { type: Date, required: true, index: true },
    opponent: { type: String, trim: true },
    venue: { type: String, trim: true },
    result: { type: String, trim: true },
    // Structured win/draw/loss, distinct from the free-text `result` above —
    // optional even for matches, since not every admin will bother logging
    // it. When it's unset, this session never counts toward anyone's
    // win/draw/loss totals.
    outcome: { type: String, enum: MATCH_OUTCOMES },
    notes: { type: String, trim: true, maxlength: 2000 },
    season: { type: String, required: true, index: true },
    // A placeholder session used only to carry pre-launch (before Spartan
    // Hub existed) totals into a player's record — see actions/legacy.ts.
    // Never shown in session lists/history and excluded from the
    // training/match counts on the team snapshot.
    isLegacy: { type: Boolean, default: false },
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
