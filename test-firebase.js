// Test script to verify Firebase Admin SDK connection
// Run with: node test-firebase.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

console.log('🔥 Testing Firebase Admin SDK Connection...\n');

try {
    // Path to service account
    const serviceAccountPath = path.join(__dirname, '../resume-generator/gcp-credentials.json');
    console.log('📁 Service Account Path:', serviceAccountPath);

    // Initialize Firebase Admin
    const app = initializeApp({
        credential: cert(serviceAccountPath),
        projectId: 'jobseek-459701'
    });

    console.log('✅ Firebase Admin initialized successfully!');
    console.log('📦 Project ID:', app.options.projectId);

    // Test Firestore connection
    const db = getFirestore();
    console.log('\n🗄️  Testing Firestore connection...');

    // Try to list collections
    db.listCollections()
        .then(collections => {
            console.log('✅ Firestore connected successfully!');
            console.log('📚 Existing collections:', collections.map(c => c.id).join(', ') || 'None yet');

            // Try to write a test document
            return db.collection('_test').doc('connection_test').set({
                timestamp: new Date(),
                message: 'Firebase connection test successful'
            });
        })
        .then(() => {
            console.log('✅ Test write successful!');

            // Clean up test document
            return db.collection('_test').doc('connection_test').delete();
        })
        .then(() => {
            console.log('✅ Test cleanup successful!');
            console.log('\n🎉 All tests passed! Firebase is ready to use.');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Firestore error:', error.message);
            console.error('\n💡 Make sure Firestore is enabled in Firebase Console');
            console.error('   Visit: https://console.firebase.google.com/project/jobseek-459701/firestore');
            process.exit(1);
        });

} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.error('\n💡 Possible issues:');
    console.error('   1. Service account file not found');
    console.error('   2. Invalid service account JSON');
    console.error('   3. Insufficient permissions');
    process.exit(1);
}
