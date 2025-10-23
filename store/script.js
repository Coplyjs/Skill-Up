// Variáveis para armazenar metas e consumos atuais
let calGoal = 2000;
let calConsumed = 0;

let waterGoal = 2000;
let waterConsumed = 0;

// Atualiza os valores na tela
function updateDisplay() {
    document.getElementById('calGoal').textContent = calGoal;
    document.getElementById('calConsumed').textContent = calConsumed;

    document.getElementById('waterGoal').textContent = waterGoal;
    document.getElementById('waterConsumed').textContent = waterConsumed;
}

// Função para adicionar calorias
function addCalories() {
    let value = prompt("Quantas calorias deseja adicionar?");
    value = parseInt(value);
    if (!isNaN(value) && value > 0) {
        calConsumed += value;
        if (calConsumed > calGoal) calConsumed = calGoal; // limita ao máximo da meta
        updateDisplay();
    } else {
        alert("Por favor, insira um número válido maior que zero.");
    }
}

// Função para adicionar água
function addWater() {
    let value = prompt("Quantos ml de água deseja adicionar?");
    value = parseInt(value);
    if (!isNaN(value) && value > 0) {
        waterConsumed += value;
        if (waterConsumed > waterGoal) waterConsumed = waterGoal; // limita ao máximo da meta
        updateDisplay();
    } else {
        alert("Por favor, insira um número válido maior que zero.");
    }
}

// Função para definir metas personalizadas
function setGoals() {
    let newCalGoal = prompt("Defina sua meta diária de calorias (kcal):", calGoal);
    newCalGoal = parseInt(newCalGoal);
    if (!isNaN(newCalGoal) && newCalGoal > 0) {
        calGoal = newCalGoal;
        if (calConsumed > calGoal) calConsumed = calGoal; // ajustar consumo se ultrapassar meta
    } else {
        alert("Meta de calorias inválida. Mantendo valor anterior.");
    }

    let newWaterGoal = prompt("Defina sua meta diária de água (ml):", waterGoal);
    newWaterGoal = parseInt(newWaterGoal);
    if (!isNaN(newWaterGoal) && newWaterGoal > 0) {
        waterGoal = newWaterGoal;
        if (waterConsumed > waterGoal) waterConsumed = waterGoal;
    } else {
        alert("Meta de água inválida. Mantendo valor anterior.");
    }

    updateDisplay();
}

// Função para resetar progresso
function resetProgress() {
    if (confirm("Deseja realmente resetar o progresso?")) {
        calConsumed = 0;
        waterConsumed = 0;
        updateDisplay();
    }
}

// Inicializa display ao carregar a página
window.onload = function() {
    updateDisplay();
};
