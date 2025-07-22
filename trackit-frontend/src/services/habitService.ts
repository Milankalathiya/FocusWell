import type { Habit, HabitLog } from '../types';
import api from './api';

export interface CreateHabitRequest {
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY';
}

export const habitService = {
  async getAllHabits(): Promise<Habit[]> {
    const response = await api.get('/api/habits');
    return response.data;
  },

  async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
    const response = await api.post('/api/habits', habitData);
    return response.data;
  },

  async updateHabit(
    id: number,
    habitData: Partial<CreateHabitRequest>
  ): Promise<Habit> {
    const response = await api.put(`/api/habits/${id}`, habitData);
    return response.data;
  },

  async deleteHabit(id: number): Promise<void> {
    await api.delete(`/api/habits/${id}`);
  },

  async logHabit(id: number): Promise<Habit> {
    const response = await api.post(`/api/habits/${id}/log`);
    return response.data;
  },

  async getHabitLogs(id: number): Promise<HabitLog[]> {
    const response = await api.get(`/api/habits/${id}/logs`);
    return response.data;
  },

  async getWeeklyProgress(id: number): Promise<number[]> {
    const response = await api.get(`/api/habits/${id}/weekly-progress`);
    return response.data;
  },

  async getStreak(id: number): Promise<{ currentStreak: number }> {
    const response = await api.get(`/api/habits/${id}/streak`);
    return response.data;
  },
};
