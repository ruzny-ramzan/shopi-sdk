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

// Calculate shipping fee BEFORE creating the order (weight + region aware)
const ship = await shopi.shipping.calculate({
  items: [{ product_id: 'uuid-here', quantity: 1 }], // weight resolved from DB
  subtotal: 450000,
  destination_country: 'LK',
});
console.log(ship.fee, ship.method, ship.reason);
// e.g. 350, "domestic", "Domestic tier 0–1000g"

// Create an order — pass shipping_fee + shipping_region from the call above
const order = await shopi.checkout.createOrder({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+94771234567',
  items: [
    { product_id: 'uuid-here', name: 'iPhone 15 Pro', price: 450000, quantity: 1 },
  ],
  shipping_address: { line1: '123 Main St', city: 'Colombo', postal_code: '00100' },
  shipping_fee: ship.fee,
  shipping_region: ship.region_key ?? undefined,
  payment_method: 'cod',
  currency: ship.currency, // optional, defaults to shop currency
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

// Record a view (increments views_count, shown in the seller dashboard)
// Safe to call from a component effect: it never throws and de-duplicates
// per browser session.
await shopi.listings.trackView(listing.slug ?? listing.id);
```

#### Tracking listing views

`views_count` is what the seller's dashboard shows as **Total Views**, and what
you render as "X people viewed this". It only increases when your storefront
tells Shopi a view happened.

| | |
|---|---|
| SDK method | `listings.trackView(slugOrId, { force? })` |
| Endpoint | `POST /v1/listings/:slugOrId/view` |
| Scope | `listings:read` |
| Returns | `number \| null` — the new `views_count`, or `null` if skipped/failed |

Behaviour:
- **Never throws.** Failures resolve to `null`, so a tracking outage can never break your page.
- **De-duplicated per browser session** via `sessionStorage` key `shopi_viewed_listing_<slugOrId>`. Pass `{ force: true }` to always count.
- Accepts either the listing **slug** or **id**.

```tsx
import { useEffect, useState } from 'react';

function ListingPage({ listing }) {
  const [views, setViews] = useState(listing.views_count);

  useEffect(() => {
    // Count once per session, then reflect the fresh number in the UI
    shopi.listings.trackView(listing.slug ?? listing.id).then((count) => {
      if (count !== null) setViews(count);
    });
  }, [listing.id]);

  return <p>{views} people viewed this</p>;
}
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

## Shipping (Profile + Weight-Based Calculation)

The shop's seller configures shipping in their Shopi dashboard (free shipping,
free-over-threshold, flat domestic, weight-tiered domestic, or per-region
international). Use `shipping.calculate` to get the correct fee for the cart
**before** calling `checkout.createOrder` — pass the same fee back into the
order so the customer is charged correctly.

```typescript
// 1. Calculate the fee
const ship = await shopi.shipping.calculate({
  items: [
    { product_id: 'prod-uuid-1', quantity: 2 },             // weight resolved server-side
    { product_id: 'prod-uuid-2', quantity: 1, weight_g: 750 }, // explicit override
  ],
  subtotal: 12500,
  destination_country: 'LK', // ISO code; defaults to "LK"
});

// ship returns:
// {
//   fee: 450,
//   method: "domestic",       // "free" | "threshold_free" | "domestic" | "international"
//   reason: "Domestic tier 1001–2000g",
//   region_key: null,
//   region_name: null,
//   cart_weight_g: 1750,
//   currency: "LKR",
//   breakdown: { base_fee: 450, extra_weight_g: 0, steps: 0, additional_fee: 0, final_shipping: 450 },
//   error: null,
// }

// 2. Pass shipping_fee + shipping_region into the order
await shopi.checkout.createOrder({
  customer_name: 'Ruzny',
  customer_email: 'ruzny@example.com',
  items: [/* same items with name + price */],
  shipping_address: { line1: '…', city: 'Colombo' },
  shipping_fee: ship.fee,
  shipping_region: ship.region_key ?? undefined,
  payment_method: 'cod',
});
```

**Notes**
- `weight_g` per item is optional. If omitted, the server reads `weight` from `products_public` (in grams).
- If shipping is unavailable for the destination, `fee` will be `0` and `error` will explain why — surface it to the customer.
- Free-shipping and free-over-threshold rules are evaluated automatically.

## Customer Auth, Profile & Order History

Shopi uses **email-based passwordless auth** (no password, no Supabase Auth user
required). Send a 6-digit code, verify it, then read/update the customer's
profile and list their orders for THIS shop.

```typescript
// 1. Send a 6-digit code to the customer's email
await shopi.customer.sendVerification('jane@example.com');

// 2. Verify the code the user types in
const result = await shopi.customer.verifyCode('jane@example.com', '482910');
if (result.error) {
  // wrong / expired code
}

// 3. Read profile (name + avatar). Returns null if no profile yet.
const profile = await shopi.customer.getProfile('jane@example.com');

// 4. Create or update the profile
await shopi.customer.upsertProfile({
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatar_url: 'https://cdn.shopi.lk/customer-uploads/jan***doe@example.com-…jpg',
});

// 5. List the customer's orders for this shop
const orders = await shopi.customer.listOrders('jane@example.com');
orders.forEach(o => {
  console.log(o.id, o.status, o.total_amount, o.currency);
});
```

**Recommended flow for a "My Account / Orders" page**
1. Persist the verified email in `localStorage` (e.g. `shopi_customer_email`).
2. On page load, call `customer.getProfile(email)` and `customer.listOrders(email)` in parallel.
3. To "log out", just clear the stored email.

Verification codes expire after 10 minutes. Re-sending a code within 60 seconds is rate-limited.

---

## Customer Profile & Checkout Autofill

Shopi's native storefront auto-creates a profile after the first order, autofills
the checkout form on subsequent visits, and locks the email field once verified
so every order ties back to the same customer. You can replicate this exact
behavior in any SDK-powered storefront — **no extra endpoints required**.

### How it works

1. **First order** → save customer details (name, email, phone, shipping address)
   to `localStorage` AND call `customer.upsertProfile()` to persist server-side.
2. **Returning visit** → read `localStorage`, autofill the checkout form.
3. **Email verified** → mark email as verified locally and render the email
   input as read-only. All future orders for this email show up in
   `customer.listOrders(email)`.

### Storage shape (recommended)

```typescript
// localStorage key: 'shopi_customer_profile'
interface LocalCustomerProfile {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingRegion: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}
```

### Complete React example

```tsx
import { useEffect, useState } from 'react';
import { Shopi } from '@shopi-lk/storefront-sdk';

const shopi = new Shopi({ apiKey: 'shopi_pk_…' });
const PROFILE_KEY = 'shopi_customer_profile';

interface LocalProfile {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingRegion: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

const empty: LocalProfile = {
  name: '', email: '', phone: '',
  shippingAddress: '', shippingRegion: '',
  isEmailVerified: false,
};

const readProfile = (): LocalProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch { return empty; }
};
const writeProfile = (p: LocalProfile) =>
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));

export function CheckoutForm({ cart, subtotal }: { cart: any[]; subtotal: number }) {
  const [form, setForm] = useState<LocalProfile>(empty);
  const [submitting, setSubmitting] = useState(false);

  // 1. Autofill from localStorage on mount
  useEffect(() => {
    const saved = readProfile();
    setForm(saved);

    // Hydrate latest name/avatar from server if email is verified
    if (saved.isEmailVerified && saved.email) {
      shopi.customer.getProfile(saved.email).then((server) => {
        if (server) {
          setForm((f) => ({
            ...f,
            name: server.name || f.name,
            avatarUrl: server.avatar_url || f.avatarUrl,
          }));
        }
      });
    }
  }, []);

  // 2. Email verification — locks the email field once verified
  async function verifyEmail() {
    await shopi.customer.sendVerification(form.email);
    const code = window.prompt('Enter the 6-digit code sent to your email');
    if (!code) return;
    const res = await shopi.customer.verifyCode(form.email, code);
    if (res.error) { alert('Invalid or expired code'); return; }

    const verified = { ...form, isEmailVerified: true };
    setForm(verified);
    writeProfile(verified);
  }

  // 3. Place order, then persist profile (local + server)
  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await shopi.orders.create({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.shippingAddress,
        shipping_region: form.shippingRegion,
        items: cart,
        subtotal,
        payment_method: 'cod',
      });

      // Save locally so the next visit autofills
      writeProfile(form);

      // Auto-create / update server-side profile so future orders
      // surface in customer.listOrders(email) under one identity.
      await shopi.customer.upsertProfile({
        email: form.email,
        name: form.name,
      });

      window.location.href = `/order/${order.id}`;
    } finally {
      setSubmitting(false);
    }
  }

  const emailLocked = form.isEmailVerified;

  return (
    <form onSubmit={placeOrder}>
      <input
        placeholder="Full name" required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <div>
        <input
          type="email" placeholder="Email" required
          value={form.email}
          readOnly={emailLocked}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {emailLocked
          ? <span>✓ Verified</span>
          : <button type="button" onClick={verifyEmail}>Verify email</button>}
      </div>

      <input
        placeholder="Phone" required
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <textarea
        placeholder="Shipping address" required
        value={form.shippingAddress}
        onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
      />
      <input
        placeholder="Region (e.g. Colombo)" required
        value={form.shippingRegion}
        onChange={(e) => setForm({ ...form, shippingRegion: e.target.value })}
      />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Placing order…' : 'Place order'}
      </button>
    </form>
  );
}
```

### "My Orders" page (uses the same email)

```tsx
export function MyOrders() {
  const { email, isEmailVerified } = readProfile();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!email || !isEmailVerified) return;
    shopi.customer.listOrders(email).then(setOrders);
  }, [email]);

  if (!isEmailVerified) {
    return <p>Verify your email at checkout to see your past orders.</p>;
  }
  return (
    <ul>
      {orders.map((o) => (
        <li key={o.id}>#{o.id.slice(0, 8)} — {o.status} — {o.currency} {o.total_amount}</li>
      ))}
    </ul>
  );
}
```

### Notes & best practices

- **Email is the customer key.** All orders placed with the same email — across
  sessions, devices, even before verification — link to the same profile and
  appear in `customer.listOrders(email)`.
- **Lock email after verification** so users don't accidentally split their
  order history across multiple emails.
- **Verification is optional** for checkout — but required to view past orders
  on a "My Orders" page.
- **Avatars:** host the image on your own storage/CDN and pass the URL to
  `customer.upsertProfile({ avatar_url })`.
- **Logout:** `localStorage.removeItem('shopi_customer_profile')`.

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
| `listings.trackView(slugOrId, opts?)` | `listings:read` | Record a listing view (`POST /listings/:slugOrId/view`), session-deduped |
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
| `checkout.createOrder(params)` | `checkout:write` | Place an order (pass `shipping_fee` from `shipping.calculate`) |
| `checkout.validatePromo(params)` | `checkout:write` | Validate promo code |
| `shipping.calculate(params)` | `checkout:write` | Calculate shipping fee from cart + destination |
| `customer.sendVerification(email)` | `customer:write` | Email a 6-digit verification code |
| `customer.verifyCode(email, code)` | `customer:write` | Verify the 6-digit code |
| `customer.getProfile(email)` | `customer:read` | Get customer name + avatar |
| `customer.upsertProfile(params)` | `customer:write` | Create/update customer profile |
| `customer.listOrders(email)` | `customer:read` | List customer's orders for THIS shop |

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
| `checkout:write` | Orders, promo validation, review submission, shipping calculation |
| `customer:read` | Read customer profile + their order history |
| `customer:write` | Send/verify codes, create/update customer profile |
