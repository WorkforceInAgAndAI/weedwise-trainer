import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface InstructorProfile {
  id: string;
  display_name: string;
}

export type UserRole = 'instructor' | 'student' | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setInstructor(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Determine role when user changes
  useEffect(() => {
    if (!user) { setInstructor(null); setRole(null); return; }

    // Check if user is an instructor
    supabase
      .from('instructors')
      .select('id, display_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setInstructor(data as InstructorProfile);
          setRole('instructor');
        } else {
          setInstructor(null);
          setRole('student');
        }
      });
  }, [user]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInstructor(null);
    setRole(null);
  }, []);

  return { user, instructor, role, loading, logout, isAuthenticated: !!user };
}
