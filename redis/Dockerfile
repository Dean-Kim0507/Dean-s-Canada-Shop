FROM redis:alpine
COPY ./redis.conf /redis.conf 
EXPOSE 6379/tcp
CMD [ "redis-server", "/redis.conf" ]