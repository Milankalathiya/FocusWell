import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { Habit } from '../../types';

interface HabitFormData {
  name: string;
  description?: string;
  frequency: string;
}

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
  habit?: Habit;
  loading?: boolean;
}

const HabitForm: React.FC<HabitFormProps> = ({
  onClose,
  onSubmit,
  habit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HabitFormData>({
    defaultValues: {
      name: habit?.name || '',
      description: habit?.description || '',
      frequency: habit?.frequency || 'DAILY',
    },
  });

  const handleFormSubmit = async (data: HabitFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ mt: 2 }}
    >
      <TextField
        {...register('name', { required: 'Habit name is required' })}
        fullWidth
        label="Habit Name"
        variant="outlined"
        margin="normal"
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <TextField
        {...register('description')}
        fullWidth
        label="Description"
        variant="outlined"
        margin="normal"
        multiline
        rows={3}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Frequency</InputLabel>
        <Select
          {...register('frequency')}
          label="Frequency"
          defaultValue="DAILY"
        >
          <MenuItem value="DAILY">Daily</MenuItem>
          <MenuItem value="WEEKLY">Weekly</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={handleCancel} disabled={loading} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
        </Button>
      </Box>
    </Box>
  );
};

export default HabitForm;
