import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [ready, setReady] = useState(false);
 const navigate = useNavigate();

 useEffect(() => {
 // Check for recovery token in URL hash
 const hash = window.location.hash;
 if (hash.includes('type=recovery')) {
 setReady(true);
 }
 }, []);

 const handleReset = async (e: React.FormEvent) => {
 e.preventDefault();
 if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
 setLoading(true);
 const { error } = await supabase.auth.updateUser({ password });
 setLoading(false);
 if (error) { toast.error(error.message); return; }
 toast.success('Password updated! Redirecting…');
 setTimeout(() => navigate('/'), 1500);
 };

 if (!ready) {
 return (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="text-center space-y-4">
 <p className="text-muted-foreground">Invalid or expired reset link.</p>
 <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Go Home</button>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-5">
 <h1 className="text-xl font-display font-bold text-foreground"> Set New Password</h1>
 <form onSubmit={handleReset} className="space-y-4">
 <input type="password" value={password} onChange={e => setPassword(e.target.value)}
 placeholder="New password (min 6 chars)" autoFocus
 className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
 <button type="submit" disabled={loading || password.length < 6}
 className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
 {loading ? 'Updating…' : 'Update Password'}
 </button>
 </form>
 </div>
 </div>
 );
}
