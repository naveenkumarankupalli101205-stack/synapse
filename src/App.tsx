import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetail from './pages/CourseDetail';
import AssignmentPage from './pages/AssignmentPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace /> : <Register />} />

      {/* Protected routes */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignment/:assignmentId"
        element={
          <ProtectedRoute>
            <AssignmentPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy routes - redirect to new routes */}
      <Route path="/teacher" element={<Navigate to="/teacher-dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;