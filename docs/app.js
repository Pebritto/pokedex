const DEFAULT_API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "http://localhost:5000/api";
// const API_BASE_URL = localStorage.getItem("pokedex_api_url") || DEFAULT_API_BASE_URL;

const state = {
  token: null,
  usuario: null,
  pokemons: [],
  tipos: new Set(),
};

const elements = {
  pokemonGrid: document.querySelector("#pokemonGrid"),
  typeFilter: document.querySelector("#typeFilter"),
  registerModal: document.querySelector("#registerModal"),
  openRegister: document.querySelector("#openRegister"),
  closeRegister: document.querySelector("#closeRegister"),
  registerForm: document.querySelector("#registerForm"),
  loginForm: document.querySelector("#loginForm"),
  logoutButton: document.querySelector("#logoutButton"),
  capturedList: document.querySelector("#capturedList"),
  capturedInfo: document.querySelector("#capturedInfo"),
  toast: document.querySelector("#toast"),
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded - Iniciando aplicação");
  restoreSession();
  setupEventListeners();
  fetchPokemons();

  if (state.token && state.usuario) {
    console.log("Usuário autenticado, buscando capturas...");
    fetchCaptured();
    toggleAuthUI(true);
  } else {
    toggleAuthUI(false);
  }
  
  // Teste: verificar se o template existe
  const template = document.querySelector("#capturedItemTemplate");
  if (template) {
    console.log("Template encontrado:", template);
    const testButton = template.content.querySelector(".delete-button");
    console.log("Botão no template:", testButton);
  } else {
    console.error("Template #capturedItemTemplate NÃO encontrado!");
  }
});

function setupEventListeners() {
  elements.openRegister.addEventListener("click", () => toggleModal(true));
  elements.closeRegister.addEventListener("click", () => toggleModal(false));
  elements.registerModal.addEventListener("click", (event) => {
    if (event.target === elements.registerModal) toggleModal(false);
  });

  elements.registerForm.addEventListener("submit", handleRegister);
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutButton.addEventListener("click", handleLogout);

  elements.typeFilter.addEventListener("change", () => {
    const tipo = elements.typeFilter.value;
    fetchPokemons(tipo);
  });

  // Event delegation para botões de exclusão (fallback)
  if (elements.capturedList) {
    console.log("Event delegation configurado para capturedList");
    elements.capturedList.addEventListener("click", (e) => {
      console.log("Clique detectado em capturedList", e.target, e.target.classList);
      const deleteButton = e.target.closest(".delete-button");
      if (deleteButton) {
        console.log("Botão de exclusão encontrado via delegation");
        e.preventDefault();
        e.stopPropagation();
        const item = deleteButton.closest(".captured-item");
        if (item) {
          const capturaId = item.dataset.capturaId;
          console.log("capturaId encontrado via delegation:", capturaId);
          if (capturaId) {
            handleDelete(parseInt(capturaId), deleteButton);
          }
        }
      }
    });
  } else {
    console.error("elements.capturedList é null!");
  }
}

function toggleModal(visible) {
  elements.registerModal.classList.toggle("hidden", !visible);
  if (visible) {
    elements.registerForm.reset();
  }
}

async function fetchPokemons(tipo = "") {
  try {
    const url = new URL(`${API_BASE_URL}/pokemons`);
    if (tipo) {
      url.searchParams.set("tipo", tipo);
    }

    const response = await fetch(url, { headers: buildAuthHeaders() });
    if (!response.ok) {
      throw new Error("Não foi possível carregar os pokémons.");
    }

    const pokemons = await response.json();
    state.pokemons = pokemons;

    if (!tipo) {
      collectTipos(pokemons);
    }

    renderPokemons(pokemons);
  } catch (error) {
    showToast(error.message, true);
  }
}

function collectTipos(pokemons) {
  state.tipos = new Set();
  pokemons.forEach((pokemon) => {
    pokemon.tipos.forEach((tipo) => state.tipos.add(tipo));
  });
  renderTypeOptions();
}

function renderTypeOptions() {
  const currentValue = elements.typeFilter.value;
  elements.typeFilter.innerHTML = '<option value="">Todos</option>';
  [...state.tipos]
    .sort()
    .forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      if (tipo === currentValue) option.selected = true;
      elements.typeFilter.appendChild(option);
    });
}

function renderPokemons(pokemons) {
  elements.pokemonGrid.innerHTML = "";
  const template = document.querySelector("#pokemonCardTemplate");

  pokemons.forEach((pokemon) => {
    const card = template.content.cloneNode(true);
    const img = card.querySelector(".pokemon-card__image");
    const name = card.querySelector(".pokemon-card__name");
    const typesList = card.querySelector(".pokemon-card__types");
    const captureButton = card.querySelector(".capture-button");

    img.src = pokemon.imagem_url || "https://via.placeholder.com/256x256?text=Pok%C3%A9mon";
    img.alt = `Sprite oficial do Pokémon ${pokemon.nome}`;
    name.textContent = pokemon.nome;

    typesList.innerHTML = "";
    pokemon.tipos.forEach((tipo) => {
      const tipoItem = document.createElement("li");
      tipoItem.textContent = tipo;
      typesList.appendChild(tipoItem);
    });

    captureButton.addEventListener("click", () => handleCapture(pokemon.id, captureButton));
    captureButton.disabled = !state.token;
    elements.pokemonGrid.appendChild(card);
  });
}

async function handleRegister(event) {
  event.preventDefault();
  const nome = document.querySelector("#registerName").value.trim();
  const email = document.querySelector("#registerEmail").value.trim();
  const senha = document.querySelector("#registerPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar usuário.");
    }

    toggleModal(false);
    showToast("Usuário cadastrado com sucesso! Faça login para capturar pokémons.");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim();
  const senha = document.querySelector("#loginPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao autenticar.");
    }

    const data = await response.json();
    state.token = data.token;
    state.usuario = data.usuario;
    persistSession();

    toggleAuthUI(true);
    fetchCaptured();
    renderPokemons(state.pokemons);
    showToast(`Bem-vindo(a), ${state.usuario.nome}!`);
    elements.loginForm.reset();
  } catch (error) {
    showToast(error.message, true);
  }
}

function handleLogout() {
  state.token = null;
  state.usuario = null;
  persistSession();
  toggleAuthUI(false);
  elements.capturedList.innerHTML = "";
  elements.capturedInfo.textContent = "Faça login para visualizar e registrar novas capturas.";
  renderPokemons(state.pokemons);
  showToast("Sessão encerrada.");
}

async function handleCapture(pokemonId, button) {
  if (!state.token) {
    showToast("Faça login para capturar pokémons.", true);
    return;
  }

  button.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/capturar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
      body: JSON.stringify({ pokemon_id: pokemonId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao capturar.");
    }

    await fetchCaptured();
    showToast("Pokémon capturado com sucesso!");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function fetchCaptured() {
  if (!state.usuario) return;

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${state.usuario.id}/pokemons`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar capturas.");
    }

    const data = await response.json();
    renderCaptured(data.pokemons);
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleDelete(capturaId, button) {
  console.log("=== handleDelete INICIADO ===", { capturaId, button, token: !!state.token });
  
  if (!state.token) {
    console.log("Sem token, mostrando toast de erro");
    showToast("Faça login para excluir pokémons.", true);
    return;
  }

  if (!capturaId || isNaN(capturaId)) {
    console.error("capturaId inválido:", capturaId);
    showToast("Erro: ID da captura não encontrado.", true);
    return;
  }

  console.log("Mostrando confirmação...");
  if (!confirm("Tem certeza que deseja excluir este pokémon da sua coleção?")) {
    console.log("Usuário cancelou a exclusão");
    return;
  }
  
  console.log("Usuário confirmou, iniciando exclusão...");

  button.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/capturar/${capturaId}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao excluir captura.");
    }

    await fetchCaptured();
    showToast("Pokémon excluído com sucesso!");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function renderCaptured(capturas) {
  if (!capturas.length) {
    elements.capturedInfo.textContent = "Nenhum pokémon capturado ainda.";
    elements.capturedList.innerHTML = "";
    return;
  }

  elements.capturedInfo.textContent = `Total capturado: ${capturas.length}`;
  elements.capturedList.innerHTML = "";
  const template = document.querySelector("#capturedItemTemplate");

  if (!template) {
    console.error("Template #capturedItemTemplate não encontrado!");
    return;
  }

  capturas.forEach(({ captura_id, pokemon, data_captura }) => {
    if (!captura_id) {
      console.warn("captura_id ausente, pulando item");
      return;
    }

    const item = template.content.cloneNode(true);
    const listItem = item.querySelector(".captured-item");
    if (!listItem) {
      console.error("Elemento .captured-item não encontrado no template clonado");
      return;
    }
    
    listItem.dataset.capturaId = captura_id.toString();
    
    const nameEl = item.querySelector(".captured-item__name");
    const dateEl = item.querySelector(".captured-item__date");
    const deleteButton = item.querySelector(".delete-button");
    
    if (!nameEl || !dateEl) {
      console.error("Elementos de nome ou data não encontrados");
    }
    
    if (nameEl) nameEl.textContent = pokemon.nome;
    if (dateEl) dateEl.textContent = formatDate(data_captura);
    
    // Adicionar item ao DOM primeiro
    elements.capturedList.appendChild(item);
    
    // Depois anexar event listener ao botão que agora está no DOM
    const deleteButtonInDOM = listItem.querySelector(".delete-button");
    if (deleteButtonInDOM) {
      console.log("Anexando listener ao botão de exclusão para captura_id:", captura_id);
      deleteButtonInDOM.addEventListener("click", (e) => {
        console.log("Botão de exclusão clicado! captura_id:", captura_id);
        e.preventDefault();
        e.stopPropagation();
        handleDelete(captura_id, deleteButtonInDOM);
      });
    } else {
      console.error("Botão .delete-button não encontrado após adicionar ao DOM!");
    }
  });
  
  // Verificar se os botões foram adicionados ao DOM
  const buttonsInDOM = elements.capturedList.querySelectorAll(".delete-button");
  console.log(`Total de botões de exclusão no DOM: ${buttonsInDOM.length}`);
}

function formatDate(isoDate) {
  if (!isoDate) return "Data desconhecida";
  const date = new Date(isoDate);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildAuthHeaders() {
  if (!state.token) return {};
  return {
    Authorization: `Bearer ${state.token}`,
  };
}

function toggleAuthUI(isAuthenticated) {
  elements.logoutButton.classList.toggle("hidden", !isAuthenticated);
  elements.loginForm.classList.toggle("hidden", isAuthenticated);
  document.querySelectorAll(".capture-button").forEach((button) => {
    button.disabled = !isAuthenticated;
  });

  if (isAuthenticated && state.usuario) {
    elements.capturedInfo.textContent = `Capturas de ${state.usuario.nome}`;
  }
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  elements.toast.style.background = isError ? "rgba(220, 38, 38, 0.95)" : "rgba(17, 94, 246, 0.95)";
  clearTimeout(elements.toast.timeoutId);
  elements.toast.timeoutId = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 4000);
}

function persistSession() {
  if (state.token && state.usuario) {
    localStorage.setItem("pokedex_token", state.token);
    localStorage.setItem("pokedex_usuario", JSON.stringify(state.usuario));
  } else {
    localStorage.removeItem("pokedex_token");
    localStorage.removeItem("pokedex_usuario");
  }
}

function restoreSession() {
  const token = localStorage.getItem("pokedex_token");
  const usuarioRaw = localStorage.getItem("pokedex_usuario");
  if (token && usuarioRaw) {
    state.token = token;
    state.usuario = JSON.parse(usuarioRaw);
  }
}

