# Stage 1: Build the Next.js application
FROM node:25.9.0-alpine AS builder

WORKDIR /usr/app

RUN npm install -g corepack --force && corepack enable

COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

RUN yarn run pre-commit:deps-check
RUN yarn run build

CMD ["yarn", "run", "start"] 