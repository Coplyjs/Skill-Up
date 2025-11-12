const apiKey = "4ta7q3VUgJWJzNpU32dxDkVGhsasDbglvf6PRXBA";
let refeicoes = [];
let totalGeral = 0;
let modal;

document.addEventListener("DOMContentLoaded", () => {
  modal = new bootstrap.Modal(document.getElementById("refeicaoModal"));
  document.getElementById("novaRefeicaoBtn").addEventListener("click", abrirModal);
  document.getElementById("addAlimentoBtn").addEventListener("click", addCampoAlimento);
  document.getElementById("salvarRefeicaoBtn").addEventListener("click", salvarRefeicao);

  carregarLocalStorage(); 
  agendarResetDiario();   
});

function abrirModal() {
  document.getElementById("nomeRefeicao").value = "";
  document.getElementById("alimentosLista").innerHTML = "";
  addCampoAlimento();
  modal.show();
}

function addCampoAlimento() {
  const container = document.getElementById("alimentosLista");
  const div = document.createElement("div");
  div.className = "alimento-item mb-3";

  div.innerHTML = `
    <div class="input-group">
      <input type="text" class="form-control alimentoNome" placeholder="Buscar alimento...">
      <input type="number" class="form-control alimentoQtd" placeholder="g" min="1">
      <input type="number" class="form-control alimentoCal" placeholder="kcal" readonly>
      <button class="btn btn-danger" type="button" onclick="this.parentElement.parentElement.remove()">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
    <ul class="sugestoes list-group mt-1"></ul>
  `;

  container.appendChild(div);

  const inputNome = div.querySelector(".alimentoNome");
  const listaSug = div.querySelector(".sugestoes");
  const inputQtd = div.querySelector(".alimentoQtd");
  const inputCal = div.querySelector(".alimentoCal");

  inputNome.addEventListener("input", async () => {
    const query = inputNome.value.trim();
    listaSug.innerHTML = "";
    if (!query) return;

    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${apiKey}`
      );
      const data = await res.json();

      const sugestoes = (data.foods || []).filter(
        f => f.dataType === "Foundation" || f.dataType === "Survey (FNDDS)"
      );

      sugestoes.forEach(f => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = f.description;

        li.addEventListener("click", () => {
          const energia = f.foodNutrients.find(n =>
            n.nutrientName.toLowerCase().includes("energy")
          );

          let kcal100 = energia ? energia.value : 0;
          if (energia && energia.unitName.toLowerCase() === "kj") kcal100 /= 4.184;

          inputNome.value = f.description;
          div.dataset.kcal100 = kcal100;
          listaSug.innerHTML = "";
        });

        listaSug.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  });

  inputQtd.addEventListener("input", () => {
    const qtd = parseFloat(inputQtd.value);
    const kcal100 = parseFloat(div.dataset.kcal100 || 0);

    if (qtd > 0 && kcal100 > 0) {
      const kcal = (kcal100 / 100) * qtd;
      inputCal.value = kcal.toFixed(1);
    } else {
      inputCal.value = "";
    }
  });
}

function salvarRefeicao() {
  const nome = document.getElementById("nomeRefeicao").value.trim();
  if (!nome) return alert("Digite o nome da refeição!");

  const nomes = document.querySelectorAll(".alimentoNome");
  const kcals = document.querySelectorAll(".alimentoCal");
  const alimentos = [];
  let totalRefeicao = 0;

  nomes.forEach((n, i) => {
    const nomeAli = n.value.trim();
    const kcal = parseFloat(kcals[i].value) || 0;

    if (nomeAli && kcal > 0) {
      alimentos.push({ nome: nomeAli, kcal });
      totalRefeicao += kcal;
    }
  });

  if (!alimentos.length)
    return alert("Adicione pelo menos um alimento com calorias!");

  refeicoes.push({ nome, alimentos, total: totalRefeicao });
  totalGeral += totalRefeicao;

  renderizarRefeicoes();
  salvarLocalStorage(); // salva no localStorage
  modal.hide();
}

function renderizarRefeicoes() {
  const container = document.getElementById("refeicoesContainer");
  container.innerHTML = "";

  refeicoes.forEach((r, index) => {
    const card = document.createElement("div");
    card.className = "card card-refeicao mb-3 p-3 shadow-sm";

    card.innerHTML = `
      <h5>${r.nome}</h5>
      <ul>${r.alimentos.map(a => `<li>${a.nome} - ${a.kcal} kcal</li>`).join("")}</ul>
      <p><strong>Total:</strong> ${r.total.toFixed(1)} kcal</p>
      <button class="btn btn-outline-danger btn-sm" onclick="removerRefeicao(${index})">
        <i class="fa-solid fa-trash"></i> Remover
      </button>
    `;

    container.appendChild(card);
  });

  document.getElementById("totalGeral").textContent = totalGeral.toFixed(1);
}

function removerRefeicao(index) {
  if (confirm("Deseja remover esta refeição?")) {
    totalGeral -= refeicoes[index].total;
    refeicoes.splice(index, 1);
    renderizarRefeicoes();
    salvarLocalStorage(); // salva alteração
  }
}

/* ---------------------- LOCALSTORAGE ---------------------- */

function salvarLocalStorage() {
  const dataAtual = new Date().toLocaleDateString();
  localStorage.setItem("refeicoesData", JSON.stringify({
    refeicoes,
    totalGeral,
    data: dataAtual
  }));
}

function carregarLocalStorage() {
  const dataSalva = localStorage.getItem("refeicoesData");
  if (!dataSalva) return;

  const { refeicoes: refeicoesSalvas, totalGeral: totalSalvo, data } = JSON.parse(dataSalva);
  const dataHoje = new Date().toLocaleDateString();

  if (data === dataHoje) {
    refeicoes = refeicoesSalvas || [];
    totalGeral = totalSalvo || 0;
    renderizarRefeicoes();
  } else {
    resetarDia();
  }
}

/* ---------------------- RESET DIÁRIO ---------------------- */

function resetarDia() {
  refeicoes = [];
  totalGeral = 0;
  renderizarRefeicoes();
  salvarLocalStorage();
  console.log("Reiniciado automaticamente às 00h00.");
}

function agendarResetDiario() {
  const agora = new Date();
  const proximaMeiaNoite = new Date(agora);
  proximaMeiaNoite.setHours(24, 0, 0, 0);

  const tempoRestante = proximaMeiaNoite - agora;

  setTimeout(() => {
    resetarDia();
    agendarResetDiario(); // agenda o próximo reset
  }, tempoRestante);
}