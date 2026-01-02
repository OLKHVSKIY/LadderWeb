// Модуль работы с задачами
// Использует API с fallback на localStorage

import { api } from './api.js';

export async function loadTasks() {
    try {
        const tasks = await api.getTasks();
        if (Array.isArray(tasks)) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks;
        }
        const tasksJson = localStorage.getItem('tasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

export async function createTask(taskData) {
    try {
        const created = await api.createTask(taskData);
        if (created && created.id) {
            const tasksJson = localStorage.getItem('tasks');
            const tasks = tasksJson ? JSON.parse(tasksJson) : [];
            tasks.push(created);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return created;
        }
        throw new Error('API create failed');
    } catch (error) {
        console.error('Error creating task:', error);
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const taskId = Date.now();
        const newTask = {
            id: taskId,
            ...taskData,
            created_at: new Date().toISOString(),
        };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return newTask;
    }
}

export async function updateTask(id, taskData) {
    try {
        const updated = await api.updateTask(id, taskData);
        if (updated && updated.id) {
            const tasksJson = localStorage.getItem('tasks');
            const tasks = tasksJson ? JSON.parse(tasksJson) : [];
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...updated };
            } else {
                tasks.push(updated);
            }
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return updated;
        }
        throw new Error('API update failed');
    } catch (error) {
        console.error('Error updating task:', error);
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks[index];
        }
        throw error;
    }
}

export async function deleteTask(id) {
    try {
        await api.deleteTask(id);
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const filteredTasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const filteredTasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
        return true;
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
