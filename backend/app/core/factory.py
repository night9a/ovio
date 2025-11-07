from flask import Flask
from flask_cors import CORS

def create_app(config_object="config.default"):
    app = Flask(__name__)
    app.config.from_object(config_object)
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    from app.modules.hello.routes import bp as hello_bp
    app.register_blueprint(hello_bp)
    
    return app
