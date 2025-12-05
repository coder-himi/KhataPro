import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerService, TransactionService, ShopService } from '../services/storage';
import { Customer, Transaction, TransactionType, ShopProfile } from '../types';
import { PageHeader, Button, Input, Card } from '../components/UIComponents';
import { formatCurrency, formatDate, generateId } from '../services/utils';
import { Phone, MessageCircle, Share2, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { useState, useEffect } = React;

const CustomerLedger: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [shop, setShop] = useState<ShopProfile | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [entryMode, setEntryMode] = useState<TransactionType | null>(null);
    
    // Transaction Form
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (id) loadData(id);
        const shopProfile = ShopService.getProfile();
        setShop(shopProfile);
    }, [id]);

    const loadData = (customerId: string) => {
        const c = CustomerService.getAll().find(cust => cust.id === customerId);
        if (!c) {
            navigate('/customers');
            return;
        }
        setCustomer(c);
        
        const txs = TransactionService.getByCustomer(customerId);
        setTransactions(txs);
        setBalance(TransactionService.getBalance(customerId));
    };

    const handleTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer || !entryMode || !amount) return;

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        const newTx: Transaction = {
            id: generateId(),
            customerId: customer.id,
            type: entryMode,
            amount: val,
            date: new Date(date).getTime(),
            notes
        };

        TransactionService.save(newTx);
        
        // Reset and reload
        setEntryMode(null);
        setAmount('');
        setNotes('');
        loadData(customer.id);
    };

    const deleteTransaction = (txId: string) => {
        if(window.confirm("Delete this transaction?")) {
             TransactionService.delete(txId);
             if (customer) loadData(customer.id);
        }
    }

    const generatePDF = async () => {
        const element = document.getElementById('ledger-content');
        if (!element || !customer) return;
        
        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Ledger_${customer.name}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        }
    };

    const getWhatsAppLink = () => {
        if (!customer || !shop) return '#';
        
        const balanceAbs = formatCurrency(Math.abs(balance));
        const statementDate = new Date().toLocaleDateString('en-IN');
        const shopName = shop.name;
        const shopMobile = shop.phone;
        const paymentNumber = shop.phonePeNumber || shop.phone || 'N/A';
        const status = balance > 0 ? 'Due (To Pay)' : 'Advance (To Receive)';

        const message = `*PAYMENT REMINDER*
        
Namaste ${customer.name},

Your total pending amount at *${shopName}* is *${balanceAbs}* as of ${statementDate}.

Please pay using PhonePe/GPay:
*${paymentNumber}*

For any queries, please call:
${shopMobile}

Thank you!`;

        return `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
    };

    if (!customer) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative">
            <PageHeader 
                title={customer.name} 
                backAction={() => navigate('/customers')}
                rightAction={
                    <button onClick={generatePDF} className="text-blue-600 font-medium text-xs bg-blue-50 px-3 py-1 rounded-full">
                        PDF
                    </button>
                }
            />

            {/* Contact Actions Bar */}
            <div className="bg-white border-b border-slate-100 flex justify-around py-3 px-4 shadow-sm sticky top-14 z-20">
                <a href={`tel:${customer.phone}`} className="flex flex-col items-center gap-1 text-slate-600 active:text-blue-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Phone size={16} /></div>
                    <span className="text-[10px]">Call</span>
                </a>
                <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-slate-600 active:text-green-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><MessageCircle size={16} /></div>
                    <span className="text-[10px]">WhatsApp</span>
                </a>
                <button className="flex flex-col items-center gap-1 text-slate-600 active:text-purple-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Share2 size={16} /></div>
                    <span className="text-[10px]">Share</span>
                </button>
            </div>

            {/* Balance Summary */}
            <div className="bg-white p-6 text-center border-b border-slate-200">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Net Balance</p>
                <h1 className={`text-4xl font-bold mt-2 ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-slate-800'}`}>
                    {formatCurrency(Math.abs(balance))}
                </h1>
                <p className={`text-sm font-medium mt-1 ${balance > 0 ? 'text-red-500' : balance < 0 ? 'text-green-500' : 'text-slate-400'}`}>
                    {balance > 0 ? 'You will get' : balance < 0 ? 'You will give' : 'Settled'}
                </p>
            </div>

            {/* Ledger Entries */}
            <div className="flex-1 overflow-y-auto p-4 pb-24" id="ledger-content">
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-10">No transactions recorded yet.</p>
                    ) : (
                        transactions.map(tx => (
                            <Card key={tx.id} className="p-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 font-medium mb-1">{formatDate(tx.date)}</p>
                                        <p className="text-sm text-slate-800">{tx.notes || (tx.type === 'GIVE' ? 'Credit Given' : 'Payment Received')}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`font-bold ${tx.type === 'GIVE' ? 'text-red-600' : 'text-green-600'}`}>
                                            {tx.type === 'GIVE' ? '-' : '+'} {formatCurrency(tx.amount)}
                                        </p>
                                        <button onClick={() => deleteTransaction(tx.id)} className="text-slate-300 hover:text-red-500 mt-2">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex gap-4 z-40">
                <Button 
                    variant="danger" 
                    fullWidth 
                    className="h-12 shadow-lg shadow-red-100"
                    onClick={() => setEntryMode('GIVE')}
                >
                    You GAVE (Credit)
                </Button>
                <Button 
                    variant="success" 
                    fullWidth 
                    className="h-12 shadow-lg shadow-green-100"
                    onClick={() => setEntryMode('GET')}
                >
                    You GOT (Payment)
                </Button>
            </div>

            {/* Centered Transaction Modal */}
            {entryMode && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                        <div className={`p-4 text-white text-center ${entryMode === 'GIVE' ? 'bg-red-600' : 'bg-green-600'}`}>
                            <h2 className="text-lg font-bold">{entryMode === 'GIVE' ? 'You gave to ' : 'You got from '}{customer.name}</h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleTransaction}>
                                <Input 
                                    label="Amount" 
                                    placeholder="₹ 0" 
                                    type="number" 
                                    className="text-2xl font-bold"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <Input 
                                    label="Details (Optional)" 
                                    placeholder="Enter item names, bill no..." 
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                                <Input 
                                    label="Date" 
                                    type="date" 
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="secondary" fullWidth onClick={() => setEntryMode(null)}>Cancel</Button>
                                    <Button 
                                        type="submit" 
                                        fullWidth 
                                        variant={entryMode === 'GIVE' ? 'danger' : 'success'}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerLedger;