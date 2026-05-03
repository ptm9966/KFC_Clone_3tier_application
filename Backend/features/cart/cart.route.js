const { Router } = require("express");
const Cart = require("./cart.model");
const cartRouter = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get all cart items
 *     description: Retrieve all items in the cart
 *     tags:
 *       - Cart
 *     responses:
 *       200:
 *         description: List of cart items
 *       401:
 *         description: Error retrieving cart
 */
cartRouter.get("/cart", async (req, res) => {
    try {
        let cart = await Cart.find();
        return res.status(200).send(cart);
    } catch (error) {
        console.log(error)
        res.status(401).send({ "err": "Somthing went wrong" })
    }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the shopping cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       401:
 *         description: Item already in cart or error
 */
cartRouter.post("/cart", async (req, res) => {
    const payload = req.body;
    const { _id } = req.body;
    const existing = await Cart.findById({ _id:_id });
    if (existing) {
        res.status(401).send({ message: "Product allredy persent in cart" })
    } else {
        try {
            const new_cart = new Cart(payload)
            await new_cart.save()
            res.status(200).send({ message: "Cart added succefully" })
        } catch (error) {
            console.log(error)
            res.status(401).send({ "err": "Somthing went wrong" })
        }
    }
});

/**
 * @swagger
 * /api/cart/{cartId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Delete an item from the shopping cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: string
 *         required: true
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Cart item deleted successfully
 *       401:
 *         description: Cart item not found
 */
cartRouter.delete("/cart/:cartId", async (req, res) => {
    const cartId = req.params.cartId.split(":").map(String)[1]
    console.log(cartId)
    const existing = await Cart.findOne({_id:cartId})
    if(!existing){
        res.status(401).send({ message: "Product allredy deleted from cart" })
    }else{
        try {
            await Cart.findOneAndDelete({"_id":cartId })
            res.status(200).send({ message: "Cart item deleted successfully" })
        } catch (error) {
            console.log(error)
            res.status(400).send({ "err": "Somthing went wrong" })
        }
    }
});

/**
 * @swagger
 * /api/cart/{cartId}:
 *   patch:
 *     summary: Update cart item
 *     description: Update quantity or details of a cart item
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: string
 *         required: true
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       401:
 *         description: Error updating cart item
 */
cartRouter.patch("/cart/:cartId", async (req, res) => {
    const cartId = req.params.cartId.split(":").map(String)[1]
    const payload = req.body
    // const note = await NoteModel.findOne({_id:noteID})
    try {
        await Cart.findOneAndUpdate({ _id: cartId }, payload)
        res.status(200).send({ message: "Cart item updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(401).send({ "err": "Somthing went wrong" })
    }
});

module.exports = cartRouter;