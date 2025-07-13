import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface ProfileFormData {
  username: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>();

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      // For now, just show success message
      // TODO: Implement actual profile update API
      setProfileSuccess('Profile updated successfully!');
    } catch {
      setProfileError('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      if (data.newPassword !== data.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      // For now, just show success message
      // TODO: Implement actual password update API
      setPasswordSuccess('Password updated successfully!');
      passwordForm.reset();
    } catch {
      setPasswordError('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
          Profile Settings
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'var(--text-secondary)', fontWeight: 400 }}
        >
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Information */}
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
                Profile Information
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mt: 1 }}
              >
                Update your personal information
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: 'var(--text-secondary)' }}
                    >
                      Username
                    </Typography>
                    <input
                      {...profileForm.register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters',
                        },
                      })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: profileForm.formState.errors.username
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                      }}
                      placeholder="Enter username"
                    />
                    {profileForm.formState.errors.username && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--accent-danger)', mt: 1 }}
                      >
                        {profileForm.formState.errors.username.message}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: 'var(--text-secondary)' }}
                    >
                      Email
                    </Typography>
                    <input
                      {...profileForm.register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: profileForm.formState.errors.email
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                      }}
                      placeholder="Enter email"
                    />
                    {profileForm.formState.errors.email && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--accent-danger)', mt: 1 }}
                      >
                        {profileForm.formState.errors.email.message}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {profileError && (
                  <Alert
                    severity="error"
                    sx={{ mt: 3, borderRadius: 'var(--radius-md)' }}
                  >
                    {profileError}
                  </Alert>
                )}
                {profileSuccess && (
                  <Alert
                    severity="success"
                    sx={{ mt: 3, borderRadius: 'var(--radius-md)' }}
                  >
                    {profileSuccess}
                  </Alert>
                )}
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isUpdatingProfile}
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
                    {isUpdatingProfile ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null}
                    Save Changes
                  </Button>
                </Box>
              </form>
            </Box>
          </Card>
        </Grid>

        {/* Change Password */}
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
                Change Password
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mt: 1 }}
              >
                Update your password for security
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: 'var(--text-secondary)' }}
                    >
                      Current Password
                    </Typography>
                    <input
                      type="password"
                      {...passwordForm.register('currentPassword', {
                        required: 'Current password is required',
                      })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: passwordForm.formState.errors.currentPassword
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                      }}
                      placeholder="Enter current password"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--accent-danger)', mt: 1 }}
                      >
                        {passwordForm.formState.errors.currentPassword.message}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: 'var(--text-secondary)' }}
                    >
                      New Password
                    </Typography>
                    <input
                      type="password"
                      {...passwordForm.register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: passwordForm.formState.errors.newPassword
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                      }}
                      placeholder="Enter new password"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--accent-danger)', mt: 1 }}
                      >
                        {passwordForm.formState.errors.newPassword.message}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: 'var(--text-secondary)' }}
                    >
                      Confirm New Password
                    </Typography>
                    <input
                      type="password"
                      {...passwordForm.register('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (value) =>
                          value === passwordForm.watch('newPassword') ||
                          'Passwords do not match',
                      })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: passwordForm.formState.errors.confirmPassword
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                      }}
                      placeholder="Confirm new password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--accent-danger)', mt: 1 }}
                      >
                        {passwordForm.formState.errors.confirmPassword.message}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {passwordError && (
                  <Alert
                    severity="error"
                    sx={{ mt: 3, borderRadius: 'var(--radius-md)' }}
                  >
                    {passwordError}
                  </Alert>
                )}
                {passwordSuccess && (
                  <Alert
                    severity="success"
                    sx={{ mt: 3, borderRadius: 'var(--radius-md)' }}
                  >
                    {passwordSuccess}
                  </Alert>
                )}
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isUpdatingPassword}
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
                    {isUpdatingPassword ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null}
                    Update Password
                  </Button>
                </Box>
              </form>
            </Box>
          </Card>
        </Grid>

        {/* Account Statistics */}
        <Grid item xs={12}>
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
                Account Statistics
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mt: 1 }}
              >
                Overview of your account activity
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: 'var(--accent-primary)' }}
                    >
                      0
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      Total Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: 'var(--accent-info)' }}
                    >
                      0
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      Active Habits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: 'var(--accent-success)' }}
                    >
                      0
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      Wellness Entries
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
