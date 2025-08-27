FROM node:22-bullseye-slim AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
COPY packages ./packages/
COPY gulpfile.ts tsconfig.json ./

RUN npm install -g gulp-cli
RUN yarn install
RUN yarn install:packages


RUN yarn build


FROM node:22-bullseye-slim

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /usr/src/app



COPY --from=builder /usr/src/app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder /usr/src/app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /usr/src/app/packages/backend/public ./packages/backend/public
COPY --from=builder /usr/src/app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./


EXPOSE 3000

CMD ["yarn", "start:prod"]