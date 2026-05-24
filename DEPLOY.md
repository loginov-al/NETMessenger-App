# Деплой NETMessenger Web

Домен: **web.netmessenger.su**  
Сервер: Ubuntu 20.04, Timeweb Cloud (SSL на CDN)

---

## 1. Подготовка сервера (один раз)

```bash
sudo apt update
sudo apt install -y git nginx python3-venv python3-pip
```

---

## 2. Скачать код

```bash
mkdir -p ~/app-we && cd ~/app-we
git clone https://github.com/loginov-al/NETMessenger-App.git
cd NETMessenger-App
```

---

## 3. Установить и запустить

```bash
sudo bash deploy/setup.sh
```

Скрипт сам:
- скопирует файлы в `/var/www/netmessenger-web`
- создаст Python-окружение и установит зависимости
- настроит nginx (порт **80**, без certbot)
- запустит сервис `netmessenger-web`

---

## 4. Timeweb Cloud CDN

В панели Timeweb → CDN → источник (origin):

```
http://185.200.241.9
```

или

```
http://web.netmessenger.su
```

SSL включается **в Timeweb**, на VPS только HTTP.

Опционально в `/etc/netmessenger/web.env`:

```
CDN_BASE=https://4opwz855t4.cdn.twcstorage.ru
```

После изменения:

```bash
sudo systemctl restart netmessenger-web
```

---

## 5. Проверка

```bash
curl -I http://127.0.0.1/home
sudo systemctl status netmessenger-web
sudo nginx -t
```

В браузере: **https://web.netmessenger.su**

---

## Обновление после изменений в коде

```bash
cd ~/app-we/NETMessenger-App
git pull
sudo bash deploy/setup.sh
```

---

## Полезные команды

| Действие | Команда |
|----------|---------|
| Логи приложения | `sudo journalctl -u netmessenger-web -f` |
| Перезапуск | `sudo systemctl restart netmessenger-web` |
| Логи nginx | `sudo tail -f /var/log/nginx/web.netmessenger.su.error.log` |

---

## Локальная разработка

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

Открыть: http://127.0.0.1:4912/home
