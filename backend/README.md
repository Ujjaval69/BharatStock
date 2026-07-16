# BharatStock — Inventory & Order Management API

A simplified, multi-tenant inventory and order management backend for small
businesses. Each business (tenant) has isolated data — products, orders,
customers — enforced at the middleware level via the JWT, not by trusting
anything the client sends.

## Stack
Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing.

## Setup

```bash
cd bharatstock
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas free tier works great) and JWT_SECRET
npm run dev
```

Server starts on `http://localhost:5000`. Health check: `GET /api/health`.

If you don't have MongoDB yet, the fastest path is a free
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster — create one,
grab the connection string, and drop it into `MONGO_URI`.

## Core concept: multi-tenancy

Every document (`Product`, `Order`, `Customer`, `User`) has a `business`
field. On login, the JWT is signed with the user's `businessId`. Every
protected route reads `req.businessId` **from the verified token**, never
from the request body or URL — so there is no way for a request to read or
write another business's data, even if a client tried to pass a different
ID. This is the core system-design idea to be ready to talk through in
interviews.

## API Reference

### Auth
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register-business` | `{ businessName, ownerName, city, email, password }` | Creates a business + its owner in one step. Returns a token. |
| POST | `/api/auth/login` | `{ businessId, email, password }` | Returns a token. |
| GET | `/api/auth/me` | — | Requires `Authorization: Bearer <token>`. |

### Products
| Method | Route | Notes |
|---|---|---|
| GET | `/api/products?search=&lowStock=true` | List active products for the current business. |
| POST | `/api/products` | `{ name, sku, category, unit, costPrice, sellingPrice, stockQty, lowStockThreshold }` |
| GET | `/api/products/:id` | |
| PUT | `/api/products/:id` | Edit product fields. |
| PATCH | `/api/products/:id/adjust-stock` | `{ delta: 10 }` or `{ delta: -3 }`. Atomic increment — safe for concurrent staff. |
| DELETE | `/api/products/:id` | Soft delete (keeps order history intact). |

### Orders
| Method | Route | Notes |
|---|---|---|
| GET | `/api/orders?status=&from=&to=` | |
| POST | `/api/orders` | `{ customerId?, customerName?, items: [{ productId, qty }] }`. Decrements stock atomically per line item; rolls back if any item is out of stock. |
| GET | `/api/orders/:id` | |
| PATCH | `/api/orders/:id/status` | `{ status: 'fulfilled' \| 'cancelled' }`. Cancelling restores stock. |

### Customers
| Method | Route |
|---|---|
| GET | `/api/customers` |
| POST | `/api/customers` — `{ name, phone, address }` |

### Reports
| Method | Route | Notes |
|---|---|---|
| GET | `/api/reports/summary?from=&to=` | Revenue, order count, top 5 products in range (defaults to last 30 days). |
| GET | `/api/reports/low-stock` | Products at or below their reorder threshold. |

All routes except `register-business` and `login` require:
```
Authorization: Bearer <token>
```

## What's deliberately out of MVP scope
Payment gateway integration, GST-compliant invoicing, barcode scanning, and
the mobile app are all natural "Phase 2" additions once the core is solid —
mentioned here so it's clear they were a scoping choice, not an oversight.

## Next steps
1. `npm run seed` (see `src/utils/seed.js`) to load sample data.
2. Build the frontend (React) against this API.
3. Deploy: Render/Railway for the API, MongoDB Atlas for the database.
