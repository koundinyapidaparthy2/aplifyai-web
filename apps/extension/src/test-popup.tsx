import React from 'react';
import { Button } from '@aplifyai/ui';

export default function TestPopup() {
    return (
        <div style={{ padding: '20px', minWidth: '300px' }}>
            <h2 style={{ marginBottom: '16px' }}>Extension Test</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button variant="primary" onClick={() => alert('Extension Primary!')}>
                    Primary Button
                </Button>
                <Button variant="secondary" onClick={() => alert('Extension Secondary!')}>
                    Secondary Button
                </Button>
                <Button variant="outline" onClick={() => alert('Extension Outline!')}>
                    Outline Button
                </Button>
            </div>
        </div>
    );
}
