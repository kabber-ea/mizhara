#!/bin/sh
set -e

if [ "$WAIT_FOR_MONGO" = "true" ]; then
  until nc -z "${MONGO_HOST:-mongo}" "${MONGO_PORT:-27017}"; do sleep 2; done
fi

seed_args=""
[ "$SEED_IF_EMPTY" = "true" ] && seed_args="$seed_args --if-empty"
[ "$SEED_SKIP_IMAGES" != "false" ] && seed_args="$seed_args --skip-images"

if [ "$SEED_IF_EMPTY" = "true" ]; then
  ./mizhara-seed $seed_args || true
elif [ "$SEED_ON_START" = "true" ]; then
  ./mizhara-seed $seed_args
fi

exec ./mizhara-api
