# Backend Dockerfile for Render.com deployment

# Build stage
FROM node:20-slim as builder

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY backend/src ./src
COPY backend/server.js .

# Runtime stage
FROM node:20-slim

WORKDIR /app

# Copy from builder
COPY --from=builder /app .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]
