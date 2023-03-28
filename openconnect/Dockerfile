FROM alpine:latest

RUN mkdir /app

WORKDIR /app

RUN apk --update add openconnect
RUN apk --update add dnsmasq

COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x entrypoint.sh

CMD [ "sh", "entrypoint.sh" ]


