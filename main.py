import os

from flask import Flask, render_template, request, send_from_directory

app = Flask(__name__, template_folder="templates", static_folder="static")

# CDN Timeweb кэширует ответы origin, если origin отдаёт Cache-Control.
# Пример: https://4opwz855t4.cdn.twcstorage.ru/static/ui-prefs.js
CDN_BASE = os.environ.get("CDN_BASE", "")


@app.context_processor
def inject_cdn():
    return {"cdn_base": CDN_BASE.rstrip("/")}


@app.after_request
def set_cache_headers(response):
    path = request.path

    if path.startswith("/static/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif path == "/sw.js":
        response.headers["Cache-Control"] = "no-cache"
        response.headers["Service-Worker-Allowed"] = "/"
    elif path in ("/manifest.webmanifest",):
        response.headers["Cache-Control"] = "public, max-age=86400"
    elif path in ("/home", "/settings", "/"):
        response.headers["Cache-Control"] = "no-cache, must-revalidate"
    elif path.endswith((".png", ".jpg", ".jpeg", ".webp", ".ico", ".svg", ".woff2")):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"

    return response


@app.route("/sw.js")
def service_worker():
    return send_from_directory("static", "sw.js", mimetype="application/javascript")


@app.route("/manifest.webmanifest")
def manifest():
    return send_from_directory(
        "static",
        "manifest.webmanifest",
        mimetype="application/manifest+json",
    )


@app.route("/")
def login():
    return render_template("start.html")


@app.route("/home")
def home():
    return render_template("home.html")


@app.route("/settings")
def settings():
    return render_template("settings.html")


if __name__ == "__main__":
    app.run(debug=True, port=4912)
