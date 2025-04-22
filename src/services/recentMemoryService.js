import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_MEMORY_KEY = 'recent_memory_id';

export const saveRecentMemory = async (memoryId) => {
  try {
    console.log('Saving memory ID to AsyncStorage:', memoryId);
    await AsyncStorage.setItem(RECENT_MEMORY_KEY, memoryId);
    return true;
  } catch (error) {
    console.error('Error saving recent memory:', error);
    return false;
  }
};

export const getRecentMemory = async () => {
  try {
    const memoryId = await AsyncStorage.getItem(RECENT_MEMORY_KEY);
    return memoryId;
  } catch (error) {
    console.error('Error getting recent memory:', error);
    return null;
  }
};