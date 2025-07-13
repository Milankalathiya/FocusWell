import TaskIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WellnessIcon from '@mui/icons-material/HealthAndSafety';
import HabitIcon from '@mui/icons-material/Loop';
import PendingIcon from '@mui/icons-material/Schedule';
import { default as TrendingUpIcon } from '@mui/icons-material/TrendingUp';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import WellnessForm from '../components/wellness/WellnessForm';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';
import { taskService } from '../services/taskService';
import { wellnessService } from '../services/wellnessService';
import { WellnessStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentHabits, setRecentHabits] = useState<any[]>([]);
  const [wellnessStats, setWellnessStats] = useState<WellnessStats | null>(
    null
  );
  const [recentWellnessData, setRecentWellnessData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wellnessFormOpen, setWellnessFormOpen] = useState(false);
  const { state } = useAuth();
  const user = state.user;

  const [weeklyActivityData, setWeeklyActivityData] = useState<
    { name: string; tasks: number; habits: number }[]
  >([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const taskAnalytics = await taskService.getTaskAnalytics();
      const todayTasks = await taskService.getTodayTasks();
      const overdueTasks = await taskService.getOverdueTasks();
      const habits = await habitService.getAllHabits();
      const wellnessStatsData = await wellnessService.getWellnessStats();
      const recentWellness = await wellnessService.getRecentWellnessData(7);

      setStats({
        totalTasks: taskAnalytics.totalTasks || 0,
        completedTasks: taskAnalytics.completedTasks || 0,
        pendingTasks: todayTasks.length,
        overdueTasks: overdueTasks.length,
        totalHabits: habits.length,
        completedHabits: habits.filter((h: any) => h.currentStreak > 0).length,
        completionRate: taskAnalytics.completionRate || 0,
      });

      setWellnessStats(wellnessStatsData);
      setRecentTasks(todayTasks.slice(0, 5));
      setRecentHabits(habits.slice(0, 5));
      setRecentWellnessData(recentWellness.slice(0, 5));
      setWeeklyActivityData([]);
    } catch (err: any) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = [
    {
      name: 'Completed',
      value: stats.completedTasks,
      color: 'var(--accent-success)',
    },
    {
      name: 'Pending',
      value: stats.pendingTasks,
      color: 'var(--accent-warning)',
    },
    {
      name: 'Overdue',
      value: stats.overdueTasks,
      color: 'var(--accent-danger)',
    },
  ];

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

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    progress,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    progress?: number;
  }) => (
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
              background: `${color}15`,
              color: color,
              mr: 2,
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
        <Typography
          variant="body2"
          sx={{ color: 'var(--text-secondary)', mb: 2 }}
        >
          {subtitle}
        </Typography>
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'var(--bg-secondary)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: 1,
          }}
        >
          Welcome back, {user?.username}! 👋
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'var(--text-secondary)', fontWeight: 400 }}
        >
          Here's your productivity overview for{' '}
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            subtitle={`${stats.completedTasks} completed`}
            icon={<TaskIcon sx={{ fontSize: 24 }} />}
            color="var(--accent-primary)"
            progress={
              stats.totalTasks > 0
                ? (stats.completedTasks / stats.totalTasks) * 100
                : 0
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Habits"
            value={stats.totalHabits}
            subtitle={`${stats.completedHabits} active streaks`}
            icon={<HabitIcon sx={{ fontSize: 24 }} />}
            color="var(--accent-info)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={
              stats.totalTasks > 0
                ? `${Math.round(
                    (stats.completedTasks / stats.totalTasks) * 100
                  )}%`
                : '0%'
            }
            subtitle="of tasks completed"
            icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
            color="var(--accent-success)"
            progress={
              stats.totalTasks > 0
                ? (stats.completedTasks / stats.totalTasks) * 100
                : 0
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Wellness Score"
            value={wellnessStats?.currentWellnessScore?.toFixed(1) || 'N/A'}
            subtitle={`${wellnessStats?.streakDays || 0} day streak`}
            icon={<WellnessIcon sx={{ fontSize: 24 }} />}
            color="var(--accent-warning)"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
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
                Task Status Overview
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mt: 1 }}
              >
                Distribution of your tasks by status
              </Typography>
            </Box>
            <Box sx={{ p: 3, height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
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
                Weekly Activity
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mt: 1 }}
              >
                Your productivity trends this week
              </Typography>
            </Box>
            <Box
              sx={{
                p: 3,
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <TrendingUpIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Coming Soon
                </Typography>
                <Typography variant="body2">
                  Weekly activity charts will be available soon
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Recent Tasks
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/tasks')}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  '&:hover': {
                    background: 'var(--bg-hover)',
                  },
                }}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ p: 3 }}>
              {recentTasks.length > 0 ? (
                recentTasks.map((task, index) => (
                  <Box
                    key={task.id}
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
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: task.completed
                          ? 'var(--accent-success)'
                          : 'var(--accent-warning)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      {task.completed ? (
                        <CheckCircleIcon
                          sx={{ color: 'white', fontSize: 20 }}
                        />
                      ) : (
                        <PendingIcon sx={{ color: 'white', fontSize: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {task.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        {task.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        background:
                          task.priority === 'HIGH'
                            ? 'var(--accent-danger)'
                            : task.priority === 'MEDIUM'
                            ? 'var(--accent-warning)'
                            : 'var(--accent-success)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <TaskIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No tasks yet
                  </Typography>
                  <Typography variant="body2">
                    Create your first task to get started
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Active Habits
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/habits')}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  '&:hover': {
                    background: 'var(--bg-hover)',
                  },
                }}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ p: 3 }}>
              {recentHabits.length > 0 ? (
                recentHabits.map((habit, index) => (
                  <Box
                    key={habit.id}
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
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-info)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <HabitIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {habit.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        {habit.description}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: 'var(--accent-info)' }}
                      >
                        {habit.currentStreak}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        day streak
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <HabitIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No habits yet
                  </Typography>
                  <Typography variant="body2">
                    Start building healthy habits today
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Wellness Form Modal */}
      <WellnessForm
        open={wellnessFormOpen}
        onClose={() => setWellnessFormOpen(false)}
        onSubmit={loadDashboardData}
      />
    </Box>
  );
};

export default Dashboard;
