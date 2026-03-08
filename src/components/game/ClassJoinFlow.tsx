import { useState, type FormEvent, useEffect } from 'react';
import { useStudent } from '@/contexts/StudentContext';
import { supabase } from '@/integrations/supabase/client';
import { useInstructorAuth } from '@/hooks/useInstructorAuth';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export default function ClassJoinFlow({ onClose }: Props) {
  const { session, joinClass, leaveClass } = useStudent();
  const { instructor } = useInstructorAuth();
  const [mode, setMode] = useState<'choose' | 'join' | 'create'>(session ? 'choose' : 'choose');
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Auto-fill join code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code) {
      setJoinCode(code.toUpperCase());
      setMode('join');
    }
  }, []);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !nickname.trim()) return;
    setLoading(true);
    setError('');
    const result = await joinClass(joinCode, nickname);
    setLoading(false);
    if (result.success) {
      toast.success('Joined class successfully!');
      onClose();
    } else {
      setError(result.error || 'Failed to join');
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    if (!instructor) {
      setError('You must be logged in as an instructor to create a class. Use the Instructor Dashboard to sign in first.');
      return;
    }
    setLoading(true);
    setError('');

    const { data: code, error: codeErr } = await supabase.rpc('generate_join_code');
    if (codeErr || !code) {
      setError('Failed to generate join code');
      setLoading(false);
      return;
    }

    const { data: newClass, error: insertErr } = await supabase
      .from('classes')
      .insert({
        name: className.trim(),
        instructor_name: instructor.display_name,
        join_code: code,
        instructor_id: instructor.id,
      })
      .select()
      .single();

    setLoading(false);
    if (insertErr || !newClass) {
      setError('Failed to create class');
      return;
    }

    setCreatedCode(code);
    toast.success(`Class created! Join code: ${code}`);
  };

  const joinUrl = createdCode ? `${window.location.origin}?join=${createdCode}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full p-6 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-foreground">🏫 Class Groups</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        {/* Current session info */}
        {session && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-foreground">Currently in: <span className="text-primary font-bold">{session.className}</span></div>
            <div className="text-xs text-muted-foreground">Playing as: <span className="text-foreground">{session.nickname}</span></div>
            <button onClick={() => leaveClass()} className="text-xs text-destructive hover:underline">Leave class</button>
          </div>
        )}

        {/* Created class success with QR */}
        {createdCode && (
          <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 space-y-3 text-center">
            <div className="text-sm font-medium text-foreground">Class created! Share this with students:</div>
            <div className="font-mono text-3xl font-bold text-primary tracking-widest">{createdCode}</div>
            <div className="inline-block bg-white p-3 rounded-lg">
              <QRCodeSVG value={joinUrl} size={160} />
            </div>
            <p className="text-xs text-muted-foreground break-all">{joinUrl}</p>
            <button onClick={() => { setCreatedCode(null); setMode('choose'); setClassName(''); }}
              className="text-sm text-primary hover:underline">Create another class</button>
          </div>
        )}

        {!createdCode && mode === 'choose' && (
          <div className="space-y-3">
            <button onClick={() => setMode('join')}
              className="w-full bg-primary/10 border border-primary/30 rounded-lg p-4 text-left hover:border-primary transition-colors">
              <div className="font-display font-bold text-foreground">🎓 Join a Class</div>
              <div className="text-xs text-muted-foreground mt-1">Enter a join code from your instructor</div>
            </button>
            <button onClick={() => setMode('create')}
              className="w-full bg-secondary border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-colors">
              <div className="font-display font-bold text-foreground">📋 Create a Class</div>
              <div className="text-xs text-muted-foreground mt-1">For instructors — requires instructor login</div>
            </button>
          </div>
        )}

        {!createdCode && mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Join Code</label>
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123" maxLength={6} autoFocus
                className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-mono tracking-widest uppercase" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Your Nickname</label>
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                placeholder="Choose a nickname" maxLength={20}
                className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">Back</button>
              <button type="submit" disabled={loading || !joinCode.trim() || !nickname.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
                {loading ? 'Joining…' : 'Join Class'}
              </button>
            </div>
          </form>
        )}

        {!createdCode && mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            {!instructor && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                ⚠️ You must sign in as an instructor first. Open the Instructor Dashboard to create an account.
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Class Name</label>
              <input type="text" value={className} onChange={e => setClassName(e.target.value)}
                placeholder="e.g. Biology 101" autoFocus
                className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {instructor && (
              <div className="text-sm text-muted-foreground">
                Creating as: <span className="text-foreground font-medium">{instructor.display_name}</span>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">Back</button>
              <button type="submit" disabled={loading || !className.trim() || !instructor}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
                {loading ? 'Creating…' : 'Create Class'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
