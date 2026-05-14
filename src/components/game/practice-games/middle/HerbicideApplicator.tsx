import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import soybeanBg from '@/assets/images/soybean_field_1.jpg';
import { Droplets, AlertTriangle, Target } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import {
  HERBICIDE_MOA,
  getMiddleSchoolMOAs,
  getBestMOAForWeed,
} from '@/data/herbicides';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface FieldWeed { id: string; weed: typeof weeds[0]; x: number; y: number; killed: boolean }

const TOTAL_ROUNDS = 3;

function buildField(level: number, round: number): FieldWeed[] {
  const pool = shuffle(weeds);
  const offset = ((level - 1) * TOTAL_ROUNDS + round) * 5;
  // 12 weeds, 4-5 distinct species — encourages MOA tradeoffs
  const speciesCount = 4 + Math.floor(Math.random() * 2);
  const species = pool.slice(offset % pool.length, (offset % pool.length) + speciesCount);
  const items: FieldWeed[] = [];
  species.forEach(s => {
    const cnt = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < cnt; i++) {
      items.push({
        id: `${s.id}-${items.length}`,
        weed: s,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
        killed: false,
      });
    }
  });
  return items;
}

export default function HerbicideApplicator({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const msPool = useMemo(() => getMiddleSchoolMOAs(), []);
  const [round, setRound] = useState(1);
  const [items, setItems] = useState<FieldWeed[]>(() => buildField(1, 1));
  const [selected, setSelected] = useState<string[]>([]);
  const [appliedMOA, setAppliedMOA] = useState<string | null>(null);
  const [phase, setPhase] = useState<'select' | 'choose' | 'result'>('select');
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ round: number; moaLabel: string; killed: number; total: number }[]>([]);

  useEffect(() => { setItems(buildField(level, round)); setSelected([]); setAppliedMOA(null); setPhase('select'); }, [level, round]);

  const toggle = (id: string) => {
    if (phase !== 'select') return;
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const selectAll = () => setSelected(items.filter(i => !i.killed).map(i => i.id));

  // Compute kill score for an MOA across the selected weeds
  const scoreMOA = (moaId: string): number => {
    return selected.reduce((acc, id) => {
      const it = items.find(i => i.id === id)!;
      const best = getBestMOAForWeed(it.weed);
      return acc + (best === moaId ? 1 : 0);
    }, 0);
  };

  const apply = (moaId: string) => {
    const moa = HERBICIDE_MOA.find(h => h.id === moaId)!;
    let killed = 0;
    setItems(prev => prev.map(it => {
      if (!selected.includes(it.id)) return it;
      const best = getBestMOAForWeed(it.weed);
      if (best === moaId) { killed++; return { ...it, killed: true }; }
      return it;
    }));
    setAppliedMOA(moaId);
    setScore(s => s + killed);
    setHistory(h => [...h, { round, moaLabel: `${moa.moa} (Group ${moa.group})`, killed, total: selected.length }]);
    setPhase('result');
  };

  const nextRound = () => {
    if (round < TOTAL_ROUNDS) setRound(r => r + 1);
    else setPhase('result'); // last round end
  };

  const isLevelDone = round === TOTAL_ROUNDS && phase === 'result' && appliedMOA;
  const finished = isLevelDone;

  const restart = () => { setRound(1); setScore(0); setHistory([]); setSelected([]); setAppliedMOA(null); setPhase('select'); };
  const nextLevelFn = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (finished) {
    addBadge({ gameId: 'herbicide-applicator', gameName: 'Herbicide Applicator', level: 'MS', score, total: items.length * TOTAL_ROUNDS });
  }

  // Top MOA candidates from MS pool — show 4 options
  const moaOptions = useMemo(() => {
    return msPool.slice(0, 5);
  }, [msPool]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Applicator</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round}/{TOTAL_ROUNDS}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
        {/* LEFT: field */}
        <div className="relative overflow-hidden">
          <img src={soybeanBg} alt="Soybean field" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/15" />
          {items.map(it => {
            const isSelected = selected.includes(it.id);
            return (
              <button key={it.id} onClick={() => toggle(it.id)} disabled={it.killed || phase !== 'select'}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${it.killed ? 'opacity-25 grayscale' : ''}`}>
                <div className={`w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-lg ${
                  it.killed ? 'border-destructive' : isSelected ? 'border-primary ring-2 ring-primary/40 scale-110' : 'border-white/80'
                }`}>
                  <WeedImage weedId={it.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: panel */}
        <div className="bg-card border-l border-border overflow-y-auto p-3 space-y-3">
          {phase === 'select' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Step 1: Select target weeds</p>
              <p className="text-xs text-muted-foreground">Click weeds in the field to add them to your spray list. Pick a herbicide that controls the most.</p>
              <button onClick={selectAll} className="w-full py-2 rounded-lg bg-secondary text-foreground font-bold text-xs">Select All Living</button>
              <div className="bg-background border border-border rounded-lg p-2 max-h-60 overflow-y-auto">
                <p className="text-[11px] font-bold text-foreground mb-1">Selected ({selected.length})</p>
                {selected.length === 0 && <p className="text-[10px] text-muted-foreground italic">Click weeds in the field.</p>}
                <div className="space-y-1">
                  {selected.map(id => {
                    const it = items.find(i => i.id === id)!;
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded overflow-hidden bg-secondary flex-shrink-0">
                          <WeedImage weedId={it.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] text-foreground flex-1 truncate">{it.weed.commonName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => setPhase('choose')} disabled={selected.length === 0}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
                Choose Herbicide →
              </button>
            </>
          )}

          {phase === 'choose' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Step 2: Pick a mode of action</p>
              <p className="text-xs text-muted-foreground">Which herbicide will control the most of your selected weeds?</p>
              <div className="space-y-2">
                {moaOptions.map(m => (
                  <button key={m.id} onClick={() => apply(m.id)}
                    className="w-full p-2.5 rounded-lg border-2 border-border bg-background hover:border-primary text-left">
                    <span className="text-xs font-bold text-foreground">{m.moa} (Group {m.group})</span>
                    <span className="text-[10px] text-muted-foreground block">e.g. {m.brands[0]}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setPhase('select')} className="w-full py-2 rounded-lg bg-secondary text-foreground font-bold text-xs">← Change Selection</button>
            </>
          )}

          {phase === 'result' && appliedMOA && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Spray Results</p>
              {(() => {
                const last = history[history.length - 1];
                const best = Math.max(...moaOptions.map(m => scoreMOA(m.id)));
                const optimal = best;
                return (
                  <div className={`p-3 rounded-lg border-2 ${last.killed === optimal ? 'border-green-500 bg-green-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
                    <p className="font-bold text-foreground flex items-center gap-1"><Target className="w-4 h-4" /> Controlled {last.killed}/{last.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">Best possible with this selection: {optimal}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{last.moaLabel}</p>
                  </div>
                );
              })()}
              {round < TOTAL_ROUNDS ? (
                <button onClick={nextRound} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  Next Round →
                </button>
              ) : (
                <LevelComplete level={level} score={score} total={items.length * TOTAL_ROUNDS} onNextLevel={nextLevelFn} onStartOver={startOver} onBack={onBack} />
              )}
            </>
          )}

          {history.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Spray History</p>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground flex justify-between">
                    <span>R{h.round}: {h.moaLabel}</span>
                    <span className="font-bold text-foreground">{h.killed}/{h.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingCoach grade="6-8" tip={`A field herbicide hits everything you spray. Pick the mode of action that controls the most of your target weeds.`} />
    </div>
  );
}
