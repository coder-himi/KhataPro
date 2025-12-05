import * as React from 'react';
import { PageHeader, Card, Button } from '../components/UIComponents';
import { TransactionService, CustomerService, ExpenseService } from '../services/storage';
import { formatCurrency, formatDate } from '../services/utils';
import { Transaction, Customer, Expense } from '../types';
import { Calendar, Download, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSettings } from '../contexts/SettingsContext';

const { useState, useEffect, useMemo } = React;

type Tab = 'daybook' | 'outstanding' | 'expenses';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('daybook');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filterDate, setFilterDate] = useState('all'); // all, today, month
    const { playSound } = useSettings();

    useEffect(() => {
        const txs = TransactionService.getAll().sort((a,b) => b.date - a.date);
        setTransactions(txs);
        setCustomers(CustomerService.getAll());
        setExpenses(ExpenseService.getAll().sort((a,b) => b.date - a.date));
    }, []);

    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let filteredTxs = transactions;
        let filteredExps = expenses;

        if (filterDate === 'today') {
            filteredTxs = transactions.filter(t => t.date >= startOfDay);
            filteredExps = expenses.filter(e => e.date >= startOfDay);
        } else if (filterDate === 'month') {
            filteredTxs = transactions.filter(t => t.date >= startOfMonth);
            filteredExps = expenses.filter(e => e.date >= startOfMonth);
        }

        return { txs: filteredTxs, exps: filteredExps };
    }, [transactions, expenses, filterDate]);

    // Outstanding Calculation
    const outstandingList = useMemo(() => {
        return customers.map(c => {
            const balance = TransactionService.getBalance(c.id);
            return { ...c, balance };
        }).filter(c => c.balance !== 0).sort((a,b) => Math.abs(b.balance) - Math.abs(a.balance));
    }, [customers, transactions]);

    const handleDownloadPDF = () => {
        playSound('click');
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("KhataPro Report", 14, 20);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        let bodyData: any[] = [];
        let headers: string[] = [];
        let title = "";

        if (activeTab === 'daybook') {
            title = "Day Book / Transaction History";
            headers = ["Date", "Customer", "Type", "Amount", "Note"];
            bodyData = filteredData.txs.map(t => {
                const cName = customers.find(c => c.id === t.customerId)?.name || 'Unknown';
                return [
                    formatDate(t.date),
                    cName,
                    t.type === 'GIVE' ? 'Given (Dr)' : 'Got (Cr)',
                    t.amount.toString(),
                    t.notes || '-'
                ];
            });
        } else if (activeTab === 'outstanding') {
            title = "Outstanding Balances";
            headers = ["Customer", "Phone", "Status", "Amount"];
            bodyData = outstandingList.map(c => [
                c.name,
                c.phone,
                c.balance > 0 ? 'To Receive' : 'To Pay',
                Math.abs(c.balance).toString()
            ]);
        } else {
            title = "Expense Report";
            headers = ["Date", "Category", "Amount", "Note"];
            bodyData = filteredData.exps.map(e => [
                formatDate(e.date),
                e.category,
                e.amount.toString(),
                e.notes || '-'
            ]);
        }

        doc.text(title, 14, 40);
        
        (doc as any).autoTable({
            startY: 45,
            head: [headers],
            body: bodyData,
            theme: 'grid',
        });

        doc.save(`${activeTab}_report.pdf`);
        playSound('success');
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 flex flex-col transition-colors duration-200">
            <PageHeader title="Reports" rightAction={
                <button onClick={handleDownloadPDF} className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 rounded-full">
                    <Download size={20} />
                </button>
            } />

            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-14 z-20">
                {(['daybook', 'outstanding', 'expenses'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); playSound('click'); }}
                        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                            activeTab === tab 
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                                : 'border-transparent text-slate-500 dark:text-slate-400'
                        }`}
                    >
                        {tab === 'daybook' ? 'Day Book' : tab}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
                    {[
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: 'month', label: 'This Month' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => { setFilterDate(f.id); playSound('click'); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                                filterDate === f.id
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-3">
                    {activeTab === 'daybook' && (
                        <>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                                <span>{filteredData.txs.length} Transactions</span>
                                <span>Total: {formatCurrency(filteredData.txs.reduce((sum, t) => sum + (t.type === 'GET' ? t.amount : -t.amount), 0))}</span>
                            </div>
                            {filteredData.txs.map(tx => {
                                const c = customers.find(c => c.id === tx.customerId);
                                return (
                                    <Card key={tx.id} className="p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'GIVE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {tx.type === 'GIVE' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white text-sm">{c?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400">{formatDate(tx.date)} • {tx.notes || (tx.type === 'GIVE' ? 'Given' : 'Received')}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm ${tx.type === 'GIVE' ? 'text-red-600' : 'text-green-600'}`}>
                                            {tx.type === 'GIVE' ? '-' : '+'} {formatCurrency(tx.amount)}
                                        </span>
                                    </Card>
                                );
                            })}
                            {filteredData.txs.length === 0 && <EmptyState msg="No transactions found" />}
                        </>
                    )}

                    {activeTab === 'outstanding' && (
                        <>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                                <span>{outstandingList.length} Customers</span>
                                <span>Net: {formatCurrency(outstandingList.reduce((sum, c) => sum + c.balance, 0))}</span>
                            </div>
                            {outstandingList.map(c => (
                                <Card key={c.id} className="p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{c.name}</p>
                                            <p className="text-xs text-slate-400">{c.phone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-sm ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(Math.abs(c.balance))}
                                        </p>
                                        <p className={`text-[10px] font-medium uppercase ${c.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {c.balance > 0 ? 'You Get' : 'You Give'}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                            {outstandingList.length === 0 && <EmptyState msg="No outstanding balances" />}
                        </>
                    )}

                    {activeTab === 'expenses' && (
                        <>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                                <span>{filteredData.exps.length} Entries</span>
                                <span>Total: {formatCurrency(filteredData.exps.reduce((sum, e) => sum + e.amount, 0))}</span>
                            </div>
                            {filteredData.exps.map(exp => (
                                <Card key={exp.id} className="p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{exp.category}</p>
                                        <p className="text-xs text-slate-400">{formatDate(exp.date)} • {exp.notes}</p>
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-white text-sm">
                                        - {formatCurrency(exp.amount)}
                                    </span>
                                </Card>
                            ))}
                            {filteredData.exps.length === 0 && <EmptyState msg="No expenses found" />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="py-10 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Filter size={24} />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{msg}</p>
    </div>
);

export default Reports;