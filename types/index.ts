export type ProductFilterParams = {
  category?: string;
  material?: string[];
  gemstone?: string[];
  occasion?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStockOnly?: boolean;
  sort?: "newest" | "priceAsc" | "priceDesc" | "popular" | "rating";
  page?: number;
  limit?: number;
};

export type ProductImage = {
  url: string;
  isPrimary: boolean;
};

export type ProductVariant = {
  size: string;
  stock: number;
};

export type ProductSummary = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  careInstructions?: string;
  price: number;
  comparePrice?: number;
  images: ProductImage[];
  category?: string;
  subCategory?: string | null;
  tags?: string[];
  material?: string;
  gemstone?: string;
  weight?: string;
  occasion?: string;
  variants?: ProductVariant[];
  totalStock?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  averageRating?: number;
  reviewCount?: number;
};

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
};

export type WishlistItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
};

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  shippingMethod: string;
  useBillingAsShipping: boolean;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export type OrderAddress = Omit<CheckoutFormData, "shippingMethod" | "useBillingAsShipping"> & {
  email?: string;
};

export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
};

export type OrderSummary = {
  _id: string;
  user: string | null;
  customerEmail: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  transactionId?: string;
  cardLast4?: string;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
