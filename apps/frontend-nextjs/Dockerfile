# Stage 1: Build Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

RUN yarn install
RUN yarn build

# Stage 2: Production Node.js server
FROM node:20-alpine AS server

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["yarn", "start"]

# Stage 3: Nginx reverse proxy
FROM nginx:alpine AS nginx

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose Nginx port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]