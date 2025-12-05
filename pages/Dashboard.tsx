import * as React from 'react';
import { CustomerService, TransactionService } from '../services/storage';
import { formatCurrency } from '../services/utils';
import { DashboardStats } from '../types';
import { Card, PageHeader } from '../components/UIComponents';
import { TrendingUp, TrendingDown, Users, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const { useState, useEffect } = React;

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalReceivable: 0,
        totalPayable: 0,
        netBalance: 0,
        todayCollection: 0
    });
    const [recentTx, setRecentTx] = useState<any[]>([]);

    useEffect(() => {
        // Calculate stats
        const customers = CustomerService.getAll();
        let receivable = 0;
        let payable = 0;
        
        customers.forEach(c => {
            const bal = TransactionService.getBalance(c.id);
            if (bal > 0) receivable += bal;
            if (bal < 0) payable += Math.abs(bal);
        });

        const txs = TransactionService.getAll();
        const today = new Date().setHours(0,0,0,0);
        const todayCollection = txs
            .filter(t => t.type === 'GET' && t.date >= today)
            .reduce((sum, t) => sum + t.amount, 0);

        // Get 5 recent transactions
        const recent = txs.sort((a,b) => b.date - a.date).slice(0, 5).map(t => {
            const customer = customers.find(c => c.id === t.customerId);
            return { ...t, customerName: customer?.name || 'Unknown' };
        });

        setStats({
            totalReceivable: receivable,
            totalPayable: payable,
            netBalance: receivable - payable,
            todayCollection
        });
        setRecentTx(recent);
    }, []);

    const data = [
        { name: 'You give', value: stats.totalReceivable, color: '#DC2626' },
        { name: 'You got', value: stats.totalPayable, color: '#16A34A' },
    ];

    return (
        <div className="pb-8">
            <header className="bg-blue-600 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-blue-100 text-sm font-medium">Net Balance</h2>
                        <h1 className="text-3xl font-bold mt-1">
                            {formatCurrency(stats.netBalance)}
                            <span className="text-sm font-normal text-blue-200 ml-2">
                                {stats.netBalance >= 0 ? '(You will get)' : '(You will pay)'}
                            </span>
                        </h1>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>
            </header>

            <div className="px-4 -mt-10">
                <Card className="flex divide-x divide-slate-100 p-4">
                    <div className="flex-1 text-center">
                        <div className="text-green-600 font-bold text-lg">{formatCurrency(stats.totalReceivable)}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">You will give</div>
                         {/* Note: In ledger terms "Receivable" (Asset) is usually Red (Credit given) and "Payable" (Liability) is Green (Advance taken) in many apps, BUT "KhataBook" often uses Green for "I will get" and Red for "I will give". Let's follow the prompt logic: "Receivable highlighted". 
                         Prompt says: "Red for receivable, green for payable" - Wait. 
                         Usually: Red = Danger = Money stuck outside (Receivable). Green = Safety = My money (or I have to pay, which is credit).
                         Let's stick to standard Khata Logic: 
                         Green Box: You will GIVE (Payable)
                         Red Box: You will GET (Udhar diya), Green = You will GIVE (Advance liya).
                         */}
                         <p className="text-[10px] text-red-500 mt-1">Total Udhar Given</p>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="text-red-600 font-bold text-lg">{formatCurrency(stats.totalPayable)}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">You will get</div>
                        <p className="text-[10px] text-green-500 mt-1">Advance Received</p>
                    </div>
                </Card>
            </div>

            <div className="mt-6 px-4">
                <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
                    <Users size={18} />
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/customers" className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Plus size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Add Customer</span>
                    </Link>
                    <Link to="/reports" className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <PieChart size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">View Reports</span>
                    </Link>
                </div>
            </div>

            <div className="mt-6 px-4">
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="text-slate-800 font-bold">Recent Activity</h3>
                    <Link to="/reports" className="text-blue-600 text-xs font-medium flex items-center">View All <ChevronRight size={14}/></Link>
                </div>
                <div className="space-y-3">
                    {recentTx.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-400 text-sm">No transactions yet</p>
                        </div>
                    ) : (
                        recentTx.map(tx => (
                            <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${tx.type === 'GIVE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {tx.customerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">{tx.customerName}</p>
                                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`text-right ${tx.type === 'GIVE' ? 'text-red-600' : 'text-green-600'}`}>
                                    <p className="font-bold text-sm">
                                        {tx.type === 'GIVE' ? 'You Gave' : 'You Got'}
                                    </p>
                                    <p className="font-bold">
                                        {tx.type === 'GIVE' ? '-' : '+'} {formatCurrency(tx.amount)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;