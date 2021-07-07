FROM node:alpine

WORKDIR /deanshop

COPY ./package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]