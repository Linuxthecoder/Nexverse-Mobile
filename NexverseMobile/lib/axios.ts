import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Use environment variables for API URL configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL ||
    (Platform.OS === 'android'
        ? 'http://10.0.2.2:5001'  // Android Emulator fallback
        : 'http://localhost:5001'); // iOS/Web fallback

console.log('🌐 API URL configured:', API_URL);

export const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Configure axios to work with cookies on mobile
axiosInstance.defaults.withCredentials = true;

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const authUser = await AsyncStorage.getItem('authUser');
            if (authUser) {
                const user = JSON.parse(authUser);
                // If your backend uses token-based auth, add it here
                // config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (error) {
            console.error('Error reading auth user from storage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        // 401 is expected during initial auth check when not logged in.
        // Avoid noisy console error in Metro for this case.
        if (status === 401) {
            await AsyncStorage.removeItem('authUser');
            return Promise.reject(error);
        }

        console.error('❌ API Error:', error.message);

        if (error.code === 'ECONNABORTED') {
            Alert.alert('Connection Timeout', 'The request took too long. Please check your internet connection.');
        } else if (error.message === 'Network Error') {
            Alert.alert(
                'Network Error',
                'Cannot connect to server. Please ensure:\n\n' +
                '1. Your backend is running on port 5001\n' +
                '2. You are using the correct IP address in .env file\n' +
                '3. Your firewall allows connections\n\n' +
                'Current API URL: ' + API_URL
            );
        }

        return Promise.reject(error);
    }
);
