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
