ARG NODE_VERSION=18.18.2

FROM node:${NODE_VERSION}-slim as base

RUN apt-get update && apt-get install -y \
  openssl \
  libssl-dev

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /app

# Build
FROM base as build

COPY package*.json ./

RUN npm install --production=false

COPY . .

COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build
RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /app /app

# Применение миграций при запуске контейнера
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]