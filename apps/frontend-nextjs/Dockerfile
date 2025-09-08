FROM node:20-alpine

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]