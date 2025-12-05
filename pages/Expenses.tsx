import * as React from 'react';
import { ExpenseService } from '../services/storage';
import { Expense } from '../types';
import { PageHeader, Card, Button, Input } from '../components/UIComponents';
import { formatCurrency, formatDate, generateId } from '../services/utils';
import { Plus, Coffee, Truck, Lightbulb, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const { useState, useEffect } = React;

const CATEGORIES = [
    { name: 'Inventory', icon: ShoppingBag, color: '#3B82F6' },
    { name: 'Rent & Bills', icon: Lightbulb, color: '#F59E0B' },
    { name: 'Transport', icon: Truck, color: '#10B981' },
    { name: 'Staff & Food', icon: Coffee, color: '#EF4444' },
    { name: 'Other', icon: Plus, color: '#6366F1' },
];

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showModal, setShowModal] = useState(false);
    
    // Form
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].name);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        setExpenses(ExpenseService.getAll().sort((a,b) => b.date - a.date));
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!amount) return;

        const newExp: Expense = {
            id: generateId(),
            amount: parseFloat(amount),
            category,
            notes,
            date: Date.now()
        };

        ExpenseService.save(newExp);
        setExpenses(ExpenseService.getAll().sort((a,b) => b.date - a.date));
        setShowModal(false);
        setAmount('');
        setNotes('');
        setCategory(CATEGORIES[0].name);
    };

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Chart Data
    const chartData = CATEGORIES.map(cat => ({
        name: cat.name,
        value: expenses.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0),
        color: cat.color
    })).filter(d => d.value > 0);

    return (
        <div className="pb-20">
            <PageHeader title="Shop Expenses" rightAction={
                <Button size="sm" onClick={() => setShowModal(true)}><Plus size={16} /> Add</Button>
            } />

            <div className="p-4 bg-blue-600 text-white rounded-b-3xl shadow-lg mb-6">
                <p className="text-blue-100 text-sm">Total Expenses</p>
                <h1 className="text-3xl font-bold mt-1">{formatCurrency(totalExpense)}</h1>
            </div>

            {chartData.length > 0 && (
                <div className="h-64 px-4 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={chartData} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36}/>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="px-4 space-y-3">
                <h3 className="font-bold text-slate-800">History</h3>
                {expenses.map(exp => {
                    const CatIcon = CATEGORIES.find(c => c.name === exp.category)?.icon || Plus;
                    return (
                        <Card key={exp.id} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <CatIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{exp.category}</p>
                                    <p className="text-xs text-slate-400">{formatDate(exp.date)} {exp.notes && `• ${exp.notes}`}</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-800">-{formatCurrency(exp.amount)}</span>
                        </Card>
                    );
                })}
            </div>

            {/* Centered Modal Implementation */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Add Expense</h2>
                        <form onSubmit={handleSave}>
                            <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button 
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setCategory(cat.name)}
                                            className={`text-xs p-2 rounded-lg border ${category === cat.name ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'border-slate-200 text-slate-600'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Input label="Note" value={notes} onChange={e => setNotes(e.target.value)} />
                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" fullWidth>Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;