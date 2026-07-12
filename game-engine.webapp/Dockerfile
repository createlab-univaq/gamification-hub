# ==========================
# Build stage
# ==========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# No live API is reachable during an isolated image build — skip the OpenAPI
# type-codegen step and build against the already-committed src/api/types/.
ENV SKIP_API_CODEGEN=true
# Set directly rather than relying on a .env file: .env is gitignored (not present
# in a git-checkout build context), and this value never varies by environment —
# nginx always proxies /api internally, so a relative path is always correct.
ENV VITE_GAMIFICATION_API_BASE_URL=/api/v1
RUN npm run build

# ==========================
# Runtime stage
# ==========================
FROM nginx:1.27-alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Internal compose network address of the API service; override via environment if split out.
ENV API_UPSTREAM=http://gamification-api:8080
# Restrict envsubst to this one variable so nginx's own $-prefixed directives are never touched.
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$

EXPOSE 5173
