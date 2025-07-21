# FocusWell - Personal Productivity Tracker

A comprehensive productivity tracking application built with React and TypeScript. FocusWell helps users manage tasks, build habits, and analyze their productivity patterns with beautiful visualizations and insights.

## Features

### 🎯 Core Functionality

- **Task Management**: Create, edit, delete, and track tasks with priorities, due dates, and repeat options
- **Habit Tracking**: Build and maintain daily/weekly habits with streak tracking
- **Analytics Dashboard**: Visualize productivity patterns with charts and insights
- **User Authentication**: Secure JWT-based authentication with auto-logout
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📊 Analytics & Insights

- Task completion rates and trends
- Habit consistency tracking
- Productivity streaks and best/worst days
- Visual charts using Recharts library
- Customizable date ranges for analysis

### 🎨 Design Features

- Modern gradient backgrounds and glassmorphism effects
- Smooth animations and micro-interactions
- Clean typography with proper hierarchy
- Intuitive navigation and user experience
- Dark/light theme support

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **React Router** for navigation
- **React Hook Form** for form management
- **Axios** for API communication
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Date-fns** for date manipulation
- **Lucide React** for icons

### Backend Integration

- JWT authentication with automatic token refresh
- RESTful API integration
- Local storage for auth persistence
- Automatic logout on token expiration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Java Spring Boot backend (see backend requirements)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd focuswell-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your backend URL:

   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Backend Requirements

This frontend requires a Spring Boot backend with the following endpoints:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/history` - Get task history with filters
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/complete` - Mark task complete
- `PUT /api/tasks/:id/incomplete` - Mark task incomplete

### Habits

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/log` - Log habit completion
- `GET /api/habits/:id/logs` - Get habit logs
- `GET /api/habits/:id/weekly-progress` - Get weekly progress

### Analytics

- `GET /api/analytics` - Get general analytics
- `GET /api/analytics/task-completion` - Get task completion data
- `GET /api/analytics/habit-consistency` - Get habit consistency data

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── habits/         # Habit-related components
│   └── tasks/          # Task-related components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Components

### Authentication

- **LoginForm**: User login with validation
- **RegisterForm**: User registration with password confirmation
- **ProtectedRoute**: Route protection wrapper
- **AuthContext**: Global authentication state management

### Task Management

- **TaskCard**: Individual task display with actions
- **TaskForm**: Create/edit task form with validation
- **Tasks Page**: Complete task management interface

### Habit Tracking

- **HabitCard**: Individual habit display with logging
- **HabitForm**: Create/edit habit form
- **Habits Page**: Complete habit management interface

### Analytics

- **Analytics Page**: Comprehensive analytics dashboard
- **Charts**: Various chart components using Recharts

## API Integration

The application uses Axios for API communication with:

- Automatic JWT token attachment
- Request/response interceptors
- Error handling and token refresh
- Toast notifications for user feedback

## Styling

The application uses Tailwind CSS with:

- Custom color palette for consistent theming
- Responsive design utilities
- Component-based styling approach
- Smooth animations and transitions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Component-based architecture

## Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Update environment variables** for production backend URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
