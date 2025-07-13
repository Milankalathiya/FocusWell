import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { wellnessService } from '../../services/wellnessService';
import { WellnessDataRequest } from '../../types';

interface WellnessFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: WellnessDataRequest;
}

const WellnessForm: React.FC<WellnessFormProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<WellnessDataRequest>({
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    sleepHours: initialData?.sleepHours || 7,
    sleepQuality: initialData?.sleepQuality || 7,
    moodScore: initialData?.moodScore || 7,
    stressLevel: initialData?.stressLevel || 5,
    productivityScore: initialData?.productivityScore || 7,
    physicalActivityMinutes: initialData?.physicalActivityMinutes || 30,
    socialInteractionHours: initialData?.socialInteractionHours || 2,
    screenTimeHours: initialData?.screenTimeHours || 4,
    waterIntakeGlasses: initialData?.waterIntakeGlasses || 6,
    mealsSkipped: initialData?.mealsSkipped || 0,
    meditationMinutes: initialData?.meditationMinutes || 10,
    energyLevel: initialData?.energyLevel || 7,
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: keyof WellnessDataRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSliderChange =
    (field: keyof WellnessDataRequest) =>
    (_event: Event, newValue: number | number[]) => {
      handleInputChange(field, newValue as number);
    };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await wellnessService.saveWellnessData(formData);
      toast.success('Wellness data saved successfully!');
      onSave();
      onClose();
    } catch {
      toast.error('Failed to save wellness data');
    } finally {
      setLoading(false);
    }
  };

  const renderSlider = (
    field: keyof WellnessDataRequest,
    label: string,
    min: number,
    max: number,
    step: number = 1
  ) => (
    <Grid item xs={12} sm={6}>
      <Typography gutterBottom>{label}</Typography>
      <Slider
        value={formData[field] as number}
        onChange={handleSliderChange(field)}
        min={min}
        max={max}
        step={step}
        marks={[
          { value: min, label: min.toString() },
          { value: max, label: max.toString() },
        ]}
        valueLabelDisplay="auto"
      />
      <Typography variant="caption" color="text.secondary">
        Current: {formData[field]}
      </Typography>
    </Grid>
  );

  const renderNumberInput = (
    field: keyof WellnessDataRequest,
    label: string,
    min: number = 0,
    max: number = 24,
    unit: string = ''
  ) => (
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={label}
        type="number"
        value={formData[field] as number}
        onChange={(e) =>
          handleInputChange(field, parseFloat(e.target.value) || 0)
        }
        inputProps={{ min, max }}
        InputProps={{
          endAdornment: unit && (
            <Typography variant="caption">{unit}</Typography>
          ),
        }}
      />
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Track Your Wellness</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Date */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Wellness Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Wellness Metrics
            </Typography>
          </Grid>
          {renderSlider('sleepHours', 'Sleep Hours', 0, 24, 0.5)}
          {renderSlider('sleepQuality', 'Sleep Quality', 1, 10)}
          {renderSlider('moodScore', 'Mood Score', 1, 10)}
          {renderSlider('stressLevel', 'Stress Level', 1, 10)}
          {renderSlider('productivityScore', 'Productivity Score', 1, 10)}
          {renderSlider('energyLevel', 'Energy Level', 1, 10)}

          {/* Activity Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Activity Metrics
            </Typography>
          </Grid>
          {renderNumberInput(
            'physicalActivityMinutes',
            'Physical Activity',
            0,
            480,
            'min'
          )}
          {renderNumberInput(
            'socialInteractionHours',
            'Social Interaction',
            0,
            24,
            'hrs'
          )}
          {renderNumberInput('screenTimeHours', 'Screen Time', 0, 24, 'hrs')}
          {renderNumberInput('meditationMinutes', 'Meditation', 0, 180, 'min')}

          {/* Nutrition Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Nutrition Metrics
            </Typography>
          </Grid>
          {renderNumberInput(
            'waterIntakeGlasses',
            'Water Intake',
            0,
            20,
            'glasses'
          )}
          {renderNumberInput('mealsSkipped', 'Meals Skipped', 0, 5, 'meals')}

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="How are you feeling today? Any specific observations?"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Wellness Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WellnessForm;
