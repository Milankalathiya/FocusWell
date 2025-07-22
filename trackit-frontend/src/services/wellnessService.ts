import { WellnessData, WellnessDataRequest, WellnessStats } from '../types';
import api from './api';

class WellnessService {
  private baseUrl = '/api/wellness';

  async saveWellnessData(data: WellnessDataRequest): Promise<WellnessData> {
    const response = await api.post(`${this.baseUrl}/data`, data);
    return response.data;
  }

  async getWellnessDataByDate(date: string): Promise<WellnessData | null> {
    try {
      const response = await api.get(`${this.baseUrl}/data?date=${date}`);
      return response.data;
    } catch {
      return null;
    }
  }

  async getAllWellnessData(): Promise<WellnessData[]> {
    const response = await api.get(`${this.baseUrl}/data/all`);
    return response.data;
  }

  async getWellnessDataByDateRange(
    startDate: string,
    endDate: string
  ): Promise<WellnessData[]> {
    const response = await api.get(
      `${this.baseUrl}/data/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getRecentWellnessData(days: number = 7): Promise<WellnessData[]> {
    const response = await api.get(`${this.baseUrl}/data/recent?days=${days}`);
    return response.data;
  }

  async getCompleteWellnessData(): Promise<WellnessData[]> {
    const response = await api.get(`${this.baseUrl}/data/complete`);
    return response.data;
  }

  async getWellnessStats(): Promise<WellnessStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async hasTodayData(): Promise<boolean> {
    const response = await api.get(`${this.baseUrl}/data/today`);
    return response.data;
  }

  async getAverageWellnessScore(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const response = await api.get(
      `${this.baseUrl}/analytics/average-score?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getLowWellnessDays(threshold: number = 5.0): Promise<WellnessData[]> {
    const response = await api.get(
      `${this.baseUrl}/analytics/low-score-days?threshold=${threshold}`
    );
    return response.data;
  }

  async getComprehensiveAnalytics(): Promise<Record<string, unknown>> {
    const response = await api.get(`${this.baseUrl}/analytics/comprehensive`);
    return response.data;
  }
}

export const wellnessService = new WellnessService();
