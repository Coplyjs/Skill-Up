const STREAK_TASK = "water";

let streakUser = null;
let streakData = null;

document.addEventListener("DOMContentLoaded", () => {
  loadStreakUser();
  initStreakData();
  renderStreak();
});

function loadStreakUser() {
  streakUser = getLoggedUser();

  if (!streakUser) {
    alert("Erro: Nenhum usuário logado!");
    return;
  }
}


function initStreakData() {
  const dbObj = loadData(); // { users:[] }
  const db = dbObj.users;

  const realUser = db.find(u => u.email === streakUser.email);

  if (!realUser.streaks) realUser.streaks = {};
  if (!realUser.streaks[STREAK_TASK]) {
    realUser.streaks[STREAK_TASK] = {
      count: 0,
      lastComplete: null // salvo sempre YYYY-MM-DD
    };
  }

  streakData = realUser.streaks[STREAK_TASK];

  saveData(dbObj);
}


function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function isToday(dateStr) {
  return dateStr === todayStr();
}

function isYesterday(dateStr) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === y.toISOString().split("T")[0];
}


function renderStreak() {
  const countEl = document.getElementById("streakCount");
  const lastEl = document.getElementById("lastCompleted");
  const btn = document.getElementById("completeToday");

  if (!countEl || !lastEl || !btn) {
    console.error("Erro: elementos da streak não encontrados!");
    return;
  }

  if (
    streakData.lastComplete &&
    !isToday(streakData.lastComplete) &&
    !isYesterday(streakData.lastComplete)
  ) {
    streakData.count = 0;
    saveStreakData();
  }

  countEl.textContent = streakData.count;

  if (streakData.lastComplete) {
    lastEl.textContent = "Last conclusion: " + streakData.lastComplete;
  } else {
    lastEl.textContent = "You haven't started yet!";
  }

  if (isToday(streakData.lastComplete)) {
    btn.disabled = true;
    btn.textContent = "Already completed today ✔";
  } else {
    btn.disabled = false;
    btn.textContent = "Mark as completed today";
  }

  btn.onclick = completeStreakToday;
}


function completeStreakToday() {
  const today = todayStr();

  if (isToday(streakData.lastComplete)) return;

  if (isYesterday(streakData.lastComplete)) {
    streakData.count += 1;
  } else {
    streakData.count = 1;
  }

  streakData.lastComplete = today;

  saveStreakData();
  renderStreak();
}


function saveStreakData() {
  const dbObj = loadData();
  const db = dbObj.users;

  const idx = db.findIndex(u => u.email === streakUser.email);
  if (idx === -1) return;

  if (!db[idx].streaks) db[idx].streaks = {};
  db[idx].streaks[STREAK_TASK] = streakData;

  saveData(dbObj);

  streakUser.streaks = db[idx].streaks;
  localStorage.setItem("loggedUser", JSON.stringify(streakUser));
}
