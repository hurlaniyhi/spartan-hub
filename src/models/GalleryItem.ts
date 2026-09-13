import { Schema, model, models, type InferSchemaType } from "mongoose";

const galleryItemSchema = new Schema(
  {
    type: { type: String, enum: ["photo", "video"], required: true, index: true },
    pathname: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    caption: { type: String, trim: true, maxlength: 200 },
    uploadedBy: { type: String },
  },
  { timestamps: true }
);

galleryItemSchema.index({ createdAt: -1 });

export type GalleryItem = InferSchemaType<typeof galleryItemSchema>;

export const GalleryItemModel = models.GalleryItem ?? model("GalleryItem", galleryItemSchema);
