// --- CONFIGURAÇÃO ---
const STREAK_TASK = "water"; // id interno da tarefa de streak

// retorna info do user logado
const user = getLoggedUser();
if (!user) {
  alert("Erro: usuário não logado.");
}

// carrega banco
const db = loadData();

// procura usuário no db real
const realUser = db.users.find(u => u.email === user.email);

// cria estrutura caso não exista
if (!realUser.streaks) {
  realUser.streaks = {};
}
if (!realUser.streaks[STREAK_TASK]) {
  realUser.streaks[STREAK_TASK] = {
    count: 0,
    lastComplete: null
  };
  saveData(db);
}

const streakData = realUser.streaks[STREAK_TASK];

// ELEMENTOS
const streakCount = document.getElementById("streakCount");
const lastCompleted = document.getElementById("lastCompleted");
const btn = document.getElementById("completeToday");

// 🟦 Função auxiliar para formatar datas (YYYY-MM-DD)
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// 🟦 Verifica se a data é hoje
function isToday(date) {
  return formatDate(new Date()) === formatDate(date);
}

// 🟦 Verifica se a data é ontem
function isYesterday(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return formatDate(yesterday) === formatDate(date);
}

// --- CARREGAR STATUS ---
function loadStreak() {
  // RESET AUTOMÁTICO se pulou algum dia
  if (
    streakData.lastComplete &&
    !isToday(streakData.lastComplete) &&
    !isYesterday(streakData.lastComplete)
  ) {
    streakData.count = 0;
    saveData(db);
  }

  streakCount.textContent = streakData.count;

  if (streakData.lastComplete) {
    lastCompleted.textContent = "Última conclusão: " + formatDate(streakData.lastComplete);
  } else {
    lastCompleted.textContent = "Você ainda não começou!";
  }

  // desabilitar botão se já completou hoje
  if (isToday(streakData.lastComplete)) {
    btn.disabled = true;
    btn.textContent = "Já concluído hoje ✔";
  } else {
    btn.disabled = false;
    btn.textContent = "Marcar como concluído hoje";
  }
}

// --- COMPLETAR O DIA ---
btn.addEventListener("click", () => {
  const today = new Date();

  if (streakData.lastComplete && isToday(streakData.lastComplete)) {
    return; // já foi concluído
  }

  if (isYesterday(streakData.lastComplete)) {
    streakData.count += 1; // continuidade
  } else {
    streakData.count = 1; // começa de novo
  }

  streakData.lastComplete = today;

  saveData(db);
  loadStreak();
});

// iniciar
loadStreak();
