# syntax=docker/dockerfile:1
# Imagem do site: build Vite e runtime nginx-unprivileged servindo os estáticos.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

COPY --chown=nginx:nginx nginx/default.conf         /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --spider -q http://127.0.0.1:8080/healthz || exit 1
