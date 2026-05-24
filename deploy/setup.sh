#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "Запустите: sudo bash deploy/setup.sh"
  exit 1
fi

APP_DIR="/var/www/netmessenger-web"
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Пакеты..."
apt-get update -qq
apt-get install -y python3-venv python3-pip nginx rsync

echo "==> Копирование в $APP_DIR ..."
mkdir -p "$APP_DIR" /etc/netmessenger
rsync -av --delete \
  --exclude venv \
  --exclude .git \
  --exclude .playwright-mcp \
  --exclude __pycache__ \
  --exclude "*.pyc" \
  "$SRC_DIR/" "$APP_DIR/"

echo "==> Python..."
rm -rf "$APP_DIR/venv"
python3 -m venv "$APP_DIR/venv"
"$APP_DIR/venv/bin/pip" install -q --upgrade pip
"$APP_DIR/venv/bin/pip" install -q -r "$APP_DIR/requirements.txt"

echo "==> Конфиг..."
if [ ! -f /etc/netmessenger/web.env ]; then
  cp "$APP_DIR/deploy/web.env.example" /etc/netmessenger/web.env
fi

echo "==> Nginx..."
cp "$APP_DIR/deploy/nginx/web.netmessenger.su.conf" /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/web.netmessenger.su.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> Сервис..."
cp "$APP_DIR/deploy/netmessenger-web.service" /etc/systemd/system/
chown -R www-data:www-data "$APP_DIR"
systemctl daemon-reload
systemctl enable netmessenger-web
systemctl restart netmessenger-web

echo ""
echo "Готово!"
echo "  Проверка:  curl http://127.0.0.1/home"
echo "  HTTP:      http://web.netmessenger.su/home"
echo "  HTTPS:     sudo bash deploy/install-timeweb-ssl.sh"
echo "  Статус:    systemctl status netmessenger-web"
