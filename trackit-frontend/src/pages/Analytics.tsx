import TaskIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
        const res = await api.post('/api/ai/insights');
        setAiInsights(res.data);
      } catch {
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
      } catch {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

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

  // Empty state for no data
  if (!analytics || analytics.totalTasks === 0) {
    return (
      <Box
        sx={{
          p: { xs: 2, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analytics
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Track your productivity and progress
        </Typography>
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: 2,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No data available
          </Typography>
          <Typography color="text.secondary">
            Start by adding tasks and habits to see your analytics here!
          </Typography>
        </Paper>
      </Box>
    );
  }

  // StatCard for consistent style
  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card
      sx={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
        minWidth: 180,
        transition: 'all var(--transition-normal)',
        '&:hover': {
          boxShadow: 'var(--shadow-md)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 'var(--radius-md)',
              background: `${color}15`,
              color: color,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        p: { xs: 1, md: 3 },
        maxWidth: 1200,
        mx: 'auto',
        width: '100%',
        backgroundColor: '#F9FAFB', // Light background for contrast
        borderRadius: '12px', // Rounded edges for the main container
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
      }}
    >
      {/* AI Insights Section */}
      {aiInsights && (
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderLeft: '6px solid #6366f1',
            background: '#F1F5F9', // Softer background
            color: 'text.primary',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // Lighter shadow
            borderRadius: '8px', // Rounded edges
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 40, color: '#6366f1', mt: 0.5 }} />
          <Box sx={{ overflowX: 'auto' }}>
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
                {(aiInsights.insights || []).map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </Box>
            <Box>
              <Typography variant="body2" component="span">
                <b>Recommendations:</b>
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(aiInsights.recommendations
                  ? aiInsights.recommendations.split('\n')
                  : []
                ).map((rec, idx) => (
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
          padding: '10px', // Added padding for better spacing
          backgroundColor: '#FFFFFF', // White background for header
          borderRadius: '8px', // Rounded edges
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // Subtle shadow
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
      <Divider sx={{ mb: 3 }} />
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={analytics?.totalTasks || 0}
            icon={<TaskIcon sx={{ fontSize: 28 }} />}
            color="#6366f1"
            subtitle={`${analytics?.completedTasks || 0} completed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${Math.round(taskCompletionRate)}%`}
            icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
            color="#10B981"
            subtitle="of tasks completed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Habits"
            value={analytics?.activeHabits || 0}
            icon={<FavoriteIcon sx={{ fontSize: 28 }} />}
            color="#8B5CF6"
            subtitle="Current active habits"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consistency Score"
            value={`${Math.round((analytics?.consistencyScore || 0) * 100)}%`}
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            color="#0ea5e9"
            subtitle="Habit consistency"
          />
        </Grid>
      </Grid>
      {/* Charts Section - 3 columns, full width */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: '12px', // Larger rounded edges
              border: '1px solid #E0E0E0', // Lighter border
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)', // Stronger shadow
              height: 500,
              backgroundColor: '#FFFFFF', // White background
              transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth hover effect
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Task Completion Trend
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={taskCompletion} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#E0E0E0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}
                    interval={0}
                    tick={{ transform: 'translate(0, 5)' }}
                  />
                  <YAxis
                    style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}
                    tick={{ transform: 'translate(-5, 0)' }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: '#FFF', border: '1px solid #CCC' }}
                    itemStyle={{ color: '#333' }}
                  />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" barSize={40} />
                  <Bar dataKey="total" fill="#E5E7EB" name="Total" barSize={40} />
                  <Legend wrapperStyle={{ fontSize: '16px', fontWeight: 'bold', paddingTop: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: '12px', // Larger rounded edges
              border: '1px solid #E0E0E0', // Lighter border
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)', // Stronger shadow
              height: 500,
              backgroundColor: '#FFFFFF', // White background
              transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth hover effect
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Task Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={180}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                    labelStyle={{ fontSize: '18px', fontWeight: 'bold', fill: '#333', textAnchor: 'middle' }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: '#FFF', border: '1px solid #CCC' }} />
                  <Legend wrapperStyle={{ fontSize: '16px', fontWeight: 'bold', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: '12px', // Larger rounded edges
              border: '1px solid #E0E0E0', // Lighter border
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)', // Stronger shadow
              height: 500,
              backgroundColor: '#FFFFFF', // White background
              transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth hover effect
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Habit Consistency
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={habitConsistency} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#E0E0E0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}
                    interval={0}
                    tick={{ transform: 'translate(0, 5)' }}
                  />
                  <YAxis
                    style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}
                    tick={{ transform: 'translate(-5, 0)' }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: '#FFF', border: '1px solid #CCC' }}
                    itemStyle={{ color: '#333' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logged"
                    stroke="#8B5CF6"
                    strokeWidth={5}
                    dot={{ fill: '#8B5CF6', r: 8 }}
                    name="Logged"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#E5E7EB"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#E5E7EB', r: 6 }}
                    name="Total"
                  />
                  <Legend wrapperStyle={{ fontSize: '16px', fontWeight: 'bold', paddingTop: '10px' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Summary Cards Section - 2 columns, full width */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {analytics?.bestDay && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                borderRadius: '12px', // Larger rounded edges
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)', // Stronger shadow
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                  transform: 'translateY(-5px)',
                },
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
                borderRadius: '12px', // Larger rounded edges
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)', // Stronger shadow
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                  transform: 'translateY(-5px)',
                },
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
