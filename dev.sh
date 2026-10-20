#!/usr/bin/env bash
# Starts the backend and the website together. Ctrl+C stops both.
cd "$(dirname "$0")"
trap 'kill 0' EXIT
[ -d frontend/node_modules ] || npm install --prefix frontend
(cd backend && uv run main.py) &
npm run dev --prefix frontend
