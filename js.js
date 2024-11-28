// Task arrays
let tasks = [];
let deletedTasks = [];

// Load tasks from localStorage
function loadTasks() {
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
  updateUI();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

// Update the UI
function updateUI() {
  const taskList = document.getElementById('taskList');
  const trashList = document.getElementById('trashList');
  
  // Display active tasks
  taskList.innerHTML = tasks.map((task, index) => `
    <li>
      ${task}
      <button onclick="deleteTask(${index})">Delete</button>
    </li>
  `).join('');

  // Display deleted tasks
  trashList.innerHTML = deletedTasks.map((task, index) => `
    <li>
      ${task}
      <button onclick="restoreTask(${index})">Restore</button>
    </li>
  `).join('');
}

// Add a new task
document.getElementById('addTaskButton').addEventListener('click', () => {
  const taskInput = document.getElementById('taskInput');
  const task = taskInput.value.trim();
  
  if (task) {
    tasks.push(task);
    taskInput.value = '';
    saveTasks();
    updateUI();
  }
});

// Delete a task
function deleteTask(index) {
  deletedTasks.push(tasks[index]);
  tasks.splice(index, 1);
  saveTasks();
  updateUI();
}

// Restore a task
function restoreTask(index) {
  tasks.push(deletedTasks[index]);
  deletedTasks.splice(index, 1);
  saveTasks();
  updateUI();
}

// Open Trash Bin
document.getElementById('trashBinButton').addEventListener('click', () => {
  document.getElementById('trashBinModal').classList.remove('hidden');
});

// Close Trash Bin
document.getElementById('closeTrashButton').addEventListener('click', () => {
  document.getElementById('trashBinModal').classList.add('hidden');
});

// Initialize the app
loadTasks();
