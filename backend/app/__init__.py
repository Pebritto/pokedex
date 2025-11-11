from flask import Flask

from .auth import auth_bp
from .config import get_config
from .extensions import init_extensions
from .routes import api_bp
from .seeds import register_seed_commands


def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())

    init_extensions(app)

    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)

    register_seed_commands(app)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app

