import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const GROUP_SIZE = 6;

function buildGroup(level: number): typeof weeds {
  const natives = shuffle(weeds.filter(w => w.origin === 'Native'));
  const intros = shuffle(weeds.filter(w => w.origin === 'Introduced'));
  // Aim for a balanced mix: 3 native + 3 introduced when possible
  const nCount = Math.min(3, natives.length);
  const iCount = Math.min(GROUP_SIZE - nCount, intros.length);
  const offsetN = ((level - 1) * 3) % Math.max(1, natives.length);
  const offsetI = ((level - 1) * 3) % Math.max(1, intros.length);
  const pickN = [...natives.slice(offsetN), ...natives.slice(0, offsetN)].slice(0, nCount);
  const pickI = [...intros.slice(offsetI), ...intros.slice(0, offsetI)].slice(0, iCount);
  return shuffle([...pickN, ...pickI]);
}

export default function NativeLookAlike({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const group = useMemo(() => buildGroup(level), [level]);
  const [placements, setPlacements] = useState<Record<string, 'native' | 'introduced'>>({});
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [bouncedIds, setBouncedIds] = useState<string[]>([]);
  const [retriedOnce, setRetriedOnce] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const unplaced = group.filter(w => !placements[w.id]);
  const allPlaced = unplaced.length === 0;
  const isCorrectZone = (w: typeof weeds[0], z: 'native' | 'introduced') =>
    z === 'native' ? w.origin === 'Native' : w.origin === 'Introduced';

  const handleDrop = (zone: 'native' | 'introduced') => {
    if (!selectedWeed || checked) return;
    setPlacements(p => ({ ...p, [selectedWeed]: zone }));
    setSelectedWeed(null);
  };
  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
  };

  const checkAnswers = () => {
    const wrong = group.filter(w => !isCorrectZone(w, placements[w.id])).map(w => w.id);
    setChecked(true);
    if (wrong.length > 0 && !retriedOnce) {
      setBouncedIds(wrong);
    } else {
      const correct = group.filter(w => isCorrectZone(w, placements[w.id])).length;
      setScore(correct);
      setDone(true);
    }
  };

  useEffect(() => {
    if (bouncedIds.length === 0) return;
    const t = setTimeout(() => {
      setPlacements(p => { const n = { ...p }; bouncedIds.forEach(id => delete n[id]); return n; });
      setChecked(false);
      setRetriedOnce(true);
      setBouncedIds([]);
    }, 800);
    return () => clearTimeout(t);
  }, [bouncedIds]);

  const restart = () => {
    setPlacements({}); setSelectedWeed(null); setChecked(false);
    setBouncedIds([]); setRetriedOnce(false); setDone(false); setScore(0);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return <LevelComplete level={level} score={score} total={GROUP_SIZE} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} title={`Native or Introduced? Lv.${level}`} />;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Native or Introduced?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{Object.keys(placements).length}/{GROUP_SIZE}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground text-center">Tap a weed, then drop it into Native or Introduced.</p>

        {/* Drop zones */}
        <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto">
          {(['native', 'introduced'] as const).map(zone => {
            const placed = group.filter(w => placements[w.id] === zone);
            return (
              <button key={zone} onClick={() => handleDrop(zone)}
                className={`rounded-xl border-2 p-3 min-h-[200px] transition-all text-left ${
                  zone === 'native' ? 'bg-green-900/15 border-green-600/50' : 'bg-amber-900/15 border-amber-600/50'
                } ${selectedWeed && !checked ? 'ring-2 ring-primary cursor-pointer' : ''}`}>
                <p className="text-sm font-bold text-foreground text-center mb-2 capitalize">{zone}</p>
                <div className="flex flex-wrap gap-2">
                  {placed.map(w => {
                    const bouncing = bouncedIds.includes(w.id);
                    const right = checked && isCorrectZone(w, zone);
                    const wrong = checked && !isCorrectZone(w, zone);
                    return (
                      <div key={w.id} onClick={e => { e.stopPropagation(); handleRemove(w.id); }}
                        className={`flex items-center gap-1.5 p-1.5 pr-2 rounded-lg cursor-pointer transition-all duration-500 ${
                          bouncing ? 'opacity-0 -translate-y-6 scale-50' : ''
                        } ${right ? 'bg-green-500/30' : wrong ? 'bg-destructive/30' : 'bg-secondary hover:bg-destructive/20'}`}>
                        <div className="w-10 h-10 rounded overflow-hidden bg-background flex-shrink-0">
                          <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{w.commonName}</span>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Unplaced weed cards */}
        {unplaced.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {retriedOnce && (
              <p className="text-xs text-amber-600 font-semibold text-center mb-2">
                Try again — re-place the {unplaced.length} weed{unplaced.length === 1 ? '' : 's'} you missed.
              </p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {unplaced.map(w => (
                <button key={w.id} onClick={() => setSelectedWeed(selectedWeed === w.id ? null : w.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    selectedWeed === w.id ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-card hover:border-primary/50'
                  }`}>
                  <div className="w-full aspect-square mb-1 overflow-hidden rounded bg-secondary">
                    <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground leading-tight block">{w.commonName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!checked && allPlaced && (
          <div className="text-center">
            <button onClick={checkAnswers} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
          </div>
        )}
      </div>
      <FloatingCoach grade="6-8" tip="Native species evolved here. Introduced ones arrived from other continents — often without natural predators." />
    </div>
  );
}
