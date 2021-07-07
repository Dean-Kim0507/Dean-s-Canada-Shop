FROM node:alpine as builder
WORKDIR /deanshop
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx

EXPOSE 3000 

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /deanshop/build  /usr/share/nginx/html
