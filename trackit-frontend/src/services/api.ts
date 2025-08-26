import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import {
  API_BASE_URL,
  API_ORIGIN,
  TOKEN_KEY,
  USER_KEY,
} from '../utils/constants';
// Removed unused import of useAuth

interface ErrorResponse {
  message?: string;
  details?: Record<string, string> | string[];
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_ORIGIN, // e.g., http://localhost:8080
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to call logout from AuthContext outside of React tree
let logoutFn: (() => void) | null = null;
export const setLogoutFunction = (fn: () => void) => {
  logoutFn = fn;
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          if (logoutFn) {
            logoutFn();
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          if (logoutFn) {
            logoutFn();
          }
          toast.error(
            "Access denied. You don't have permission for this action."
          );
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          if (data && data.details) {
            const details = data.details;
            if (Array.isArray(details)) {
              (details as string[]).forEach((message) =>
                toast.error(String(message))
              );
            } else {
              Object.values(details as Record<string, string>).forEach(
                (message) => toast.error(String(message))
              );
            }
          } else {
            toast.error((data as any)?.message || 'Validation failed');
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error((data as any)?.message || 'An error occurred');
      }
    } else if ((error as any).request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;

export const nutritionApi = {
  async getNutritionProfile(token: string) {
    const res = await fetch(`${API_BASE_URL}/nutrition/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load nutrition profile');
    return res.json();
  },
  async saveMealPlan(token: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/nutrition/mealplan/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save meal plan');
  },

  async getMealPlansForRange(token: string, start: string, end: string) {
  const res = await fetch(`${API_BASE_URL}/nutrition/mealplan/range?start=${start}&end=${end}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch meal plans');
  return res.json();
},
  async getAnalyticsSummary(token: string, start: string, end: string) {
    const url = new URL(
      `${API_BASE_URL}/nutrition/analytics/summary`,
      window.location.origin
    );
    url.searchParams.set('start', start);
    url.searchParams.set('end', end);
    const res = await fetch(
      url.toString().replace(window.location.origin, ''),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },
  async updateProfile(token: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/nutrition/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save profile');
    return res.json();
  },
  async generateMealPlan(token: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/nutrition/mealplan/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate meal plan');
    return res.json();
  },
  async getMealPlanForDay(token: string, date: string) {
    const url = new URL(
      `${API_BASE_URL}/nutrition/mealplan/day`,
      window.location.origin
    );
    url.searchParams.set('date', date);
    const res = await fetch(
      url.toString().replace(window.location.origin, ''),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error('Failed to load meal plan');
    return res.json();
  },
  async getMealsForDay(token: string, date: string) {
    const url = new URL(
      `${API_BASE_URL}/nutrition/meals/day`,
      window.location.origin
    );
    url.searchParams.set('date', date);
    const res = await fetch(
      url.toString().replace(window.location.origin, ''),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error('Failed to load meals');
    return res.json();
  },
  async searchFoods(token: string, q: string) {
    const url = new URL(
      `${API_BASE_URL}/nutrition/foods`,
      window.location.origin
    );
    if (q) url.searchParams.set('q', q);
    const res = await fetch(
      url.toString().replace(window.location.origin, ''),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error('Failed to search foods');
    return res.json();
  },
  async logMeal(token: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/nutrition/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log meal');
    return res.json();
  },
  async deleteMeal(token: string, mealId: number) {
    const res = await fetch(`${API_BASE_URL}/nutrition/meals/${mealId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete meal');
  },
  async logWeight(token: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/nutrition/weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log weight');
    return res.json();
  },
};
