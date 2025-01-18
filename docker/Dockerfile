FROM node:18-alpine3.15

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY package.json yarn.lock ./
COPY tsconfig* ./
# COPY nest-cli.json ./
COPY src/ src/
COPY docker/docker-entrypoint.sh docker-entrypoint.sh

RUN apk add --no-cache python3 make g++ zip


RUN apk add git
RUN yarn install

RUN yarn build
EXPOSE ${SERVICE_PORT}

ENTRYPOINT ["sh", "/usr/src/app/docker-entrypoint.sh"] 