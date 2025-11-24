#!/usr/bin/env node

/**
 * Script to get Firebase Web App configuration
 * This will help us get the client-side Firebase config
 */

const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ID = 'jobseek-459701';

console.log('🔥 Getting Firebase Web App Configuration...\n');

// Get access token from gcloud
console.log('🔑 Getting access token...');
const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
console.log('✅ Access token obtained\n');

// List existing web apps
console.log('📱 Checking for existing web apps...');

const options = {
    hostname: 'firebase.googleapis.com',
    path: `/v1beta1/projects/${PROJECT_ID}/webApps`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);

            if (response.apps && response.apps.length > 0) {
                console.log(`✅ Found ${response.apps.length} existing web app(s)\n`);

                // Get config for the first app
                const appId = response.apps[0].appId;
                const appName = response.apps[0].name;

                console.log(`📱 App ID: ${appId}`);
                console.log(`📝 App Name: ${appName}\n`);

                // Get the config
                getWebAppConfig(appName, token);
            } else {
                console.log('⚠️  No web apps found. Creating one...\n');
                createWebApp(token);
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.error('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

req.end();

function getWebAppConfig(appName, token) {
    console.log('🔍 Getting web app configuration...\n');

    const options = {
        hostname: 'firebase.googleapis.com',
        path: `/v1beta1/${appName}/config`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const config = JSON.parse(data);

                console.log('✅ Firebase Web App Configuration:\n');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('Add these to your .env.local file:\n');
                console.log(`NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}`);
                console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}`);
                console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}`);
                console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`);
                console.log(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`);
                console.log(`NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}`);
                if (config.measurementId) {
                    console.log(`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${config.measurementId}`);
                }
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                // Update .env.local automatically
                updateEnvFile(config);
            } catch (error) {
                console.error('❌ Error parsing config:', error.message);
                console.error('Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request error:', error.message);
    });

    req.end();
}

function createWebApp(token) {
    const options = {
        hostname: 'firebase.googleapis.com',
        path: `/v1beta1/projects/${PROJECT_ID}/webApps`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const postData = JSON.stringify({
        displayName: 'AmplifyAI Web'
    });

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('✅ Web app created successfully!\n');

                // Wait a moment for the app to be fully created
                setTimeout(() => {
                    getWebAppConfig(response.name, token);
                }, 2000);
            } catch (error) {
                console.error('❌ Error creating web app:', error.message);
                console.error('Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request error:', error.message);
    });

    req.write(postData);
    req.end();
}

function updateEnvFile(config) {
    const fs = require('fs');
    const path = require('path');

    const envPath = path.join(__dirname, '.env.local');

    try {
        let envContent = fs.readFileSync(envPath, 'utf-8');

        // Update each variable
        envContent = envContent.replace(
            /NEXT_PUBLIC_FIREBASE_API_KEY=.*/,
            `NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}`
        );
        envContent = envContent.replace(
            /NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=.*/,
            `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}`
        );
        envContent = envContent.replace(
            /NEXT_PUBLIC_FIREBASE_PROJECT_ID=.*/,
            `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}`
        );
        envContent = envContent.replace(
            /NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=.*/,
            `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`
        );
        envContent = envContent.replace(
            /NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=.*/,
            `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`
        );
        envContent = envContent.replace(
            /NEXT_PUBLIC_FIREBASE_APP_ID=.*/,
            `NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}`
        );

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env.local file updated automatically!\n');
        console.log('🔄 Please restart your dev server (npm run dev) to apply changes.\n');
    } catch (error) {
        console.error('⚠️  Could not update .env.local automatically:', error.message);
        console.log('Please update it manually with the values above.\n');
    }
}
