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

## 4. SSL от Timeweb

Сейчас DNS `web.netmessenger.su` → `185.200.241.9` (напрямую на VPS).  
SSL в панели Timeweb **сам по себе не открывает порт 443** на сервере — его нужно «подключить» одним из способов ниже.

### Вариант A — сертификат Timeweb на VPS (DNS уже на VPS)

1. Timeweb Cloud → **SSL-сертификаты** → ваш сертификат для `web.netmessenger.su`
2. Скопируйте **CRT** и **Private KEY** на сервер:

```bash
sudo nano /etc/ssl/web.netmessenger.su.crt
sudo nano /etc/ssl/web.netmessenger.su.key
```

3. Установите в nginx:

```bash
cd ~/app-we/NETMessenger-App
git pull
sudo bash deploy/install-timeweb-ssl.sh
```

### Вариант B — SSL через балансировщик Timeweb

1. Timeweb → **Балансировщики** → SSL для `web.netmessenger.su`
2. Backend: ваш VPS, порт **80**
3. DNS: A-запись `web.netmessenger.su` → **IP балансировщика** (не IP VPS)

### Вариант C — CDN для статики (у вас уже есть)

`4opwz855t4.cdn.twcstorage.ru` — это CDN **для файлов**, не для всего сайта.  
Он не заменяет HTTPS для `web.netmessenger.su`.

---

## 5. Timeweb Cloud CDN (статика)

В `.env` / `/etc/netmessenger/web.env`:

```
CDN_BASE=https://4opwz855t4.cdn.twcstorage.ru
```

Опционально в `/etc/netmessenger/web.env`:

```
CDN_BASE=https://4opwz855t4.cdn.twcstorage.ru
```

После изменения:

```bash
sudo systemctl restart netmessenger-web
```

---

## 6. Проверка

```bash
curl -I http://127.0.0.1/home
sudo systemctl status netmessenger-web
sudo nginx -t
```

В браузере: **http://web.netmessenger.su/home** (пока не настроен HTTPS)

Если `https://` не открывается — см. раздел **4. SSL от Timeweb**.

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
