# =============================================================================
# JobSeek Chrome Extension - Multi-Stage Build
# Optimized Docker build for Chrome extension development and packaging
# =============================================================================

# =============================================================================
# Stage 1: Dependencies
# Install only production dependencies for caching
# =============================================================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# =============================================================================
# Stage 2: Builder
# Build the extension for production
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the extension
RUN npm run build

# Remove source maps for production
RUN find dist -name "*.map" -type f -delete

# =============================================================================
# Stage 3: Production
# Serve built extension files with nginx
# =============================================================================
FROM nginx:1.25-alpine AS production

# Install runtime dependencies
RUN apk upgrade --no-cache && \
    apk add --no-cache curl

# Copy built extension files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf 2>/dev/null || true

# Create non-root user
RUN adduser -D -u 1001 nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

USER nginx-user

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/manifest.json || exit 1

CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Stage 4: Development
# Run Vite dev server with hot reload
# =============================================================================
FROM node:20-alpine AS development

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci && \
    npm cache clean --force

# Copy source code (volumes will override in docker-compose)
COPY . .

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /bin/sh -D nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "run", "dev"]
