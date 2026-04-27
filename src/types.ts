// ── Configuration ────────────────────────────────────────────────────────────

export interface ShopiConfig {
  /** Your Storefront API key (must start with shopi_pk_) */
  apiKey: string;
  /** Override the API base URL (default: https://apicall.shopi.lk/v1) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeoutMs?: number;
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

// ── Listings (Showcase / Lead-Gen) ──────────────────────────────────────────

export interface Listing {
  id: string;
  shop_id?: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number | null;
  price_label: string | null;
  currency: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  images: string[] | null;
  video: string | null;
  features: string[] | null;
  specifications: Record<string, any> | null;
  contact_info: Record<string, any> | null;
  availability_status: string | null;
  is_featured: boolean | null;
  views_count: number | null;
  inquiries_count: number | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface ListingListParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: "created_at" | "name" | "price" | "views_count" | "updated_at" | "sort_order";
  sort_order?: "asc" | "desc";
}

export interface ListingListResponse {
  listings: Listing[];
  total: number;
  limit: number;
  offset: number;
}

// ── Rental Items ────────────────────────────────────────────────────────────

export interface RentalItem {
  id: string;
  shop_id?: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  images: string[] | null;
  video: string | null;
  specifications: Record<string, any> | null;
  currency: string | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  deposit_required: boolean | null;
  deposit_amount: number | null;
  min_rental_duration_hours: number | null;
  max_rental_duration_days: number | null;
  total_quantity: number | null;
  available_quantity: number | null;
  pickup_available: boolean | null;
  delivery_available: boolean | null;
  delivery_fee: number | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface RentalItemListParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: "created_at" | "name" | "daily_rate" | "updated_at" | "sort_order";
  sort_order?: "asc" | "desc";
}

export interface RentalItemListResponse {
  rental_items: RentalItem[];
  total: number;
  limit: number;
  offset: number;
}

// ── Services (Appointments / Bookings) ──────────────────────────────────────

export interface Service {
  id: string;
  shop_id?: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  currency: string | null;
  category: string | null;
  duration_minutes: number;
  images: string[] | null;
  deposit_required: boolean | null;
  deposit_amount: number | null;
  max_bookings_per_slot: number | null;
  buffer_before_minutes: number | null;
  buffer_after_minutes: number | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceListParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: "created_at" | "name" | "price" | "sort_order" | "updated_at";
  sort_order?: "asc" | "desc";
}

export interface ServiceListResponse {
  services: Service[];
  total: number;
  limit: number;
  offset: number;
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
  /** Object or string. Stringified when stored. */
  shipping_address?: Record<string, any> | string;
  /** Shipping fee from /shipping/calculate (added on top of items subtotal). */
  shipping_fee?: number;
  /** Region key/name returned by /shipping/calculate (e.g. "LK", "EU"). */
  shipping_region?: string;
  payment_method?: string;
  /** Uploaded bank-transfer receipt URL, if applicable. */
  payment_proof_url?: string;
  notes?: string;
  discount_amount?: number;
  /** ISO currency, defaults to shop currency on the server. */
  currency?: string;
  /** Optional Supabase auth user id, if you have one. */
  user_id?: string;
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

// ── Shipping ─────────────────────────────────────────────────────────────────

export interface ShippingCalcCartItem {
  product_id: string;
  quantity: number;
  /** Optional override; otherwise resolved from products_public.weight (grams) */
  weight_g?: number;
}

export interface ShippingCalculateParams {
  items: ShippingCalcCartItem[];
  subtotal: number;
  /** ISO country code, e.g. "LK", "US". Defaults to "LK". */
  destination_country?: string;
}

export interface ShippingBreakdown {
  base_fee: number;
  extra_weight_g: number;
  steps: number;
  additional_fee: number;
  final_shipping: number;
}

export interface ShippingResult {
  fee: number;
  method: "free" | "threshold_free" | "domestic" | "international";
  reason: string;
  region_key: string | null;
  region_name: string | null;
  cart_weight_g: number;
  currency: string;
  breakdown: ShippingBreakdown | null;
  error: string | null;
}

// ── Customer (Shopi email-based auth) ───────────────────────────────────────

export interface CustomerProfile {
  name: string | null;
  email: string;
  avatar_url: string | null;
}

export interface CustomerOrder {
  id: string;
  status: string;
  total_amount: number;
  currency: string | null;
  items: any;
  shipping_fee: number | null;
  shipping_region: string | null;
  shipping_address: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifyCodeResult {
  verified?: boolean;
  ok?: boolean;
  error?: string;
  [k: string]: unknown;
}
