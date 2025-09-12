FROM node:24.7.0-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn build

# Stage 2: Serve the static application with Nginx
FROM nginx:stable-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf.template /etc/nginx/conf.d/default.conf

# Copy the static build output from the builder stage
COPY --from=builder /.next /usr/share/nginx/html

# Expose port 80
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]