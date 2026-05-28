import mongoose, { Document, Model } from "mongoose";

export interface GalleryImageDoc extends Document {
  title: string;
  caption: string;
  partnerLabel: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

const galleryImageSchema = new mongoose.Schema<GalleryImageDoc>(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: "", trim: true },
    partnerLabel: { type: String, default: "Mr/Ms Supranational", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

galleryImageSchema.index({ sortOrder: 1, createdAt: -1 });

const GalleryImageModel =
  (mongoose.models.GalleryImage as Model<GalleryImageDoc>) ||
  mongoose.model<GalleryImageDoc>("GalleryImage", galleryImageSchema, "gallery_images");

export default GalleryImageModel;
