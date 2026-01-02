// Модуль работы с заметками
// Использует API с fallback на localStorage

import { api } from './api.js';

export async function loadNotes(workspaceId) {
    try {
        const data = await api.getNotes(workspaceId);
        if (data && Array.isArray(data.stickers)) {
            return data.stickers;
        }
        return [];
    } catch (error) {
        console.error('Error loading notes:', error);
        return [];
    }
}

export async function saveNotes(workspaceId, stickers) {
    try {
        const data = await api.saveNotes(workspaceId, stickers || []);
        return data?.stickers || [];
    } catch (error) {
        console.error('Error saving notes:', error);
        throw error;
    }
}
