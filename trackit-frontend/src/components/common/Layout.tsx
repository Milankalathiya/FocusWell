import React from 'react';
import {
  FaChartPie,
  FaClock,
  FaPlus,
  FaTasks,
  FaThLarge,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', icon: <FaChartPie />, text: 'Dashboard' },
  { path: '/projects', icon: <FaThLarge />, text: 'Projects' },
  { path: '/tasks', icon: <FaTasks />, text: 'Tasks' },
  { path: '/timelog', icon: <FaClock />, text: 'Time log' },
  { path: '/resources', icon: <FaUsers />, text: 'Resource mgnt' },
  { path: '/users', icon: <FaUser />, text: 'Users' },
  { path: '/templates', icon: <FaThLarge />, text: 'Project template' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-bg-main font-sans">
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
      <aside className="glass flex flex-col justify-between w-64 p-6 m-4 rounded-2xl bg-sidebar-dark text-white shadow-glass">
        <div>
          <div className="flex items-center mb-10">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-xl font-bold mr-3 shadow-lg">
              F
            </div>
            <span className="text-2xl font-bold tracking-wide">FocusWell</span>
          </div>
          <Link to="/projects">
            <button className="w-full flex items-center gap-2 bg-primary text-white font-semibold py-3 px-4 rounded-xl mb-8 shadow-lg hover:bg-opacity-90 transition">
              <FaPlus /> Create new project
            </button>
          </Link>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-lg ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-primary'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                {item.icon} {item.text}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 mt-10 p-3 rounded-xl bg-white/10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            A
          </div>
          <div>
            <div className="font-semibold">Alex meian</div>
            <div className="text-xs text-text-muted">Product manager</div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
