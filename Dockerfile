FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV COMPASS_BUILD_TARGET=server

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/src/config.yaml ./src/config.yaml
COPY --from=builder /app/src/server/env.js ./src/server/env.js
COPY --from=builder /app/scripts/server-entry.js ./scripts/server-entry.js

EXPOSE 3000

CMD ["node", "scripts/server-entry.js"]
