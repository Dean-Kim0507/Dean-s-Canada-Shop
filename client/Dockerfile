FROM node:alpine as builder
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_SANDBOX
WORKDIR /deanshop
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY . .
ENV REACT_APP_GOOGLE_CLIENT_ID=${REACT_APP_GOOGLE_CLIENT_ID}
ENV REACT_APP_SANDBOX=${REACT_APP_SANDBOX}
RUN npm run build

FROM nginx

EXPOSE 3000 

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /deanshop/build  /usr/share/nginx/html
