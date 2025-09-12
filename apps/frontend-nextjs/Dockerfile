# Stage 1: Build the Next.js application
FROM node:24.7.0-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
RUN yarn build

# Stage 2: Create a lightweight runtime image
FROM node:24.7.0-alpine AS runner

# Set the working directory
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production

# Copy only the necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["yarn", "start"]