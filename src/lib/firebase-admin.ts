import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK (server-side)
const apps = getApps();

if (!apps.length) {
    // Check if we're using service account or default credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
            credential: cert(serviceAccount),
        });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        initializeApp({
            credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
        });
    } else {
        // Use default credentials (for Cloud Run, etc.)
        initializeApp();
    }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
