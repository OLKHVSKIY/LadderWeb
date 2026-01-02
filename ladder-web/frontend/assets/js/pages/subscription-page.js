// Страница подписки

document.addEventListener('DOMContentLoaded', () => {
    initSubscriptionPage();
});

function initSubscriptionPage() {
    // Обработчик кнопки "Назад" - возвращает на предыдущую страницу
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Проверяем, есть ли история для возврата
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // Если истории нет, возвращаемся на страницу задач (главную)
                window.location.href = '/public/tasks.html';
            }
        });
    }

    // Обработчики выбора плана подписки
    const plans = document.querySelectorAll('.subscription-plan');
    plans.forEach(plan => {
        plan.addEventListener('click', () => {
            // Убираем активный класс со всех планов
            plans.forEach(p => p.classList.remove('active'));
            // Добавляем активный класс к выбранному плану
            plan.classList.add('active');
        });
    });

    // Обработчик кнопки подписки
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            const activePlan = document.querySelector('.subscription-plan.active');
            if (activePlan) {
                const planType = activePlan.getAttribute('data-plan');
                const planDuration = activePlan.querySelector('.plan-duration').textContent;
                const planPrice = activePlan.querySelector('.plan-price').textContent;
                
                console.log('Подписка выбрана:', {
                    type: planType,
                    duration: planDuration,
                    price: planPrice
                });
                
                // Отслеживаем подписку для админ-панели
                import('../modules/subscription-tracker.js').then(({ trackSubscription }) => {
                    const userId = 1; // Получаем ID текущего пользователя
                    trackSubscription(userId, planType, 'active');
                });
                
                // Сохраняем план пользователя
                localStorage.setItem('user_plan', planType);
                
                // Здесь будет логика обработки подписки
                // Например, переход на страницу оплаты или вызов API
                alert(`Выбрана подписка: ${planDuration} за ${planPrice}`);
            }
        });
    }
}

