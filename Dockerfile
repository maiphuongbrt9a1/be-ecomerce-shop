FROM node:22.18.0 AS base
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate
RUN yarn build

FROM base AS runner
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NODE_ENV=production
ENV TZ=Asia/Ho_Chi_Minh
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json yarn.lock ./
EXPOSE 4000
CMD ["sh", "-c", "until yarn prisma migrate deploy; do echo 'Database not ready, retrying in 3s...'; sleep 3; done; yarn start:prod"]
