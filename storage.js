// storage.js will be present in every file to acess and modify data

const key = 'db'

// Save data to localStorage
function saveData(value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`✅ Data saved under key "${key}"`);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load data from localStorage
function loadData() {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

function getLoggedUser() {
  const data = JSON.parse(localStorage.getItem('loggedUser'));

  if(data !== null){
    return data
  }
}

// Make the functions available globally (so you can use them anywhere)
window.saveData = saveData;
window.loadData = loadData;
window.getLoggedUser = getLoggedUser