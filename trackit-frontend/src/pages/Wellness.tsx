import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import WellnessForm from '../components/wellness/WellnessForm';
import { useAuth } from '../contexts/AuthContext';
import { wellnessService } from '../services/wellnessService';
import { WellnessData, WellnessStats } from '../types';

const Wellness: React.FC = () => {
  const [wellnessStats, setWellnessStats] = useState<WellnessStats | null>(
    null
  );
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { state } = useAuth();
  const user = state.user;

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, data] = await Promise.all([
        wellnessService.getWellnessStats(),
        wellnessService.getAllWellnessData(),
      ]);

      setWellnessStats(stats);
      setWellnessData(data);
    } catch {
      setError('Error loading wellness data');
      toast.error('Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  };

  const getWellnessLevel = (score: number) => {
    if (score >= 8)
      return { level: 'Excellent', color: 'var(--accent-success)' };
    if (score >= 6) return { level: 'Good', color: 'var(--accent-info)' };
    if (score >= 4) return { level: 'Fair', color: 'var(--accent-warning)' };
    return { level: 'Poor', color: 'var(--accent-danger)' };
  };

  const chartData = wellnessData.slice(-7).map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    wellness: item.wellnessScore,
    mood: item.moodScore,
    sleep: item.sleepQuality,
    energy: item.energyLevel,
    stress: item.stressLevel,
  }));

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 'var(--radius-md)', mb: 3 }}>
        {error}
      </Alert>
    );
  }

  const hasData = wellnessData.length > 0;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: 1,
          }}
        >
          Wellness Dashboard
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'var(--text-secondary)', fontWeight: 400 }}
        >
          Track and monitor your wellness journey
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              '&:hover': {
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-primary)15',
                    color: 'var(--accent-primary)',
                    mr: 2,
                  }}
                >
                  <AddIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Current Wellness Score
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {wellnessStats?.currentWellnessScore?.toFixed(1) || 'N/A'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                {wellnessStats?.currentWellnessScore
                  ? getWellnessLevel(wellnessStats.currentWellnessScore).level
                  : 'No data yet'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              '&:hover': {
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-info)15',
                    color: 'var(--accent-info)',
                    mr: 2,
                  }}
                >
                  <AddIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Average Score
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {wellnessStats?.averageWellnessScore?.toFixed(1) || 'N/A'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              '&:hover': {
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-warning)15',
                    color: 'var(--accent-warning)',
                    mr: 2,
                  }}
                >
                  <AddIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Streak Days
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {wellnessStats?.streakDays || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Consecutive days tracked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              '&:hover': {
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-success)15',
                    color: 'var(--accent-success)',
                    mr: 2,
                  }}
                >
                  <AddIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Total Entries
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {wellnessStats?.totalEntries || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Days tracked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Data Button */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
          sx={{
            background: 'var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: '#6B5BFF',
              transform: 'translateY(-1px)',
              boxShadow: 'var(--shadow-glow)',
            },
          }}
        >
          Add Wellness Data
        </Button>
      </Box>

      {/* Charts Section */}
      {hasData ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Wellness Trend (Last 7 Days)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)', mt: 1 }}
                >
                  Your wellness and mood scores over time
                </Typography>
              </Box>
              <Box sx={{ p: 3, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-light)"
                    />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="wellness"
                      stroke="var(--accent-primary)"
                      fill="var(--accent-primary)"
                      fillOpacity={0.3}
                      name="Wellness Score"
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="var(--accent-info)"
                      fill="var(--accent-info)"
                      fillOpacity={0.3}
                      name="Mood Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  Recent Entries
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)', mt: 1 }}
                >
                  Your latest wellness data
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {wellnessData.slice(0, 5).map((entry, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      mb: 2,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      transition: 'all var(--transition-normal)',
                      '&:hover': {
                        background: 'var(--bg-hover)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        Wellness Score:{' '}
                        {entry.wellnessScore?.toFixed(1) || 'N/A'}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        entry.wellnessScore
                          ? getWellnessLevel(entry.wellnessScore).level
                          : 'N/A'
                      }
                      size="small"
                      sx={{
                        background: entry.wellnessScore
                          ? getWellnessLevel(entry.wellnessScore).color
                          : 'var(--text-secondary)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* Empty State */
        <Card
          sx={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
            }}
          >
            <AddIcon
              sx={{
                fontSize: 64,
                mb: 2,
                color: 'var(--text-secondary)',
                opacity: 0.3,
              }}
            />
            <Typography
              variant="h5"
              sx={{ mb: 2, color: 'var(--text-secondary)' }}
            >
              No wellness data yet
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, color: 'var(--text-secondary)' }}
            >
              Start tracking your wellness journey by adding your first wellness
              entry
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{
                background: 'var(--accent-primary)',
                borderRadius: 'var(--radius-md)',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: '#6B5BFF',
                  transform: 'translateY(-1px)',
                  boxShadow: 'var(--shadow-glow)',
                },
              }}
            >
              Add Your First Entry
            </Button>
          </Box>
        </Card>
      )}

      {/* Wellness Form Modal */}
      <WellnessForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={loadWellnessData}
      />
    </Box>
  );
};

export default Wellness;
