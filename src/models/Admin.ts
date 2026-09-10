import { Schema, model, models, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

export type Admin = InferSchemaType<typeof adminSchema>;

export const AdminModel = models.Admin ?? model("Admin", adminSchema);
