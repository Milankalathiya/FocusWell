import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import { useHabits } from '../hooks/useHabits';
import type { HabitWithStatus } from '../types';
type HabitFormData = {
  name: string;
  description?: string;
  frequency: string;
};

const Habits: React.FC = () => {
  const {
    habits,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    loading,
    error,
  } = useHabits();
  const [showDialog, setShowDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithStatus | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleCreateHabit = async (data: HabitFormData) => {
    setSubmitting(true);
    try {
      await createHabit(data);
      setShowDialog(false);
      setEditingHabit(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateHabit = async (data: HabitFormData) => {
    if (!editingHabit) return;
    setSubmitting(true);
    try {
      await updateHabit(editingHabit.id, data);
      setShowDialog(false);
      setEditingHabit(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (habit: HabitWithStatus) => {
    setEditingHabit(habit);
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this habit? This will remove all associated logs.'
      )
    ) {
      await deleteHabit(id);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingHabit(null);
  };

  const dailyHabits = habits.filter(
    (habit: HabitWithStatus) => habit.frequency === 'DAILY'
  );
  const weeklyHabits = habits.filter(
    (habit: HabitWithStatus) => habit.frequency === 'WEEKLY'
  );

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: { sm: 'space-between' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Habits
          </Typography>
          <Typography color="text.secondary">
            Build better habits and track your progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          Add Habit
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : habits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No habits yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Start building better habits by creating your first one.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowDialog(true)}
          >
            Create Your First Habit
          </Button>
        </Box>
      ) : (
        <Box>
          {dailyHabits.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Daily Habits
              </Typography>
              <Grid container spacing={2}>
                {dailyHabits.map((habit) => (
                  <Grid item xs={12} sm={6} md={4} key={habit.id}>
                    <HabitCard
                      habit={habit}
                      onLogHabit={logHabit}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isLoggedToday={habit.isLoggedToday}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          {weeklyHabits.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Weekly Habits
              </Typography>
              <Grid container spacing={2}>
                {weeklyHabits.map((habit) => (
                  <Grid item xs={12} sm={6} md={4} key={habit.id}>
                    <HabitCard
                      habit={habit}
                      onLogHabit={logHabit}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isLoggedToday={habit.isLoggedToday}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Habit Form Dialog */}
      <Dialog open={showDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHabit ? 'Edit Habit' : 'Create New Habit'}
        </DialogTitle>
        <DialogContent>
          <HabitForm
            habit={editingHabit || undefined}
            onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
            loading={submitting}
            onClose={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Habits;
