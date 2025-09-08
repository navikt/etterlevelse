FROM node:24.7.0-alpine

WORKDIR /

COPY . .
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]