// Компонент списка задач
import { loadTasks, deleteTask, updateTask } from '../modules/tasks.js';
import { formatTaskDate } from '../modules/tasks.js';

export async function renderTaskList(container) {
    if (!container) return;

    const tasks = await loadTasks();
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">Нет задач</p>';
        return;
    }

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        container.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.innerHTML = `
        <div class="task-card-header">
            <h3 class="task-card-title">${task.title}</h3>
            <span class="task-card-priority ${task.priority}">${task.priority}</span>
        </div>
        <p class="task-card-description">${task.description || ''}</p>
        <div class="task-card-footer">
            <span>${formatTaskDate(task.due_date)}</span>
            <div class="task-card-actions">
                <button class="btn-complete" data-id="${task.id}">
                    ${task.completed ? 'Отменить' : 'Выполнить'}
                </button>
                <button class="btn-delete" data-id="${task.id}">Удалить</button>
            </div>
        </div>
    `;

    // Обработчики событий
    card.querySelector('.btn-complete').addEventListener('click', async (e) => {
        const taskId = parseInt(e.target.dataset.id);
        await updateTask(taskId, { completed: !task.completed });
        renderTaskList(document.getElementById('task-list'));
    });

    card.querySelector('.btn-delete').addEventListener('click', async (e) => {
        if (confirm('Удалить задачу?')) {
            const taskId = parseInt(e.target.dataset.id);
            await deleteTask(taskId);
            renderTaskList(document.getElementById('task-list'));
        }
    });

    return card;
}

// Автоматическая инициализация отключена
// Используется tasks-page.js для загрузки задач на странице tasks.html
// Раскомментируйте ниже, если нужна автоматическая инициализация на других страницах
/*
document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    if (taskList) {
        renderTaskList(taskList);
    }
});
*/

