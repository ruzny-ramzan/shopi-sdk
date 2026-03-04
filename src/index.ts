import type {
  ShopiConfig,
  Shop,
  Product,
  ProductListParams,
  ProductListResponse,
  Category,
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
} from "./types";

export * from "./types";

const DEFAULT_BASE_URL =
  "https://bdpvfwfftaepqjvnnkwv.supabase.co/functions/v1/storefront-api/v1";

export class Shopi {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ShopiConfig) {
    if (!config.apiKey) throw new Error("apiKey is required");
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown; params?: Record<string, string | number | undefined> } = {}
  ): Promise<T> {
    const { method = "GET", body, params } = options;
    let url = `${this.baseUrl}/${path}`;

    if (params) {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) search.set(k, String(v));
      }
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }

    const res = await fetch(url, {
      method,
      headers: {
        "X-Shopi-Api-Key": this.apiKey,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ShopiError(data.error || "Request failed", res.status, data);
    }
    return data as T;
  }

  // ── Shop ───────────────────────────────────────────────────────────────

  /** Get shop info */
  async getShop(): Promise<Shop> {
    const res = await this.request<{ shop: Shop }>("shop");
    return res.shop;
  }

  // ── Products ───────────────────────────────────────────────────────────

  products = {
    /** List products with optional filters */
    list: async (params?: ProductListParams): Promise<ProductListResponse> => {
      return this.request<ProductListResponse>("products", {
        params: params as Record<string, string | number | undefined>,
      });
    },

    /** Get a single product by slug */
    getBySlug: async (slug: string): Promise<Product> => {
      const res = await this.request<{ product: Product }>(`products/${encodeURIComponent(slug)}`);
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

  // ── Store Settings ─────────────────────────────────────────────────────

  /** Get store settings (name, logo, shipping, social links, etc.) */
  async getStoreSettings(): Promise<StoreSettings> {
    const res = await this.request<{ settings: StoreSettings }>("store-settings");
    return res.settings;
  }

  // ── Payment Methods ────────────────────────────────────────────────────

  async getPaymentMethods(): Promise<{ payment_methods: PaymentMethod[]; bank_details: BankDetail[] }> {
    return this.request("payment-methods");
  }

  // ── Pages ──────────────────────────────────────────────────────────────

  pages = {
    list: async (): Promise<Page[]> => {
      const res = await this.request<{ pages: Page[] }>("pages");
      return res.pages;
    },
    getBySlug: async (slug: string): Promise<Page> => {
      const res = await this.request<{ page: Page }>(`pages/${encodeURIComponent(slug)}`);
      return res.page;
    },
  };

  // ── Blog ───────────────────────────────────────────────────────────────

  blog = {
    list: async (params?: BlogListParams): Promise<{ posts: BlogPost[]; total: number }> => {
      return this.request("blogs", {
        params: params as Record<string, string | number | undefined>,
      });
    },
    getBySlug: async (slug: string): Promise<BlogPost> => {
      const res = await this.request<{ post: BlogPost }>(`blogs/${encodeURIComponent(slug)}`);
      return res.post;
    },
  };

  // ── Reviews ────────────────────────────────────────────────────────────

  reviews = {
    /** Get reviews for a product */
    list: async (productId: string, limit?: number): Promise<Review[]> => {
      const res = await this.request<{ reviews: Review[] }>(`reviews/${encodeURIComponent(productId)}`, {
        params: limit ? { limit } : undefined,
      });
      return res.reviews;
    },
    /** Submit a review (requires approval by seller) */
    submit: async (params: SubmitReviewParams): Promise<{ id: string }> => {
      const res = await this.request<{ review: { id: string } }>("reviews", {
        method: "POST",
        body: params,
      });
      return res.review;
    },
  };

  // ── Discounts ──────────────────────────────────────────────────────────

  async getDiscounts(): Promise<{ shop_wide: Discount[]; product_specific: Discount[] }> {
    const res = await this.request<{ shop_wide_discounts: Discount[]; product_discounts: Discount[] }>("discounts");
    return { shop_wide: res.shop_wide_discounts, product_specific: res.product_discounts };
  }

  // ── Theme Settings ─────────────────────────────────────────────────────

  async getThemeSettings(): Promise<ThemeSettings | null> {
    const res = await this.request<{ theme: ThemeSettings | null }>("theme-settings");
    return res.theme;
  }

  // ── Checkout / Orders ──────────────────────────────────────────────────

  checkout = {
    /** Create an order */
    createOrder: async (params: CreateOrderParams): Promise<Order> => {
      const res = await this.request<{ order: Order }>("orders", {
        method: "POST",
        body: params,
      });
      return res.order;
    },
    /** Validate a promo code */
    validatePromo: async (params: PromoValidateParams): Promise<PromoValidateResult> => {
      return this.request<PromoValidateResult>("promo/validate", {
        method: "POST",
        body: params,
      });
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
