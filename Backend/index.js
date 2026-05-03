require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const connect = require("./config/db");
const swaggerSpecs = require("./config/swagger");
const userRoute = require("./features/user/user.route");
const productRouter = require("./features/product/product.route");
const cartRouter = require("./features/cart/cart.route");
const orderRouter = require("./features/order/order.route");


const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cors());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { 
  customCss: '.swagger-ui { font-family: Arial, sans-serif; }',
  customSiteTitle: 'KFC API Documentation'
}));

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

app.use("/auth", userRoute);
app.use("/api",productRouter);
app.use("/api",cartRouter);
app.use("/api",orderRouter);



app.listen(PORT, async () => {
    await connect();
    console.log(`Listening at http://localhost:${PORT}`);
})
