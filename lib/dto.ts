import type { ProductDoc } from "@/models/Product";
import type { OrderDoc } from "@/models/Order";
import type { Address, UserDoc } from "@/models/User";
import type { CategoryDoc } from "@/models/Category";

type LeanDoc<T> = T & {
  _id?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
};

function stringifyId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value) return value.toString();
  return String(value);
}

export function serializeProduct(product: LeanDoc<Partial<ProductDoc>>) {
  return {
    _id: stringifyId(product._id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    careInstructions: product.careInstructions,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images ?? [],
    category: stringifyId(product.category),
    subCategory: product.subCategory ? stringifyId(product.subCategory) : null,
    tags: product.tags ?? [],
    material: product.material,
    gemstone: product.gemstone,
    weight: product.weight,
    occasion: product.occasion,
    variants: product.variants ?? [],
    totalStock: product.totalStock,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function serializeAdminProduct(product: LeanDoc<Partial<ProductDoc>>) {
  return {
    ...serializeProduct(product),
    costPrice: product.costPrice,
  };
}

export function serializeCategory(category: LeanDoc<Partial<CategoryDoc>>) {
  const parent = category.parent as any;
  return {
    _id: stringifyId(category._id),
    name: category.name ?? "",
    slug: category.slug ?? "",
    image: category.image ?? "",
    description: category.description ?? "",
    parent: parent && typeof parent === "object" && "name" in parent
      ? { _id: stringifyId(parent._id), name: parent.name ?? "" }
      : parent
        ? stringifyId(parent)
        : null,
    isActive: category.isActive ?? true,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function serializeAddress(address: Partial<Address> & { _id?: unknown }) {
  return {
    _id: stringifyId(address._id),
    label: address.label ?? "",
    street: address.street ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    zip: address.zip ?? "",
    country: address.country ?? "",
    isDefault: Boolean(address.isDefault),
  };
}

export function serializeUserProfile(user: LeanDoc<Partial<UserDoc>>) {
  return {
    _id: stringifyId(user._id),
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role ?? "user",
    avatar: user.avatar ?? { url: "", publicId: "" },
    isVerified: Boolean(user.isVerified),
    addresses: (user.addresses ?? []).map((address: any) => serializeAddress(address)),
    wishlist: (user.wishlist ?? []).map((product: any) => stringifyId(product)),
  };
}

export function serializeWishlistProduct(product: LeanDoc<Partial<ProductDoc>>) {
  const primaryImage = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url ?? "";
  return {
    productId: stringifyId(product._id),
    name: product.name ?? "",
    image: primaryImage,
    price: product.price ?? 0,
    slug: product.slug ?? "",
  };
}

export function serializeOrder(order: LeanDoc<Partial<OrderDoc>>) {
  return {
    _id: stringifyId(order._id),
    user: order.user ? stringifyId(order.user) : null,
    customerEmail: order.customerEmail,
    orderNumber: order.orderNumber,
    items: (order.items ?? []).map((item) => ({
      product: stringifyId(item.product),
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      variant: item.variant ?? "",
    })),
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId,
    cardLast4: order.cardLast4,
    shippingMethod: order.shippingMethod,
    shippingCost: order.shippingCost,
    subtotal: order.subtotal,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
    couponCode: order.couponCode,
    status: order.status,
    trackingNumber: order.trackingNumber,
    statusHistory: order.statusHistory ?? [],
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
