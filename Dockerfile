FROM node:18.12.1
WORKDIR /usr/src/app
COPY package*.json .
COPY package_symlinks.js .
RUN yarn install
COPY . .