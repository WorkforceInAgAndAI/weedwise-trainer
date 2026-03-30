import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
 onAuthenticated: () => void;
 onClose: () => void;
}

export default function InstructorAuth({ onAuthenticated, onClose }: Props) {
 const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [displayName, setDisplayName] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleLogin = async (e: FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 const { error: err } = await supabase.auth.signInWithPassword({ email, password });
 setLoading(false);
 if (err) {
 setError(err.message);
 return;
 }
 toast.success('Logged in successfully!');
 onAuthenticated();
 };

 const handleSignup = async (e: FormEvent) => {
 e.preventDefault();
 if (!displayName.trim()) { setError('Display name is required'); return; }
 setLoading(true);
 setError('');

 const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
 email,
 password,
 options: { emailRedirectTo: window.location.origin },
 });

 if (signUpErr) {
 setLoading(false);
 setError(signUpErr.message);
 return;
 }

 // Create instructor profile
 if (signUpData.user) {
 const { error: profileErr } = await supabase.from('instructors').insert({
 user_id: signUpData.user.id,
 display_name: displayName.trim(),
 });
 if (profileErr) {
 setLoading(false);
 setError('Account created but profile failed. Please try logging in.');
 return;
 }
 }

 setLoading(false);
 toast.success('Account created! Check your email to verify, then log in.');
 setMode('login');
 };

 const handleForgot = async (e: FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
 redirectTo: `${window.location.origin}/reset-password`,
 });
 setLoading(false);
 if (err) { setError(err.message); return; }
 toast.success('Password reset email sent!');
 setMode('login');
 };

 return (
 <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full p-6 space-y-5 animate-scale-in">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-display font-bold text-foreground">
 {mode === 'login' ? ' Instructor Login' : mode === 'signup' ? ' Create Account' : ' Reset Password'}
 </h2>
 <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg"></button>
 </div>

 {mode === 'login' && (
 <form onSubmit={handleLogin} className="space-y-4">
 <div>
 <label className="text-sm font-medium text-foreground block mb-1">Email</label>
 <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="instructor@school.edu" />
 </div>
 <div>
 <label className="text-sm font-medium text-foreground block mb-1">Password</label>
 <input type="password" value={password} onChange={e => setPassword(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="••••••••" />
 </div>
 {error && <p className="text-sm text-destructive">{error}</p>}
 <button type="submit" disabled={loading || !email || !password}
 className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
 {loading ? 'Logging in…' : 'Log In'}
 </button>
 <div className="flex justify-between text-sm">
 <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-primary hover:underline">Create account</button>
 <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-muted-foreground hover:underline">Forgot password?</button>
 </div>
 </form>
 )}

 {mode === 'signup' && (
 <form onSubmit={handleSignup} className="space-y-4">
 <div>
 <label className="text-sm font-medium text-foreground block mb-1">Display Name</label>
 <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} autoFocus
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="Prof. Smith" />
 </div>
 <div>
 <label className="text-sm font-medium text-foreground block mb-1">Email</label>
 <input type="email" value={email} onChange={e => setEmail(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="instructor@school.edu" />
 </div>
 <div>
 <label className="text-sm font-medium text-foreground block mb-1">Password</label>
 <input type="password" value={password} onChange={e => setPassword(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="Min 6 characters" />
 </div>
 {error && <p className="text-sm text-destructive">{error}</p>}
 <button type="submit" disabled={loading || !email || !password || !displayName.trim()}
 className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
 {loading ? 'Creating…' : 'Create Account'}
 </button>
 <button type="button" onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-muted-foreground hover:underline">
 Already have an account? Log in
 </button>
 </form>
 )}

 {mode === 'forgot' && (
 <form onSubmit={handleForgot} className="space-y-4">
 <div>
 <label className="text-sm font-medium text-foreground block mb-1">Email</label>
 <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="instructor@school.edu" />
 </div>
 {error && <p className="text-sm text-destructive">{error}</p>}
 <button type="submit" disabled={loading || !email}
 className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
 {loading ? 'Sending…' : 'Send Reset Link'}
 </button>
 <button type="button" onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-muted-foreground hover:underline">
 Back to login
 </button>
 </form>
 )}
 </div>
 </div>
 );
}
