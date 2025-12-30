// Компонент AI предложений
import { decomposeTask, formatAISuggestions } from '../modules/ai.js';
import { createTask } from '../modules/tasks.js';

export function initAISuggestions() {
    const decomposeBtn = document.getElementById('ai-decompose-btn');
    const input = document.getElementById('ai-input');
    const suggestionsContainer = document.getElementById('ai-suggestions');

    if (!decomposeBtn || !input || !suggestionsContainer) return;

    decomposeBtn.addEventListener('click', async () => {
        const description = input.value.trim();
        if (!description) {
            alert('Введите описание задачи');
            return;
        }

        decomposeBtn.disabled = true;
        decomposeBtn.textContent = 'Обработка...';

        try {
            const subtasks = await decomposeTask(description);
            const formatted = formatAISuggestions(subtasks);
            renderSuggestions(formatted, suggestionsContainer);
        } catch (error) {
            alert('Ошибка: ' + error.message);
        } finally {
            decomposeBtn.disabled = false;
            decomposeBtn.textContent = 'Разложить на подзадачи';
        }
    });
}

function renderSuggestions(suggestions, container) {
    container.innerHTML = '';

    if (suggestions.length === 0) {
        container.innerHTML = '<p>Не удалось разложить задачу</p>';
        return;
    }

    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'ai-suggestion-item';
        item.innerHTML = `
            <h4>${suggestion.title}</h4>
            ${suggestion.description ? `<p>${suggestion.description}</p>` : ''}
            <button class="btn btn-primary btn-sm" data-suggestion='${JSON.stringify(suggestion)}'>
                Создать задачу
            </button>
        `;

        item.querySelector('button').addEventListener('click', async (e) => {
            const suggestionData = JSON.parse(e.target.dataset.suggestion);
            try {
                await createTask(suggestionData);
                item.style.opacity = '0.5';
                e.target.textContent = 'Создано';
                e.target.disabled = true;
            } catch (error) {
                alert('Ошибка создания задачи: ' + error.message);
            }
        });

        container.appendChild(item);
    });
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    initAISuggestions();
});

