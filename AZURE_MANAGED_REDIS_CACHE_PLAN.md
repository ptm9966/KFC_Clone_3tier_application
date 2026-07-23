# Azure Managed Redis Cache Integration Plan

## Goal
Add Azure Managed Redis Cache to the Backend service to improve response time for read-heavy product queries and reduce repeated MongoDB load.

This plan is targeted at the existing backend service in `Backend/`, which is an Express app using Mongoose.

---

## Why Azure Managed Redis Cache

- Provides low-latency in-memory caching for frequently requested data.
- Offloads read traffic from MongoDB for catalog queries and product lookups.
- Improves page load speed for product list, category filters, product search, and product detail responses.
- Azure-managed service reduces operational overhead compared to self-hosted Redis.

---

## Targeted caching points

The best backend cache targets in this repo are:

1. `GET /api/product` (all products)
2. `GET /api/product?categories=...` (product filtering)
3. `GET /api/product/search?q=...` (product search)
4. `GET /api/product/:productId` (single product detail)

These endpoints are read-heavy, often repeated by frontend users, and suitable for short-term caching.

---

## Azure resource setup

### 1. Create Azure Cache for Redis

- Create an Azure Cache for Redis instance in the same region as your backend App Service or compute.
- Recommended SKU:
  - Development/test: `Basic` or `Standard`.
  - Production: `Standard` or `Premium` with clustering if needed.
- Recommended settings:
  - `Redis version`: latest supported stable version.
  - `Enable non-SSL port`: false if using SSL.
  - `Virtual network`: use VNet integration or Private Endpoint if backend is in Azure VNet.

### 2. Obtain connection properties

From Azure portal, capture:

- `HOSTNAME` (e.g. `mycache.redis.cache.windows.net`)
- `PORT` (usually `6380` for TLS)
- `PRIMARY ACCESS KEY`
- `SECONDARY ACCESS KEY`

### 3. Configure application settings

Set these secrets in Azure App Service / Azure environment config or in `.env` for local testing:

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `REDIS_TLS=true` (optional, if using TLS)
- `REDIS_CACHE_ENABLED=true`

Example `.env` values:

```text
REDIS_HOST=mycache.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=<primary-access-key>
REDIS_TLS=true
REDIS_CACHE_ENABLED=true
```

---

## Backend changes

### 1. Add Redis dependency

Update `Backend/package.json`:

```json
"dependencies": {
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "mongoose": "^9.6.1",
  "nodemon": "^3.1.14",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1",
  "prom-client": "^14.2.0",
  "redis": "^5.0.0"
}
```

Then run `npm install` inside `Backend/`.

### 2. Create Redis helper module

Add a new file `Backend/config/redis.js` with a shared Redis client:

- Initialize Redis only once.
- Respect `REDIS_CACHE_ENABLED`.
- Support TLS if needed.

### 3. Wrap product getters with cache logic

Modify `Backend/features/product/product.route.js`:

- Compute cache keys by full request context.
- Try `redis.get(cacheKey)` before querying MongoDB.
- On cache hit, return the JSON response immediately.
- On cache miss, query the database and `redis.set(cacheKey, data, { EX: ttl })`.

Suggested TTL values:

- Products list / filters: `180` seconds
- Search results: `60` seconds
- Product detail: `300` seconds

### 4. Add cache invalidation

Invalidate or expire cached data when product writes happen.

- After `POST /api/product`, delete the cache entries for:
  - `products:all`
  - `products:categories:*`
  - `products:search:*`
- After `DELETE /api/product/:productId`, delete:
  - `product:<productId>`
  - `products:all`
  - `products:categories:*`
  - `products:search:*`

If you want a simpler initial implementation, rely on short TTLs instead of explicit invalidation.

### 5. Keep caching optional

Add a safe fallback so the backend continues working if Redis is unreachable:

- If Redis client fails or caching is disabled, the app should still return product data from MongoDB.
- Log a warning but do not fail requests because of Redis problems.

---

## Implementation outline

### Example cache patterns

- `products:all`
- `products:categories:<category>`
- `products:search:<q>`
- `product:<productId>`

### Example flow for `GET /api/product`

1. Build key: `products:all` or `products:categories:<category>`.
2. `const cached = await redis.get(key)`.
3. If found, parse JSON and send it.
4. If missing, query MongoDB with `Product.find()`.
5. Cache result with TTL.
6. Return response.

### Example flow for `GET /api/product/:productId`

1. Build key: `product:<productId>`.
2. Try Redis.
3. Query MongoDB if absent.
4. Cache and return.

---

## Deployment considerations

### If backend is deployed in Azure App Service

- Use App Service settings for `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.
- Enable `WEBSITE_LOAD_USER_PROFILE=1` if required by your app.
- If using TLS, ensure `tls: { rejectUnauthorized: false }` only for dev; prefer proper certificate validation.

### If backend is Dockerized locally or in Azure Container Instances

- Add Redis env vars to your container configuration.
- Keep `REDIS_CACHE_ENABLED=false` for local builds if you do not have a Redis instance.

### If using VNet / Private Endpoint

- Use Azure VNet integration for App Service or AKS.
- Ensure the Redis instance and backend share the same VNet or have network access.
- For Private Endpoint, add DNS or host mapping for the Redis hostname.

---

## Testing and validation

### Manual tests

- Verify product list returns near-instant responses on repeated calls.
- Verify product detail and category filters return cached results.
- Confirm `GET /metrics` still works.
- Test create/delete flows to ensure stale cache is invalidated or TTL expires.

### Load testing

- Use existing load test scripts in `LoadTesting/` to compare with and without Redis.
- Track average response time and request throughput.
- Validate Redis hit ratio by logging cache misses/hits during test runs.

---

## Recommended next steps

1. Add `redis` package to `Backend/package.json`.
2. Create `Backend/config/redis.js` and initialize Redis from env.
3. Update `Backend/features/product/product.route.js` to use Redis caching for read routes.
4. Add invalidation on product updates and deletes.
5. Deploy to Azure and wire environment variables.
6. Verify with load tests.

---

## Notes for this repository

- The backend currently exposes `GET /api/product`, `GET /api/product/search`, and `GET /api/product/:productId`.
- These are the best places to add Azure Redis Cache for faster responses.
- The current backend does not yet have a dedicated cache module, so a new `Backend/config/redis.js` is the cleanest integration point.
