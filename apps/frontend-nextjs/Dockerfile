# Stage 1: Build the Next.js application
FROM node:25.4.0-alpine AS builder

WORKDIR /usr/app

COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

RUN yarn run build

CMD yarn run start