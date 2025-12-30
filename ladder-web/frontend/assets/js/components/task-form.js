// Компонент формы создания/редактирования задачи
import { createTask, updateTask, getTask } from '../modules/tasks.js';
import { api } from '../modules/api.js';

export function initTaskForm(container, taskId = null) {
    if (!container) return;

    const form = document.createElement('form');
    form.id = 'task-form';
    form.innerHTML = `
        <div class="form-group">
            <label for="title">Название задачи</label>
            <input type="text" id="title" name="title" required>
        </div>
        <div class="form-group">
            <label for="description">Описание</label>
            <textarea id="description" name="description"></textarea>
        </div>
        <div class="form-group">
            <label for="priority">Приоритет</label>
            <select id="priority" name="priority">
                <option value="low">Низкий</option>
                <option value="medium" selected>Средний</option>
                <option value="high">Высокий</option>
            </select>
        </div>
        <div class="form-group">
            <label for="due_date">Срок выполнения</label>
            <input type="date" id="due_date" name="due_date">
        </div>
        <button type="submit" class="btn btn-primary">
            ${taskId ? 'Обновить' : 'Создать'} задачу
        </button>
    `;

    container.appendChild(form);

    // Загрузка данных задачи если редактирование
    if (taskId) {
        loadTaskData(taskId);
    }

    // Обработчик отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null,
        };

        try {
            if (taskId) {
                await updateTask(taskId, taskData);
            } else {
                await createTask(taskData);
            }
            window.location.href = '/public/tasks.html';
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    });
}

async function loadTaskData(taskId) {
    try {
        const task = await getTask(taskId);
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description || '';
        document.getElementById('priority').value = task.priority;
        if (task.due_date) {
            document.getElementById('due_date').value = task.due_date.split('T')[0];
        }
    } catch (error) {
        console.error('Error loading task:', error);
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('task-form');
    if (formContainer && formContainer.tagName === 'FORM') {
        // Форма уже существует в HTML
        const form = formContainer;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                due_date: formData.get('due_date') || null,
            };

            try {
                await createTask(taskData);
                window.location.href = '/public/tasks.html';
            } catch (error) {
                alert('Ошибка: ' + error.message);
            }
        });
    } else if (formContainer) {
        // Контейнер для динамического создания формы
        initTaskForm(formContainer);
    }
});

