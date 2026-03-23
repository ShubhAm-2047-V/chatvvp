import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    // Mock login since we don't have a real backend immediately ready
    if (email && password) {
      const mockToken = 'mock_jwt_token_123';
      await AsyncStorage.setItem('userToken', mockToken);
      return { success: true, token: mockToken };
    }
    throw new Error('Invalid credentials');
  },

  register: async (name: string, email: string, password: string) => {
    if (name && email && password) {
      const mockToken = 'mock_jwt_token_123';
      await AsyncStorage.setItem('userToken', mockToken);
      return { success: true, token: mockToken };
    }
    throw new Error('Registration failed');
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
  },

  checkAuth: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  }
};
