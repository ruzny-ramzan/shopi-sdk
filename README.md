# @shopi-lk/storefront-sdk

Official Shopi.lk Storefront SDK for building custom storefronts across all business types — **Shop**, **Listing**, **Rental**, and **Service**.

## Install

```bash
npm install @shopi-lk/storefront-sdk
```

## Quick Start

```typescript
import { Shopi } from '@shopi-lk/storefront-sdk';

const shopi = new Shopi({
  apiKey: 'shopi_pk_your_api_key_here',
});

// Get shop info (includes business_type: "shop" | "listing" | "rental" | "service")
const info = await shopi.getShop();
console.log(info.business_type); // e.g. "shop"
```

## Business Types

### Shop (E-Commerce)

```typescript
// List products with filtering, sorting & pagination
const { products, total } = await shopi.products.list({
  category: 'Electronics',
  search: 'phone',
  limit: 12,
  offset: 0,
  sort_by: 'created_at',
  sort_order: 'desc',
});

// Get a single product by slug
const product = await shopi.products.getBySlug('iphone-15-pro');

// Get all categories
const categories = await shopi.categories.list();

// Create an order
const order = await shopi.checkout.createOrder({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  items: [
    { product_id: 'uuid-here', name: 'iPhone 15 Pro', price: 450000, quantity: 1 },
  ],
  payment_method: 'cod',
});

// Validate a promo code
const promo = await shopi.checkout.validatePromo({
  code: 'SAVE10',
  subtotal: 450000,
});
```

### Listing (Showcase / Lead Generation)

For businesses like jewelry, vehicles, or gems — no cart/checkout, focused on inquiries.

```typescript
// List all visible listings
const { listings, total } = await shopi.listings.list({
  category: 'Rings',
  search: 'diamond',
  limit: 20,
  sort_by: 'views_count',
  sort_order: 'desc',
});

// Get a single listing by slug
const listing = await shopi.listings.getBySlug('diamond-engagement-ring');
console.log(listing.price);              // e.g. 125000
console.log(listing.availability_status); // e.g. "available"
console.log(listing.features);           // e.g. ["18K Gold", "0.5ct Diamond"]
console.log(listing.contact_info);       // e.g. { phone: "+94...", whatsapp: "..." }
console.log(listing.views_count);        // e.g. 342
```

### Rental (Vehicle / Equipment Rental)

For businesses that rent items with availability tracking.

```typescript
// List rental items
const { rental_items, total } = await shopi.rentalItems.list({
  category: 'SUV',
  limit: 10,
  sort_by: 'daily_rate',
  sort_order: 'asc',
});

// Get a single rental item by slug
const item = await shopi.rentalItems.getBySlug('toyota-land-cruiser');
console.log(item.daily_rate);           // e.g. 15000
console.log(item.weekly_rate);          // e.g. 90000
console.log(item.available_quantity);   // e.g. 3
console.log(item.deposit_required);     // e.g. true
console.log(item.deposit_amount);       // e.g. 50000
console.log(item.pickup_available);     // e.g. true
console.log(item.delivery_available);   // e.g. true
console.log(item.delivery_fee);         // e.g. 2500
```

### Service (Appointments / Bookings)

For businesses offering appointments like salons, mehendi artists, or consultants.

```typescript
// List services
const { services, total } = await shopi.services.list({
  category: 'Bridal',
  limit: 10,
  sort_by: 'price',
  sort_order: 'asc',
});

// Get a single service by slug
const service = await shopi.services.getBySlug('bridal-mehendi-package');
console.log(service.price);               // e.g. 25000
console.log(service.duration_minutes);     // e.g. 120
console.log(service.deposit_required);     // e.g. true
console.log(service.deposit_amount);       // e.g. 5000
console.log(service.max_bookings_per_slot); // e.g. 1
```

## Common APIs (All Business Types)

```typescript
// Store settings (name, logo, shipping, social links)
const settings = await shopi.getStoreSettings();

// Theme settings (colors, fonts, section layout)
const theme = await shopi.getThemeSettings();

// Payment methods & bank details
const { payment_methods, bank_details } = await shopi.getPaymentMethods();

// CMS pages
const pages = await shopi.pages.list();
const page = await shopi.pages.getBySlug('about-us');

// Blog posts
const { posts } = await shopi.blog.list({ limit: 5 });
const post = await shopi.blog.getBySlug('welcome-to-our-store');

// Product reviews (works for products)
const reviews = await shopi.reviews.list('product-uuid');
await shopi.reviews.submit({
  product_id: 'product-uuid',
  rating: 5,
  review_text: 'Amazing quality!',
  customer_name: 'Jane',
  customer_email: 'jane@example.com',
});

// Active discounts
const { shop_wide, product_specific } = await shopi.getDiscounts();
```

## API Reference

### `new Shopi(config)`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `apiKey` | `string` | ✅ | Your Storefront API key (must start with `shopi_pk_`) |
| `baseUrl` | `string` | ❌ | Override API URL (default: `https://apicall.shopi.lk/v1`) |
| `timeoutMs` | `number` | ❌ | Request timeout in ms (default: `10000`) |

### Methods

| Method | Scope | Description |
|--------|-------|-------------|
| `getShop()` | `shop:read` | Shop info (name, domain, business_type, theme) |
| `products.list(params?)` | `products:read` | List products with filters & pagination |
| `products.getBySlug(slug)` | `products:read` | Single product by slug |
| `categories.list()` | `products:read` | All product categories |
| `listings.list(params?)` | `listings:read` | List listings with filters & pagination |
| `listings.getBySlug(slug)` | `listings:read` | Single listing by slug |
| `rentalItems.list(params?)` | `rentals:read` | List rental items with filters & pagination |
| `rentalItems.getBySlug(slug)` | `rentals:read` | Single rental item by slug |
| `services.list(params?)` | `services:read` | List services with filters & pagination |
| `services.getBySlug(slug)` | `services:read` | Single service by slug |
| `getStoreSettings()` | `shop:read` | Store config (logo, shipping, social) |
| `getPaymentMethods()` | `shop:read` | Payment methods + bank details |
| `pages.list()` | `content:read` | CMS pages |
| `pages.getBySlug(slug)` | `content:read` | Single CMS page |
| `blog.list(params?)` | `content:read` | Blog posts (paginated) |
| `blog.getBySlug(slug)` | `content:read` | Single blog post |
| `reviews.list(productId)` | `products:read` | Product reviews |
| `reviews.submit(params)` | `checkout:write` | Submit a review |
| `getDiscounts()` | `products:read` | Active discounts |
| `getThemeSettings()` | `shop:read` | Theme colors, fonts, sections |
| `checkout.createOrder(params)` | `checkout:write` | Place an order |
| `checkout.validatePromo(params)` | `checkout:write` | Validate promo code |

### List Parameters

All `.list()` methods accept these common parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | `string` | — | Filter by category name |
| `search` | `string` | — | Search by name (case-insensitive) |
| `limit` | `number` | `50` | Results per page (max 100) |
| `offset` | `number` | `0` | Pagination offset |
| `sort_by` | `string` | varies | Sort field (see type definitions for allowed values) |
| `sort_order` | `"asc" \| "desc"` | `"desc"` | Sort direction |

### Rate Limiting

After every request, the current rate-limit state is available:

```typescript
const { products } = await shopi.products.list();
console.log(shopi.rateLimit);
// { limit: 60, remaining: 58, reset: 1720000000 }
```

## Error Handling

```typescript
import { Shopi, ShopiError } from '@shopi-lk/storefront-sdk';

try {
  const listings = await shopi.listings.list();
} catch (error) {
  if (error instanceof ShopiError) {
    console.error(error.message, error.status);
    // error.status === 401 → invalid API key
    // error.status === 403 → insufficient scope
    // error.status === 404 → resource not found
    // error.status === 408 → request timed out
    // error.status === 429 → rate limit exceeded
    // error.status === 0   → network error (offline, DNS failure)
  }
}
```

## Reliability

- **Automatic retries** — transient `5xx` and `429` responses are retried up to 2 times with exponential backoff (300ms, 600ms). For `429`, the SDK honours the `Retry-After` header.
- **Request timeouts** — every request is cancelled after 10s by default. Override with `timeoutMs`.
- **Safe JSON parsing** — non-JSON server responses (e.g. HTML gateway errors) throw a typed `ShopiError` instead of a raw `SyntaxError`.
- **Rate-limit awareness** — inspect `shopi.rateLimit` after any call to monitor your quota.

## Scopes

API keys can be scoped to limit access. Use `*` for full access or combine specific scopes:

| Scope | Access |
|-------|--------|
| `*` | Full access (all endpoints) |
| `shop:read` | Shop info, store settings, payment methods, theme |
| `products:read` | Products, categories, reviews, discounts |
| `listings:read` | Listings |
| `rentals:read` | Rental items |
| `services:read` | Services |
| `content:read` | Pages, blog posts |
| `checkout:write` | Orders, promo validation, review submission |
