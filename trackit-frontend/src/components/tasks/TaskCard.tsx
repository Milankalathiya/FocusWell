import {
  Category,
  CheckCircle,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  PriorityHigh,
  Schedule,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  expanded = false,
  onToggleExpand,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <PriorityHigh fontSize="small" />;
      default:
        return null;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Card
      sx={{
        mb: 2,
        border: isOverdue ? '2px solid #f44336' : '1px solid #e0e0e0',
        backgroundColor: task.completed ? '#f5f5f5' : 'white',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Checkbox
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            icon={<CheckCircle />}
            checkedIcon={<CheckCircle color="success" />}
            sx={{ mt: 0 }}
          />

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'text.secondary' : 'text.primary',
                  flexGrow: 1,
                }}
              >
                {task.title}
              </Typography>

              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority)}
                size="small"
                icon={getPriorityIcon(task.priority)}
              />

              {task.category && (
                <Chip
                  label={task.category}
                  variant="outlined"
                  size="small"
                  icon={<Category fontSize="small" />}
                />
              )}
            </Box>

            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  mb: 1,
                }}
              >
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>

              {task.repeatType !== 'NONE' && (
                <Chip label={task.repeatType} size="small" variant="outlined" />
              )}
            </Box>

            <Collapse in={expanded}>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  {task.estimatedHours && (
                    <Typography variant="body2" color="text.secondary">
                      Estimated: {task.estimatedHours}h
                    </Typography>
                  )}
                  {task.actualHours && (
                    <Typography variant="body2" color="text.secondary">
                      Actual: {task.actualHours}h
                    </Typography>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Collapse>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {onToggleExpand && (
              <IconButton size="small" onClick={onToggleExpand}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}

            <Tooltip title="Edit Task">
              {task.completed ? (
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(task)}
                    disabled={task.completed}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </span>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => onEdit(task)}
                  disabled={task.completed}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
            </Tooltip>

            <Tooltip title="Delete Task">
              <IconButton
                size="small"
                onClick={() => onDelete(task.id)}
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

export default TaskCard;
