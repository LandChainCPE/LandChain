FROM node:18 as builder
WORKDIR /app
COPY frontend ./
RUN npm install --force
RUN npm run build

FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .