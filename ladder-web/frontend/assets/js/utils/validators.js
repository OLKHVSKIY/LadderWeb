// Валидаторы
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

export function validateMinLength(value, minLength) {
    return value && value.length >= minLength;
}

export function validateMaxLength(value, maxLength) {
    return value && value.length <= maxLength;
}

export function validateTask(task) {
    const errors = [];
    
    if (!validateRequired(task.title)) {
        errors.push('Название задачи обязательно');
    }
    
    if (task.title && !validateMinLength(task.title, 3)) {
        errors.push('Название задачи должно быть не менее 3 символов');
    }
    
    if (task.title && !validateMaxLength(task.title, 200)) {
        errors.push('Название задачи должно быть не более 200 символов');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
}

