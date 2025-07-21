export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  HABITS: '/habits',
  ANALYTICS: '/analytics',
  WELLNESS: '/wellness',
  PROFILE: '/profile',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    PROFILE: '/api/users/profile',
  },
  TASKS: {
    BASE: '/api/tasks',
    TODAY: '/api/tasks/today',
    OVERDUE: '/api/tasks/overdue',
    UPCOMING: '/api/tasks/upcoming',
    ANALYTICS: '/api/tasks/analytics',
    CATEGORIES: '/api/tasks/categories',
  },
  HABITS: {
    BASE: '/api/habits',
    LOG: '/api/habits/log',
  },
} as const;

export const PRIORITY_COLORS = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
} as const;

export const PRIORITY_BORDER_COLORS = {
  LOW: 'border-green-200',
  MEDIUM: 'border-yellow-200',
  HIGH: 'border-red-200',
} as const;

export const TASK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export const TASK_REPEAT_TYPES = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
} as const;

export const HABIT_FREQUENCIES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

export const TOKEN_KEY = 'focuswell_token';
export const USER_KEY = 'focuswell_user';
