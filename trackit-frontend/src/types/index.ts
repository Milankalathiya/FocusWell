export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  timezone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  repeatType: 'NONE' | 'DAILY' | 'WEEKLY';
  category?: string;
  estimatedHours?: number;
  actualHours?: number;
  completed: boolean;
  completedAt?: string;
  archived: boolean;
  reminderSent: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
  dueToday?: boolean;
  overdue?: boolean;
  dueThisWeek?: boolean;
}

export interface TaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  repeatType: 'NONE' | 'DAILY' | 'WEEKLY';
  category?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  frequency: string;
  user: User;
  currentStreak?: number;
  longestStreak?: number;
}

export interface HabitWithStatus extends Habit {
  isLoggedToday: boolean;
  currentStreak: number;
}

export interface HabitLog {
  id: number;
  habit: Habit;
  user: User;
  logDate: string;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  todayTasks: number;
  completionRate: number;
  tasksByPriority: Record<string, number>;
  tasksByCategory: Record<string, number>;
}

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  activeHabits: number;
  consistencyScore: number;
  bestDay?: string;
  worstDay?: string;
  tasksThisWeek: number[];
  habitsThisWeek: number[];
  period?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: {
    id: number;
    username: string;
  };
}

// Wellness Types
export interface WellnessData {
  id: number;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  moodScore: number;
  stressLevel: number;
  productivityScore: number;
  physicalActivityMinutes: number;
  socialInteractionHours: number;
  screenTimeHours: number;
  waterIntakeGlasses: number;
  mealsSkipped: number;
  meditationMinutes: number;
  energyLevel: number;
  notes: string;
  wellnessScore: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface WellnessDataRequest {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  moodScore: number;
  stressLevel: number;
  productivityScore: number;
  physicalActivityMinutes: number;
  socialInteractionHours: number;
  screenTimeHours: number;
  waterIntakeGlasses: number;
  mealsSkipped: number;
  meditationMinutes: number;
  energyLevel: number;
  notes: string;
}

export interface WellnessStats {
  totalEntries: number;
  currentWellnessScore: number;
  averageWellnessScore: number;
  streakDays: number;
}

export interface RiskAssessment {
  id: number;
  assessmentDate: string;
  depressionRisk: number;
  anxietyRisk: number;
  burnoutRisk: number;
  stressRisk: number;
  isolationRisk: number;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskFactors: string;
  recommendations: string;
  requiresImmediateAttention: boolean;
  shouldContactProfessional: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  recommendationType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
  completedAt?: string;
  actionItems: string;
  expectedImpact: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTimeMinutes: number;
  category: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}
