import * as React from 'react';
import { CustomerService, TransactionService } from '../services/storage';
import { Customer } from '../types';
import { PageHeader, Input, Button } from '../components/UIComponents';
import { Search, UserPlus, Phone, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, generateId } from '../services/utils';

const { useState, useEffect } = React;

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<(Customer & { balance: number })[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    // Add Customer Form State
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = () => {
        const list = CustomerService.getAll();
        const withBalance = list.map(c => ({
            ...c,
            balance: TransactionService.getBalance(c.id)
        }));
        setCustomers(withBalance);
    };

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomerName) return;

        const newCustomer: Customer = {
            id: generateId(),
            name: newCustomerName,
            phone: newCustomerPhone,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        CustomerService.save(newCustomer);
        loadCustomers();
        setShowAddModal(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        navigate(`/customer/${newCustomer.id}`);
    };

    const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    return (
        <div className="bg-slate-50 min-h-full">
            <PageHeader 
                title="Parties & Customers" 
                rightAction={
                    <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
                        <UserPlus size={16} /> Add New
                    </Button>
                }
            />

            <div className="p-4 sticky top-14 bg-slate-50 z-20">
                <Input 
                    placeholder="Search by name or number..." 
                    icon={<Search size={18} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-0"
                />
            </div>

            <div className="px-4 pb-4 space-y-3">
                {filtered.map(customer => (
                    <Link 
                        to={`/customer/${customer.id}`} 
                        key={customer.id} 
                        className="block bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone size={10} /> {customer.phone || 'No Phone'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-sm ${customer.balance > 0 ? 'text-red-600' : customer.balance < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                    {formatCurrency(Math.abs(customer.balance))}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">
                                    {customer.balance > 0 ? 'You Get' : customer.balance < 0 ? 'You Give' : 'Settled'}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserPlus className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-slate-900 font-medium">No customers found</h3>
                        <p className="text-slate-500 text-sm mt-1">Add a new customer to start recording transactions.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setShowAddModal(true)}>
                            Add Customer
                        </Button>
                    </div>
                )}
            </div>

            {/* Centered Modal Implementation */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Add New Party</h2>
                        <form onSubmit={handleAddCustomer}>
                            <Input 
                                label="Party Name" 
                                placeholder="Enter name" 
                                value={newCustomerName}
                                onChange={e => setNewCustomerName(e.target.value)}
                                autoFocus
                                required
                            />
                            <Input 
                                label="Mobile Number" 
                                placeholder="Enter mobile number" 
                                type="tel"
                                value={newCustomerPhone}
                                onChange={e => setNewCustomerPhone(e.target.value)}
                            />
                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>Cancel</Button>
                                <Button type="submit" fullWidth disabled={!newCustomerName}>Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;