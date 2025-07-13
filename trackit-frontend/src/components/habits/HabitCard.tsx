import {
  Delete,
  Edit,
  LocalFireDepartment,
  Repeat,
  TrendingUp,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import type { Habit } from '../../types';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
  onLogHabit: (habitId: number) => void;
  isLoggedToday: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onLogHabit,
  isLoggedToday,
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'success';
    if (streak >= 3) return 'warning';
    return 'default';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 7) return <LocalFireDepartment fontSize="small" />;
    if (streak >= 3) return <TrendingUp fontSize="small" />;
    return null;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {habit.name}
              </Typography>

              <Chip
                label={habit.frequency}
                variant="outlined"
                size="small"
                icon={<Repeat fontSize="small" />}
              />
            </Box>

            {habit.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {habit.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={`${habit.currentStreak ?? 0} day streak`}
                color={getStreakColor(habit.currentStreak ?? 0)}
                size="small"
                icon={getStreakIcon(habit.currentStreak ?? 0)}
              />

              {habit.longestStreak &&
                habit.longestStreak > (habit.currentStreak || 0) && (
                  <Chip
                    label={`Best: ${habit.longestStreak} days`}
                    variant="outlined"
                    size="small"
                  />
                )}
            </Box>

            {habit.currentStreak && habit.currentStreak > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((habit.currentStreak ?? 0) / 30) * 100, 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip
              title={isLoggedToday ? 'Already logged today' : 'Log Today'}
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => onLogHabit(habit.id)}
                  color={isLoggedToday ? 'success' : 'primary'}
                  disabled={isLoggedToday}
                >
                  <TrendingUp fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Edit Habit">
              <IconButton size="small" onClick={() => onEdit(habit)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Habit">
              <IconButton
                size="small"
                onClick={() => onDelete(habit.id)}
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
