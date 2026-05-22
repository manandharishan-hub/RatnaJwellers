import mongoose from "mongoose";
import ProductModel from "@/models/Product";

export const STANDARD_SHIPPING_CENTS = 500;
export const TAX_RATE = 0.08;

export type IncomingOrderItem = {
  product?: string;
  productId?: string;
  quantity?: number;
  variant?: string;
};

export async function priceOrderItems(items: IncomingOrderItem[]) {
  const normalizedItems = items.map((item) => ({
    productId: item.product ?? item.productId ?? "",
    quantity: Number(item.quantity ?? 0),
    variant: item.variant ?? "",
  }));

  if (normalizedItems.some((item) => !mongoose.Types.ObjectId.isValid(item.productId))) {
    throw new Error("One or more cart items are invalid.");
  }
  if (normalizedItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new Error("Cart item quantities must be at least 1.");
  }

  const productIds = normalizedItems.map((item) => item.productId);
  const products = await ProductModel.find({
    _id: { $in: productIds },
    isPublished: true,
  }).lean();
  const productById = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = normalizedItems.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error("A product in your cart is no longer available.");
    }

    const variant = item.variant
      ? product.variants?.find((productVariant) => productVariant.size === item.variant)
      : product.variants?.[0];
    const availableStock = variant?.stock ?? product.totalStock ?? 0;
    if (availableStock < item.quantity) {
      throw new Error(`${product.name} does not have enough stock.`);
    }

    const primaryImage = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url ?? "";
    return {
      product: product._id,
      name: product.name,
      image: primaryImage,
      price: product.price,
      quantity: item.quantity,
      variant: item.variant || variant?.size || "",
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const shippingCost = STANDARD_SHIPPING_CENTS;
  const discount = 0;
  const total = subtotal + tax + shippingCost - discount;

  return { orderItems, subtotal, tax, shippingCost, discount, total };
}

export async function decreaseStockForOrder(orderItems: Awaited<ReturnType<typeof priceOrderItems>>["orderItems"]) {
  for (const item of orderItems) {
    const productId = item.product;
    const quantity = Number(item.quantity);
    const variant = item.variant || "";

    if (variant) {
      const updated = await ProductModel.updateOne(
        { _id: productId, "variants.size": variant, "variants.stock": { $gte: quantity }, totalStock: { $gte: quantity } },
        { $inc: { "variants.$.stock": -quantity, totalStock: -quantity } }
      );
      if (updated.matchedCount > 0) continue;
    }

    const updated = await ProductModel.updateOne(
      { _id: productId, totalStock: { $gte: quantity } },
      { $inc: { totalStock: -quantity } }
    );
    if (updated.matchedCount === 0) {
      throw new Error(`${item.name} does not have enough stock.`);
    }
  }
}
