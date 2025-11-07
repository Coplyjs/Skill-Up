let tasks = [];
let taskModal;

document.addEventListener("DOMContentLoaded", () => {
  // Garante que o modal existe no DOM antes de inicializar
  const modalElement = document.getElementById("taskModal");
  if (!modalElement) {
    console.error("Modal não encontrado no DOM!");
    return;
  }

  // Inicializa o modal do Bootstrap
  taskModal = new bootstrap.Modal(modalElement);

  // Botão "+" abre o modal
  const createBtn = document.querySelector(".createTask");
  if (createBtn) {
    createBtn.addEventListener("click", openTaskModal);
  } else {
    console.error("Botão .createTask não encontrado!");
  }

  // Botão "Salvar" dentro do modal
  const saveBtn = document.getElementById("saveTaskBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveTask);
  } else {
    console.error("Botão #saveTaskBtn não encontrado!");
  }

  renderTasks();
});

function openTaskModal() {
  console.log("Abrindo modal de task...");
  document.getElementById("taskName").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("taskFins").value = "";

  taskModal.show(); // <-- abre o modal
}

function saveTask() {
  const name = document.getElementById("taskName").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const time = document.getElementById("taskTime").value.trim();
  const fins = document.getElementById("taskFins").value.trim();

  if (!name || !description || !time || !fins) {
    alert("Preencha todos os campos!");
    return;
  }

  tasks.push({ name, description, time, fins });
  renderTasks();
  taskModal.hide();
}

function renderTasks() {
  const container = document.querySelector(".tasks");
  container.innerHTML = "";

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "card p-3 mb-3 shadow-sm";

    card.innerHTML = `
      <h1 class="name">${task.name}</h1>
      <p class="description">${task.description}</p>
      <p class="timeToComplete">${task.time}</p>
      <p class="fins">${task.fins} Fins</p>
      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm completeTask">Completar</button>
        <button class="btn btn-outline-danger btn-sm" onclick="removeTask(${index})">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function removeTask(index) {
  if (confirm("Deseja excluir esta tarefa?")) {
    tasks.splice(index, 1);
    renderTasks();
  }
}
