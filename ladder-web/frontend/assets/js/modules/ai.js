// Модуль AI интеграции
import { api } from './api.js';

export async function decomposeTask(description) {
    try {
        const result = await api.decomposeTask(description);
        return result.subtasks || [];
    } catch (error) {
        console.error('Error decomposing task:', error);
        throw error;
    }
}

export function formatAISuggestions(subtasks) {
    return subtasks.map((subtask, index) => ({
        id: index + 1,
        title: subtask.title || subtask,
        description: subtask.description || '',
        priority: subtask.priority || 'medium',
    }));
}

