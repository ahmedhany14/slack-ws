FROM node:18-slim as dev

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm install -g pnpm

RUN pnpm install

COPY apps/realtime-ws apps/realtime-ws
COPY libs libs

RUN pnpm run build realtime-ws

FROM node:18-slim as prod

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}


WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod

COPY --from=dev /app/dist ./dist

CMD ["node", "dist/apps/realtime-ws/main"]