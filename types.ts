export interface ShopProfile {
    name: string;
    ownerName: string;
    phone: string;
    phonePeNumber?: string;
    address: string;
    currency: string;
    language: 'en' | 'hi';
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address?: string;
    creditLimit?: number;
    photoUrl?: string;
    createdAt: number;
    updatedAt: number;
}

export type TransactionType = 'GIVE' | 'GET'; // GIVE = You gave (Credit/Udhar), GET = You got (Payment)

export interface Transaction {
    id: string;
    customerId: string;
    type: TransactionType;
    amount: number;
    date: number; // timestamp
    notes?: string;
    imageUrl?: string;
}

export interface Expense {
    id: string;
    category: string;
    amount: number;
    date: number;
    notes?: string;
}

export interface DashboardStats {
    totalReceivable: number; // You will get
    totalPayable: number;    // You will pay (advances)
    netBalance: number;
    todayCollection: number;
}

export interface AppState {
    shop: ShopProfile | null;
    isAuthenticated: boolean;
}

export interface AppSettings {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
}