"""Top-level application entrypoint for backend."""
from app import create_app
from app.extensions import socketio

app = create_app()


if __name__ == "__main__":
    # When running locally start the socketio server for realtime
    socketio.run(app, host="0.0.0.0", port=5000)
