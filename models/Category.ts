import mongoose, { Document, Model } from "mongoose";

export interface CategoryDoc extends Document {
  name: string;
  slug: string;
  image: string;
  description: string;
  parent: mongoose.Types.ObjectId | null;
  isActive: boolean;
}

const categorySchema = new mongoose.Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryModel = (mongoose.models.Category as Model<CategoryDoc>) || mongoose.model<CategoryDoc>("Category", categorySchema, "categories");
export default CategoryModel;
