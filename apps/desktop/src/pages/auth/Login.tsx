import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@aplifyai/ui';

export const Login = () => {
    const handleBrowserLogin = async () => {
        // Open the web app login page with a callback URL
        // The callback URL uses our custom protocol: aplifyai://auth
        const callbackUrl = encodeURIComponent('aplifyai://auth');
        const webAppUrl = import.meta.env.VITE_WEB_APP_URL || 'http://localhost:3000';
        const loginUrl = `${webAppUrl}/login?callback=${callbackUrl}`;

        await (window as any).ipcRenderer.invoke('open-external', loginUrl);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-center text-base font-medium text-gray-900 mb-6">
                    Sign in to your account
                </h3>
                <Button
                    onClick={handleBrowserLogin}
                    variant="primary"
                    className="w-full h-12 flex justify-center items-center gap-3 text-base font-medium bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <span className="text-xl">🌐</span>
                    Sign in with Browser
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Secure Authentication</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                    Clicking the button above will open your default browser to authenticate securely via our web portal.
                </p>
            </div>
        </div>
    );
};
