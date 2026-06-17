require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
// Prometheus client for custom metrics
const client = require('prom-client');
const connect = require("./config/db");
const swaggerSpecs = require("./config/swagger");
const userRoute = require("./features/user/user.route");
const productRouter = require("./features/product/product.route");
const cartRouter = require("./features/cart/cart.route");
const orderRouter = require("./features/order/order.route");


const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const register = client.register;

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const totalRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status']
});

const errorCount = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of error responses',
  labelNames: ['route', 'error_type', 'status']
});

// Middleware to observe requests and response times
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route && req.route.path ? req.route.path : req.path;
    totalRequests.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route, status: res.statusCode });

    if (res.statusCode >= 500) {
      errorCount.inc({ route, error_type: 'server', status: res.statusCode });
    } else if (res.statusCode >= 400) {
      errorCount.inc({ route, error_type: 'client', status: res.statusCode });
    }
  });
  next();
});

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

// Expose metrics in the Prometheus text format.
app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});

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

// Error-handling middleware to count uncaught errors
app.use((err, req, res, next) => {
  const route = req.route && req.route.path ? req.route.path : req.path;
  errorCount.inc({ route, error_type: 'uncaught', status: (res.statusCode || 500) });
  next(err);
});

app.listen(PORT, async () => {
    await connect();
    console.log(`Listening at http://localhost:${PORT}`);
    console.log(`CORS Mode: ${process.env.ALLOWED_ORIGINS ? 'Restricted' : 'Allow All (Development)'}`);
})
