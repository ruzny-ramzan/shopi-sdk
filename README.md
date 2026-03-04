# @shopi/storefront-sdk

Official Shopi Storefront SDK for building custom e-commerce storefronts.

## Install

```bash
npm install @shopi/storefront-sdk
```

## Quick Start

```typescript
import { Shopi } from '@shopi/storefront-sdk';

const shop = new Shopi({
  apiKey: 'shopi_pk_your_api_key_here',
});

// Get shop info
const info = await shop.getShop();

// List products
const { products, total } = await shop.products.list({
  limit: 12,
  sort_by: 'created_at',
  sort_order: 'desc',
});

// Get a single product
const product = await shop.products.getBySlug('my-product');

// Get categories
const categories = await shop.categories.list();

// Get store settings (name, logo, shipping, social links)
const settings = await shop.getStoreSettings();

// Get theme settings (colors, fonts, sections)
const theme = await shop.getThemeSettings();

// Create an order
const order = await shop.checkout.createOrder({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  items: [
    { product_id: '...', name: 'T-Shirt', price: 2500, quantity: 1 },
  ],
  payment_method: 'cod',
});

// Validate promo code
const promo = await shop.checkout.validatePromo({
  code: 'SAVE10',
  subtotal: 5000,
});
```

## API Reference

### `new Shopi(config)`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `apiKey` | `string` | ✅ | Your Storefront API key |
| `baseUrl` | `string` | ❌ | Override API URL |

### Methods

| Method | Description |
|--------|-------------|
| `shop.getShop()` | Shop info |
| `shop.products.list(params?)` | List products (filter, sort, paginate) |
| `shop.products.getBySlug(slug)` | Single product |
| `shop.categories.list()` | All categories |
| `shop.getStoreSettings()` | Store config |
| `shop.getPaymentMethods()` | Payment methods + bank details |
| `shop.pages.list()` | CMS pages |
| `shop.pages.getBySlug(slug)` | Single page |
| `shop.blog.list(params?)` | Blog posts |
| `shop.blog.getBySlug(slug)` | Single post |
| `shop.reviews.list(productId)` | Product reviews |
| `shop.reviews.submit(params)` | Submit a review |
| `shop.getDiscounts()` | Active discounts |
| `shop.getThemeSettings()` | Theme colors, fonts, sections |
| `shop.checkout.createOrder(params)` | Place an order |
| `shop.checkout.validatePromo(params)` | Validate promo code |

## Error Handling

```typescript
import { Shopi, ShopiError } from '@shopi/storefront-sdk';

try {
  const products = await shop.products.list();
} catch (error) {
  if (error instanceof ShopiError) {
    console.error(error.message, error.status);
  }
}
```
