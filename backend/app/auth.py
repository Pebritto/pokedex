from functools import wraps
from typing import Callable, Dict, Optional

from flask import Blueprint, current_app, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from .extensions import db
from .models import Usuario

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _get_serializer() -> URLSafeTimedSerializer:
    secret_key = current_app.config["SECRET_KEY"]
    return URLSafeTimedSerializer(secret_key, salt="auth-token")


def generate_token(usuario: Usuario) -> str:
    serializer = _get_serializer()
    return serializer.dumps({"usuario_id": usuario.id})


def decode_token(token: str, max_age: int = 60 * 60 * 8) -> Optional[Dict]:
    serializer = _get_serializer()
    try:
        return serializer.loads(token, max_age=max_age)
    except SignatureExpired:
        return None
    except BadSignature:
        return None


def login_required(func: Callable):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token ausente"}), 401

        token = auth_header.split(" ", 1)[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        usuario = Usuario.query.get(payload.get("usuario_id"))
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        kwargs["usuario_autenticado"] = usuario
        return func(*args, **kwargs)

    return wrapper


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not usuario.check_password(senha):
        return jsonify({"error": "Credenciais inválidas"}), 401

    token = generate_token(usuario)
    return jsonify({"token": token, "usuario": {"id": usuario.id, "nome": usuario.nome, "email": usuario.email}})

