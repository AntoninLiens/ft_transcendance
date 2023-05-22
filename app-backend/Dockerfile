FROM node:19-alpine

RUN npm install -g npm@9.6.7

WORKDIR /app-backend

COPY .env .
COPY package.json .
COPY package-lock.json .

COPY . .

RUN npm i

CMD [ "npm", "run", "start" ]