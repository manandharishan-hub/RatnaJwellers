import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0 },
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  isPrimary: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    sku: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    careInstructions: { type: String, default: "Handle with care and store in dry place." },
    price: { type: Number, required: true },
    comparePrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    images: { type: [imageSchema], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    tags: { type: [String], default: [] },
    material: { type: String, default: "Gold" },
    gemstone: { type: String, default: "Diamond" },
    weight: { type: String, default: "0.00g" },
    occasion: { type: String, default: "Everyday" },
    variants: { type: [variantSchema], default: [] },
    totalStock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

productSchema.pre("save", function () {
  if (!this.totalStock && this.variants?.length) {
    this.totalStock = this.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
});

const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema, "products");
export default ProductModel;
