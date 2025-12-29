#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-8000}"
VITE_PORT="${VITE_PORT:-5173}"

if [[ ! -f .env ]]; then
  echo "[dev] Missing .env. Copy .env.example to .env and set DB credentials first." >&2
  exit 1
fi

backend_cmd=(php artisan serve --host="$APP_HOST" --port="$APP_PORT")
frontend_cmd=(npm run dev -- --host --port "$VITE_PORT")

printf "[dev] Starting backend: %s\n" "${backend_cmd[*]}"
"${backend_cmd[@]}" &
BACK_PID=$!

printf "[dev] Starting frontend: %s\n" "${frontend_cmd[*]}"
"${frontend_cmd[@]}" &
FRONT_PID=$!

cleanup() {
  echo "\n[dev] Shutting down..." >&2
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait
