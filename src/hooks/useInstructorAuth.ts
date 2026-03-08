import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface InstructorProfile {
  id: string;
  display_name: string;
}

export function useInstructorAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load instructor profile when user changes
  useEffect(() => {
    if (!user) { setInstructor(null); return; }
    supabase
      .from('instructors')
      .select('id, display_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setInstructor(data as InstructorProfile | null);
      });
  }, [user]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInstructor(null);
  }, []);

  return { user, instructor, loading, logout, isAuthenticated: !!user && !!instructor };
}
