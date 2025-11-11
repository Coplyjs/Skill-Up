let tasks = [];
let taskModal;
let loggedUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const modalElement = document.getElementById("taskModal");
  if (!modalElement) return console.error("Modal not found!");

  taskModal = new bootstrap.Modal(modalElement);

  const createBtn = document.querySelector(".createTask");
  if (createBtn) createBtn.addEventListener("click", openTaskModal);

  const saveBtn = document.getElementById("saveTaskBtn");
  if (saveBtn) saveBtn.addEventListener("click", saveTask);

  // Load logged user
  const userData = localStorage.getItem("loggedUser");
  if (!userData) return console.error("No logged user found!");
  loggedUser = JSON.parse(userData);

  // Load user's tasks
  if (Array.isArray(loggedUser.tasks)) tasks = loggedUser.tasks;

  renderTasks();
  checkExpiredTasks();
  setInterval(checkExpiredTasks, 60000);
});

function openTaskModal() {
  document.getElementById("taskName").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("taskFins").value = "";
  taskModal.show();
}

function saveTask() {
  const name = document.getElementById("taskName").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const time = document.getElementById("taskTime").value.trim();
  const fins = document.getElementById("taskFins").value.trim();

  if (!name || !description || !time || !fins) {
    alert("Fill all fields!");
    return;
  }

  const now = new Date();
  const duration = parseTime(time);
  const expiration = duration ? now.getTime() + duration : null;

  tasks.push({
    name,
    description,
    time,
    fins,
    createdAt: now.getTime(),
    expiresAt: expiration,
    expired: false
  });

  saveUserTasks();
  renderTasks();
  taskModal.hide();
}

// Parse "10h", "30m", "2d" etc. into milliseconds
function parseTime(str) {
  const match = str.match(/^(\d+)([hmd])$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "h": return value * 60 * 60 * 1000;
    case "m": return value * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

function renderTasks() {
  const container = document.querySelector(".tasks");
  container.innerHTML = "";

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "card p-3 mb-3 shadow-sm";
    if (task.expired) card.style.opacity = "0.6";

    card.innerHTML = `
      <h1 class="name">${task.name}</h1>
      <p class="description">${task.description}</p>
      <p class="timeToComplete">${task.time}</p>
      <p class="fins">${task.fins} Fins</p>
      ${task.expired ? `<p class="text-danger fw-bold">Expired</p>` : ""}
      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm completeTask">Complete</button>
        <button class="btn btn-outline-danger btn-sm" onclick="removeTask(${index})">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function removeTask(index) {
  tasks.splice(index, 1);
  saveUserTasks();
  renderTasks();
}

// Save updated tasks inside the logged user
function saveUserTasks() {
  if (!loggedUser) return;
  loggedUser.tasks = tasks;
  localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

  // Also update user in "db" list if it exists
  const db = loadData() || [];
  const userIndex = db.findIndex(u => u.email === loggedUser.email);
  if (userIndex !== -1) {
    db[userIndex] = loggedUser;
    saveData(db);
  } else {
    db.push(loggedUser);
    saveData(db);
  }
}

// Check if any task has expired
function checkExpiredTasks() {
  const now = Date.now();
  let updated = false;

  tasks.forEach(task => {
    if (task.expiresAt && now > task.expiresAt && !task.expired) {
      task.expired = true;
      console.log(`⚠️ Task "${task.name}" has expired!`);
      updated = true;
    }
  });

  if (updated) {
    saveUserTasks();
    renderTasks();
  }
}