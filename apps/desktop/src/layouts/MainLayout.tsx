import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, User } from 'lucide-react';

export const MainLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: Clear auth state
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                        <span className="text-3xl">🚀</span> AplifyAI
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard size={20} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                                <span>Dashboard</span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Settings size={20} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                                <span>Settings</span>
                            </>
                        )}
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                            KP
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">K P</p>
                            <p className="text-xs text-gray-500 truncate">user@example.com</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
                <Outlet />
            </div>
        </div>
    );
};
