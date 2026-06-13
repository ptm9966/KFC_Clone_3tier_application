const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Build swagger server URL:
// Priority:
// 1. SWAGGER_BASE_URL (full URL)
// 2. SWAGGER_HOST + SWAGGER_PORT (or PORT)
// 3. '/' (same origin — let browser use current host and port)
const swaggerUrl = (() => {
  if (process.env.SWAGGER_BASE_URL) return process.env.SWAGGER_BASE_URL;
  const host = process.env.SWAGGER_HOST;
  const port = process.env.SWAGGER_PORT || process.env.PORT || 8080;
  if (host) {
    const hasProto = /^https?:\/\//i.test(host);
    return (hasProto ? host : `http://${host}`) + `:${port}`;
  }
  return '/';
})();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KFC React App API',
      version: '1.0.0',
      description: 'API documentation for KFC React App Backend',
      contact: {
        name: 'API Support',
      },
    },
    // Server URL used by Swagger UI. See top of file for env options.
    servers: [
      {
        url: swaggerUrl,
        description: 'Server (SWAGGER_BASE_URL, or SWAGGER_HOST:SWAGGER_PORT, or same-origin)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, '../features/**/*.route.js')], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
