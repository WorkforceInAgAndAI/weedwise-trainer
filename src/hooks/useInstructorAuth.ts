// Re-export from useAuth for backward compatibility
import { useAuth } from './useAuth';

export function useInstructorAuth() {
  const { user, instructor, loading, logout, role } = useAuth();
  return {
    user,
    instructor,
    loading,
    logout,
    isAuthenticated: !!user && role === 'instructor',
  };
}
