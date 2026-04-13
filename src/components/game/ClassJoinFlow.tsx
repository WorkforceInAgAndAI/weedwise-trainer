import { useState, type FormEvent, useEffect } from 'react';
import { useStudent } from '@/contexts/StudentContext';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ClassJoinFlow({ onClose }: Props) {
  const { session, joinClass, leaveClass } = useStudent();
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code) setJoinCode(code.toUpperCase());
  }, []);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !nickname.trim()) return;
    setLoading(true); setError('');
    const result = await joinClass(joinCode, nickname);
    setLoading(false);
    if (result.success) {
      toast.success(
        result.rejoined
          ? 'Welcome back — rejoined your class.'
          : 'Joined class successfully!'
      );
      onClose();
    } else {
      // Inline error only — modal stays open; avoids duplicating the same text as a toast
      setError(result.error || 'Failed to join');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-card border border-border rounded-lg shadow-card-hover max-w-md w-full p-6 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">Join a Class</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {session && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3 space-y-2">
            <div className="text-sm font-medium text-foreground">Currently in: <span className="text-primary font-bold">{session.className}</span></div>
            <div className="text-xs text-muted-foreground">Playing as: <span className="text-foreground">{session.nickname}</span></div>
            <button onClick={() => leaveClass()} className="text-xs text-destructive hover:underline">Leave class</button>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Join Code</label>
            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123" maxLength={6} autoFocus
              className="w-full px-4 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-center text-2xl font-mono tracking-widest uppercase" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Your Nickname</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Choose a nickname" maxLength={20} className={inputClass} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading || !joinCode.trim() || !nickname.trim()}
            className="w-full px-4 py-3 rounded-md bg-success text-success-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity text-sm">
            {loading ? 'Joining…' : 'Join Class'}
          </button>
        </form>
      </div>
    </div>
  );
}
