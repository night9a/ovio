from flask import Flask, render_template
import json

LOG_FILE = "../runtime/logs/app.log"
METRICS_FILE = "../runtime/metrics.json"

app = Flask(__name__)

@app.route("/")
def dashboard():
    with open(METRICS_FILE) as f:
        metrics = json.load(f)

    with open(LOG_FILE) as f:
        logs = f.readlines()[-200:]  # tail

    return render_template(
        "console.html",
        metrics=metrics,
        logs=logs,
    )

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=9000)

