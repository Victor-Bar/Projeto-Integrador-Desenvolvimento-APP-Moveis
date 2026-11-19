import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../configs/config';

export async function loadStorage() {
  const value = await AsyncStorage.getItem(config.localStorageKey);
  if (!value) return null;

  return JSON.parse(value);
}

export async function saveStorage(data) {
  await AsyncStorage.setItem(
    config.localStorageKey,
    JSON.stringify(data)
  );
}

export async function clearStorage() {
  await AsyncStorage.removeItem(config.localStorageKey);
}