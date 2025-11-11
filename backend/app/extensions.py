from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()


def init_extensions(app):
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    origins = [origin.strip() for origin in app.config.get("CORS_ORIGINS", "").split(",") if origin.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}} if origins else {r"/api/*": {"origins": "*"}})

