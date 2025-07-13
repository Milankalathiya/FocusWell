import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import type { Task, TaskRequest } from '../types';

const Tasks: React.FC = () => {
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  } = useTasks();
  const [tab, setTab] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState('dueDate');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (tab === 0) matchesTab = true;
    else if (tab === 1)
      matchesTab =
        !task.completed &&
        new Date(task.dueDate).toDateString() === new Date().toDateString();
    else if (tab === 2)
      matchesTab = !task.completed && new Date(task.dueDate) < new Date();
    else if (tab === 3) matchesTab = task.completed;

    return matchesSearch && matchesTab;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority': {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        );
      }
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const handleOpenDialog = (task?: Task) => {
    setEditingTask(task || null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTask(null);
  };

  const handleSubmit = async (data: TaskRequest) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        setSnackbar('Task updated successfully!');
      } else {
        await createTask(data);
        setSnackbar('Task created successfully!');
      }
      handleCloseDialog();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    await toggleTaskComplete(taskId);
    // Find the updated task in the tasks array
    const updatedTask = tasks.find((t) => t.id === taskId);
    setSnackbar(
      updatedTask && updatedTask.completed
        ? 'Task completed!'
        : 'Task marked incomplete'
    );
  };

  const handleDelete = async (taskId: number) => {
    await deleteTask(taskId);
    setSnackbar('Task deleted successfully!');
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    handleSortClose();
  };

  const getTabStats = () => {
    const allTasks = tasks.length;
    const todayTasks = tasks.filter(
      (task) =>
        !task.completed &&
        new Date(task.dueDate).toDateString() === new Date().toDateString()
    ).length;
    const overdueTasks = tasks.filter(
      (task) => !task.completed && new Date(task.dueDate) < new Date()
    ).length;
    const completedTasks = tasks.filter((task) => task.completed).length;

    return { allTasks, todayTasks, overdueTasks, completedTasks };
  };

  const stats = getTabStats();

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
          Task Management
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'var(--text-secondary)', fontWeight: 400 }}
        >
          Organize your tasks and boost your productivity
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
                  Total Tasks
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {stats.allTasks}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                All tasks in your workspace
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
                  Today's Tasks
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {stats.todayTasks}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Due today
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
                  Overdue Tasks
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {stats.overdueTasks}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Past due date
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
                  Completed Tasks
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 1, color: 'var(--text-primary)' }}
              >
                {stats.completedTasks}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Successfully finished
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Section */}
      <Card
        sx={{
          borderRadius: 'var(--radius-lg)',
          mb: 6,
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {/* Search Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                px: 2,
                py: 1,
                minWidth: 300,
                flex: 1,
                border: '1px solid var(--border-light)',
              }}
            >
              <SearchIcon
                sx={{ mr: 1, color: 'var(--text-secondary)', fontSize: 20 }}
              />
              <InputBase
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  fontSize: 'var(--font-size-sm)',
                  '& input': {
                    color: 'var(--text-primary)',
                  },
                  '& input::placeholder': {
                    color: 'var(--text-secondary)',
                    opacity: 0.7,
                  },
                }}
              />
            </Box>

            {/* Sort Button */}
            <IconButton
              onClick={handleSortClick}
              sx={{
                background: 'var(--bg-secondary)',
                '&:hover': {
                  background: 'var(--bg-hover)',
                },
              }}
            >
              <SortIcon />
            </IconButton>

            {/* Add Task Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'var(--accent-primary)',
                borderRadius: 'var(--radius-md)',
                px: 3,
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
              Add Task
            </Button>
          </Box>

          {/* Tabs */}
          <Box sx={{ mt: 3 }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-sm)',
                  minHeight: 48,
                  borderRadius: 'var(--radius-md)',
                  mx: 0.5,
                  color: 'var(--text-secondary)',
                },
                '& .Mui-selected': {
                  background: 'var(--bg-hover)',
                  color: 'var(--accent-primary) !important',
                },
              }}
            >
              <Tab label={`All (${stats.allTasks})`} />
              <Tab label={`Today (${stats.todayTasks})`} />
              <Tab label={`Overdue (${stats.overdueTasks})`} />
              <Tab label={`Completed (${stats.completedTasks})`} />
            </Tabs>
          </Box>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{ borderRadius: 'var(--radius-md)', mb: 3 }}
        >
          {error}
        </Alert>
      ) : sortedTasks.length === 0 ? (
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
            <Typography
              variant="h5"
              sx={{ mb: 2, color: 'var(--text-secondary)' }}
            >
              {searchTerm ? 'No tasks found' : 'No tasks yet'}
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, color: 'var(--text-secondary)' }}
            >
              {searchTerm
                ? `No tasks match "${searchTerm}"`
                : 'Create your first task to get started with productivity tracking'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
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
                Create Your First Task
              </Button>
            )}
          </Box>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sortedTasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
              <TaskCard
                task={task}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onToggleExpand={undefined}
                expanded={false}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
          },
        }}
      >
        <MenuItem onClick={() => handleSortChange('dueDate')}>
          Sort by Due Date
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('priority')}>
          Sort by Priority
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('title')}>
          Sort by Title
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('created')}>
          Sort by Created Date
        </MenuItem>
      </Menu>

      {/* Task Form Dialog */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TaskForm
            task={editingTask || undefined}
            onSubmit={handleSubmit}
            open={showDialog}
            onClose={handleCloseDialog}
            loading={submitting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
            sx={{
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary)',
            color: 'white',
          },
        }}
      />
    </Box>
  );
};

export default Tasks;
