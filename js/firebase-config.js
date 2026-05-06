// Firebase Configuration for Kiwi Church
// Replace with your Firebase project credentials

const firebaseConfig = {
  apiKey: "AIzaSyDbGRbr1D2difpQWfxoZqPy58FmNrQ2HbA",
  authDomain: "kiwichurch-1ef0f.firebaseapp.com",
  projectId: "kiwichurch-1ef0f",
  storageBucket: "kiwichurch-1ef0f.firebasestorage.app",
  messagingSenderId: "295588695621",
  appId: "1:295588695621:web:7320e07a05229564a45d2c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services (only those whose SDKs are loaded)
const db = firebase.firestore();
const auth = typeof firebase.auth === 'function' ? firebase.auth() : null;
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;

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
