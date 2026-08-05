import { useState, useMemo, useEffect } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import soybeanBg from '@/assets/images/soybean_field_1.jpg';
import { Target, DollarSign, Lock } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import { getDifficulty, levelSlice } from '@/lib/difficulty';
import {
  HERBICIDE_MOA,
  getMiddleSchoolMOAs,
  getBestMOAForWeed,
} from '@/data/herbicides';
import FloatingCoach from '@/components/game/FloatingCoach';
import BetweenLevelShop from '@/components/game/BetweenLevelShop';
import { usePracticeShop, type ShopItem } from '@/lib/practiceShop';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface FieldWeed { id: string; weed: typeof weeds[0]; x: number; y: number; killed: boolean }

// Fewer rounds per level so students earn faster and reach the shop sooner.
const TOTAL_ROUNDS = 2;

// Kills award crop revenue that flows into the persistent shop wallet.
const REVENUE_PER_KILL = 40;
// Guaranteed end-of-level scouting stipend so a student who mismatches every
// spray still accumulates enough to unlock a new chemical and progress.
const LEVEL_COMPLETION_BONUS = 150;

// Students START with only 2 basic MOAs. New herbicides must be UNLOCKED
// between levels using earnings. This maps MOA ids -> shop items.
const STARTER_MOAS = ['glyphosate', 'atrazine'];
const SHOP_CATALOG: ShopItem[] = [
  { id: '2,4-D',        name: '2,4-D (Auxin)',         cost: 125, tag: 'Broadleaf', desc: 'Cheap, effective on many broadleaves.' },
  { id: 'dicamba',      name: 'Dicamba (Auxin)',       cost: 200, tag: 'Broadleaf', desc: 'Premium auxin for tough broadleaves.' },
  { id: 'glufosinate',  name: 'Glufosinate (GS)',      cost: 225, tag: 'Contact',   desc: 'Non-selective contact burndown.' },
  { id: 'mesotrione',   name: 'Mesotrione (HPPD)',     cost: 175, tag: 'Bleacher',  desc: 'Bleaches broadleaves & some grasses.' },
  { id: 'metolachlor',  name: 'S-Metolachlor (VLCFA)', cost: 150, tag: 'Pre-plant', desc: 'Pre-emerge for grasses & small-seeded broadleaves.' },
  { id: 'clethodim',    name: 'Clethodim (ACCase)',    cost: 175, tag: 'Grass',     desc: 'Selective grass killer.' },
  { id: 'fomesafen',    name: 'Fomesafen (PPO)',       cost: 200, tag: 'Broadleaf', desc: 'PPO for resistant broadleaves.' },
];

function buildField(level: number, round: number): FieldWeed[] {
  const d = getDifficulty(level, 'ms');
  const pool = shuffle(weeds);
  const offset = ((level - 1) * TOTAL_ROUNDS + round) * 5;
  const speciesCount = Math.min(pool.length, 4 + Math.floor(Math.random() * 2) + Math.max(0, d.options - 4));
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
  const shop = usePracticeShop('herbicide-applicator', STARTER_MOAS, 0);
  const [earnedThisLevel, setEarnedThisLevel] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [round, setRound] = useState(1);
  const [items, setItems] = useState<FieldWeed[]>(() => buildField(1, 1));
  const [selected, setSelected] = useState<string[]>([]);
  const [appliedMOA, setAppliedMOA] = useState<string | null>(null);
  const [phase, setPhase] = useState<'select' | 'choose' | 'result'>('select');
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ round: number; moaLabel: string; killed: number; total: number }[]>([]);

  useEffect(() => { setItems(buildField(level, round)); setSelected([]); setAppliedMOA(null); setPhase('select'); }, [level, round]);

  useEffect(() => {
    if (showShop) {
      addBadge({ gameId: 'herbicide-applicator', gameName: 'Herbicide Applicator', level: 'MS', score, total: items.length * TOTAL_ROUNDS });
    }
  }, [showShop]);

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
    if (!shop.owns(moaId)) return;
    const moa = HERBICIDE_MOA.find(h => h.id === moaId)!;
    let killed = 0;
    // Broadcast effect: herbicide kills every susceptible plant it contacts.
    setItems(prev => prev.map(it => {
      if (it.killed) return it;
      const best = getBestMOAForWeed(it.weed);
      if (best === moaId) { killed++; return { ...it, killed: true }; }
      return it;
    }));
    setAppliedMOA(moaId);
    setScore(s => s + killed);
    const revenue = killed * REVENUE_PER_KILL;
    shop.earn(revenue);
    setEarnedThisLevel(v => v + revenue);
    setHistory(h => [...h, { round, moaLabel: `${moa.moa} (Group ${moa.group})`, killed, total: selected.length }]);
    setPhase('result');
  };

  const nextRound = () => {
    if (round < TOTAL_ROUNDS) setRound(r => r + 1);
    else {
      shop.earn(LEVEL_COMPLETION_BONUS);
      setEarnedThisLevel(v => v + LEVEL_COMPLETION_BONUS);
      setShowShop(true); // end of level -> shop
    }
  };

  const sprayAgain = () => {
    setSelected([]);
    setAppliedMOA(null);
    setPhase('select');
  };

  const livingCount = items.filter(i => !i.killed).length;

  const restart = () => { setRound(1); setScore(0); setHistory([]); setSelected([]); setAppliedMOA(null); setPhase('select'); setEarnedThisLevel(0); setShowShop(false); };
  const nextLevelFn = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); shop.reset(); restart(); };

  if (showShop) {
    return (
      <BetweenLevelShop
        title="Herbicide Locker"
        level={level}
        score={score}
        total={items.length * TOTAL_ROUNDS}
        money={shop.money}
        owned={shop.owned}
        earnedThisLevel={earnedThisLevel}
        catalog={SHOP_CATALOG}
        onBuy={shop.buy}
        onContinue={nextLevelFn}
        onStartOver={startOver}
        onBack={onBack}
        gradeLabel="6-8"
      />
    );
  }

  // Show only MOAs the student has unlocked (plus starter set).
  const moaOptions = useMemo(() => {
    return msPool.filter(m => shop.owns(m.id));
  }, [msPool, shop.owned]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Applicator</h1>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <DollarSign className="w-3 h-3" />{shop.money}
        </span>
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
                  <WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" />
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
                          <WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" />
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
              <p className="text-xs text-muted-foreground">Which of YOUR unlocked herbicides matches these weeds best?</p>
              <div className="space-y-2">
                {moaOptions.length === 0 && (
                  <p className="text-xs text-destructive font-bold">No herbicides unlocked yet — save up between levels!</p>
                )}
                {moaOptions.map(m => (
                  <button key={m.id} onClick={() => apply(m.id)}
                    className="w-full p-2.5 rounded-lg border-2 border-border bg-background hover:border-primary text-left">
                    <span className="text-xs font-bold text-foreground">{m.moa} (Group {m.group})</span>
                    <span className="text-[10px] text-muted-foreground block">Chemical: {m.brands[0]}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic">Each kill earns ${REVENUE_PER_KILL} for your locker. Unlock more chemicals between levels.</p>
              {msPool.some(m => !shop.owns(m.id)) && (
                <div className="mt-2 border-t border-border pt-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 inline-flex items-center gap-1"><Lock className="w-3 h-3" />Locked</p>
                  {msPool.filter(m => !shop.owns(m.id)).slice(0,4).map(m => (
                    <p key={m.id} className="text-[10px] text-muted-foreground">{m.moa} (Group {m.group})</p>
                  ))}
                </div>
              )}
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
              {livingCount > 0 && (
                <button onClick={sprayAgain} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  Spray Again ({livingCount} weeds left) →
                </button>
              )}
              <button onClick={nextRound}
                className={`w-full py-2.5 rounded-lg font-bold text-sm ${livingCount > 0 ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'}`}>
                {round < TOTAL_ROUNDS ? (livingCount > 0 ? 'End Round Early →' : 'Next Round →') : 'Finish Level →'}
              </button>
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
