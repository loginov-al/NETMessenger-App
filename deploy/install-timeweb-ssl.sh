#!/bin/bash
# Установка SSL Timeweb на nginx (когда DNS указывает на VPS).
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "Запустите: sudo bash deploy/install-timeweb-ssl.sh"
  exit 1
fi

CRT="/etc/ssl/web.netmessenger.su.crt"
KEY="/etc/ssl/web.netmessenger.su.key"
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$CRT" ] || [ ! -f "$KEY" ]; then
  echo "Не найдены файлы сертификата Timeweb:"
  echo "  $CRT"
  echo "  $KEY"
  echo ""
  echo "1. Timeweb Cloud → SSL-сертификаты → web.netmessenger.su"
  echo "2. Скопируйте CRT и Private KEY в файлы на сервере:"
  echo "   sudo nano $CRT"
  echo "   sudo nano $KEY"
  echo "3. Запустите скрипт снова"
  exit 1
fi

chmod 644 "$CRT"
chmod 600 "$KEY"

cp "$SRC_DIR/deploy/nginx/web.netmessenger.su.ssl.conf" /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/web.netmessenger.su.ssl.conf /etc/nginx/sites-enabled/

nginx -t
systemctl reload nginx

echo ""
echo "Готово: https://web.netmessenger.su"
echo "Порт 80 оставлен для CDN/балансировщика (origin)."
