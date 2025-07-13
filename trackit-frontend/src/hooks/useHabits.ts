import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { habitService } from '../services/habitService';
import type { Habit } from '../types';

interface HabitFormData {
  name: string;
  description?: string;
  frequency: string;
}

interface HabitWithStatus extends Habit {
  isLoggedToday: boolean;
  currentStreak: number;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitService.getAllHabits();
      // For each habit, fetch log status and streak
      const habitsWithStatus = await Promise.all(
        data.map(async (habit) => {
          let isLoggedToday = false;
          let currentStreak = 0;
          try {
            // Check if logged today
            const logs = await habitService.getHabitLogs(habit.id);
            const today = new Date().toISOString().slice(0, 10);
            isLoggedToday = logs.some(
              (log) => log.logDate.slice(0, 10) === today
            );
          } catch {
            // Ignore error, treat as not logged
          }
          try {
            // Fetch streak
            const streakRes = await habitService.getStreak(habit.id);
            currentStreak = streakRes.currentStreak || 0;
          } catch {
            // Ignore error, treat as 0 streak
          }
          return { ...habit, isLoggedToday, currentStreak };
        })
      );
      setHabits(habitsWithStatus);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch habits';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createHabit = useCallback(async (habitData: HabitFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure frequency is 'DAILY' or 'WEEKLY'
      const newHabit = await habitService.createHabit({
        ...habitData,
        frequency: habitData.frequency === 'WEEKLY' ? 'WEEKLY' : 'DAILY',
      });
      // Add default status fields
      setHabits((prev) => [
        { ...newHabit, isLoggedToday: false, currentStreak: 0 },
        ...prev,
      ]);
      toast.success('Habit created successfully!');
      return newHabit;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHabit = useCallback(
    async (id: number, habitData: Partial<HabitFormData>) => {
      setLoading(true);
      setError(null);
      try {
        // Ensure frequency is 'DAILY' or 'WEEKLY' if present
        const updatedHabit = await habitService.updateHabit(id, {
          ...habitData,
          frequency: habitData.frequency === 'WEEKLY' ? 'WEEKLY' : 'DAILY',
        });
        setHabits((prev) =>
          prev.map((habit) =>
            habit.id === id
              ? { ...updatedHabit, isLoggedToday: false, currentStreak: 0 }
              : habit
          )
        );
        toast.success('Habit updated successfully!');
        return updatedHabit;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update habit';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteHabit = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await habitService.deleteHabit(id);
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
      toast.success('Habit deleted successfully!');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logHabit = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await habitService.logHabit(id);
        // After logging, refetch all habits to update log status and streaks
        await fetchHabits();
        toast.success('Habit logged successfully!');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to log habit';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchHabits]
  );

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    refetch: fetchHabits,
  };
};
