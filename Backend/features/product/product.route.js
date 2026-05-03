const { Router } = require("express");
const Product = require("./product.model");
const productRouter = Router();

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
    let categories = req.query.categories;
    if (categories) {
        try {
            // console.log(categories)
            let items = await Product.find({ "categories": categories });
            // let items = await Product.find({"title":{ "$regex": categories, "$options": "i" }});

            res.status(200).send(items);
        } catch (error) {
            console.log(error)
            res.status(401).send({ "err": "Somthing went wrong" })
        }
    } else {
        let items = await Product.find();
        // let items = await Product.find({"title":{ "$regex": categories, "$options": "i" }});

        res.status(200).send(items);
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
    let q = req.query.q;
    try {
        console.log(q)
        // let items = await Product.find({"categories":categories});
        let items = await Product.find({ "title": { "$regex": q, "$options": "i" } });

        res.status(200).send(items);
    } catch (error) {
        console.log(error)
        res.status(401).send({ "err": "Somthing went wrong" })
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
    let productId = req.params.productId.split(":").map(String)[1];
    try {

        let only = await Product.findOne({ _id: productId });
        return res.status(200).send(only);
    } catch (error) {
        console.log(error)
        res.status(401).send({ "err": "Somthing went wrong" })
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
        res.status(401).send({ message: "Product allredy persent in cart" })
    } else {
        try {
            const new_cart = new Product(payload)
            await new_cart.save()
            res.status(200).send({ message: "Product created succefully" })
        } catch (error) {
            console.log(error)
            res.status(401).send({ "err": "Somthing went wrong" })
        }
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
    const productId = req.params.productId.split(":").map(String)[1]
    console.log(productId)
    const existing = await Product.findOne({ _id: productId })
    if (!existing) {
        res.status(401).send({ message: "Product allredy deleted from product" })
    } else {
        try {
            await Product.findOneAndDelete({ "_id": productId })
            res.status(200).send({ message: "Product item deleted successfully" })
        } catch (error) {
            console.log(error)
            res.status(400).send({ "err": "Somthing went wrong" })
        }
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
    const productId = req.params.productId.split(":").map(String)[1]
    const payload = req.body
    // const note = await NoteModel.findOne({_id:noteID})
    try {
        await Product.findByIdAndUpdate({ _id: productId }, payload)
        res.status(200).send({ message: "Product item updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(401).send({ "err": "Somthing went wrong" })
    }
});




module.exports = productRouter;