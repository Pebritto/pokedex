from datetime import datetime

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB

from .extensions import bcrypt, db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(128), nullable=False)
    capturas = db.relationship("Captura", back_populates="usuario", cascade="all, delete-orphan")

    def set_password(self, senha: str) -> None:
        self.senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")

    def check_password(self, senha: str) -> bool:
        return bcrypt.check_password_hash(self.senha_hash, senha)


class Pokemon(db.Model):
    __tablename__ = "pokemons"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    tipos = db.Column(JSONB, nullable=False, default=list)
    imagem_url = db.Column(db.String(255))
    capturas = db.relationship("Captura", back_populates="pokemon", cascade="all, delete-orphan")


class Captura(db.Model):
    __tablename__ = "capturados"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    pokemon_id = db.Column(db.Integer, db.ForeignKey("pokemons.id", ondelete="CASCADE"), nullable=False)
    data_captura = db.Column(db.DateTime, nullable=False, server_default=func.now(), default=datetime.utcnow)

    usuario = db.relationship("Usuario", back_populates="capturas")
    pokemon = db.relationship("Pokemon", back_populates="capturas")

