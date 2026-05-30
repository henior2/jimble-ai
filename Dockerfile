FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production

FROM base AS release
ENV NODE_ENV=production

COPY --from=install /app/node_modules ./node_modules

COPY src ./src
COPY package.json tsconfig.json ./

CMD [ "bun", "run", "start" ]
