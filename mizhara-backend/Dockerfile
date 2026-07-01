FROM golang:1.22-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o mizhara-api . \
 && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o mizhara-seed ./scripts/seed/cmd

FROM alpine:3.20

RUN apk add --no-cache ca-certificates netcat-openbsd wget

WORKDIR /app

COPY --from=build /app/mizhara-api /app/mizhara-seed ./
COPY scripts/seed/data ./scripts/seed/data
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh mizhara-api mizhara-seed

ENV GO_ENV=production \
    PORT=3000 \
    SEED_IF_EMPTY=true \
    SEED_SKIP_IMAGES=true

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
