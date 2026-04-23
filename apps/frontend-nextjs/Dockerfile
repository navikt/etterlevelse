# Stage 1: Build the Next.js application
FROM node:25.9.0-alpine AS builder

WORKDIR /usr/app

COPY package.json .
COPY yarn.lock .

# Install dependencies
ENV YARN_VERSION=4.14.1

COPY . .

ENV NODE_ENV=production

RUN yarn run build

CMD ["yarn", "run", "start"] 