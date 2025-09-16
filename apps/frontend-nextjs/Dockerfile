# Stage 1: Build the Next.js application
FROM node:24.8.0-alpine AS builder

WORKDIR /usr/app

COPY package.json yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

RUN npm run build

CMD npm run start