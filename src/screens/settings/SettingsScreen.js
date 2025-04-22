import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { logout, sendPasswordResetEmail } from '../../services/authService';
import { getSortOrderPreference, saveSortOrderPreference } from '../../services/userPreferencesService';
import { auth } from '../../firebaseConfig';

const SettingsScreen = () => {
  const currentUser = auth.currentUser;
  const userEmail = currentUser ? currentUser.email : 'Not signed in';

  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const sortOrderPreference = await getSortOrderPreference();
        setSortOrder(sortOrderPreference);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  const handleSortOrderChange = async (value) => {
    setSortOrder(value);
    await saveSortOrderPreference(value);
  };

  const handleResetPassword = async () => {
    if (!currentUser || !currentUser.email) {
      Alert.alert("Error", "No user email found");
      return;
    }

    Alert.alert(
      "Reset Password",
      "Send a password reset email to " + currentUser.email + "?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Send Email",
          onPress: async () => {
            try {
              setSending(true);
              await sendPasswordResetEmail(currentUser.email);
              setSending(false);
              Alert.alert(
                "Success",
                "Password reset email sent to " + currentUser.email,
                [{ text: "OK" }]
              );
            } catch (error) {
              setSending(false);
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('User logged out successfully');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      {/* Display User Email & Reset Password Button */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
        <TouchableOpacity 
          style={styles.resetPasswordButton}
          onPress={handleResetPassword}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.resetPasswordButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sorting Order Preferences */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Display</Text>
        <Text style={styles.settingLabel}>Sort Memories By:</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioButton}
            onPress={() => handleSortOrderChange('newest')}
          >
            <View style={[
              styles.radioCircle,
              sortOrder === 'newest' && styles.radioSelected
            ]} />
            <Text style={styles.radioLabel}>Newest First</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioButton}
            onPress={() => handleSortOrderChange('oldest')}
          >
            <View style={[
              styles.radioCircle,
              sortOrder === 'oldest' && styles.radioSelected
            ]} />
            <Text style={styles.radioLabel}>Oldest First</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  resetPasswordButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  resetPasswordButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  radioGroup: {
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#007AFF',
    borderWidth: 6,
    borderColor: '#fff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;