import {
  AccountCircle,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Loop as HabitsIcon,
  Logout,
  Menu as MenuIcon,
  Person as ProfileIcon,
  Settings,
  Assignment as TasksIcon,
  Favorite as WellnessIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { state, logout } = useAuth();
  const user = state.user;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: ROUTES.DASHBOARD,
    },
    {
      text: 'Tasks',
      icon: <TasksIcon />,
      path: ROUTES.TASKS,
    },
    {
      text: 'Habits',
      icon: <HabitsIcon />,
      path: ROUTES.HABITS,
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: ROUTES.ANALYTICS,
    },
    {
      text: 'Wellness',
      icon: <WellnessIcon />,
      path: ROUTES.WELLNESS,
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
    handleMenuClose();
  };

  const handleSettings = () => {
    // For now, just close the menu
    // TODO: Implement settings page or modal
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
          TrackIt
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
              'TrackIt'}
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
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile} sx={{ py: 2 }}>
          <ListItemIcon>
            <ProfileIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={handleSettings} sx={{ py: 2 }}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 2, color: 'var(--accent-danger)' }}
        >
          <ListItemIcon>
            <Logout sx={{ color: 'var(--accent-danger)' }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
