// ── Configuration ────────────────────────────────────────────────────────────

export interface ShopiConfig {
  /** Your Storefront API key (starts with shopi_pk_) */
  apiKey: string;
  /** Override the API base URL (default: https://bdpvfwfftaepqjvnnkwv.supabase.co/functions/v1/storefront-api/v1) */
  baseUrl?: string;
}

// ── Shop ─────────────────────────────────────────────────────────────────────

export interface Shop {
  id: string;
  shop_name: string;
  subdomain: string;
  custom_domain: string | null;
  primary_domain: string | null;
  business_type: string | null;
  is_active: boolean;
  active_theme: number | null;
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  images: string[];
  is_visible: boolean;
  stock_quantity: number | null;
  track_inventory: boolean;
  sku: string | null;
  weight: number | null;
  variants: ProductVariant[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
  prices?: Record<string, number>;
}

export interface ProductListParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: "created_at" | "name" | "price" | "sales" | "updated_at";
  sort_order?: "asc" | "desc";
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

// ── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

// ── Store Settings ───────────────────────────────────────────────────────────

export interface StoreSettings {
  shop_name: string;
  tagline: string | null;
  logo_url: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  footer_text: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  business_category: string | null;
  business_hours: any;
  location_city: string | null;
  location_country: string | null;
  social_links: Record<string, string> | null;
  shipping_regions: any;
  is_free_shipping: boolean | null;
  free_shipping_enabled: boolean | null;
  free_shipping_threshold: number | null;
  shipping_currency: string | null;
  shipping_config: any;
  international_shipping: any;
}

// ── Payment ──────────────────────────────────────────────────────────────────

export interface PaymentMethod {
  method_id: string;
  method_name: string;
  enabled: boolean;
}

export interface BankDetail {
  bank_name: string;
  branch_name: string | null;
  account_number: string;
  account_holder_name: string;
}

// ── Pages & Blog ─────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  is_visible: boolean;
  sort_order: number | null;
  meta_title: string | null;
  meta_description: string | null;
  rendered_html: string | null;
  rendered_css: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string | null;
  published_at: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  rendered_html?: string | null;
  rendered_css?: string | null;
}

export interface BlogListParams {
  limit?: number;
  offset?: number;
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  image_url: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

// ── Discounts ────────────────────────────────────────────────────────────────

export interface Discount {
  id: string;
  name: string;
  discount_percentage: number;
  applies_to: string;
  product_id: string | null;
  start_date: string;
  end_date: string;
}

// ── Theme Settings ───────────────────────────────────────────────────────────

export interface ThemeSettings {
  theme_id: number;
  settings: Record<string, any>;
  is_published: boolean;
}

// ── Orders / Checkout ────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export interface CreateOrderParams {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: CartItem[];
  shipping_address?: Record<string, any>;
  shipping_method?: string;
  payment_method?: string;
  notes?: string;
  promo_code_id?: string;
  discount_amount?: number;
}

export interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

// ── Promo Codes ──────────────────────────────────────────────────────────────

export interface PromoValidateParams {
  code: string;
  cart_items?: CartItem[];
  subtotal?: number;
}

export interface PromoValidateResult {
  valid: boolean;
  error?: string;
  promo_code?: {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    applies_to: string;
  };
  discount_amount?: number;
  message?: string;
}

// ── Reviews Submit ───────────────────────────────────────────────────────────

export interface SubmitReviewParams {
  product_id: string;
  rating: number;
  review_text?: string;
  customer_name?: string;
  customer_email?: string;
  image_url?: string;
}
