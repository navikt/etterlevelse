# Stage 1: Build the Next.js application
FROM node:26.3.1-alpine AS builder

WORKDIR /usr/app

ENV NODE_ENV=production
ENV HUSKY=0

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn/releases ./.yarn/releases
COPY patches ./patches

# Install dependencies
RUN node .yarn/releases/yarn-4.16.0.cjs --version && node .yarn/releases/yarn-4.16.0.cjs install --immutable

COPY . .

RUN node .yarn/releases/yarn-4.16.0.cjs run build

CMD ["node", ".yarn/releases/yarn-4.16.0.cjs", "run", "start"]