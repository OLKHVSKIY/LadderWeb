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
        // Если бэкенд недоступен, пробуем взять из localStorage, чтобы не терять заметки
        try {
            const local = localStorage.getItem('notes_stickers');
            if (local) {
                const parsed = JSON.parse(local);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (storageError) {
            console.error('Error reading notes from localStorage:', storageError);
        }
        console.error('Error loading notes from API, fallback to empty:', error);
        return [];
    }
}

export async function saveNotes(workspaceId, stickers) {
    try {
        const data = await api.saveNotes(workspaceId, stickers || []);
        return data?.stickers || [];
    } catch (error) {
        console.error('Error saving notes to API, saving locally:', error);
        try {
            // Сохраняем локально, чтобы пользователь не терял данные при оффлайне
            localStorage.setItem('notes_stickers', JSON.stringify(stickers || []));
        } catch (storageError) {
            console.error('Error saving notes to localStorage:', storageError);
        }
        // Возвращаем то, что смогли сохранить локально
        return stickers || [];
    }
}
