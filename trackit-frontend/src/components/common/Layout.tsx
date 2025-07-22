import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TaskIcon from '@mui/icons-material/Task';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext'; 

// Example routes (replace with your actual routes/constants)
const ROUTES = {
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  HABITS: '/habits',
  ANALYTICS: '/analytics',
  WELLNESS: '/wellness',
  PROFILE: '/profile',
};

const drawerWidth = 260;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: ROUTES.DASHBOARD,
  },
  {
    text: 'Tasks',
    icon: <TaskIcon />,
    path: ROUTES.TASKS,
  },
  {
    text: 'Habits',
    icon: <FavoriteIcon />,
    path: ROUTES.HABITS,
  },
  {
    text: 'Analytics',
    icon: <BarChartIcon />,
    path: ROUTES.ANALYTICS,
  },
  {
    text: 'Wellness',
    icon: <AssignmentIcon />,
    path: ROUTES.WELLNESS,
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Example user (replace with your auth logic)
  const { state } = useAuth();
  const user = state.user;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    // TODO: Add your logout logic
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
    handleMenuClose();
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-light)',
      }}
    >
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          FocusWell
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 3, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  color: isActive
                    ? 'var(--accent-primary)'
                    : 'var(--text-secondary)',
                  transition: 'all var(--transition-normal)',
                  '&:hover': {
                    background: 'var(--bg-hover)',
                    color: 'var(--accent-primary)',
                  },
                  '&.Mui-selected': {
                    background: 'var(--bg-hover)',
                    color: 'var(--accent-primary)',
                    '&:hover': {
                      background: 'var(--bg-hover)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  {React.cloneElement(item.icon, {
                    sx: {
                      fontSize: 20,
                    },
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 'var(--font-size-sm)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile Section */}
      <Box sx={{ p: 3, borderTop: '1px solid var(--border-light)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            '&:hover': {
              background: 'var(--bg-hover)',
              borderColor: 'var(--accent-primary)',
            },
          }}
          onClick={handleMenuOpen}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              background: 'var(--accent-primary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {user?.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-secondary)' }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-sm)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
              background: 'var(--bg-secondary)',
              '&:hover': {
                background: 'var(--bg-hover)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              'FocusWell'}
          </Typography>

          {/* Mobile User Menu */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                background: 'var(--bg-secondary)',
                '&:hover': {
                  background: 'var(--bg-hover)',
                },
              }}
            >
              <AccountCircle />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'var(--bg-sidebar)',
            color: 'var(--text-primary)',
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
