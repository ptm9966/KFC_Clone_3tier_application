const { Router } = require("express");
const Product = require("./product.model");
const { safeGet, safeSet, safeDel, safeKeys, parseCachedValue } = require("../../config/redis");
const productRouter = Router();

const CACHE_TTL = {
  productDetail: 300,
  productList: 180,
  productSearch: 60,
};

async function clearProductCache(productId) {
  if (productId) {
    await safeDel(`product:${productId}`);
  }

  const keys = await safeKeys("products:*");
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => safeDel(key)));
  }
}

function normalizeProductId(productId) {
  return String(productId || "").replace(/^:/, "");
}

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get all products or filter by category
 *     description: Retrieve all products or filter by category
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter products by category
 *     responses:
 *       200:
 *         description: List of products
 *       401:
 *         description: Error retrieving products
 */
productRouter.get("/product", async (req, res) => {
    const categories = req.query.categories;
    const cacheKey = categories ? `products:categories:${categories}` : "products:all";

    try {
        const cached = parseCachedValue(await safeGet(cacheKey));
        if (cached !== null && cached !== undefined) {
            return res.status(200).send(cached);
        }

        const items = categories
            ? await Product.find({ categories })
            : await Product.find();

        await safeSet(cacheKey, JSON.stringify(items), CACHE_TTL.productList);
        res.status(200).send(items);
    } catch (error) {
        console.error(error);
        res.status(401).send({ err: "Something went wrong" });
    }
});

/**
 * @swagger
 * /api/product/search:
 *   get:
 *     summary: Search products by title
 *     description: Search products by title keyword
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Search error
 */
productRouter.get("/product/search", async (req, res) => {
    const q = req.query.q;
    if (!q) {
        return res.status(400).send({ err: "Query parameter q is required" });
    }

    const cacheKey = `products:search:${q}`;
    try {
        const cached = parseCachedValue(await safeGet(cacheKey));
        if (cached !== null && cached !== undefined) {
            return res.status(200).send(cached);
        }

        const items = await Product.find({ title: { $regex: q, $options: "i" } });
        await safeSet(cacheKey, JSON.stringify(items), CACHE_TTL.productSearch);
        res.status(200).send(items);
    } catch (error) {
        console.error(error);
        res.status(401).send({ err: "Something went wrong" });
    }
});


/**
 * @swagger
 * /api/product/{productId}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product by its ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       401:
 *         description: Error retrieving product
 */
productRouter.get("/product/:productId", async (req, res) => {
    const productId = normalizeProductId(req.params.productId);
    const cacheKey = `product:${productId}`;

    try {
        const cached = parseCachedValue(await safeGet(cacheKey));
        if (cached !== null && cached !== undefined) {
            return res.status(200).send(cached);
        }

        const only = await Product.findOne({ _id: productId });
        if (only) {
            await safeSet(cacheKey, JSON.stringify(only), CACHE_TTL.productDetail);
        }
        return res.status(200).send(only);
    } catch (error) {
        console.error(error);
        res.status(401).send({ err: "Something went wrong" });
    }
});

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product to the catalog
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categories:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product created successfully
 *       401:
 *         description: Product already exists or error
 */
productRouter.post("/product", async (req, res) => {
    const payload = req.body;
    const { title } = req.body;
    const existing = await Product.findOne({ title });
    if (existing) {
        return res.status(401).send({ message: "Product already present" });
    }

    try {
        const newProduct = new Product(payload);
        await newProduct.save();
        await clearProductCache();
        res.status(200).send({ message: "Product created successfully" });
    } catch (error) {
        console.error(error);
        res.status(401).send({ err: "Something went wrong" });
    }
});

/**
 * @swagger
 * /api/product/{productId}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Product not found
 */
productRouter.delete("/product/:productId", async (req, res) => {
    const productId = normalizeProductId(req.params.productId);
    const existing = await Product.findOne({ _id: productId });
    if (!existing) {
        return res.status(401).send({ message: "Product already deleted" });
    }

    try {
        await Product.findOneAndDelete({ _id: productId });
        await clearProductCache(productId);
        res.status(200).send({ message: "Product item deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(400).send({ err: "Something went wrong" });
    }
});

/**
 * @swagger
 * /api/product/{productId}:
 *   patch:
 *     summary: Update a product
 *     description: Update product details by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Error updating product
 */
productRouter.patch("/product/:productId", async (req, res) => {
    const productId = normalizeProductId(req.params.productId);
    const payload = req.body;
    try {
        await Product.findByIdAndUpdate(productId, payload);
        await clearProductCache(productId);
        res.status(200).send({ message: "Product item updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(401).send({ err: "Something went wrong" });
    }
});




module.exports = productRouter;