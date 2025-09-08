FROM node:20-alpine3.20

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]