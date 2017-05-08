FROM node:boron-alpine

RUN mkdir -p /usr/src/server

WORKDIR /usr/src/server

COPY index.js /usr/src/server
COPY package.json /usr/src/server

RUN npm config set loglevel warn
RUN npm install

EXPOSE 5000

CMD ["node", "index"]