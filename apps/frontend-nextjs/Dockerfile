FROM node:20-alpine3.20

WORKDIR /

COPY . .
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]