FROM node:20-alpine

WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV FRONTEND_URL=$FRONTEND_URL
ENV DB_URL=$DB_URL

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD npm run health || exit 1

# Start application
CMD ["npm", "start"]
