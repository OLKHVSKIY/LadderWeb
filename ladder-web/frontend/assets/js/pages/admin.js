// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initAdminPanel();
});

function initAdminPanel() {
    // Navigation
    setupNavigation();
    
    // Load initial data
    loadOverviewData();
    
    // Setup refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const activeSection = document.querySelector('.admin-section.active');
            if (activeSection) {
                const sectionName = activeSection.id.replace('-section', '');
                console.log('Refreshing section:', sectionName);
                loadSectionData(sectionName);
            }
        });
    }
    
    // Инициализируем графики после небольшой задержки для правильного размера canvas
    setTimeout(() => {
        const users = getUsers();
        updateRegistrationsChart(users);
        updateFeaturesChart();
    }, 100);
}

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                    updatePageTitle(item.textContent.trim());
                    // Загружаем данные с небольшой задержкой для правильной инициализации графиков
                    setTimeout(() => {
                        loadSectionData(sectionId);
                    }, 50);
                }
            });
        });
    });
}

function updatePageTitle(title) {
    document.getElementById('page-title').textContent = title;
}

// Load section data
function loadSectionData(section) {
    switch(section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'tasks':
            loadTasksData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'suggestions':
            loadSuggestionsData();
            break;
    }
}

// Overview Data
function loadOverviewData() {
    // Load from localStorage or API
    const users = getUsers();
    const tasks = getTasks();
    const suggestions = getSuggestions();
    const subscriptions = getSubscriptions();
    
    // Update stats
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-tasks').textContent = tasks.length;
    document.getElementById('total-suggestions').textContent = suggestions.length;
    document.getElementById('total-subscriptions').textContent = subscriptions.length;
    
    // Calculate new registrations this month
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsers = users.filter(u => new Date(u.created_at) >= thisMonth);
    document.getElementById('new-registrations').textContent = newUsers.length;
    document.getElementById('users-change').querySelector('span').textContent = `+${newUsers.length}`;
    
    // Calculate new tasks this month
    const newTasks = tasks.filter(t => new Date(t.created_at) >= thisMonth);
    document.getElementById('tasks-change').querySelector('span').textContent = `+${newTasks.length}`;
    
    // Update subscriptions
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    document.getElementById('subscriptions-change').querySelector('span').textContent = activeSubscriptions.length;
    
    // Update unread suggestions
    const unreadSuggestions = suggestions.filter(s => !s.read);
    document.getElementById('suggestions-change').querySelector('span').textContent = unreadSuggestions.length;
    
    // Update charts with delay for proper canvas sizing
    setTimeout(() => {
        updateRegistrationsChart(users);
        updateFeaturesChart();
    }, 100);
}

// Users Data
function loadUsersData() {
    // Сначала синхронизируем пользователей из настроек
    const users = getUsers();
    const tasks = getTasks();
    const tbody = document.getElementById('users-table-body');
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #86868b;">Нет пользователей</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const userTasks = tasks.filter(t => t.user_id === user.id);
        const row = createUserRow(user, userTasks.length);
        tbody.appendChild(row);
    });
    
    // Setup search (удаляем старые обработчики)
    const searchInput = document.getElementById('users-search');
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    newSearchInput.addEventListener('input', (e) => {
        filterUsers(e.target.value);
    });
}

function createUserRow(user, tasksCount) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name || 'Не указано'}</td>
        <td>${user.email}</td>
        <td>${formatDate(user.created_at)}</td>
        <td>${tasksCount}</td>
        <td><span class="status-badge active">Активен</span></td>
        <td>
            <button class="action-btn" onclick="viewUser(${user.id})">Просмотр</button>
        </td>
    `;
    return tr;
}

function filterUsers(query) {
    const rows = document.querySelectorAll('#users-table-body tr');
    const lowerQuery = query.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
}

// Tasks Data
function loadTasksData() {
    const tasks = getTasks();
    const users = getUsers();
    const tbody = document.getElementById('tasks-table-body');
    
    tbody.innerHTML = '';
    
    // Сортируем задачи по дате создания (новые сверху)
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0);
        const dateB = new Date(b.created_at || b.date || 0);
        return dateB - dateA; // Убывание: новые сначала
    });
    
    sortedTasks.forEach(task => {
        const user = users.find(u => u.id === task.user_id);
        const row = createTaskRow(task, user);
        tbody.appendChild(row);
    });
    
    // Setup filter (удаляем старый обработчик и добавляем новый)
    const filterSelect = document.getElementById('tasks-filter');
    const newFilterSelect = filterSelect.cloneNode(true);
    filterSelect.parentNode.replaceChild(newFilterSelect, filterSelect);
    
    newFilterSelect.addEventListener('change', (e) => {
        filterTasks(e.target.value);
    });
}

function createTaskRow(task, user) {
    const tr = document.createElement('tr');
    const priorityLabels = { 1: 'Низкий', 2: 'Средний', 3: 'Высокий' };
    const priorityColors = { 1: '#34c759', 2: '#ff9500', 3: '#ff3b30' };
    
    tr.innerHTML = `
        <td>${task.id}</td>
        <td>${task.title}</td>
        <td>${user ? user.name || user.email : 'Неизвестно'}</td>
        <td>${formatDate(task.created_at)}</td>
        <td><span style="color: ${priorityColors[task.priority]}">${priorityLabels[task.priority]}</span></td>
        <td><span class="status-badge ${task.completed ? 'active' : 'inactive'}">${task.completed ? 'Выполнено' : 'Активна'}</span></td>
    `;
    return tr;
}

function filterTasks(filter) {
    const rows = document.querySelectorAll('#tasks-table-body tr');
    const now = new Date();
    
    rows.forEach(row => {
        const dateText = row.cells[3].textContent;
        const taskDate = new Date(dateText);
        let show = true;
        
        switch(filter) {
            case 'today':
                show = isSameDay(taskDate, now);
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                show = taskDate >= weekAgo;
                break;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                show = taskDate >= monthAgo;
                break;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

// Analytics Data
function loadAnalyticsData() {
    updateFeaturesList();
    updateActivityChart();
    updateSubscriptionsChart();
}

function updateFeaturesList() {
    const features = getFeatureUsage();
    const container = document.getElementById('features-list');
    
    container.innerHTML = '';
    
    features.forEach(feature => {
        const item = document.createElement('div');
        item.className = 'feature-item';
        item.innerHTML = `
            <span class="feature-name">${feature.name}</span>
            <span class="feature-count">${feature.count}</span>
        `;
        container.appendChild(item);
    });
}

// Suggestions Data
function loadSuggestionsData() {
    const suggestions = getSuggestions();
    const container = document.getElementById('suggestions-list');
    
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #86868b;">Нет предложений</div>';
        return;
    }
    
    // Сортируем по дате (новые сначала)
    const sortedSuggestions = [...suggestions].sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0);
        const dateB = new Date(b.created_at || b.date || 0);
        return dateB - dateA;
    });
    
    sortedSuggestions.forEach(suggestion => {
        const card = createSuggestionCard(suggestion);
        container.appendChild(card);
    });
    
    // Setup filters (удаляем старые обработчики и добавляем новые)
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            filterSuggestions(newBtn.dataset.filter);
        });
    });
}

function createSuggestionCard(suggestion) {
    const card = document.createElement('div');
    // Проверяем read, если поле отсутствует - считаем непрочитанным
    const isRead = suggestion.read === true;
    card.className = `suggestion-card ${isRead ? '' : 'unread'}`;
    
    // Получаем имя и сообщение (поддерживаем оба формата)
    const name = suggestion.name || suggestion.title || 'Аноним';
    const message = suggestion.message || suggestion.description || '';
    const email = suggestion.email || null;
    const date = suggestion.created_at || suggestion.date || new Date().toISOString();
    
    card.innerHTML = `
        <div class="suggestion-header">
            <div class="suggestion-meta">
                <div class="suggestion-author">${escapeHtml(name)}</div>
                <div class="suggestion-date">${formatDate(date)}</div>
            </div>
            ${!isRead ? '<span class="status-badge" style="background: #ff3b30; color: #fff;">Новое</span>' : ''}
        </div>
        <div class="suggestion-content">${escapeHtml(message)}</div>
        <div class="suggestion-actions">
            ${email ? `<a href="mailto:${escapeHtml(email)}" class="action-btn">Ответить</a>` : ''}
            <button class="action-btn primary" onclick="markAsRead(${suggestion.id})">Отметить прочитанным</button>
        </div>
    `;
    return card;
}

function filterSuggestions(filter) {
    const cards = document.querySelectorAll('.suggestion-card');
    
    cards.forEach(card => {
        let show = true;
        
        if (filter === 'unread') {
            show = card.classList.contains('unread');
        } else if (filter === 'read') {
            show = !card.classList.contains('unread');
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Charts with Chart.js
let registrationsChart = null;
let featuresChart = null;
let activityChart = null;

function updateRegistrationsChart(users) {
    // Group by date for last 30 days
    const last30Days = [];
    const labels = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last30Days.push({
            date: dateStr,
            count: 0
        });
        labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
    }
    
    users.forEach(user => {
        const userDate = new Date(user.created_at).toISOString().split('T')[0];
        const day = last30Days.find(d => d.date === userDate);
        if (day) day.count++;
    });
    
    const canvas = document.getElementById('registrations-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (registrationsChart) {
        registrationsChart.destroy();
    }
    
    registrationsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Регистрации',
                data: last30Days.map(d => d.count),
                backgroundColor: '#ff3b30',
                borderColor: '#ff2d20',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: '#e5e5e7'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateFeaturesChart() {
    const features = getFeatureUsage();
    const canvas = document.getElementById('features-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (featuresChart) {
        featuresChart.destroy();
    }
    
    const colors = ['#ff3b30', '#007aff', '#34c759', '#ff9500', '#af52de', '#5856d6'];
    
    featuresChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: features.map(f => f.name),
            datasets: [{
                data: features.map(f => f.count),
                backgroundColor: colors.slice(0, features.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 12,
                        font: {
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateActivityChart() {
    const tasks = getTasks();
    const notes = JSON.parse(localStorage.getItem('notes_stickers') || '[]');
    
    // Group by date for last 7 days
    const last7Days = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push({
            date: dateStr,
            tasks: 0,
            notes: 0
        });
        labels.push(date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));
    }
    
    tasks.forEach(task => {
        const taskDate = new Date(task.created_at || task.date).toISOString().split('T')[0];
        const day = last7Days.find(d => d.date === taskDate);
        if (day) day.tasks++;
    });
    
    notes.forEach(note => {
        const noteDate = new Date(note.created_at || note.date).toISOString().split('T')[0];
        const day = last7Days.find(d => d.date === noteDate);
        if (day) day.notes++;
    });
    
    const canvas = document.getElementById('activity-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (activityChart) {
        activityChart.destroy();
    }
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Задачи',
                    data: last7Days.map(d => d.tasks),
                    borderColor: '#ff3b30',
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Заметки',
                    data: last7Days.map(d => d.notes),
                    borderColor: '#007aff',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: '#e5e5e7'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateSubscriptionsChart() {
    const subscriptions = getSubscriptions();
    
    // Group by plan type
    const planCounts = {
        'pro': 0,
        'premium': 0,
        'enterprise': 0
    };
    
    subscriptions.forEach(sub => {
        if (sub.status === 'active' && planCounts.hasOwnProperty(sub.plan)) {
            planCounts[sub.plan]++;
        }
    });
    
    // This would be used if we add a subscriptions chart
    // For now, we just track the data
}

// Data functions
function getUsers() {
    // Получаем пользователей из localStorage
    const userName = localStorage.getItem('user_name') || '';
    const userEmail = localStorage.getItem('user_email') || '';
    
    // Получаем сохраненных пользователей из админки
    const adminUsersJson = localStorage.getItem('admin_users') || '[]';
    let adminUsers = JSON.parse(adminUsersJson);
    
    // Если есть данные в настройках, добавляем/обновляем пользователя
    if (userName || userEmail) {
        // Проверяем, есть ли уже такой пользователь по email
        const existingUserIndex = adminUsers.findIndex(u => 
            u.email && userEmail && u.email.toLowerCase() === userEmail.toLowerCase()
        );
        
        const userData = {
            id: existingUserIndex >= 0 ? adminUsers[existingUserIndex].id : (adminUsers.length > 0 ? Math.max(...adminUsers.map(u => u.id)) + 1 : 1),
            name: userName || 'Пользователь',
            email: userEmail || 'Не указан',
            created_at: existingUserIndex >= 0 
                ? adminUsers[existingUserIndex].created_at 
                : new Date().toISOString()
        };
        
        if (existingUserIndex >= 0) {
            // Обновляем существующего пользователя
            adminUsers[existingUserIndex] = { ...adminUsers[existingUserIndex], ...userData };
        } else {
            // Добавляем нового пользователя
            adminUsers.push(userData);
        }
        
        localStorage.setItem('admin_users', JSON.stringify(adminUsers));
    }
    
    // Если нет пользователей, создаем из текущих настроек
    if (adminUsers.length === 0 && (userName || userEmail)) {
        adminUsers = [{
            id: 1,
            name: userName || 'Пользователь',
            email: userEmail || 'Не указан',
            created_at: new Date().toISOString()
        }];
        localStorage.setItem('admin_users', JSON.stringify(adminUsers));
    }
    
    // Всегда возвращаем актуальные данные из настроек, если они есть
    if (userName || userEmail) {
        const finalUserIndex = adminUsers.findIndex(u => 
            u.email && userEmail && u.email.toLowerCase() === userEmail.toLowerCase()
        );
        if (finalUserIndex >= 0) {
            adminUsers[finalUserIndex] = {
                ...adminUsers[finalUserIndex],
                name: userName || adminUsers[finalUserIndex].name,
                email: userEmail || adminUsers[finalUserIndex].email
            };
        }
    }
    
    return adminUsers;
}

function getTasks() {
    const tasksJson = localStorage.getItem('tasks') || '[]';
    const tasks = JSON.parse(tasksJson);
    const users = getUsers();
    
    // Если есть пользователи, связываем задачи с первым пользователем
    const defaultUserId = users.length > 0 ? users[0].id : 1;
    
    // Добавляем user_id если его нет (для совместимости)
    return tasks.map((task, index) => ({
        ...task,
        user_id: task.user_id || defaultUserId, // По умолчанию первый пользователь
        created_at: task.created_at || task.date || new Date().toISOString()
    }));
}

function getSuggestions() {
    const suggestionsJson = localStorage.getItem('admin_suggestions') || '[]';
    let suggestions = JSON.parse(suggestionsJson);
    
    // Если нет предложений в admin_suggestions, проверяем старый формат
    if (suggestions.length === 0) {
        const oldSuggestionsJson = localStorage.getItem('suggestions') || '[]';
        const oldSuggestions = JSON.parse(oldSuggestionsJson);
        
        // Конвертируем старый формат в новый
        if (oldSuggestions.length > 0) {
            suggestions = oldSuggestions.map(s => ({
                id: s.id,
                name: s.title || 'Аноним',
                message: s.description || '',
                email: s.email || null,
                created_at: s.date || s.created_at || new Date().toISOString(),
                read: false
            }));
            localStorage.setItem('admin_suggestions', JSON.stringify(suggestions));
        }
    }
    
    return suggestions;
}

function getSubscriptions() {
    const subscriptionsJson = localStorage.getItem('admin_subscriptions') || '[]';
    let subscriptions = JSON.parse(subscriptionsJson);
    
    // Если нет подписок, проверяем в настройках пользователя
    if (subscriptions.length === 0) {
        const userPlan = localStorage.getItem('user_plan') || 'free';
        if (userPlan !== 'free') {
            subscriptions = [{
                id: 1,
                user_id: 1,
                plan: userPlan,
                status: 'active',
                created_at: new Date().toISOString(),
                expires_at: null
            }];
            localStorage.setItem('admin_subscriptions', JSON.stringify(subscriptions));
        }
    }
    
    return subscriptions;
}

function getFeatureUsage() {
    // Получаем реальные данные из localStorage
    const featureUsage = JSON.parse(localStorage.getItem('feature_usage') || '{}');
    
    // Если данных нет, инициализируем
    if (Object.keys(featureUsage).length === 0) {
        const tasks = getTasks();
        const notes = JSON.parse(localStorage.getItem('notes_stickers') || '[]');
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        
        // Считаем только сообщения пользователя (не от ИИ)
        const chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
        const userMessages = chatHistory.filter(msg => msg.role === 'user' || msg.type === 'user');
        
        return [
            { name: 'Создание задач', count: tasks.length },
            { name: 'Создание заметок', count: notes.length },
            { name: 'Поиск', count: searchHistory.length },
            { name: 'Quick Add', count: searchHistory.filter(s => s.type === 'tasks' || s.type === 'note').length },
            { name: 'Чат с AI', count: userMessages.length }
        ];
    }
    
    // Преобразуем объект в массив
    return Object.entries(featureUsage).map(([name, count]) => ({
        name,
        count: parseInt(count) || 0
    })).sort((a, b) => b.count - a.count);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Не указано';
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Action functions
function viewUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    const tasks = getTasks();
    const userTasks = tasks.filter(t => t.user_id === userId);
    const subscriptions = getSubscriptions();
    const userSubscription = subscriptions.find(s => s.user_id === userId && s.status === 'active');
    
    if (!user) {
        alert('Пользователь не найден');
        return;
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'user-modal-overlay';
    modal.innerHTML = `
        <div class="user-modal">
            <div class="user-modal-header">
                <h3>Информация о пользователе</h3>
                <button class="user-modal-close" onclick="this.closest('.user-modal-overlay').remove()">×</button>
            </div>
            <div class="user-modal-content">
                <div class="user-info-item">
                    <span class="user-info-label">ID:</span>
                    <span class="user-info-value">${user.id}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Имя:</span>
                    <span class="user-info-value">${escapeHtml(user.name || 'Не указано')}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Email:</span>
                    <span class="user-info-value">${escapeHtml(user.email || 'Не указан')}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Дата регистрации:</span>
                    <span class="user-info-value">${formatDate(user.created_at)}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Задач создано:</span>
                    <span class="user-info-value">${userTasks.length}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Подписка:</span>
                    <span class="user-info-value">${userSubscription ? userSubscription.plan.toUpperCase() : 'Бесплатная'}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие по клику на overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function markAsRead(suggestionId) {
    const suggestions = getSuggestions();
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
        suggestion.read = true;
        localStorage.setItem('admin_suggestions', JSON.stringify(suggestions));
        // Обновляем отображение
        loadSuggestionsData();
        // Обновляем статистику в overview
        if (document.getElementById('suggestions-section').classList.contains('active')) {
            loadOverviewData();
        }
    }
}

// Делаем функции глобальными для использования в onclick
window.viewUser = viewUser;
window.markAsRead = markAsRead;

