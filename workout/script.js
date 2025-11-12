const API_KEY = "";
let treinos = [];
const allMuscles = [
  "abdominals","abductors","adductors","biceps","calves","chest",
  "forearms","glutes","hamstrings","lats","lower_back","middle_back",
  "neck","quadriceps","shoulders","triceps"
];

// modalController oferece uma API uniforme (show/hide) que usa bootstrap se disponível
const modalController = {
  init(modalId) {
    this.modalId = modalId;
    this.el = document.getElementById(modalId);
    if (!this.el) return;
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      try {
        this.bsInstance = bootstrap.Modal.getOrCreateInstance(this.el);
        this.useBootstrap = true;
      } catch (e) {
        this.useBootstrap = false;
      }
    } else this.useBootstrap = false;
  },
  show() {
    if (!this.el) return;
    if (this.useBootstrap && this.bsInstance) this.bsInstance.show();
    else {
      this.el.classList.add("show");
      this.el.style.display = "block";
      document.body.classList.add("modal-open");
      if (!document.querySelector(".modal-backdrop-custom")) {
        const bd = document.createElement("div");
        bd.className = "modal-backdrop-custom";
        bd.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1040;";
        document.body.appendChild(bd);
      }
    }
  },
  hide() {
    if (!this.el) return;
    if (this.useBootstrap && this.bsInstance) this.bsInstance.hide();
    else {
      this.el.classList.remove("show");
      this.el.style.display = "none";
      document.body.classList.remove("modal-open");
      const bd = document.querySelector(".modal-backdrop-custom");
      if (bd) bd.remove();
    }
  }
};

// ---------- HELPERS ----------
function qs(id) { return document.getElementById(id); }
function qsel(selector, parent = document) { return parent.querySelector(selector); }

// ---------- START ----------
document.addEventListener("DOMContentLoaded", () => {
  modalController.init("treinoModal");

  const novoBtn = qs("novoTreinoBtn");
  const addExBtn = qs("addExercicioBtn");
  const salvarBtn = qs("salvarTreinoBtn");

  if (novoBtn) novoBtn.addEventListener("click", abrirModal);
  if (addExBtn) addExBtn.addEventListener("click", addCampoExercicio);
  if (salvarBtn) salvarBtn.addEventListener("click", salvarTreino);

  carregarLocalStorage(); // ← Carrega treinos salvos
  agendarResetDiario();   // ← Agenda reset automático

  renderizarTreinos();
});

// ---------- MODAL / UI ----------
function abrirModal() {
  const nomeEl = qs("nomeTreino");
  const lista = qs("exerciciosLista");
  if (nomeEl) nomeEl.value = "";
  if (lista) lista.innerHTML = "";
  addCampoExercicio();
  modalController.show();
}

/** cria campos de exercício dentro do modal */
function addCampoExercicio() {
  const container = qs("exerciciosLista");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "exercicio-item mb-3 p-2 border rounded";
  div.innerHTML = `
    <div class="row g-2 align-items-end">
      <div class="col-md-4">
        <label class="form-label mb-1">Músculo</label>
        <input type="text" class="form-control exMusculo" placeholder="ex: chest, biceps" autocomplete="off">
        <div class="sugestoes-musculo list-group mt-1" style="display:none;"></div>
      </div>

      <div class="col-md-4">
        <label class="form-label mb-1">Exercício</label>
        <input type="text" class="form-control exNome" placeholder="Escolha um exercício" readonly>
        <div class="sugestoes-ex list-group mt-1" style="display:none;"></div>
      </div>

      <div class="col-6 col-md-2">
        <label class="form-label mb-1">Séries</label>
        <input type="number" class="form-control exSeries" min="1" value="3">
      </div>

      <div class="col-6 col-md-2">
        <label class="form-label mb-1">Reps</label>
        <input type="number" class="form-control exReps" min="1" value="10">
      </div>

      <div class="col-6 col-md-2 mt-2">
        <label class="form-label mb-1">Carga (kg)</label>
        <input type="number" class="form-control exPeso" min="0" step="0.5" placeholder="kg">
      </div>

      <div class="col-6 col-md-2 mt-2 d-flex align-items-end">
        <button type="button" class="btn btn-outline-danger w-100 btn-remover-ex">Remover</button>
      </div>
    </div>
  `;

  container.appendChild(div);

  const inputMusculo = div.querySelector(".exMusculo");
  const listaMus = div.querySelector(".sugestoes-musculo");
  const inputExNome = div.querySelector(".exNome");
  const listaEx = div.querySelector(".sugestoes-ex");
  const btnRemover = div.querySelector(".btn-remover-ex");

  inputMusculo.addEventListener("input", () => {
    const q = inputMusculo.value.trim().toLowerCase();
    listaMus.innerHTML = "";
    if (!q) { listaMus.style.display = "none"; return; }
    const filtrado = allMuscles.filter(m => m.startsWith(q));
    if (filtrado.length === 0) { listaMus.style.display = "none"; return; }
    filtrado.forEach(m => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-group-item list-group-item-action";
      item.textContent = m;
      item.addEventListener("click", () => {
        inputMusculo.value = m;
        listaMus.style.display = "none";
        buscarExerciciosPorMusculo(m, listaEx, inputExNome);
      });
      listaMus.appendChild(item);
    });
    listaMus.style.display = "block";
  });

  listaEx.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    inputExNome.value = btn.dataset.name || btn.textContent;
    listaEx.style.display = "none";
  });

  btnRemover.addEventListener("click", () => div.remove());
}

// ---------- API ----------
async function buscarExerciciosPorMusculo(muscle, listaEx) {
  if (!listaEx) return;
  listaEx.innerHTML = `<div class="list-group-item">Carregando...</div>`;
  listaEx.style.display = "block";
  try {
    const res = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${encodeURIComponent(muscle)}`, {
      headers: { "X-Api-Key": API_KEY }
    });
    if (!res.ok) {
      listaEx.innerHTML = `<div class="list-group-item text-danger">Erro (status ${res.status})</div>`;
      return;
    }
    const data = await res.json();
    if (!data || data.length === 0) {
      listaEx.innerHTML = `<div class="list-group-item">Nenhum exercício encontrado</div>`;
      return;
    }
    listaEx.innerHTML = "";
    data.slice(0, 12).forEach(ex => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-group-item list-group-item-action";
      btn.textContent = ex.name;
      btn.dataset.name = ex.name;
      listaEx.appendChild(btn);
    });
  } catch (err) {
    console.error(err);
    listaEx.innerHTML = `<div class="list-group-item text-danger">Erro ao buscar exercícios</div>`;
  }
}

// ---------- SAVE / RENDER ----------
function salvarTreino() {
  const nomeEl = qs("nomeTreino");
  const nome = nomeEl ? nomeEl.value.trim() : "";
  if (!nome) return alert("Digite o nome do treino!");

  const itens = document.querySelectorAll(".exercicio-item");
  const exercicios = [];
  itens.forEach(item => {
    const nomeEx = qsel(".exNome", item)?.value.trim() || "";
    const musculo = qsel(".exMusculo", item)?.value.trim() || "";
    const series = parseInt(qsel(".exSeries", item)?.value) || 0;
    const reps = parseInt(qsel(".exReps", item)?.value) || 0;
    const peso = parseFloat(qsel(".exPeso", item)?.value) || 0;
    if (nomeEx && musculo && series > 0 && reps > 0)
      exercicios.push({ name: nomeEx, muscle: musculo, sets: series, reps, weight: peso });
  });

  if (!exercicios.length) return alert("Adicione pelo menos um exercício válido.");

  const treino = { nome, exercicios, criadoEm: new Date().toISOString() };
  treinos.push(treino);
  modalController.hide();
  renderizarTreinos();
  salvarLocalStorage(); // ← salva no localStorage
}

function renderizarTreinos() {
  const container = qs("treinosContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!treinos.length) {
    container.innerHTML = `<div class="alert alert-info">Nenhum treino cadastrado.</div>`;
    return;
  }

  treinos.forEach((t, i) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title mb-1">${t.nome}</h5>
          </div>
          <button class="btn btn-sm btn-outline-danger" onclick="removerTreino(${i})">
            <i class="fa-solid fa-trash"></i> Remover
          </button>
        </div>
        <ul class="list-group list-group-flush mt-3">
          ${t.exercicios.map(e => `
            <li class="list-group-item">
              <strong>${e.name}</strong> — ${e.sets}×${e.reps} ${e.weight ? `(${e.weight}kg)` : ""}
              <br><small class="text-muted">Muscle: ${e.muscle}</small>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
    container.appendChild(card);
  });
}

function removerTreino(index) {
  if (!confirm("Deseja remover este treino?")) return;
  treinos.splice(index, 1);
  renderizarTreinos();
  salvarLocalStorage();
}

/* ---------------------- LOCALSTORAGE ---------------------- */

function salvarLocalStorage() {
  const dataAtual = new Date().toLocaleDateString();
  localStorage.setItem("treinosData", JSON.stringify({
    treinos,
    data: dataAtual
  }));
}

function carregarLocalStorage() {
  const dataSalva = localStorage.getItem("treinosData");
  if (!dataSalva) return;
  const { treinos: salvos, data } = JSON.parse(dataSalva);
  const hoje = new Date().toLocaleDateString();
  if (data === hoje) {
    treinos = salvos || [];
    renderizarTreinos();
  } else resetarDia();
}

/* ---------------------- RESET DIÁRIO ---------------------- */

function resetarDia() {
  treinos = [];
  renderizarTreinos();
  salvarLocalStorage();
  console.log("Treinos resetados automaticamente às 00h00.");
}

function agendarResetDiario() {
  const agora = new Date();
  const proxima = new Date(agora);
  proxima.setHours(24, 0, 0, 0);
  const tempo = proxima - agora;
  setTimeout(() => {
    resetarDia();
    agendarResetDiario();
  }, tempo);

}
