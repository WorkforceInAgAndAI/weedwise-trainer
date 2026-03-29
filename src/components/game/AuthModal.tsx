import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X } from 'lucide-react';

type AuthMode = 'login' | 'signup-instructor' | 'signup-student' | 'forgot';

interface Props {
  onClose: () => void;
  onAuthenticated: (role: 'instructor' | 'student') => void;
  defaultMode?: 'login' | 'signup-instructor' | 'signup-student';
}

export default function AuthModal({ onClose, onAuthenticated, defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setLoading(false); setError(err.message); return; }
    if (data.user) {
      const { data: instrData } = await supabase.from('instructors').select('id').eq('user_id', data.user.id).maybeSingle();
      setLoading(false);
      toast.success('Logged in!');
      onAuthenticated(instrData ? 'instructor' : 'student');
    }
  };

  const handleSignupInstructor = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { setError('Display name is required'); return; }
    setLoading(true);
    setError('');
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (signUpErr) { setLoading(false); setError(signUpErr.message); return; }
    if (signUpData.user && signUpData.session) {
      const { error: profileErr } = await supabase.from('instructors').insert({ user_id: signUpData.user.id, display_name: displayName.trim() });
      if (profileErr) { setLoading(false); setError('Account created but profile failed: ' + profileErr.message); return; }
      setLoading(false);
      toast.success('Instructor account created!');
      onAuthenticated('instructor');
    } else {
      setLoading(false);
      toast.success('Account created! Check your email to verify, then log in.');
      setMode('login');
    }
  };

  const handleSignupStudent = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (signUpErr) { setLoading(false); setError(signUpErr.message); return; }
    if (signUpData.session) {
      setLoading(false);
      toast.success('Student account created!');
      onAuthenticated('student');
    } else {
      setLoading(false);
      toast.success('Account created! Check your email to verify, then log in.');
      setMode('login');
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (err) { setError(err.message); return; }
    toast.success('Password reset email sent!');
    setMode('login');
  };

  const modeTitle: Record<AuthMode, string> = {
    'login': 'Log In',
    'signup-instructor': 'Instructor Sign Up',
    'signup-student': 'Student Sign Up',
    'forgot': 'Reset Password',
  };

  const inputClass = "w-full px-4 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";
  const btnPrimary = "w-full px-4 py-3 rounded-md bg-success text-success-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-card-hover max-w-md w-full p-6 space-y-5 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">{modeTitle[mode]}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus className={inputClass} placeholder="you@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading || !email || !password} className={btnPrimary}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-muted-foreground hover:text-foreground transition-colors">Forgot password?</button>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">Don't have an account?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setMode('signup-instructor'); setError(''); }}
                  className="flex-1 px-3 py-2 rounded-md border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
                  Instructor
                </button>
                <button type="button" onClick={() => { setMode('signup-student'); setError(''); }}
                  className="flex-1 px-3 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors">
                  Student
                </button>
              </div>
            </div>
          </form>
        )}

        {mode === 'signup-instructor' && (
          <form onSubmit={handleSignupInstructor} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Display Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} autoFocus className={inputClass} placeholder="Prof. Smith" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="instructor@school.edu" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="Min 6 characters" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading || !email || !password || !displayName.trim()} className={btnPrimary}>
              {loading ? 'Creating…' : 'Create Instructor Account'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Already have an account? Log in
            </button>
          </form>
        )}

        {mode === 'signup-student' && (
          <form onSubmit={handleSignupStudent} className="space-y-4">
            <p className="text-sm text-muted-foreground">Create an account to save your progress across devices. You can still play without an account.</p>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus className={inputClass} placeholder="student@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="Min 6 characters" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading || !email || !password} className={btnPrimary}>
              {loading ? 'Creating…' : 'Create Student Account'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Already have an account? Log in
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus className={inputClass} placeholder="you@email.com" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading || !email} className={btnPrimary}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
