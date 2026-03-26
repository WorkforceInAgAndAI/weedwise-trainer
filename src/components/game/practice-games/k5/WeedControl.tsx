import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const METHODS = [
  { id: 'pull', label: 'Pull by hand', icon: '✋' },
  { id: 'spray', label: 'Spray herbicide', icon: '🧴' },
  { id: 'mow', label: 'Mow it down', icon: '🚜' },
  { id: 'leave', label: 'Leave it alone', icon: '🚫' },
];

function bestMethod(w: typeof weeds[0]): string {
  const m = w.management.toLowerCase();
  if (m.includes('hand') || m.includes('pull')) return 'pull';
  if (m.includes('mow') || m.includes('mechanical') || m.includes('tillage')) return 'mow';
  if (m.includes('herbicide') || m.includes('pre') || m.includes('post')) return 'spray';
  return 'pull';
}

interface FieldWeed { weed: typeof weeds[0]; x: number; y: number; identified: boolean; managed: boolean; correct: boolean; }

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const fieldWeeds = useMemo<FieldWeed[]>(() =>
    shuffle(weeds).slice(0, 8).map(w => ({
      weed: w, x: 10 + Math.random() * 75, y: 15 + Math.random() * 65,
      identified: false, managed: false, correct: false,
    })), []);

  const [weedState, setWeedState] = useState(fieldWeeds);
  const [timer, setTimer] = useState(60);
  const [activeWeed, setActiveWeed] = useState<number | null>(null);
  const [phase, setPhase] = useState<'identify' | 'manage'>('identify');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (timer <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, done]);

  const clickWeed = (idx: number) => {
    if (done || weedState[idx].managed) return;
    setActiveWeed(idx);
    setPhase(weedState[idx].identified ? 'manage' : 'identify');
  };

  const identifyWeed = (name: string) => {
    if (activeWeed === null) return;
    const correct = name === weedState[activeWeed].weed.commonName;
    if (correct) {
      setWeedState(prev => prev.map((w, i) => i === activeWeed ? { ...w, identified: true } : w));
      setPhase('manage');
    }
  };

  const manageWeed = (methodId: string) => {
    if (activeWeed === null) return;
    const w = weedState[activeWeed];
    const correct = methodId === bestMethod(w.weed);
    setWeedState(prev => prev.map((fw, i) => i === activeWeed ? { ...fw, managed: true, correct } : fw));
    setActiveWeed(null);
    if (weedState.filter(w => w.managed).length + 1 >= weedState.length) setDone(true);
  };

  const score = weedState.filter(w => w.managed && w.correct).length;
  const managed = weedState.filter(w => w.managed).length;
  const active = activeWeed !== null ? weedState[activeWeed] : null;

  // Generate MCQ options for identification
  const idOptions = useMemo(() => {
    if (activeWeed === null) return [];
    const correct = weedState[activeWeed].weed.commonName;
    const wrongs = shuffle(weeds.filter(w => w.commonName !== correct)).slice(0, 3).map(w => w.commonName);
    return shuffle([correct, ...wrongs]);
  }, [activeWeed, weedState]);

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🧑‍🌾</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{timer > 0 ? 'Field Clear!' : "Time's Up!"}</h2>
        <p className="text-muted-foreground mb-2">Managed: {managed}/{weedState.length}</p>
        <p className="text-muted-foreground mb-6">Correct methods: {score}/{managed}</p>
        <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
        <span className={`text-sm font-bold ${timer <= 10 ? 'text-destructive' : 'text-foreground'}`}>{timer}s</span>
        <span className="text-sm text-primary font-bold ml-2">{score} pts</span>
      </div>
      <div className="flex-1 relative" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 30%, #4a7c3f 30%, #3d6b34 100%)' }}>
        {/* Field with weeds */}
        {weedState.map((fw, i) => (
          <button key={i} onClick={() => clickWeed(i)}
            className={`absolute w-12 h-12 rounded-full transition-all ${fw.managed ? 'opacity-30 scale-75' : 'hover:scale-110 animate-pulse'}`}
            style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/50 bg-secondary">
              <WeedImage weedId={fw.weed.id} stage="seedling" className="w-full h-full object-cover" />
            </div>
            {fw.managed && <span className="absolute -top-1 -right-1 text-sm">{fw.correct ? '✅' : '❌'}</span>}
          </button>
        ))}

        {/* Active weed panel */}
        {active && (
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4">
            {phase === 'identify' ? (
              <div>
                <p className="text-sm font-bold text-foreground mb-2">What weed is this?</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary">
                    <WeedImage weedId={active.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-muted-foreground flex-1">{active.weed.traits[0]}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {idOptions.map(opt => (
                    <button key={opt} onClick={() => identifyWeed(opt)}
                      className="py-2 px-3 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:border-primary transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-foreground mb-2">How should you manage <span className="text-primary">{active.weed.commonName}</span>?</p>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => manageWeed(m.id)}
                      className="py-2 px-3 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:border-primary transition-colors">
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
