// Модуль работы с пространствами (workspaces)

// Структура пространства:
// {
//   id: string,
//   name: string,
//   isPersonal: boolean, // true для первого личного пространства
//   createdAt: string,
//   members: [
//     {
//       userId: string,
//       userName: string,
//       avatar: string,
//       joinedAt: string
//     }
//   ],
//   inviteCode: string, // код для приглашения
//   stickers: [] // стикеры этого пространства
// }

// Получить все пространства
export function getWorkspaces() {
    try {
        const workspacesJson = localStorage.getItem('workspaces');
        if (workspacesJson) {
            return JSON.parse(workspacesJson);
        }
        // Если пространств нет, создаем первое личное пространство
        const personalWorkspace = createPersonalWorkspace();
        return [personalWorkspace];
    } catch (error) {
        console.error('Error loading workspaces:', error);
        const personalWorkspace = createPersonalWorkspace();
        return [personalWorkspace];
    }
}

// Создать первое личное пространство
function createPersonalWorkspace() {
    const personalWorkspace = {
        id: 'personal-' + Date.now(),
        name: 'Личное пространство',
        isPersonal: true,
        createdAt: new Date().toISOString(),
        members: [],
        inviteCode: null, // личное пространство нельзя приглашать
        stickers: []
    };
    saveWorkspaces([personalWorkspace]);
    return personalWorkspace;
}

// Сохранить пространства
export function saveWorkspaces(workspaces) {
    try {
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
    } catch (error) {
        console.error('Error saving workspaces:', error);
    }
}

// Получить текущее активное пространство
export function getCurrentWorkspace() {
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    const workspaces = getWorkspaces();
    
    if (workspaceId) {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace) {
            return workspace;
        }
    }
    
    // Если нет активного, возвращаем первое (личное)
    return workspaces[0] || createPersonalWorkspace();
}

// Установить текущее активное пространство
export function setCurrentWorkspace(workspaceId) {
    localStorage.setItem('currentWorkspaceId', workspaceId);
}

// Создать новое пространство
export function createWorkspace(name) {
    const workspaces = getWorkspaces();
    const newWorkspace = {
        id: 'workspace-' + Date.now(),
        name: name || `Пространство ${workspaces.length}`,
        isPersonal: false,
        createdAt: new Date().toISOString(),
        members: [],
        inviteCode: generateInviteCode(),
        stickers: []
    };
    
    workspaces.push(newWorkspace);
    saveWorkspaces(workspaces);
    return newWorkspace;
}

// Удалить пространство
export function deleteWorkspace(workspaceId) {
    const workspaces = getWorkspaces();
    const filtered = workspaces.filter(w => w.id !== workspaceId);
    
    // Нельзя удалить личное пространство
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace && workspace.isPersonal) {
        throw new Error('Нельзя удалить личное пространство');
    }
    
    // Если удаляем текущее пространство, переключаемся на первое
    const currentId = localStorage.getItem('currentWorkspaceId');
    if (currentId === workspaceId) {
        if (filtered.length > 0) {
            setCurrentWorkspace(filtered[0].id);
        }
    }
    
    saveWorkspaces(filtered);
}

// Переименовать пространство
export function renameWorkspace(workspaceId, newName) {
    const workspaces = getWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
        workspace.name = newName;
        saveWorkspaces(workspaces);
    }
}

// Генерировать код приглашения
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Получить ссылку приглашения
export function getInviteLink(workspaceId) {
    const workspace = getWorkspaces().find(w => w.id === workspaceId);
    if (!workspace) {
        return null;
    }
    
    if (workspace.isPersonal) {
        throw new Error('Нельзя пригласить в личное пространство');
    }
    
    // Генерируем ссылку на основе inviteCode
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/notes.html?invite=${workspace.inviteCode}`;
}

// Принять приглашение по коду
export function acceptInvite(inviteCode) {
    const workspaces = getWorkspaces();
    const workspace = workspaces.find(w => w.inviteCode === inviteCode);
    
    if (!workspace) {
        throw new Error('Неверный код приглашения');
    }
    
    // Получаем данные текущего пользователя
    const user = getUserData();
    if (!user) {
        throw new Error('Пользователь не найден');
    }
    
    // Проверяем, не является ли пользователь уже участником
    const isMember = workspace.members.some(m => m.userId === user.id);
    if (isMember) {
        return workspace; // Уже участник
    }
    
    // Добавляем пользователя в участники
    workspace.members.push({
        userId: user.id,
        userName: user.name || 'Пользователь',
        avatar: user.avatar || null,
        joinedAt: new Date().toISOString()
    });
    
    saveWorkspaces(workspaces);
    setCurrentWorkspace(workspace.id);
    
    return workspace;
}

// Получить данные пользователя
function getUserData() {
    // Пытаемся получить из Telegram
    const telegramUser = localStorage.getItem('telegram_user');
    if (telegramUser) {
        const user = JSON.parse(telegramUser);
        return {
            id: user.id?.toString() || 'user-' + Date.now(),
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь',
            avatar: user.photo_url || null
        };
    }
    
    // Если нет Telegram, используем локальные данные
    const localUser = localStorage.getItem('local_user');
    if (localUser) {
        return JSON.parse(localUser);
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: 'user-' + Date.now(),
        name: 'Пользователь',
        avatar: null
    };
    localStorage.setItem('local_user', JSON.stringify(newUser));
    return newUser;
}

// Получить стикеры текущего пространства
export function getWorkspaceStickers() {
    const workspace = getCurrentWorkspace();
    return workspace.stickers || [];
}

// Сохранить стикеры текущего пространства
export function saveWorkspaceStickers(stickers) {
    const workspace = getCurrentWorkspace();
    const workspaces = getWorkspaces();
    const workspaceIndex = workspaces.findIndex(w => w.id === workspace.id);
    
    if (workspaceIndex !== -1) {
        workspaces[workspaceIndex].stickers = stickers;
        saveWorkspaces(workspaces);
    }
}

