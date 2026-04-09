FROM node:22.18.0 AS base
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
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json yarn.lock ./
EXPOSE 4000
EXPOSE 80
RUN yarn prisma generate
CMD ["sh", "-c", "until yarn prisma migrate deploy; do echo 'Database not ready, retrying in 3s...'; sleep 3; done; yarn start:prod"]
