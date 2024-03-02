FROM node:18-alpine3.16 AS builder
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.25.0-alpine
COPY --from=builder /app/build /usr/share/nginx/html

