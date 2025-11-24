'use client';

import { useState, useEffect } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

export default function VersionDisplay() {
    const [version, setVersion] = useState<string>('');
    const [buildDate, setBuildDate] = useState<string>('');
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Get version from package.json or environment variable
        const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
        const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();
        const gitSha = process.env.NEXT_PUBLIC_GIT_SHA || 'development';

        setVersion(gitSha !== 'development' ? gitSha.substring(0, 7) : appVersion);
        setBuildDate(new Date(buildTime).toLocaleDateString());
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-40">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-900/90 text-white text-xs rounded-lg hover:bg-gray-800 transition-all backdrop-blur-sm shadow-lg"
                aria-label="Version Information"
            >
                <HiInformationCircle className="w-4 h-4" />
                <span className="font-mono">v{version}</span>
            </button>

            {showDetails && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Application Info</h3>
                    <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span className="font-medium">Version:</span>
                            <span className="font-mono">{version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Build Date:</span>
                            <span>{buildDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Environment:</span>
                            <span className="capitalize">
                                {process.env.NODE_ENV || 'production'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDetails(false)}
                        className="mt-3 w-full px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
