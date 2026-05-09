# Base
FROM node:23-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# Install deps
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Nhận biến env lúc build 
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Hard-code để tiện test với docker-compose
# ENV NEXT_PUBLIC_API_URL=http://backend:5000

RUN pnpm build

# Production (standalone)
FROM node:23-alpine AS runner
WORKDIR /app

# ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# standalone có sẵn server.js
CMD ["node", "server.js"]