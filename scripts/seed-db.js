const fs = require("fs");
const mongoose = require("mongoose");

function loadLocalEnv() {
  if (!fs.existsSync(".env.local")) return;
  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

const categorySchema = new mongoose.Schema(
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
    images: { type: [{ url: String, isPrimary: Boolean }], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    tags: { type: [String], default: [] },
    material: { type: String, default: "Gold" },
    gemstone: { type: String, default: "Diamond" },
    weight: { type: String, default: "0.00g" },
    occasion: { type: String, default: "Everyday" },
    variants: { type: [{ size: String, stock: Number }], default: [] },
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

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema, "categories");
const Product = mongoose.models.Product || mongoose.model("Product", productSchema, "products");

const categories = [
  { name: "Rings", slug: "rings", image: "/luxury-bg.png", description: "Signature rings and refined bands." },
  { name: "Necklaces", slug: "necklaces", image: "/panther-bg.png", description: "Layered chains and statement pendants." },
  { name: "Bracelets", slug: "bracelets", image: "/uploads/1776176961212_e27832e7caf095f6a639c2e50db40b05.jpg", description: "Bangles, cuffs, and delicate bracelets." },
  { name: "Earrings", slug: "earrings", image: "/luxury-bg.png", description: "Studs, drops, and occasion-ready earrings." },
];

async function run() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI or MONGODB_URL in .env.local");
  }

  await mongoose.connect(uri);

  const savedCategories = {};
  for (const category of categories) {
    savedCategories[category.slug] = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: { ...category, isActive: true } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  const products = [
    {
      name: "Aurora Diamond Ring",
      slug: "aurora-diamond-ring",
      sku: "RAT-RING-001",
      description: "A luminous everyday ring with a polished gold band and refined stone setting.",
      careInstructions: "Store separately, avoid harsh chemicals, and polish gently with a soft cloth.",
      price: 124000,
      comparePrice: 146000,
      costPrice: 75000,
      images: [{ url: "/luxury-bg.png", isPrimary: true }],
      category: savedCategories.rings._id,
      tags: ["bridal", "diamond", "gold"],
      material: "Gold",
      gemstone: "Diamond",
      weight: "4.8g",
      occasion: "Everyday",
      variants: [{ size: "Standard", stock: 8 }],
      totalStock: 8,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
    },
    {
      name: "Celeste Pearl Necklace",
      slug: "celeste-pearl-necklace",
      sku: "RAT-NECK-002",
      description: "A soft pearl necklace designed for layering, gifting, and quiet occasions.",
      careInstructions: "Wipe pearls after wear and keep away from perfume, water, and direct heat.",
      price: 68000,
      comparePrice: 0,
      costPrice: 39000,
      images: [{ url: "/panther-bg.png", isPrimary: true }],
      category: savedCategories.necklaces._id,
      tags: ["pearl", "gift", "necklace"],
      material: "Gold",
      gemstone: "Pearl",
      weight: "8.2g",
      occasion: "Gift",
      variants: [{ size: "Standard", stock: 12 }],
      totalStock: 12,
      isPublished: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    {
      name: "Noor Gold Bracelet",
      slug: "noor-gold-bracelet",
      sku: "RAT-BRACE-003",
      description: "A minimal gold bracelet with a balanced profile for daily wear.",
      careInstructions: "Fasten before storing and avoid contact with abrasive surfaces.",
      price: 42000,
      comparePrice: 52000,
      costPrice: 25000,
      images: [{ url: "/uploads/1776176961212_e27832e7caf095f6a639c2e50db40b05.jpg", isPrimary: true }],
      category: savedCategories.bracelets._id,
      tags: ["gold", "bracelet", "everyday"],
      material: "Gold",
      gemstone: "None",
      weight: "5.4g",
      occasion: "Everyday",
      variants: [{ size: "Standard", stock: 15 }],
      totalStock: 15,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
    },
  ];

  for (const product of products) {
    await Product.findOneAndUpdate(
      { slug: product.slug },
      { $set: product },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
