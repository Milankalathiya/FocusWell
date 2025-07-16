import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import api from '../services/api';
import type { Analytics } from '../types';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(7);

  // AI Insights state
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<{
    wellnessScore: number;
    insights: string[];
    recommendations: string;
    sentimentSummary: string;
  } | null>(null);

  useEffect(() => {
    const fetchAIInsights = async () => {
      setAiLoading(true);
      setAiError(null);
      try {
        const res = await api.post('/ai/insights');
        setAiInsights(res.data);
      } catch (err) {
        setAiError('Failed to fetch AI insights');
      } finally {
        setAiLoading(false);
      }
    };
    fetchAIInsights();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const analyticsData = await analyticsService.getAnalytics(dateRange);
        setAnalytics(analyticsData);
      } catch (err: any) {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

  console.log('AnalyticsPage rendered, dateRange:', dateRange);

  const taskCompletionRate = analytics?.totalTasks
    ? (analytics.completedTasks / analytics.totalTasks) * 100
    : 0;

  const pieData = [
    {
      name: 'Completed',
      value: analytics?.completedTasks || 0,
      color: '#10B981',
    },
    {
      name: 'Pending',
      value: (analytics?.totalTasks || 0) - (analytics?.completedTasks || 0),
      color: '#F59E0B',
    },
  ];

  // Map tasksThisWeek and habitsThisWeek to recharts format
  const days = analytics?.tasksThisWeek?.length || 7;
  const today = new Date();
  const taskCompletion =
    analytics?.tasksThisWeek?.map((count, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - idx));
      return {
        date: d.toISOString().slice(0, 10),
        completed: count,
        total: analytics?.totalTasks || 0,
      };
    }) || [];
  const habitConsistency =
    analytics?.habitsThisWeek?.map((count, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - idx));
      return {
        date: d.toISOString().slice(0, 10),
        logged: count,
        total: analytics?.activeHabits || 0,
      };
    }) || [];

  useEffect(() => {
    console.log('Fallback useEffect running');
  }, []);

  if (loading || aiLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (aiError) {
    return <Alert severity="error">{aiError}</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* AI Insights Section - Restyled and Fixed DOM nesting */}
      {aiInsights && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderLeft: '6px solid #6366f1',
            background: 'background.paper',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 40, color: '#6366f1', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              AI Wellness Insights
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <b>Wellness Score:</b> {aiInsights.wellnessScore}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <b>Sentiment:</b> {aiInsights.sentimentSummary}
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" component="span">
                <b>Insights:</b>
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {aiInsights.insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </Box>
            <Box>
              <Typography variant="body2" component="span">
                <b>Recommendations:</b>
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {aiInsights.recommendations.split('\n').map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </Box>
          </Box>
        </Paper>
      )}
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
            Analytics
          </Typography>
          <Typography color="text.secondary">
            Track your productivity and progress
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateRange}
            label="Date Range"
            onChange={(e) => setDateRange(Number(e.target.value))}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={14}>Last 14 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary" variant="subtitle2">
              Total Tasks
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {analytics?.totalTasks || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary" variant="subtitle2">
              Completion Rate
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {Math.round(taskCompletionRate)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary" variant="subtitle2">
              Active Habits
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {analytics?.activeHabits || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary" variant="subtitle2">
              Consistency Score
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {Math.round((analytics?.consistencyScore || 0) * 100)}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Task Completion Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Task Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Habit Consistency
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={habitConsistency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="logged"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                  name="Logged"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#E5E7EB"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#E5E7EB' }}
                  name="Total"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {analytics?.bestDay && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h6" gutterBottom>
                🏆 Most Productive Day
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {new Date(analytics.bestDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Keep up the great work!
              </Typography>
            </Paper>
          </Grid>
        )}
        {analytics?.worstDay && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h6" gutterBottom>
                😴 Least Productive Day
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {new Date(analytics.worstDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                You can do better!
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
