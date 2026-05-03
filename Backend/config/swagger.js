const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

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
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: 'Development Server',
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
