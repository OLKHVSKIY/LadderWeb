// Subscription Tracker - отслеживание подписок для админ-панели

export function trackSubscription(userId, plan, status = 'active') {
    try {
        const subscriptions = JSON.parse(localStorage.getItem('admin_subscriptions') || '[]');
        
        // Проверяем, есть ли уже подписка у этого пользователя
        const existingIndex = subscriptions.findIndex(s => s.user_id === userId && s.status === 'active');
        
        const subscription = {
            id: existingIndex >= 0 ? subscriptions[existingIndex].id : Date.now(),
            user_id: userId,
            plan: plan, // 'pro', 'premium', 'enterprise'
            status: status, // 'active', 'cancelled', 'expired'
            created_at: existingIndex >= 0 ? subscriptions[existingIndex].created_at : new Date().toISOString(),
            expires_at: null // Можно добавить дату истечения
        };
        
        if (existingIndex >= 0) {
            subscriptions[existingIndex] = subscription;
        } else {
            subscriptions.push(subscription);
        }
        
        localStorage.setItem('admin_subscriptions', JSON.stringify(subscriptions));
        
        // Также сохраняем план пользователя
        localStorage.setItem('user_plan', plan);
    } catch (e) {
        console.error('Error tracking subscription:', e);
    }
}

export function cancelSubscription(userId) {
    try {
        const subscriptions = JSON.parse(localStorage.getItem('admin_subscriptions') || '[]');
        const subscription = subscriptions.find(s => s.user_id === userId && s.status === 'active');
        
        if (subscription) {
            subscription.status = 'cancelled';
            localStorage.setItem('admin_subscriptions', JSON.stringify(subscriptions));
            localStorage.setItem('user_plan', 'free');
        }
    } catch (e) {
        console.error('Error cancelling subscription:', e);
    }
}

