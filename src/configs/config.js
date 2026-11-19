import { Platform } from 'react-native';

export default {
    localStorageKey: 'storeKey',
    authStorageKey: 'authToken',
    apiBaseUrl: Platform.select({
        android: 'http://192.168.3.2:3000',
        default: 'http://localhost:3000',
    }),
}