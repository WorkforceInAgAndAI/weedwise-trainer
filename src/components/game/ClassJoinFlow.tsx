import { useState, type FormEvent, useEffect } from 'react';
import { useStudent } from '@/contexts/StudentContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { X, Users, Plus } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ClassJoinFlow({ onClose }: Props) {
  const { session, joinClass, leaveClass } = useStudent();
  const [mode, setMode] = useState<'choose' | 'join' | 'create'>(session ? 'choose' : 'choose');
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [className, setClassName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code) { setJoinCode(code.toUpperCase()); setMode('join'); }
  }, []);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !nickname.trim()) return;
    setLoading(true); setError('');
    const result = await joinClass(joinCode, nickname);
    setLoading(false);
    if (result.success) { toast.success('Joined class successfully!'); onClose(); }
    else { setError(result.error || 'Failed to join'); }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !instructorName.trim()) return;
    setLoading(true); setError('');
    const { data: code, error: codeErr } = await supabase.rpc('generate_join_code');
    if (codeErr || !code) { setError('Failed to generate join code'); setLoading(false); return; }
    const { error: insertErr } = await supabase.from('classes').insert({
      name: className.trim(),
      instructor_name: instructorName.trim(),
      join_code: code,
    }).select().single();
    setLoading(false);
    if (insertErr) { setError('Failed to create class'); return; }
    setCreatedCode(code);
    toast.success(`Class created! Join code: ${code}`);
  };

  const joinUrl = createdCode ? `${window.location.origin}${window.location.pathname}?join=${createdCode}` : '';
  const inputClass = "w-full px-4 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-card border border-border rounded-lg shadow-card-hover max-w-md w-full p-6 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">Instructor / Class</h2>
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

        {createdCode && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-4 space-y-3 text-center">
            <div className="text-sm font-medium text-foreground">Class created! Share this with students:</div>
            <div className="font-mono text-3xl font-bold text-primary tracking-widest">{createdCode}</div>
            <div className="inline-block bg-white p-3 rounded-md">
              <QRCodeSVG value={joinUrl} size={160} />
            </div>
            <p className="text-xs text-muted-foreground break-all">{joinUrl}</p>
            <p className="text-xs text-muted-foreground mt-1">Students scan the QR code or visit the link to join instantly.</p>
            <button onClick={() => { setCreatedCode(null); setMode('choose'); setClassName(''); setInstructorName(''); }}
              className="text-sm text-primary hover:underline">Create another class</button>
          </div>
        )}

        {!createdCode && mode === 'choose' && (
          <div className="space-y-3">
            <button onClick={() => setMode('join')}
              className="w-full bg-card border border-border rounded-md p-4 text-left shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-semibold text-foreground text-sm">Join a Class</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Enter a join code from your instructor</div>
                </div>
              </div>
            </button>
            <button onClick={() => setMode('create')}
              className="w-full bg-card border border-border rounded-md p-4 text-left shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-semibold text-foreground text-sm">Create a Class (Instructor)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Quick setup — no account needed. Data lasts for this session only.</div>
                </div>
              </div>
            </button>
          </div>
        )}

        {!createdCode && mode === 'join' && (
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
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary transition-colors">Back</button>
              <button type="submit" disabled={loading || !joinCode.trim() || !nickname.trim()}
                className="flex-1 px-4 py-3 rounded-md bg-success text-success-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity text-sm">
                {loading ? 'Joining…' : 'Join Class'}
              </button>
            </div>
          </form>
        )}

        {!createdCode && mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="text-xs text-muted-foreground">No account needed. Create a class for this session. When you close the tab, student data from this session won't persist.</p>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Your Name</label>
              <input type="text" value={instructorName} onChange={e => setInstructorName(e.target.value)} placeholder="e.g. Ms. Johnson" autoFocus className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Class Name</label>
              <input type="text" value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. Biology 101" className={inputClass} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary transition-colors">Back</button>
              <button type="submit" disabled={loading || !className.trim() || !instructorName.trim()}
                className="flex-1 px-4 py-3 rounded-md bg-success text-success-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity text-sm">
                {loading ? 'Creating…' : 'Create Class'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
