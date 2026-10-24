# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspace frontend --ignore-scripts

COPY frontend frontend

ARG VITE_API_URL=/api
ARG VITE_DEMO_MODE=true
ENV VITE_API_URL=$VITE_API_URL \
    VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1/healthz || exit 1
