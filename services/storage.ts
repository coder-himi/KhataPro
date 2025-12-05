import { Customer, Transaction, Expense, ShopProfile, AppSettings } from '../types';

// Simulating the window.storage API for a browser environment
// In a real scenario, this would interface with the specific platform API provided.

const STORAGE_PREFIX = 'khatapro_';

const storage = {
    getItem: (key: string): any => {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage Get Error', e);
            return null;
        }
    },
    setItem: (key: string, value: any): void => {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage Set Error', e);
        }
    },
    removeItem: (key: string): void => {
        localStorage.removeItem(STORAGE_PREFIX + key);
    }
};

// Data Access Object Pattern

export const ShopService = {
    getProfile: (): ShopProfile | null => storage.getItem('shop_profile'),
    saveProfile: (profile: ShopProfile) => storage.setItem('shop_profile', profile),
    isSetup: (): boolean => !!storage.getItem('shop_profile'),
};

export const SettingsService = {
    getSettings: (): AppSettings => {
        return storage.getItem('app_settings') || { theme: 'light', soundEnabled: true };
    },
    saveSettings: (settings: AppSettings) => storage.setItem('app_settings', settings),
};

export const CustomerService = {
    getAll: (): Customer[] => storage.getItem('customers') || [],
    save: (customer: Customer) => {
        const list = CustomerService.getAll();
        const index = list.findIndex(c => c.id === customer.id);
        if (index >= 0) {
            list[index] = customer;
        } else {
            list.push(customer);
        }
        storage.setItem('customers', list);
    },
    delete: (id: string) => {
        const list = CustomerService.getAll().filter(c => c.id !== id);
        storage.setItem('customers', list);
    }
};

export const TransactionService = {
    getAll: (): Transaction[] => storage.getItem('transactions') || [],
    getByCustomer: (customerId: string): Transaction[] => {
        const all = TransactionService.getAll();
        return all.filter(t => t.customerId === customerId).sort((a, b) => b.date - a.date);
    },
    save: (transaction: Transaction) => {
        const list = TransactionService.getAll();
        const index = list.findIndex(t => t.id === transaction.id);
        if (index >= 0) {
            list[index] = transaction;
        } else {
            list.push(transaction);
        }
        storage.setItem('transactions', list);
    },
    delete: (id: string) => {
        const list = TransactionService.getAll().filter(t => t.id !== id);
        storage.setItem('transactions', list);
    },
    getBalance: (customerId: string): number => {
        const txs = TransactionService.getByCustomer(customerId);
        // Positive means customer owes shop (Receivable)
        // Negative means shop owes customer (Advance)
        return txs.reduce((acc, curr) => {
            return curr.type === 'GIVE' ? acc + curr.amount : acc - curr.amount;
        }, 0);
    }
};

export const ExpenseService = {
    getAll: (): Expense[] => storage.getItem('expenses') || [],
    save: (expense: Expense) => {
        const list = ExpenseService.getAll();
        list.push(expense);
        storage.setItem('expenses', list);
    }
};