#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/learning-programming-website}"
BACKEND_DIR="$APP_DIR/backend"
PISTON_DIR="$APP_DIR/piston"
PM2_APP_NAME="${PM2_APP_NAME:-learning-platform-backend}"

echo "[1/8] Pull latest code"
cd "$APP_DIR"
git pull

echo "[2/8] Install backend dependencies"
cd "$BACKEND_DIR"
npm install

echo "[3/8] Verify backend .env"
if [ ! -f ".env" ]; then
  echo "Missing $BACKEND_DIR/.env"
  echo "Copy backend/.env.example to backend/.env and fill real values first."
  exit 1
fi

echo "[4/8] Start or reload backend with PM2"
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$PM2_APP_NAME" --update-env
else
  pm2 start server.js --name "$PM2_APP_NAME"
fi

echo "[5/8] Save PM2 process list"
pm2 save

echo "[6/8] Start or refresh Piston"
cd "$PISTON_DIR"
docker compose up -d

echo "[7/8] Health checks"
curl -fsS http://127.0.0.1:5000/ >/dev/null && echo "Backend OK"
curl -fsS http://127.0.0.1:2000/api/v2/runtimes >/dev/null && echo "Piston OK"

echo "[8/8] Done"
echo "Remember to:"
echo "- install Piston runtimes if this is first deploy"
echo "- reload nginx if you changed deploy/nginx.conf"
echo "- redeploy frontend on Vercel if frontend code/env changed"
