import click
import requests
from flask.cli import with_appcontext

from .extensions import db
from .models import Pokemon

POKEAPI_BASE_URL = "https://pokeapi.co/api/v2"


def register_seed_commands(app):
    @app.cli.command("seed-pokemons")
    @click.option("--limit", default=151, show_default=True, type=int, help="Quantidade de pokémons para importar")
    @with_appcontext
    def seed_pokemons(limit: int):
        """Popula a tabela de pokémons com dados da PokeAPI."""
        click.echo(f"Importando {limit} pokémons da PokeAPI...")

        session = requests.Session()
        response = session.get(f"{POKEAPI_BASE_URL}/pokemon", params={"limit": limit, "offset": 0}, timeout=30)
        response.raise_for_status()

        results = response.json().get("results", [])
        total_importados = 0

        for pokemon_info in results:
            pokemon_data = session.get(pokemon_info["url"], timeout=30).json()
            pokemon_id = pokemon_data["id"]
            nome = pokemon_data["name"].capitalize()
            tipos = [tipo["type"]["name"].lower() for tipo in pokemon_data["types"]]
            imagem_url = pokemon_data["sprites"]["other"]["official-artwork"]["front_default"]

            pokemon = Pokemon.query.get(pokemon_id)
            if not pokemon:
                pokemon = Pokemon(id=pokemon_id)

            pokemon.nome = nome
            pokemon.tipos = tipos
            pokemon.imagem_url = imagem_url

            db.session.add(pokemon)
            total_importados += 1

        db.session.commit()
        click.echo(f"Importação concluída. {total_importados} registros atualizados.")

