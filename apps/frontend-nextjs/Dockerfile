FROM node:20-alpine3.20

COPY . .
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]