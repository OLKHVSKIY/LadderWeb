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
        console.log('createTask called with data:', taskData);
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        console.log('Current tasks count before creation:', tasks.length);
        
        const taskId = Date.now();
        const newTask = {
            id: taskId,
            ...taskData,
            created_at: new Date().toISOString(),
        };
        
        console.log('New task object:', newTask);
        
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Проверяем, что задача действительно сохранилась
        const verifyJson = localStorage.getItem('tasks');
        const verifyTasks = verifyJson ? JSON.parse(verifyJson) : [];
        const verifyTask = verifyTasks.find(t => t.id === taskId);
        console.log('Task saved, verification:', verifyTask ? 'SUCCESS' : 'FAILED');
        console.log('Total tasks after save:', verifyTasks.length);
        
        if (!verifyTask) {
            console.error('CRITICAL: Task was not saved properly!');
            throw new Error('Task was not saved to localStorage');
        }
        
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

