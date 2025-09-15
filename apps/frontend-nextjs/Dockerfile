# Stage 1: Build the Next.js application
FROM node:24.7.0-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

COPY .next/standalone /app/
COPY public /app/public/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]