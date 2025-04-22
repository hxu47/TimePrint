import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  GeoPoint
} from "firebase/firestore";
import { FIREBASE_CONFIG } from './config';


// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

// Memory collection reference
const getMemoriesRef = () => collection(db, 'memories');

// Create a new memory
export const createMemory = async (memoryData) => {
  try {
    const userId = auth.currentUser.uid;
    const memoriesRef = getMemoriesRef();

    // Ensure location data is properly structured for Firestore
    const geoPoint = new GeoPoint(
      memoryData.location.latitude,
      memoryData.location.longitude
    );

    const newMemory = {
      title: memoryData.title,
      content: memoryData.content,
      userId,
      createdAt: memoryData.createdAt,
      // location data
      location: geoPoint,
      locationName: memoryData.locationName,
      // weather data
      weather: {
        temperature: memoryData.weather.temperature,
        condition: memoryData.weather.condition,
      },
      photos: memoryData.photos,  // photos data
      tags: memoryData.tags || []  // tag data
    };
    const docRef = await addDoc(memoriesRef, newMemory);
    return docRef.id;
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
};

// Get user's memories
export const getUserMemories = async () => {
  try {
    const userId = auth.currentUser.uid;
    const memoriesRef = getMemoriesRef();
    const q = query(
      memoriesRef,
      where("userId", "==", userId), // only get current user's memories
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
      id: doc.id,
      ...data,
      location: data.location ? {
        latitude: data.location.latitude,
        longitude: data.location.longitude
      } : null
    }
  });
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

// Update a memory
export const updateMemory = async (memoryId, updateData) => {
  try {
    const memoryRef = doc(db, 'memories', memoryId);
    
    // If updateData contains location coordinates, convert to Firestore GeoPoint
    if (updateData.location) {
      updateData.location = new GeoPoint(
        updateData.location.latitude,
        updateData.location.longitude
      );
    }
    
    // Add updatedAt timestamp if not already present
    if (!updateData.updatedAt) {
      updateData.updatedAt = new Date().toISOString();
    }
    
    await updateDoc(memoryRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

// Delete a memory
export const deleteMemory = async (memoryId) => {
  try {
    const memoryRef = doc(db, 'memories', memoryId);
    await deleteDoc(memoryRef);
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};