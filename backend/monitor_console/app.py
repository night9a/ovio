from flask import Flask, render_template
import json
import os

# Get absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "..", "runtime", "logs", "app.log")
METRICS_FILE = os.path.join(BASE_DIR, "..", "runtime", "metrics.json")

app = Flask(__name__)

@app.route("/")
def dashboard():
    # Load metrics safely
    if os.path.exists(METRICS_FILE):
        with open(METRICS_FILE) as f:
            try:
                metrics = json.load(f)
            except json.JSONDecodeError:
                metrics = {}
    else:
        metrics = {}

    # Load last 200 log lines safely
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE) as f:
            logs = f.readlines()[-200:]

    return render_template(
        "console.html",
        metrics=metrics,
        logs=logs,
    )

if __name__ == "__main__":
    # Development server warning
    app.run(host="127.0.0.1", port=9000, debug=True)

