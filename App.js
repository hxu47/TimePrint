import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from "firebase/auth";
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { auth } from "./src/firebaseConfig";
import { Feather } from '@expo/vector-icons';

// Import screen components
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import MemoryListScreen from './src/screens/memory/MemoryListScreen';
import CreateMemoryScreen from './src/screens/memory/CreateMemoryScreen';
import EditMemoryScreen from './src/screens/memory/EditMemoryScreen';
import MemoryDetailScreen from './src/screens/memory/MemoryDetailScreen';

import MapScreen from './src/screens/map/MapScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

import SearchScreen from './src/screens/search/SearchScreen';
import SearchResultsScreen from './src/screens/search/SearchResultsScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Memories') {
              iconName = 'book';
            } else if (route.name === 'Create') {
              iconName = 'plus-square';
            } else if (route.name === 'Map') {
              iconName = 'map';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            // Return the Feather icon component
            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: true,
        })}
      >
          <Tab.Screen name="Memories" component={MemoryListScreen} />
          <Tab.Screen name="Create" component={CreateMemoryScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens 
          <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ):(
          // Main App Stack
          <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
          <Stack.Screen name="EditMemory" component={EditMemoryScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          </>
        )
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
  }
});

export default App;