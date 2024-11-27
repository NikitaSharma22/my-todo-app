document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const themeToggle = document.getElementById('themeToggle');
    const contextMenu = document.getElementById('contextMenu');
    const undoContainer = document.getElementById('undoContainer');
    const undoButton = document.getElementById('undoButton');

    let selectedTask = null;
    let deletedTask = null;
    let undoTimeout = null;

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => addTaskToDOM(task.text, task.state));

    // Add task on "Add" button click or "Enter" key press
    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTaskToDOM(taskText);
            saveTask(taskText, 'default');
            taskInput.value = '';
        }
    };

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Add task to DOM
    function addTaskToDOM(taskText, state = 'default') {
        const li = document.createElement('li');
        li.textContent = taskText;

        if (state === 'done') li.classList.add('done');
        if (state === 'not-needed') li.classList.add('not-needed');

        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, li);
        });

        taskList.appendChild(li);
    }

    // Show Context Menu
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        const taskElement = event.target.closest('li');
        if (taskElement) {
            showContextMenu(event.pageX, event.pageY, taskElement);
        }
    });

    function showContextMenu(x, y, taskElement) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
        selectedTask = taskElement;
    }

    // Hide Context Menu when clicking elsewhere
    document.addEventListener('click', () => contextMenu.classList.add('hidden'));

    // Context Menu Actions
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.id;

        if (!selectedTask) return;

        if (action === 'editTask') {
            const newText = prompt('Edit your task:', selectedTask.textContent);
            if (newText) {
                selectedTask.textContent = newText;
                updateTaskInStorage(selectedTask.textContent, newText);
            }
        }

        if (action === 'markDone') {
            selectedTask.classList.toggle('done');
            updateTaskState(selectedTask, selectedTask.classList.contains('done') ? 'done' : 'default');
        }

        if (action === 'markNotNeeded') {
            selectedTask.classList.toggle('not-needed');
            updateTaskState(selectedTask, selectedTask.classList.contains('not-needed') ? 'not-needed' : 'default');
        }

        if (action === 'deleteTask') {
            deleteTask(selectedTask);
        }
    });

    // Delete Task with Undo Option
    function deleteTask(taskElement) {
        deletedTask = {
            text: taskElement.textContent,
            state: taskElement.classList.contains('done') ? 'done' : taskElement.classList.contains('not-needed') ? 'not-needed' : 'default'
        };

        taskElement.remove();
        undoContainer.classList.remove('hidden');

        clearTimeout(undoTimeout);
        undoTimeout = setTimeout(() => {
            undoContainer.classList.add('hidden');
            deletedTask = null;
        }, 5000);
    }

    // Undo Deletion
    undoButton.addEventListener('click', () => {
        if (deletedTask) {
            addTaskToDOM(deletedTask.text, deletedTask.state);
            saveTask(deletedTask.text, deletedTask.state);

            undoContainer.classList.add('hidden');
            deletedTask = null;
            clearTimeout(undoTimeout);
        }
    });

    // Save Task to LocalStorage
    function saveTask(text, state) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ text, state });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Update Task in LocalStorage
    function updateTaskInStorage(oldText, newText) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(task => task.text === oldText);
        if (taskIndex !== -1) {
            tasks[taskIndex].text = newText;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    // Toggle Dark Mode
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'true' : 'false');
    });

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
});
