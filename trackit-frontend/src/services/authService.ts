// src/services/authService.ts
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
} from '../types';
import api from './api';

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/api/users/login', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/api/users/profile');
    return response.data;
  },
};
