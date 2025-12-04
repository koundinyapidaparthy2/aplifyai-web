'use client';

import { useState } from 'react';
import type { Job, User } from '@aplifyai/types';
import { Button, Input, Card } from '@aplifyai/ui';
import { useLocalStorage, useDebounce } from '@aplifyai/hooks';
import { formatDate, isValidEmail } from '@aplifyai/utils';
import { API_ENDPOINTS } from '@aplifyai/constants';
import { createApiClient } from '@aplifyai/api';
import { loginSchema } from '@aplifyai/validation';
import { storage } from '@aplifyai/storage';
import { analytics, EVENTS } from '@aplifyai/analytics';
import { logger } from '@aplifyai/logger';
import { handleError } from '@aplifyai/errors';

export default function ExampleUsagePage() {
    const [email, setEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [savedJobs, setSavedJobs] = useLocalStorage<Job[]>('savedJobs', []);

    // Debounce search term
    const debouncedSearch = useDebounce(searchTerm, 300);

    const handleLogin = async () => {
        try {
            // Validate input
            const validated = loginSchema.parse({ email, password: 'test123' });

            // Log attempt
            logger.info('Login attempt', { email });

            // Create API client
            const client = createApiClient('http://localhost:3000');
            const response = await client.post<{ token: string }>(API_ENDPOINTS.AUTH.LOGIN, validated);

            if (response.success && response.data) {
                // Store token
                await storage.set('auth-token', response.data.token);

                // Track event
                analytics.track(EVENTS.LOGIN, { email });

                logger.info('Login successful', { email });
            }
        } catch (error) {
            const message = handleError(error);
            logger.error('Login failed', { email, error: message });
            alert(message);
        }
    };

    const saveJob = async (job: Job) => {
        setSavedJobs([...savedJobs, job]);
        analytics.track(EVENTS.JOB_SAVED, { jobId: job.id });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Centralized Packages Example</h1>

            {/* Types Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Types (@aplifyai/types)</h2>
                <p className="text-sm text-gray-600">
                    Using TypeScript types: User, Job, ApiResponse
                </p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    {`import type { User, Job } from '@aplifyai/types';`}
                </pre>
            </Card>

            {/* Utils Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Utils (@aplifyai/utils)</h2>
                <div className="space-y-2">
                    <p>Date: {formatDate(new Date(), 'long')}</p>
                    <p>Email valid: {isValidEmail(email) ? '✅' : '❌'}</p>
                </div>
            </Card>

            {/* Hooks Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Hooks (@aplifyai/hooks)</h2>
                <div className="space-y-2">
                    <Input
                        label="Search (debounced)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                    />
                    <p className="text-sm">Debounced value: {debouncedSearch}</p>
                    <p className="text-sm">Saved jobs: {savedJobs.length}</p>
                </div>
            </Card>

            {/* Validation Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Validation (@aplifyai/validation)</h2>
                <div className="space-y-2">
                    <Input
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={email && !isValidEmail(email) ? 'Invalid email' : undefined}
                        fullWidth
                    />
                    <Button onClick={handleLogin}>Login (with validation)</Button>
                </div>
            </Card>

            {/* API Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">API Client (@aplifyai/api)</h2>
                <p className="text-sm text-gray-600">
                    Centralized API client with get/post/put/delete methods
                </p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    {`const client = createApiClient(baseURL, token);
const response = await client.get('/api/jobs');`}
                </pre>
            </Card>

            {/* Constants Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Constants (@aplifyai/constants)</h2>
                <div className="space-y-1 text-sm">
                    <p>Login endpoint: {API_ENDPOINTS.AUTH.LOGIN}</p>
                    <p>Jobs endpoint: {API_ENDPOINTS.JOBS.LIST}</p>
                </div>
            </Card>

            {/* Storage Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Storage (@aplifyai/storage)</h2>
                <p className="text-sm text-gray-600">
                    Works in both browser (localStorage) and extension (chrome.storage)
                </p>
                <Button
                    onClick={async () => {
                        await storage.set('test', { value: 'Hello!' });
                        const data = await storage.get('test');
                        alert(JSON.stringify(data));
                    }}
                >
                    Test Storage
                </Button>
            </Card>

            {/* Analytics Example */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Analytics (@aplifyai/analytics)</h2>
                <Button
                    onClick={() => {
                        analytics.track(EVENTS.JOB_VIEWED, { jobId: '123' });
                        alert('Event tracked! Check console.');
                    }}
                >
                    Track Event
                </Button>
            </Card>
        </div>
    );
}
