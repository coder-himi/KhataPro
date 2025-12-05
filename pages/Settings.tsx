import * as React from 'react';
import { PageHeader, Card, Button, Input } from '../components/UIComponents';
import { ShopService } from '../services/storage';
import { ShopProfile } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { Store, Moon, Sun, Volume2, VolumeX, Save, RefreshCw } from 'lucide-react';

const { useState, useEffect } = React;

const Settings: React.FC = () => {
    const { settings, toggleTheme, toggleSound, playSound } = useSettings();
    const [shop, setShop] = useState<ShopProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState<ShopProfile>({
        name: '', ownerName: '', phone: '', phonePeNumber: '', address: '', currency: 'INR', language: 'en'
    });

    useEffect(() => {
        const profile = ShopService.getProfile();
        if (profile) {
            setShop(profile);
            setFormData({ ...profile, phonePeNumber: profile.phonePeNumber || '' });
        }
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        ShopService.saveProfile(formData);
        setShop(formData);
        setIsEditing(false);
        playSound('success');
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 transition-colors duration-200">
            <PageHeader title="Settings" />

            <div className="p-4 space-y-4">
                {/* Theme & Sound Section */}
                <Card className="p-4">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 tracking-wide">Preferences</h3>
                    
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${settings.theme === 'dark' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span className="text-slate-800 dark:text-white font-medium">Dark Mode</span>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2 mt-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${settings.soundEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </div>
                            <span className="text-slate-800 dark:text-white font-medium">Sound Effects</span>
                        </div>
                        <button 
                            onClick={toggleSound}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                </Card>

                {/* Store Details Section */}
                <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Store Details</h3>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-medium hover:underline">Edit</button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-3 animate-[fadeIn_0.2s]">
                            <Input 
                                label="Shop Name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <Input 
                                label="Owner Name" 
                                value={formData.ownerName} 
                                onChange={e => setFormData({...formData, ownerName: e.target.value})}
                            />
                            <Input 
                                label="Shop Mobile Number" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="For Contact"
                            />
                            <Input 
                                label="PhonePe / GPay Number" 
                                value={formData.phonePeNumber} 
                                onChange={e => setFormData({...formData, phonePeNumber: e.target.value})}
                                placeholder="For online payments"
                            />
                            <Input 
                                label="Address" 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" fullWidth onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit" fullWidth className="gap-2"><Save size={16} /> Save</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-full text-blue-600 shadow-sm">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{shop?.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{shop?.ownerName}</p>
                                    <p className="text-xs text-slate-400 mt-1">{shop?.address}</p>
                                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                                        <p>📱 Contact: {shop?.phone || 'Not set'}</p>
                                        <p>💳 Payment: {shop?.phonePeNumber || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* App Info */}
                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-slate-400">KhataPro Version 1.0.0</p>
                    <p className="text-xs text-slate-400 mt-1">Made for Local Businesses</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;