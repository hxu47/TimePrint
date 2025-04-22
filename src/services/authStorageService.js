import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';

// Save auth token and email (but not password)
export const saveUserAuth = async (email, token) => {
  try {
    // Save email for display purposes
    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
    
    // Save auth token instead of password
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    
    console.log('User auth data saved securely');
    return true;
  } catch (error) {
    console.error('Error saving auth data:', error);
    return false;
  }
};

// Get saved auth data
export const getSavedAuth = async () => {
  try {
    const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    
    if (!email || !token) return null;
    
    return { email, token };
  } catch (error) {
    console.error('Error getting saved auth data:', error);
    return null;
  }
};

// Clear saved auth data (on logout)
export const clearSavedAuth = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    console.log('User auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing saved auth data:', error);
    return false;
  }
};