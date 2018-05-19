FROM node:6

WORKDIR /service
COPY ./ /service

RUN npm install
RUN npm start

