import React from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Settings } from './pages/settings/Settings';
import { Session } from './pages/session/Session';

const router = createHashRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'settings', element: <Settings /> },
        ],
    },
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'signup', element: <Signup /> },
        ],
    },
    {
        path: '/session',
        element: <Session />,
    },
]);

export const AppRouter = () => {
    React.useEffect(() => {
        const handleAuthToken = (_event: any, token: string) => {
            console.log('Received auth token:', token);
            localStorage.setItem('auth_token', token);
            // Force navigation to dashboard
            router.navigate('/');
        };

        // Listen for auth-token event
        // We need to cast window to any because ipcRenderer is exposed via contextBridge
        const ipcRenderer = (window as any).ipcRenderer;
        let removeListener: (() => void) | undefined;

        if (ipcRenderer) {
            removeListener = ipcRenderer.on('auth-token', handleAuthToken);
        } else {
            console.error('ipcRenderer not found');
        }

        return () => {
            if (removeListener) {
                removeListener();
            }
        };
    }, []);

    return <RouterProvider router={router} />;
};
