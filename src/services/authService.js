import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail as sendPasswordReset } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const registerWithEmailAndPassword = async (email, password) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store minimal user data in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: new Date().toISOString(),
    });

    return userCredential.user;
  } catch (error) {
    let errorMessage = 'An error occurred during registration';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
    }
    
    throw new Error(errorMessage);
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    
    // Convert Firebase errors to user-friendly messages
    let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
      }
    }
    
    // Throw a new error with the user-friendly message
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    throw new Error('Error signing out');
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    await sendPasswordReset(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    
    // For security reasons, we don't want to expose whether an email exists
    // So for user-not-found errors, we should still return success
    if (error.code === 'auth/user-not-found') {
      return { success: true };
    }
    
    // For other errors like network issues or invalid email format,
    // we can show an error
    let errorMessage = 'Failed to send password reset email';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many reset attempts. Please try again later.';
          break;
      }
    }
    
    throw new Error(errorMessage);
  }
};