import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URL;

const productSchema = new mongoose.Schema({
    name: String,
    material: {
        type: String,
        enum: ["Gold", "Silver", "Diamond"]
    }
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema, "products");

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to potentially update.`);

        const materials = ["Gold", "Silver", "Diamond"];
        let updatedCount = 0;

        for (const product of products) {
            // Randomly assign a material
            const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
            
            await Product.findByIdAndUpdate(product._id, { 
                $set: { material: randomMaterial } 
            });
            updatedCount++;
        }

        console.log(`Migration complete. Updated ${updatedCount} products with random materials.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
