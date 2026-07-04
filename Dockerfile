# Multi-stage build for Financial Reporting Engine
# Stage 1: Build web assets
FROM node:22-alpine AS web-builder
WORKDIR /app
COPY package*.json ./
COPY apps/web ./apps/web
RUN npm ci
RUN npm run build -w apps/web

# Stage 2: Build final image with API and web assets
FROM node:22-alpine
WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY apps/api ./apps/api

# Install production dependencies only for API
RUN npm ci --omit=dev --workspace=apps/api

# Copy built web assets
COPY --from=web-builder /app/apps/web/dist ./apps/web/dist

# Create directories for runtime data
RUN mkdir -p apps/api/uploads apps/api/generated apps/api/storage

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S app -u 1001
USER app

# Expose port
EXPOSE 4000

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start API server
CMD ["npm", "start", "-w", "apps/api"]
