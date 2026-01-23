// Kiwi Church - Firebase Authentication Service
// Handles user authentication with email/password and username support

const Auth = {
    currentUser: null,
    currentUserData: null,
    onAuthChangeCallbacks: [],

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        // Listen for auth state changes
        auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;

            if (user) {
                // Fetch full user data from Firestore
                this.currentUserData = await DB.getUser(user.uid);
                console.log('[Auth] User signed in:', user.email);
            } else {
                this.currentUserData = null;
                console.log('[Auth] User signed out');
            }

            // Notify all listeners
            this.onAuthChangeCallbacks.forEach(cb => cb(user, this.currentUserData));
        });
    },

    // Subscribe to auth state changes
    onAuthChange(callback) {
        this.onAuthChangeCallbacks.push(callback);

        // If already signed in, call immediately
        if (this.currentUser) {
            callback(this.currentUser, this.currentUserData);
        }

        // Return unsubscribe function
        return () => {
            const index = this.onAuthChangeCallbacks.indexOf(callback);
            if (index > -1) {
                this.onAuthChangeCallbacks.splice(index, 1);
            }
        };
    },

    // ============================================
    // SIGN IN
    // ============================================

    // Sign in with email or username
    async signIn(identifier, password) {
        let email = identifier;

        // Check if identifier is a username (no @ symbol)
        if (!identifier.includes('@')) {
            const user = await DB.getUserByUsername(identifier);
            if (!user) {
                throw new Error('Username not found');
            }
            email = user.email;
        }

        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error('[Auth] Sign in error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // SIGN UP
    // ============================================

    async signUp(email, password, userData = {}) {
        // Validate username if provided
        if (userData.username) {
            const isAvailable = await DB.checkUsernameAvailable(userData.username);
            if (!isAvailable) {
                throw new Error('Username is already taken');
            }
        }

        try {
            // Create Firebase auth user
            const result = await auth.createUserWithEmailAndPassword(email, password);
            const user = result.user;

            // Update display name in Firebase Auth
            if (userData.displayName) {
                await user.updateProfile({
                    displayName: userData.displayName
                });
            }

            // Create user document in Firestore
            await DB.createUser(user.uid, {
                email: email,
                displayName: userData.displayName || email.split('@')[0],
                username: userData.username || null,
                photoURL: userData.photoURL || null,
                role: 'member', // Default role
                preferences: {
                    emailNotifications: true,
                    darkMode: false
                }
            });

            return user;
        } catch (error) {
            console.error('[Auth] Sign up error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // SIGN OUT
    // ============================================

    async signOut() {
        // Clear local state synchronously BEFORE calling Firebase signOut
        // This prevents race conditions where UI checks auth state during signOut
        this.currentUser = null;
        this.currentUserData = null;

        try {
            await auth.signOut();
        } catch (error) {
            console.error('[Auth] Sign out error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // PASSWORD RESET
    // ============================================

    async sendPasswordResetEmail(email) {
        try {
            await auth.sendPasswordResetEmail(email);
        } catch (error) {
            console.error('[Auth] Password reset error:', error);
            throw this.formatError(error);
        }
    },

    async confirmPasswordReset(code, newPassword) {
        try {
            await auth.confirmPasswordReset(code, newPassword);
        } catch (error) {
            console.error('[Auth] Confirm password reset error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // EMAIL VERIFICATION
    // ============================================

    async sendEmailVerification() {
        if (!this.currentUser) {
            throw new Error('No user signed in');
        }

        try {
            await this.currentUser.sendEmailVerification();
        } catch (error) {
            console.error('[Auth] Email verification error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // PROFILE UPDATES
    // ============================================

    async updateProfile(updates) {
        if (!this.currentUser) {
            throw new Error('No user signed in');
        }

        try {
            // Update Firebase Auth profile
            const authUpdates = {};
            if (updates.displayName) authUpdates.displayName = updates.displayName;
            if (updates.photoURL) authUpdates.photoURL = updates.photoURL;

            if (Object.keys(authUpdates).length > 0) {
                await this.currentUser.updateProfile(authUpdates);
            }

            // Update Firestore user document
            await DB.updateUser(this.currentUser.uid, updates);

            // Refresh user data
            this.currentUserData = await DB.getUser(this.currentUser.uid);

            return this.currentUserData;
        } catch (error) {
            console.error('[Auth] Profile update error:', error);
            throw this.formatError(error);
        }
    },

    async updateEmail(newEmail, password) {
        if (!this.currentUser) {
            throw new Error('No user signed in');
        }

        try {
            // Re-authenticate first
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.currentUser.email,
                password
            );
            await this.currentUser.reauthenticateWithCredential(credential);

            // Update email
            await this.currentUser.updateEmail(newEmail);

            // Update in Firestore
            await DB.updateUser(this.currentUser.uid, { email: newEmail });

            return true;
        } catch (error) {
            console.error('[Auth] Email update error:', error);
            throw this.formatError(error);
        }
    },

    async updatePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('No user signed in');
        }

        try {
            // Re-authenticate first
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.currentUser.email,
                currentPassword
            );
            await this.currentUser.reauthenticateWithCredential(credential);

            // Update password
            await this.currentUser.updatePassword(newPassword);

            return true;
        } catch (error) {
            console.error('[Auth] Password update error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // USERNAME MANAGEMENT
    // ============================================

    async setUsername(username) {
        if (!this.currentUser) {
            throw new Error('No user signed in');
        }

        // Check availability
        const isAvailable = await DB.checkUsernameAvailable(username);
        if (!isAvailable) {
            throw new Error('Username is already taken');
        }

        // Remove old username if exists
        if (this.currentUserData?.username) {
            await db.collection('usernames')
                .doc(this.currentUserData.username.toLowerCase())
                .delete();
        }

        // Set new username
        await db.collection('usernames').doc(username.toLowerCase()).set({
            uid: this.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update user document
        await DB.updateUser(this.currentUser.uid, { username });

        // Refresh user data
        this.currentUserData = await DB.getUser(this.currentUser.uid);

        return true;
    },

    // ============================================
    // ROLE CHECKS
    // ============================================

    isAdmin() {
        return this.currentUserData?.role === 'admin';
    },

    isHost() {
        return this.currentUserData?.role === 'host';
    },

    isAdminOrHost() {
        return this.isAdmin() || this.isHost();
    },

    hasRole(role) {
        return this.currentUserData?.role === role;
    },

    // ============================================
    // HELPERS
    // ============================================

    formatError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection'
        };

        return new Error(errorMessages[error.code] || error.message);
    },

    // Get current user ID
    get uid() {
        return this.currentUser?.uid || null;
    },

    // Check if user is signed in
    get isSignedIn() {
        return !!this.currentUser;
    }
};

// Make available globally
window.Auth = Auth;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}
