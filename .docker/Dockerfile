FROM node:lts-slim as builder

WORKDIR /app

COPY . .

RUN npm i -g pnpm
RUN pnpm i
RUN pnpm run build

FROM nginx:latest as production

WORKDIR /usr/share/nginx/html

COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]