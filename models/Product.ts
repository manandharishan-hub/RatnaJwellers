import mongoose, { Document, Model } from "mongoose";

export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface ProductDoc extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  careInstructions: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  images: ProductImage[];
  category: mongoose.Types.ObjectId;
  subCategory: mongoose.Types.ObjectId | null;
  tags: string[];
  material: string;
  gemstone: string;
  weight: string;
  occasion: string;
  variants: ProductVariant[];
  totalStock: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  averageRating: number;
  reviewCount: number;
}

const variantSchema = new mongoose.Schema<ProductVariant>({
  size: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0 },
});

const imageSchema = new mongoose.Schema<ProductImage>({
  url: { type: String, required: true, trim: true },
  isPrimary: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema<ProductDoc>(
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

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1 });

productSchema.pre("save", function () {
  if (!this.totalStock && this.variants?.length) {
    this.totalStock = this.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
});

const ProductModel = (mongoose.models.Product as Model<ProductDoc>) || mongoose.model<ProductDoc>("Product", productSchema, "products");
export default ProductModel;
