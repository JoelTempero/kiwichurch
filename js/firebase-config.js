// Firebase Configuration for Kiwi Church
// Replace with your Firebase project credentials

const firebaseConfig = {
    apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "kiwichurch.firebaseapp.com",
    projectId: "kiwichurch",
    storageBucket: "kiwichurch.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxx"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence for Firestore
db.enablePersistence({ synchronizeTabs: true })
    .catch(err => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence not supported in this browser');
        }
    });

// Export for use in other modules
window.firebaseApp = { auth, db, storage };

console.log('[Firebase] Initialized successfully');
