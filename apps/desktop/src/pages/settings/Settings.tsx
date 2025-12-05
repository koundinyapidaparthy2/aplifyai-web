import React from 'react';
import { Button } from '@aplifyai/ui';
import { User, Mail, Lock, Trash2 } from 'lucide-react';

export const Settings = () => {
    return (
        <div className="flex h-full bg-white rounded-tl-3xl shadow-inner overflow-hidden">
            {/* Settings Sidebar */}
            <div className="w-72 bg-gray-50/50 p-8 space-y-2 border-r border-gray-100">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-3">Settings</h2>
                {['General', 'Calendar', 'Keybinds', 'Profile', 'Language', 'Billing'].map((item) => (
                    <button
                        key={item}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${item === 'Profile'
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100'
                                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Settings Content */}
            <div className="flex-1 p-12 overflow-auto">
                <div className="max-w-3xl">
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile</h1>
                        <span className="text-sm text-gray-500">Manage your account</span>
                    </div>

                    <div className="space-y-10">
                        {/* Display Name */}
                        <section className="bg-white">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Display Name</label>
                            <p className="text-sm text-gray-500 mb-4">Nickname or first name, however you want to be called.</p>
                            <input
                                type="text"
                                defaultValue="K P"
                                className="w-full max-w-md px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                            />
                        </section>

                        {/* Email */}
                        <section>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Account Email</label>
                            <p className="text-sm text-gray-500 mb-4">Your email cannot be changed. Please contact support if you need assistance.</p>
                            <div className="relative max-w-md group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400 group-hover:text-gray-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    defaultValue="koundinya511@gmail.com"
                                    disabled
                                    className="w-full pl-11 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 sm:text-sm cursor-not-allowed font-medium"
                                />
                            </div>
                        </section>

                        {/* Avatar */}
                        <section>
                            <label className="block text-sm font-semibold text-gray-900 mb-4">Avatar</label>
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-sm border border-indigo-50">
                                    KP
                                </div>
                                <Button variant="outline" className="text-sm font-medium px-6 py-2.5 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all">
                                    Upload new image
                                </Button>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Password */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Password & Security</h3>
                            <p className="text-sm text-gray-500 mb-6">Secure your account with a password</p>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-center justify-between hover:border-gray-300 transition-colors">
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Account password</p>
                                    <p className="text-sm text-gray-500">Set a password to access your account.</p>
                                </div>
                                <Button variant="outline" className="bg-white border-gray-200 shadow-sm hover:bg-gray-50 px-6">Update</Button>
                            </div>
                        </section>

                        {/* Delete Account */}
                        <section>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-500 mb-6">Delete your account and all associated data. This action cannot be undone.</p>
                            <Button variant="secondary" className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 border-red-100 px-6 py-2.5 rounded-xl transition-colors">
                                <Trash2 size={18} />
                                Delete my account
                            </Button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
