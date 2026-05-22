import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter product name"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Please enter product description"],
        },
        price: {
            type: Number,
            required: [true, "Please enter product price"],
            default: 0.0,
        },
        stock: {
            type: Number,
            required: [true, "Please enter product stock"],
            default: 0,
        },
        category: {
            type: String,
            required: [true, "Please select category for this product"],
            enum: {
                values: [
                    "Rings",
                    "Necklaces",
                    "Earrings",
                    "Bracelets",
                    "Sets",
                    "Pendants"
                ],
                message: "Please select correct category for product",
            },
        },
        imageUrl: {
            type: String,
            required: [true, "Please provide product image URL"],
        },
        material: {
            type: String,
            required: [true, "Please select material for this product"],
            enum: {
                values: ["Gold", "Silver", "Diamond"],
                message: "Please select correct material for product",
            },
            default: "Gold"
        },
    },
    { timestamps: true }
);

const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema, "products");
export default ProductModel;
