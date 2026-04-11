# 阶段 1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 阶段 2: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建 server 模式
RUN npm run build:server

# 阶段 3: 运行
FROM node:20-alpine AS runner
WORKDIR /app

# 清理 apk 缓存以减少镜像体积
RUN rm -rf /var/cache/apk/* /tmp/*

ENV NODE_ENV=production
ENV PORT=3000
ENV COMPASS_RUNTIME_MODE=server

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public/config.yaml ./public/config.yaml
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# 启动 Hono 服务器
CMD ["node", "dist/server/index.mjs"]
