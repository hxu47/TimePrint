import AsyncStorage from '@react-native-async-storage/async-storage';

const SORT_ORDER_KEY = 'memory_sort_preference';

export const saveSortOrderPreference = async (sortOrder) => {
  try {
    await AsyncStorage.setItem(SORT_ORDER_KEY, sortOrder);
    return true;
  } catch (error) {
    console.error('Error saving sort order preference:', error);
    return false;
  }
};

export const getSortOrderPreference = async () => {
  try {
    const value = await AsyncStorage.getItem(SORT_ORDER_KEY);
    return value !== null ? value : 'newest';
  } catch (error) {
    console.error('Error getting sort order preference:', error);
    return 'newest';
  }
};