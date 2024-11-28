document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const contextMenu = document.getElementById('contextMenu');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTask = null;
    let deletedTask = null;
    let deletedTaskIndex = null;

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            if (task.done) li.classList.add('done');
            if (task.notNeeded) li.classList.add('not-needed');

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;
            li.appendChild(taskText);

            if (task.notNeeded) {
                const notNeededText = document.createElement('div');
                notNeededText.classList.add('not-needed-text');
                notNeededText.textContent = 'Not needed';
                li.appendChild(notNeededText);
            }

            li.dataset.index = index;
            li.addEventListener('contextmenu', showContextMenu);
            li.addEventListener('touchstart', handleLongPress);
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, done: false, notNeeded: false });
            saveTasks();
            renderTasks();
            taskInput.value = '';
        }
    }

    function handleLongPress(e) {
        e.preventDefault();
        showContextMenu(e);
    }

    function showContextMenu(e) {
        e.preventDefault();
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        
        currentTask = e.currentTarget;
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    function handleContextMenuAction(action) {
        const index = currentTask.dataset.index;
        
        switch(action) {
            case 'edit':
                const newText = prompt('Edit task:', tasks[index].text);
                if (newText !== null) {
                    tasks[index].text = newText.trim();
                }
                break;
            case 'delete':
                deletedTask = tasks.splice(index, 1)[0];
                deletedTaskIndex = index;
                showUndo(deletedTask, deletedTaskIndex);
                break;
            case 'done':
                tasks[index].done = !tasks[index].done;
                break;
            case 'not-needed':
                tasks[index].notNeeded = !tasks[index].notNeeded;
                break;
        }
        
        saveTasks();
        renderTasks();
        hideContextMenu();
    }

    function showUndo(task, originalIndex) {
        // Display a UI element to allow the user to undo the deletion
        const undoContainer = document.createElement('div');
        undoContainer.classList.add('undo-container');
        undoContainer.textContent = `Deleted "${task.text}". Undo?`;

        const undoButton = document.createElement('button');
        undoButton.textContent = 'Undo';
        undoButton.addEventListener('click', handleUndo);

        undoContainer.appendChild(undoButton);
        taskList.insertBefore(undoContainer, taskList.firstChild);

        // Remove the undo container after 5 seconds
        const undoTimeout = setTimeout(() => {
            taskList.removeChild(undoContainer);
            clearTimeout(undoTimeout);
        }, 5000);
    }

    function handleUndo() {
        // Restore the deleted task
        tasks.splice(deletedTaskIndex, 0, deletedTask);
        saveTasks();
        renderTasks();

        // Remove the undo container
        const undoContainer = document.querySelector('.undo-container');
        taskList.removeChild(undoContainer);

        deletedTask = null;
        deletedTaskIndex = null;
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    document.addEventListener('click', hideContextMenu);
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action) handleContextMenuAction(action);
    });

    // Initial render
    renderTasks();

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered'))
            .catch(error => console.error('Service Worker registration failed:', error));
    }
});