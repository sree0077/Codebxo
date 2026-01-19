/**
 * Maps Firebase Auth error codes to user-friendly, professional messages.
 * 
 * @param {string} errorCode - The Firebase error code (e.g., 'auth/user-not-found')
 * @returns {string} A user-friendly error message
 */
export const mapAuthError = (errorCode) => {
    switch (errorCode) {
        // Login errors
        case 'auth/invalid-email':
            return 'The email address provided is not valid.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';

        // Registration errors
        case 'auth/email-already-in-use':
            return 'This email address is already registered.';
        case 'auth/operation-not-allowed':
            return 'Email and password registration is currently disabled.';
        case 'auth/weak-password':
            return 'The password is too weak. Please use at least 6 characters.';

        // Network/System errors
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/internal-error':
            return 'An unexpected server error occurred. Please try again later.';

        default:
            console.log('[AUTH] Unhandled Firebase error code:', errorCode);
            return 'An error occurred during authentication. Please try again.';
    }
};
