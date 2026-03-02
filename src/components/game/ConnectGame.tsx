import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';

const PAIR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-cyan-500'];

interface Props {
  mode: 'family' | 'scientific';
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function ConnectGame({ mode, onComplete, onNext }: Props) {
  const { leftItems, rightItems, correctMap } = useMemo(() => {
    const picked = [...weeds].sort(() => Math.random() - 0.5).slice(0, 6);
    const left = picked.map(w => ({ id: w.id, label: w.commonName }));
    const rightSet = mode === 'family'
      ? [...new Set(picked.map(w => w.family))].map(f => ({ id: f, label: f }))
      : picked.map(w => ({ id: w.id + '_sci', label: w.scientificName }));
    const right = [...rightSet].sort(() => Math.random() - 0.5);
    const map: Record<string, string> = {};
    picked.forEach(w => {
      map[w.id] = mode === 'family' ? w.family : w.id + '_sci';
    });
    return { leftItems: left, rightItems: right, correctMap: map };
  }, [mode]);

  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const getConnectionIndex = (leftId: string) => {
    const entries = Object.entries(connections);
    const idx = entries.findIndex(([k]) => k === leftId);
    return idx >= 0 ? idx : -1;
  };

  const getRightConnectionIndex = (rightId: string) => {
    const entries = Object.entries(connections);
    const idx = entries.findIndex(([, v]) => v === rightId);
    return idx >= 0 ? idx : -1;
  };

  const handleLeftClick = (id: string) => {
    if (checked) return;
    setSelectedLeft(selectedLeft === id ? null : id);
  };

  const handleRightClick = (id: string) => {
    if (checked || !selectedLeft) return;
    const newConn = { ...connections };
    // In family mode, allow many-to-one (multiple weeds → same family)
    // In scientific mode, one-to-one only
    if (mode === 'scientific') {
      Object.keys(newConn).forEach(k => { if (newConn[k] === id) delete newConn[k]; });
    }
    newConn[selectedLeft] = id;
    setConnections(newConn);
    setSelectedLeft(null);
  };

  const handleCheck = () => {
    setChecked(true);
    onComplete(leftItems.map(item => ({
      weedId: item.id,
      correct: connections[item.id] === correctMap[item.id],
    })));
  };

  const allConnected = Object.keys(connections).length === leftItems.length;
  const correctCount = checked ? leftItems.filter(i => connections[i.id] === correctMap[i.id]).length : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">
          {mode === 'family' ? '🔗 Plant Family Connect' : '🔬 Scientific Name Match'}
        </h2>
        <p className="text-sm text-muted-foreground">Tap a name on the left, then tap its match on the right to connect them.</p>
      </div>

      <div className="flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-2">
          {leftItems.map(item => {
            const connIdx = getConnectionIndex(item.id);
            const isConnected = connIdx >= 0;
            return (
              <button key={item.id} onClick={() => handleLeftClick(item.id)}
                className={`w-full p-3 rounded-lg border-2 text-left text-sm font-semibold transition-all ${
                  checked
                    ? (connections[item.id] === correctMap[item.id] ? 'border-accent bg-accent/10' : 'border-destructive bg-destructive/10')
                    : selectedLeft === item.id ? 'border-primary bg-primary/10'
                    : isConnected ? 'border-foreground/30 bg-secondary' : 'border-border hover:border-primary/50'
                }`}>
                <div className="flex items-center gap-2">
                  {isConnected && <span className={`w-4 h-4 rounded-full ${PAIR_COLORS[connIdx % PAIR_COLORS.length]} shrink-0`} />}
                  <span className="text-foreground">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-2">
          {rightItems.map(item => {
            const connIdx = getRightConnectionIndex(item.id);
            const isConnected = connIdx >= 0;
            return (
              <button key={item.id} onClick={() => handleRightClick(item.id)}
                disabled={checked || !selectedLeft}
                className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${
                  checked ? 'border-border opacity-70'
                  : isConnected ? 'border-foreground/30 bg-secondary' : selectedLeft ? 'border-border hover:border-primary/50 cursor-pointer' : 'border-border cursor-default'
                }`}>
                <div className="flex items-center gap-2">
                  {isConnected && <span className={`w-4 h-4 rounded-full ${PAIR_COLORS[connIdx % PAIR_COLORS.length]} shrink-0`} />}
                  <span className={`text-foreground ${mode === 'scientific' ? 'italic' : ''}`}>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!checked && allConnected && (
        <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          ✅ Check Connections
        </button>
      )}

      {checked && (
        <div className="rounded-lg p-4 space-y-2 animate-scale-in border border-border bg-muted/30">
          <div className="text-lg font-bold text-foreground">{correctCount}/{leftItems.length} Correct!</div>
          {leftItems.filter(i => connections[i.id] !== correctMap[i.id]).map(i => {
            const correctRight = rightItems.find(r => r.id === correctMap[i.id]);
            return <p key={i.id} className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{i.label}</span> → <span className="italic text-primary">{correctRight?.label}</span></p>;
          })}
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT →</button>
        </div>
      )}
    </div>
  );
}
