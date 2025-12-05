import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                        <span className="text-3xl">🚀</span>
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Welcome to AplifyAI
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Your intelligent meeting copilot
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-10 shadow-xl rounded-2xl border border-gray-100">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
