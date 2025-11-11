let tasks = [];
let dailyTasks = [];
let taskModal;
let loggedUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const modalElement = document.getElementById("taskModal");
  if (!modalElement) return console.error("Modal not found!");
  taskModal = new bootstrap.Modal(modalElement);

  document.querySelector(".createTask")?.addEventListener("click", openTaskModal);
  document.getElementById("saveTaskBtn")?.addEventListener("click", saveTask);

  // Load logged user
  const userData = localStorage.getItem("loggedUser");
  if (!userData) return console.error("No logged user found!");
  loggedUser = JSON.parse(userData);

  tasks = loggedUser.tasks || [];
  dailyTasks = loggedUser.dailyTasks || [];

  renderTasks();
  resetTasksIfNeeded();
  setInterval(resetTasksIfNeeded, 60000); // check every minute
});

function openTaskModal() {
  document.getElementById("taskName").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskDaily").checked = false;
  document.getElementById("taskDifficulty").value = "1";
  taskModal.show();
}

function saveTask() {
  const name = document.getElementById("taskName").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const isDaily = document.getElementById("taskDaily").checked;
  const fins = parseInt(document.getElementById("taskDifficulty").value);

  if (!name || !description) {
    showThemeAlert("Por favor, preencha todos os campos!");
    return;
  }

  const newTask = {
    name,
    description,
    fins,
    completed: false,
    createdAt: Date.now(),
    lastUpdated: getTodayDate()
  };

  if (isDaily) {
    newTask.date = getTodayDate();
    dailyTasks.push(newTask);
  } else {
    tasks.push(newTask);
  }

  saveUserData();
  renderTasks();
  taskModal.hide();
}

function renderTasks() {
  const container = document.querySelector(".tasks");
  container.innerHTML = "";

  const allTasks = [
    ...tasks.map(t => ({ ...t, type: "normal" })),
    ...dailyTasks.map(t => ({ ...t, type: "daily" }))
  ];

  allTasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "card p-3 mb-3 shadow-sm";
    if (task.completed) card.style.opacity = "0.6";

    card.innerHTML = `
      <h1 class="name">${task.name}</h1>
      <p class="description">${task.description}</p>
      <p class="fins">${task.fins} fins</p>
      ${task.type === "daily" ? `<span class="badge bg-info">Daily</span>` : ""}
      <div class="d-flex gap-2 mt-2">
        <button class="btn btn-success btn-sm" onclick="completeTask('${task.type}', ${index})">Complete</button>
        <button class="btn btn-outline-danger btn-sm" onclick="removeTask('${task.type}', ${index})">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function completeTask(type, index) {
  let taskArray = type === "daily" ? dailyTasks : tasks;
  const task = taskArray[index];
  if (!task) return;

  if (!task.completed) {
    loggedUser.fins = (loggedUser.fins || 0) + task.fins;
    task.completed = true;
    task.lastUpdated = getTodayDate();
    console.log(`You earned ${task.fins} fins!`);
  }

  saveUserData();
  renderTasks();
}

function removeTask(type, index) {
  if (type === "daily") dailyTasks.splice(index, 1);
  else tasks.splice(index, 1);

  saveUserData();
  renderTasks();
}

function saveUserData() {
  if (!loggedUser) return;

  loggedUser.tasks = tasks;
  loggedUser.dailyTasks = dailyTasks;
  localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

  const db = loadData() || [];
  const idx = db.findIndex(u => u.email === loggedUser.email);
  if (idx !== -1) {
    db[idx] = loggedUser;
    saveData(db);
  } else {
    db.push(loggedUser);
    saveData(db);
  }
}

/**
 * 🔁 Reset daily tasks and remove completed normal tasks after midnight
 */
function resetTasksIfNeeded() {
  const today = getTodayDate();
  let updated = false;

  // Reset daily tasks
  dailyTasks.forEach(task => {
    if (task.date !== today) {
      task.date = today;
      task.completed = false;
      updated = true;
    }
  });

  // Remove completed normal tasks from previous days
  const originalCount = tasks.length;
  tasks = tasks.filter(task => {
    if (!task.completed) return true; // keep uncompleted
    return task.lastUpdated === today; // only keep if completed today
  });

  if (tasks.length !== originalCount) updated = true;

  if (updated) {
    saveUserData();
    renderTasks();
  }
}

/** Helper: Get current date in YYYY-MM-DD format */
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/* Theme alert helper: shows centered popup using site palette */
function showThemeAlert(message, timeout = 3500) {
  let alertEl = document.getElementById("themeAlert");
  let msgEl = document.getElementById("themeAlertMessage");
  let closeBtn = document.getElementById("themeAlertClose");
  if (!alertEl || !msgEl || !closeBtn) return alert(message);

  msgEl.textContent = message;

  // Show: remove hidden then add show class to trigger CSS transitions
  alertEl.removeAttribute("hidden");
  // force reflow then add class
  requestAnimationFrame(() => alertEl.classList.add("show"));

  let hideTimeoutId = null;

  function cleanupListeners() {
    closeBtn.removeEventListener("click", hide);
    document.removeEventListener("keydown", onKey);
    alertEl.removeEventListener("transitionend", onTransitionEnd);
  }

  function hide() {
    // start hide animation
    alertEl.classList.remove("show");
    // after transition ends, set hidden
    // onTransitionEnd will handle hidden and cleanup
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
  }

  function onKey(e) {
    if (e.key === "Escape") hide();
  }

  function onTransitionEnd(e) {
    // wait for the inner element opacity/transform transition to finish
    if (e.target && e.target.classList && e.target.classList.contains('theme-alert-inner')) {
      if (!alertEl.classList.contains('show')) {
        // fully hidden now
        alertEl.setAttribute('hidden', '');
        cleanupListeners();
      }
    }
  }

  closeBtn.addEventListener("click", hide);
  document.addEventListener("keydown", onKey);
  // listen on container for transitionend (from inner element)
  alertEl.addEventListener("transitionend", onTransitionEnd);

  if (timeout > 0) {
    hideTimeoutId = setTimeout(hide, timeout);
  }
}