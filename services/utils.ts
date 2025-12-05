export const formatCurrency = (amount: number, locale = 'en-IN', currency = 'INR') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
