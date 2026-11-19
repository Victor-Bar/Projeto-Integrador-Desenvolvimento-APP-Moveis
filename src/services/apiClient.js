import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../configs/config';

export async function getAuthToken() {
    return AsyncStorage.getItem(config.authStorageKey);
}

export async function saveAuthToken(token) {
    await AsyncStorage.setItem(config.authStorageKey, token);
}

export async function removeAuthToken() {
    await AsyncStorage.removeItem(config.authStorageKey);
}

export async function request(path, options = {}) {
    const token = await getAuthToken();
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const body = response.status === 204 ? null : await response.json();

    if (!response.ok) {
        const error = new Error(body?.error || 'Não foi possível concluir a solicitação.');
        error.status = response.status;
        throw error;
    }

    return body;
}
