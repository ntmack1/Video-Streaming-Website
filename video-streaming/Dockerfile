FROM node:22.14.0

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY ./src ./src

CMD npm start