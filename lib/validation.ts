import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Please enter your password"),
});

export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  street: z.string().min(3, "Enter your street address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  zip: z.string().min(4, "Enter your ZIP code"),
  country: z.string().min(2, "Enter your country"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const addressSchema = z.object({
  _id: z.string().optional(),
  label: z.string().min(1, "Address label is required").default("Home"),
  street: z.string().min(3, "Enter your street address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  zip: z.string().min(4, "Enter your ZIP code"),
  country: z.string().min(2, "Enter your country"),
  isDefault: z.boolean().default(false),
});

export const wishlistMutationSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
});

export const cartMutationSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  variant: z.string().optional().default(""),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  image: z.string().optional().default(""),
  description: z.string().optional().default(""),
  parent: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const productImageSchema = z.object({
  url: z.string().min(1, "Image URL is required").refine((value) => {
    if (value.startsWith("/")) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "Image must be a valid URL or public path"),
  isPrimary: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  sku: z.string().min(2, "SKU is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  careInstructions: z.string().optional().default("Handle with care and store in dry place."),
  price: z.coerce.number().int().min(100, "Price must be at least NPR 1"),
  comparePrice: z.coerce.number().int().min(0).default(0),
  costPrice: z.coerce.number().int().min(0).default(0),
  images: z.array(productImageSchema).min(1, "Add at least one product image"),
  category: z.string().min(1, "Choose a category"),
  subCategory: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  material: z.string().min(1, "Material is required").default("Gold"),
  gemstone: z.string().min(1, "Gemstone is required").default("Diamond"),
  weight: z.string().min(1, "Weight is required").default("0.00g"),
  occasion: z.string().min(1, "Occasion is required").default("Everyday"),
  variants: z.array(z.object({
    size: z.string().min(1, "Variant size is required"),
    stock: z.coerce.number().int().min(0),
  })).default([]),
  totalStock: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "packed", "out-for-delivery", "shipped", "delivered", "cancelled", "refunded"]),
  trackingNumber: z.string().optional(),
  note: z.string().optional(),
});

export const orderItemSchema = z.object({
  product: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  variant: z.string().optional(),
}).refine((item) => item.product || item.productId, {
  message: "Product id is required.",
  path: ["productId"],
});

export const orderAddressSchema = checkoutSchema.omit({ email: true }).extend({
  email: z.string().email("Enter a valid email").optional(),
});

export const orderCreateSchema = z.object({
  shippingAddress: orderAddressSchema,
  billingAddress: orderAddressSchema,
  items: z.array(orderItemSchema).min(1, "Cart items are required to create an order."),
  paymentMethod: z.literal("esewa").default("esewa"),
  paymentStatus: z.enum(["pending", "paid", "completed", "failed"]).default("pending"),
  transactionId: z.string().optional().default(""),
  status: z.enum(["pending", "processing", "packed", "out-for-delivery", "shipped", "delivered", "cancelled", "refunded"]).default("pending"),
  couponCode: z.string().optional().default(""),
});
