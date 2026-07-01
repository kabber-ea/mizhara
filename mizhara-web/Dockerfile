FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=""
ARG VITE_INSTAGRAM_URL=""
ARG VITE_WHATSAPP_NUMBER=""
ARG VITE_SUPPORT_EMAIL=""

ENV VITE_API_URL=$VITE_API_URL \
    VITE_INSTAGRAM_URL=$VITE_INSTAGRAM_URL \
    VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER \
    VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL

RUN npm run build

FROM node:20-alpine

RUN npm install -g serve@14.2.6 && npm cache clean --force

WORKDIR /app

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production PORT=5000

EXPOSE 5000

CMD ["sh", "-c", "exec serve -s dist -l tcp://0.0.0.0:${PORT}"]
