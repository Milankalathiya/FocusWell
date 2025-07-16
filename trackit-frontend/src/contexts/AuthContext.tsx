import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import toast from 'react-hot-toast';
import { setLogoutFunction } from '../services/api';
import { authService } from '../services/authService';
import type { AuthState, LoginResponse, User } from '../types';
import { clearAuthData, setAuthData } from '../utils/auth';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Register the logout function for global API error handling
    setLogoutFunction(logout);
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token,
          },
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearAuthData();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response: LoginResponse = await authService.login({
        username,
        password,
      });

      // Store token first before making profile request
      localStorage.setItem(TOKEN_KEY, response.token);

      // Get full user profile
      const userProfile = await authService.getProfile();

      setAuthData(response.token, userProfile);
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userProfile,
          token: response.token,
        },
      });

      toast.success('Login successful!');
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        const message = apiError.response?.data?.message || 'Login failed';
        toast.error(message);
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.register({
        username,
        email,
        password,
        firstName,
        lastName,
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success('Registration successful! Please login.');
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          apiError.response?.data?.message || 'Registration failed';
        toast.error(message);
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
