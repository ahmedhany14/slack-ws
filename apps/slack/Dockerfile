FROM node:18-slim as dev

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm install -g pnpm

RUN pnpm install

COPY apps/slack apps/slack
COPY libs libs

RUN pnpm run build slack

FROM node:18-slim as prod


ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod

COPY --from=dev /app/dist ./dist

CMD ["node", "dist/apps/slack/main"]