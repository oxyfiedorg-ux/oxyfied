import api from './api';
import type { User } from '../types';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (name: string, phone: string): Promise<User> => {
    const response = await api.put('/users/profile', { name, phone });
    return response.data;
  }
};
