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

// CORS Configuration
// For development: Allow all origins (works with LoadBalancer/Ingress/localhost)
// For production: Set ALLOWED_ORIGINS env variable with comma-separated list
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : []; // Empty = allow all in dev

    // If ALLOWED_ORIGINS not set, allow all (development mode)
    if (allowedOrigins.length === 0) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin) || !origin) {
      // !origin for requests without Origin header (curl, mobile apps, etc)
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
    console.log(`CORS Mode: ${process.env.ALLOWED_ORIGINS ? 'Restricted' : 'Allow All (Development)'}`);
})
