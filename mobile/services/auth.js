import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'currentUser';

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    global.currentUser = user;
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem(USER_KEY);
    if (userString) {
      const user = JSON.parse(userString);
      global.currentUser = user;
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    global.currentUser = null;
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
};

export const isUserLoggedIn = async () => {
  const user = await getUser();
  return user !== null;
};

export const getCurrentUser = async () => {
  // First try to get from global
  if (global.currentUser) {
    return global.currentUser;
  }
  
  // If not in global, try to get from AsyncStorage
  try {
    const userString = await AsyncStorage.getItem(USER_KEY);
    if (userString) {
      const user = JSON.parse(userString);
      global.currentUser = user;
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

export const setCurrentUser = (user) => {
  global.currentUser = user;
};

// Synchronous version for immediate use
export const getCurrentUserSync = () => {
  return global.currentUser;
}; 