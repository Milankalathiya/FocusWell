import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Task, TaskRequest } from '../../types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskRequest) => Promise<void>;
  task?: Task;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSubmit,
  task,
  loading = false,
}) => {
  const [dueDate, setDueDate] = useState<string>(
    task?.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskRequest>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      repeatType: task?.repeatType || 'NONE',
      category: task?.category || '',
      estimatedHours: task?.estimatedHours || undefined,
      actualHours: task?.actualHours || undefined,
    },
  });

  const handleFormSubmit = async (data: TaskRequest) => {
    const taskData: TaskRequest = {
      ...data,
      dueDate: new Date(dueDate).toISOString(),
    };

    await onSubmit(taskData);
    reset();
    setDueDate(new Date().toISOString().slice(0, 16));
    onClose();
  };

  const handleClose = () => {
    reset();
    setDueDate(new Date().toISOString().slice(0, 16));
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ mt: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register('title', { required: 'Title is required' })}
                fullWidth
                label="Task Title"
                variant="outlined"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('description')}
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date & Time"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  {...register('priority')}
                  label="Priority"
                  defaultValue="MEDIUM"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('category')}
                fullWidth
                label="Category"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Repeat Type</InputLabel>
                <Select
                  {...register('repeatType')}
                  label="Repeat Type"
                  defaultValue="NONE"
                >
                  <MenuItem value="NONE">None</MenuItem>
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('estimatedHours', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' },
                })}
                fullWidth
                label="Estimated Hours"
                type="number"
                variant="outlined"
                error={!!errors.estimatedHours}
                helperText={errors.estimatedHours?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('actualHours', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' },
                })}
                fullWidth
                label="Actual Hours"
                type="number"
                variant="outlined"
                error={!!errors.actualHours}
                helperText={errors.actualHours?.message}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
