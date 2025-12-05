import * as React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerLedger from './pages/CustomerLedger';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { ShopService } from './services/storage';
import { Input, Button } from './components/UIComponents';
import { Store } from 'lucide-react';
import { SettingsProvider } from './contexts/SettingsContext';

const { useState, useEffect } = React;

const SetupShop: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [name, setName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ShopService.saveProfile({
            name,
            ownerName: 'Owner',
            phone: '',
            address: '',
            currency: 'INR',
            language: 'en'
        });
        onComplete();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-600 p-6">
            <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store size={32} />
                </div>
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome to KhataPro</h1>
                <p className="text-center text-slate-500 mb-8">Your digital ledger for smart business.</p>
                <form onSubmit={handleSubmit}>
                    <Input 
                        label="Shop Name" 
                        placeholder="My Kirana Store" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                    />
                    <Button type="submit" fullWidth size="lg" className="mt-4">Get Started</Button>
                </form>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [isSetup, setIsSetup] = useState(false);

    useEffect(() => {
        setIsSetup(ShopService.isSetup());
    }, []);

    if (!isSetup) {
        return <SetupShop onComplete={() => setIsSetup(true)} />;
    }

    return (
        <SettingsProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="customer/:id" element={<CustomerLedger />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </SettingsProvider>
    );
};

export default App;