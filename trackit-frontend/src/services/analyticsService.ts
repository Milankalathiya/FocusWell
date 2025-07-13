import type { Analytics, ApiResponse } from '../types';
import api from './api';

export const analyticsService = {
  async getAnalytics(days: number = 7): Promise<Analytics> {
    const response = await api.get<Analytics>(
      `/analytics/summary?days=${days}`
    );
    return response.data;
  },

  async getTaskCompletion(
    days: number = 7
  ): Promise<{ date: string; completed: number; total: number }[]> {
    const response = await api.get<
      ApiResponse<{ date: string; completed: number; total: number }[]>
    >(`/analytics/task-completion?days=${days}`);
    return response.data.data;
  },

  async getHabitConsistency(
    days: number = 7
  ): Promise<{ date: string; logged: number; total: number }[]> {
    const response = await api.get<
      ApiResponse<{ date: string; logged: number; total: number }[]>
    >(`/analytics/habit-consistency?days=${days}`);
    return response.data.data;
  },
};
