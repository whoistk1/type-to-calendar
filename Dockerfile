# Multi-stage Dockerfile for type-to-calendar (Vite + React)

# --- Stage 1: Build the static application ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies based on lockfile for deterministic builds
COPY package*.json ./
RUN npm ci

# Copy project source code
COPY . .

# Build arguments for Vite client environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build production assets (emits to /app/dist)
RUN npm run build

# --- Stage 2: Serve using lightweight Nginx ---
FROM nginx:alpine AS runner

# Use custom Nginx configuration optimized for SPAs
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
