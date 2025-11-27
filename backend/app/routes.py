from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from .auth import login_required
from .extensions import db
from .models import Captura, Pokemon, Usuario

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.get("/usuarios")
def listar_usuarios():
    usuarios = Usuario.query.all()
    return jsonify(
        [
            {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
            }
            for usuario in usuarios
        ]
    )


@api_bp.post("/usuarios")
def criar_usuario():
    data = request.get_json() or {}
    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")

    if not nome or not email or not senha:
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    usuario = Usuario(nome=nome.strip(), email=email.strip().lower())
    usuario.set_password(senha)

    db.session.add(usuario)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email já cadastrado"}), 409

    return (
        jsonify(
            {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
            }
        ),
        201,
    )


@api_bp.get("/pokemons")
def listar_pokemons():
    tipo = request.args.get("tipo")
    query = Pokemon.query
    if tipo:
        tipo_normalizado = tipo.strip().lower()
        query = query.filter(Pokemon.tipos.contains([tipo_normalizado]))

    pokemons = query.order_by(Pokemon.id).all()
    return jsonify(
        [
            {
                "id": pokemon.id,
                "nome": pokemon.nome,
                "tipos": pokemon.tipos,
                "imagem_url": pokemon.imagem_url,
            }
            for pokemon in pokemons
        ]
    )


@api_bp.post("/capturar")
@login_required
def capturar_pokemon(usuario_autenticado: Usuario):
    data = request.get_json() or {}
    pokemon_id = data.get("pokemon_id")
    data_captura_str = data.get("data_captura")

    if not pokemon_id:
        return jsonify({"error": "pokemon_id é obrigatório"}), 400

    pokemon = Pokemon.query.get(pokemon_id)
    if not pokemon:
        return jsonify({"error": "Pokémon não encontrado"}), 404

    captura_existente = Captura.query.filter_by(
        usuario_id=usuario_autenticado.id, pokemon_id=pokemon.id
    ).first()
    if captura_existente:
        return jsonify({"error": "Pokémon já capturado por este usuário"}), 409

    data_captura = None
    if data_captura_str:
        try:
            data_captura = datetime.fromisoformat(data_captura_str)
        except ValueError:
            return jsonify({"error": "data_captura inválida"}), 400

    captura = Captura(
        usuario_id=usuario_autenticado.id,
        pokemon_id=pokemon.id,
        data_captura=data_captura,
    )
    db.session.add(captura)
    db.session.commit()

    return (
        jsonify(
            {
                "id": captura.id,
                "usuario_id": captura.usuario_id,
                "pokemon_id": captura.pokemon_id,
                "data_captura": captura.data_captura.isoformat(),
            }
        ),
        201,
    )


@api_bp.get("/usuarios/<int:usuario_id>/pokemons")
def pokemons_do_usuario(usuario_id: int):
    usuario = (
        Usuario.query.options(joinedload(Usuario.capturas).joinedload(Captura.pokemon))
        .filter_by(id=usuario_id)
        .first()
    )
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    capturados = [
        {
            "captura_id": captura.id,
            "data_captura": captura.data_captura.isoformat() if captura.data_captura else None,
            "pokemon": {
                "id": captura.pokemon.id,
                "nome": captura.pokemon.nome,
                "tipos": captura.pokemon.tipos,
                "imagem_url": captura.pokemon.imagem_url,
            },
        }
        for captura in usuario.capturas
    ]

    return jsonify({"usuario": {"id": usuario.id, "nome": usuario.nome}, "pokemons": capturados})


@api_bp.delete("/capturar/<int:captura_id>")
@login_required
def excluir_captura(captura_id: int, usuario_autenticado: Usuario):
    captura = Captura.query.get(captura_id)
    if not captura:
        return jsonify({"error": "Captura não encontrada"}), 404

    if captura.usuario_id != usuario_autenticado.id:
        return jsonify({"error": "Você não tem permissão para excluir esta captura"}), 403

    db.session.delete(captura)
    db.session.commit()

    return jsonify({"message": "Captura excluída com sucesso"}), 200

