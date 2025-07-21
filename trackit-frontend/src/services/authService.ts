// src/services/authService.ts
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '../types';
import api from './api';

const API_BASE_URL = 'https://focuswell-production.up.railway.app/api/users';

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post(`${API_BASE_URL}/register`, data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post(`${API_BASE_URL}/login`, data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/api/users/profile');
    return response.data;
  },
};
