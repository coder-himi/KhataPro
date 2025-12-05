import * as React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, Settings, PieChart } from 'lucide-react';

const Layout: React.FC = () => {
    const location = useLocation();
    
    // Hide bottom nav on transaction detail pages or modals if needed
    const hideNav = location.pathname.includes('/add-transaction');

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Home' },
        { path: '/customers', icon: Users, label: 'Parties' },
        { path: '/expenses', icon: Receipt, label: 'Expenses' },
        { path: '/reports', icon: PieChart, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'More' },
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-200">
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 no-scrollbar">
                <Outlet />
            </main>

            {!hideNav && (
                <nav className="absolute bottom-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-2 py-2 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full py-1 transition-colors ${
                                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`
                            }
                        >
                            <item.icon size={24} strokeWidth={2} />
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            )}
        </div>
    );
};

export default Layout;