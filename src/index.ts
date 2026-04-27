import type {
  ShopiConfig,
  Shop,
  Product,
  ProductListParams,
  ProductListResponse,
  Category,
  Listing,
  ListingListParams,
  ListingListResponse,
  RentalItem,
  RentalItemListParams,
  RentalItemListResponse,
  Service,
  ServiceListParams,
  ServiceListResponse,
  StoreSettings,
  PaymentMethod,
  BankDetail,
  Page,
  BlogPost,
  BlogListParams,
  Review,
  Discount,
  ThemeSettings,
  CreateOrderParams,
  Order,
  PromoValidateParams,
  PromoValidateResult,
  SubmitReviewParams,
  ShippingCalculateParams,
  ShippingResult,
  CustomerProfile,
  CustomerOrder,
  VerifyCodeResult,
} from "./types";

export * from "./types";

const DEFAULT_BASE_URL = "https://apicall.shopi.lk/v1";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RateLimitState {
  /** Maximum requests allowed per window */
  limit: number;
  /** Requests remaining in the current window */
  remaining: number;
  /** Unix timestamp (seconds) when the window resets */
  reset: number;
}

export class Shopi {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;

  /** Populated after every request — reflects the current rate-limit window. */
  public rateLimit: RateLimitState | null = null;

  constructor(config: ShopiConfig) {
    if (!config.apiKey || typeof config.apiKey !== "string") {
      throw new Error("apiKey is required and must be a string");
    }
    const trimmed = config.apiKey.trim();
    if (!trimmed.startsWith("shopi_pk_")) {
      throw new Error('apiKey must start with "shopi_pk_"');
    }
    this.apiKey = trimmed;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      params?: Record<string, string | number | undefined>;
      _retryCount?: number;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, params, _retryCount = 0 } = options;
    let url = `${this.baseUrl}/${path}`;

    if (params) {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) search.set(k, String(v));
      }
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: {
          "X-Shopi-Api-Key": this.apiKey,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new ShopiError(
          `Request timed out after ${this.timeoutMs}ms`,
          408
        );
      }
      throw new ShopiError(
        err instanceof Error ? err.message : "Network error",
        0
      );
    } finally {
      clearTimeout(timer);
    }

    // Retry on transient server errors with exponential backoff
    // For 429, honour Retry-After header from worker if present
    if (RETRYABLE_STATUSES.has(res.status) && _retryCount < MAX_RETRIES) {
      let delay = 2 ** _retryCount * 300; // 300ms, 600ms default
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        if (retryAfter) delay = Math.min(parseInt(retryAfter, 10) * 1000, 10_000);
      }
      await sleep(delay);
      return this.request<T>(path, { ...options, _retryCount: _retryCount + 1 });
    }

    // Capture rate-limit state from worker response headers
    const rlLimit     = res.headers.get("X-RateLimit-Limit");
    const rlRemaining = res.headers.get("X-RateLimit-Remaining");
    const rlReset     = res.headers.get("X-RateLimit-Reset");
    if (rlLimit && rlRemaining && rlReset) {
      this.rateLimit = {
        limit:     parseInt(rlLimit, 10),
        remaining: parseInt(rlRemaining, 10),
        reset:     parseInt(rlReset, 10),
      };
    }

    // Safe JSON parse — server may return HTML on gateway errors
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new ShopiError(
        `Unexpected server response (status ${res.status})`,
        res.status
      );
    }

    if (!res.ok) {
      const errData = data as Record<string, unknown>;
      throw new ShopiError(
        typeof errData?.error === "string" ? errData.error : "Request failed",
        res.status,
        data
      );
    }

    return data as T;
  }

  // ── Shop ───────────────────────────────────────────────────────────────

  async getShop(): Promise<Shop> {
    const res = await this.request<{ shop: Shop }>("shop");
    return res.shop;
  }

  // ── Products ───────────────────────────────────────────────────────────

  products = {
    list: async (params?: ProductListParams): Promise<ProductListResponse> => {
      return this.request<ProductListResponse>("products", {
        params: params as Record<string, string | number | undefined>,
      });
    },

    getBySlug: async (slug: string): Promise<Product> => {
      const res = await this.request<{ product: Product }>(
        `products/${encodeURIComponent(slug)}`
      );
      return res.product;
    },
  };

  // ── Categories ─────────────────────────────────────────────────────────

  categories = {
    list: async (): Promise<Category[]> => {
      const res = await this.request<{ categories: Category[] }>("categories");
      return res.categories;
    },
  };

  // ── Listings ──────────────────────────────────────────────────────────

  listings = {
    list: async (params?: ListingListParams): Promise<ListingListResponse> => {
      return this.request<ListingListResponse>("listings", {
        params: params as Record<string, string | number | undefined>,
      });
    },

    getBySlug: async (slug: string): Promise<Listing> => {
      const res = await this.request<{ listing: Listing }>(
        `listings/${encodeURIComponent(slug)}`
      );
      return res.listing;
    },
  };

  // ── Rental Items ──────────────────────────────────────────────────────

  rentalItems = {
    list: async (params?: RentalItemListParams): Promise<RentalItemListResponse> => {
      return this.request<RentalItemListResponse>("rental-items", {
        params: params as Record<string, string | number | undefined>,
      });
    },

    getBySlug: async (slug: string): Promise<RentalItem> => {
      const res = await this.request<{ rental_item: RentalItem }>(
        `rental-items/${encodeURIComponent(slug)}`
      );
      return res.rental_item;
    },
  };

  // ── Services ──────────────────────────────────────────────────────────

  services = {
    list: async (params?: ServiceListParams): Promise<ServiceListResponse> => {
      return this.request<ServiceListResponse>("services", {
        params: params as Record<string, string | number | undefined>,
      });
    },

    getBySlug: async (slug: string): Promise<Service> => {
      const res = await this.request<{ service: Service }>(
        `services/${encodeURIComponent(slug)}`
      );
      return res.service;
    },
  };

  // ── Store Settings ─────────────────────────────────────────────────────

  async getStoreSettings(): Promise<StoreSettings> {
    const res = await this.request<{ settings: StoreSettings }>(
      "store-settings"
    );
    return res.settings;
  }

  // ── Payment Methods ────────────────────────────────────────────────────

  async getPaymentMethods(): Promise<{
    payment_methods: PaymentMethod[];
    bank_details: BankDetail[];
  }> {
    return this.request("payment-methods");
  }

  // ── Pages ──────────────────────────────────────────────────────────────

  pages = {
    list: async (): Promise<Page[]> => {
      const res = await this.request<{ pages: Page[] }>("pages");
      return res.pages;
    },
    getBySlug: async (slug: string): Promise<Page> => {
      const res = await this.request<{ page: Page }>(
        `pages/${encodeURIComponent(slug)}`
      );
      return res.page;
    },
  };

  // ── Blog ───────────────────────────────────────────────────────────────

  blog = {
    list: async (
      params?: BlogListParams
    ): Promise<{ posts: BlogPost[]; total: number }> => {
      return this.request("blogs", {
        params: params as Record<string, string | number | undefined>,
      });
    },
    getBySlug: async (slug: string): Promise<BlogPost> => {
      const res = await this.request<{ post: BlogPost }>(
        `blogs/${encodeURIComponent(slug)}`
      );
      return res.post;
    },
  };

  // ── Reviews ────────────────────────────────────────────────────────────

  reviews = {
    list: async (productId: string, limit?: number): Promise<Review[]> => {
      const res = await this.request<{ reviews: Review[] }>(
        `reviews/${encodeURIComponent(productId)}`,
        { params: limit ? { limit } : undefined }
      );
      return res.reviews;
    },
    submit: async (params: SubmitReviewParams): Promise<{ id: string }> => {
      const res = await this.request<{ review: { id: string } }>("reviews", {
        method: "POST",
        body: params,
      });
      return res.review;
    },
  };

  // ── Discounts ──────────────────────────────────────────────────────────

  async getDiscounts(): Promise<{
    shop_wide: Discount[];
    product_specific: Discount[];
  }> {
    const res = await this.request<{
      shop_wide_discounts: Discount[];
      product_discounts: Discount[];
    }>("discounts");
    return {
      shop_wide: res.shop_wide_discounts,
      product_specific: res.product_discounts,
    };
  }

  // ── Theme Settings ─────────────────────────────────────────────────────

  async getThemeSettings(): Promise<ThemeSettings | null> {
    const res = await this.request<{ theme: ThemeSettings | null }>(
      "theme-settings"
    );
    return res.theme;
  }

  // ── Checkout / Orders ──────────────────────────────────────────────────

  checkout = {
    createOrder: async (params: CreateOrderParams): Promise<Order> => {
      const res = await this.request<{ order: Order }>("orders", {
        method: "POST",
        body: params,
      });
      return res.order;
    },
    validatePromo: async (
      params: PromoValidateParams
    ): Promise<PromoValidateResult> => {
      return this.request<PromoValidateResult>("promo/validate", {
        method: "POST",
        body: params,
      });
    },
  };

  // ── Shipping ───────────────────────────────────────────────────────────

  shipping = {
    /**
     * Calculate shipping fee for a cart based on the shop's configured
     * shipping rules (free, weight-tiered, or weight-based domestic/international).
     * Server resolves missing item weights from products_public.
     */
    calculate: async (params: ShippingCalculateParams): Promise<ShippingResult> => {
      return this.request<ShippingResult>("shipping/calculate", {
        method: "POST",
        body: params,
      });
    },
  };

  // ── Customer (Shopi email-based auth + profile + order history) ───────

  customer = {
    /** Send a 6-digit verification code to the customer's email. */
    sendVerification: async (email: string): Promise<{ ok?: boolean; error?: string }> => {
      return this.request("customer/send-verification", {
        method: "POST",
        body: { email },
      });
    },

    /** Verify the 6-digit code emailed to the customer. */
    verifyCode: async (email: string, code: string): Promise<VerifyCodeResult> => {
      return this.request<VerifyCodeResult>("customer/verify-code", {
        method: "POST",
        body: { email, code },
      });
    },

    /** Fetch the customer's profile (name, avatar). Returns null if not found. */
    getProfile: async (email: string): Promise<CustomerProfile | null> => {
      const res = await this.request<{ profile: CustomerProfile | null }>(
        "customer/profile",
        { params: { email } },
      );
      return res.profile;
    },

    /** Create or update the customer's profile (name, avatar_url). */
    upsertProfile: async (
      params: { email: string; name?: string; avatar_url?: string | null },
    ): Promise<{ ok?: boolean; error?: string }> => {
      return this.request("customer/profile", {
        method: "POST",
        body: params,
      });
    },

    /** List the customer's orders for THIS shop only. */
    listOrders: async (email: string): Promise<CustomerOrder[]> => {
      const res = await this.request<{ orders: CustomerOrder[] }>(
        "customer/orders",
        { params: { email } },
      );
      return res.orders;
    },
  };
}

// ── Error Class ──────────────────────────────────────────────────────────────

export class ShopiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ShopiError";
    this.status = status;
    this.data = data;
  }
}
