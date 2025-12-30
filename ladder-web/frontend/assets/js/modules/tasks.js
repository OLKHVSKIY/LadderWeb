// Модуль работы с задачами
// Использует localStorage вместо API, так как backend не требуется

export async function loadTasks() {
    try {
        // Пытаемся загрузить из localStorage
        const tasksJson = localStorage.getItem('tasks');
        if (tasksJson) {
            return JSON.parse(tasksJson);
        }
        return [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

export async function createTask(taskData) {
    try {
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        
        const newTask = {
            id: Date.now(),
            ...taskData,
            created_at: new Date().toISOString(),
        };
        
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return newTask;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

export async function updateTask(id, taskData) {
    try {
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks[index];
        }
        throw new Error('Task not found');
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

export async function deleteTask(id) {
    try {
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        
        const filteredTasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

export function formatTaskDate(dateString) {
    const date = new Date(dateString);
    const lang = localStorage.getItem('language') || 'ru';
    const locales = {
        'ru': 'ru-RU',
        'en': 'en-US',
        'es': 'es-ES'
    };
    return date.toLocaleDateString(locales[lang] || 'ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

