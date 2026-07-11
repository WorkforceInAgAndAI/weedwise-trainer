import { useState, useMemo } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { Ship, Package, Bug, Sprout } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { WEED_ARRIVAL_KNOWLEDGE } from '@/data/weedKnowledge';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type ArrivalMethod = 'accident' | 'purpose' | 'other-species' | 'native-spread';

const ARRIVAL_LABELS: Record<ArrivalMethod, { label: string; Icon: typeof Ship }> = {
  accident: { label: 'By Accident', Icon: Ship },
  purpose: { label: 'On Purpose', Icon: Package },
  'other-species': { label: 'Through Other Species', Icon: Bug },
  'native-spread': { label: 'Native — Spread by Agriculture', Icon: Sprout },
};

const ARRIVAL_DESCRIPTIONS: Record<ArrivalMethod, string> = {
  accident: 'Arrived unintentionally as a contaminant in shipping, crop seed, soil, or ballast water — no one meant to bring it.',
  purpose: 'Brought intentionally for agriculture, ornamental gardening, fiber, forage, or erosion control — then escaped cultivation.',
  'other-species': 'Hitchhiked on animals, livestock, machinery, or moved through the live-plant/nursery trade with another species.',
  'native-spread': 'Already lived in North America before farming. Tillage, equipment, and disturbed fields let it spread aggressively into croplands.',
};

function getArrivalData(w: typeof weeds[0]): { method: ArrivalMethod; story: string } {
  const k = WEED_ARRIVAL_KNOWLEDGE[w.id];
  if (k) return { method: k.method as ArrivalMethod, story: `${w.commonName} (${w.scientificName}) — ${k.story}` };
  // Conservative fallback for unmapped weeds
  const method: ArrivalMethod = w.origin === 'Native' ? 'native-spread' : 'accident';
  const story =
    method === 'native-spread'
      ? `${w.commonName} (${w.scientificName}) is native to North America. It became a problem weed when farming created disturbed habitats where it could spread aggressively across cropland.`
      : `${w.commonName} (${w.scientificName}) likely arrived accidentally through contaminated crop seed, shipping materials, or soil. It now thrives in ${w.habitat.toLowerCase()}.`;
  return { method, story };
}

export default function InvasiveQuiz({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const rounds = useMemo(() => {
    // Round-robin across all four arrival methods so students see real variety
    // instead of "accident" seven times in a row.
    const pool = weeds.filter(w => WEED_ARRIVAL_KNOWLEDGE[w.id]);
    const byMethod: Record<ArrivalMethod, typeof weeds> = {
      accident: [], purpose: [], 'other-species': [], 'native-spread': [],
    };
    for (const w of pool) {
      const m = WEED_ARRIVAL_KNOWLEDGE[w.id].method as ArrivalMethod;
      byMethod[m].push(w);
    }
    (Object.keys(byMethod) as ArrivalMethod[]).forEach(k => {
      byMethod[k] = shuffle(byMethod[k]);
    });
    const methodKeys = (Object.keys(byMethod) as ArrivalMethod[]).filter(k => byMethod[k].length > 0);
    const cursor: Record<ArrivalMethod, number> = {
      accident: (level - 1) * 2, purpose: (level - 1) * 2,
      'other-species': (level - 1) * 2, 'native-spread': (level - 1) * 2,
    };
    const picks: typeof weeds = [];
    let safety = 0;
    while (picks.length < 8 && safety++ < 200) {
      const m = methodKeys[picks.length % methodKeys.length];
      const list = byMethod[m];
      const w = list[cursor[m]++ % list.length];
      if (!picks.some(p => p.id === w.id)) picks.push(w);
    }
    return shuffle(picks).map(w => {
      const data = getArrivalData(w);
      return { weed: w, method: data.method, story: data.story };
    });
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<ArrivalMethod | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ weedId: string; name: string; method: ArrivalMethod; correct: boolean }[]>([]);

  const done = round >= rounds.length;
  const current = !done ? rounds[round] : null;

  const submit = (method: ArrivalMethod) => {
    if (answered) return;
    setSelected(method);
    setAnswered(true);
    const isCorrect = method === current!.method;
    if (isCorrect) setScore(s => s + 1);
    setHistory(h => [...h, { weedId: current!.weed.id, name: current!.weed.commonName, method: current!.method, correct: isCorrect }]);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setAnswered(false); };
  const restart = () => { setRound(0); setScore(0); setSelected(null); setAnswered(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'invasive-travelers', gameName: 'Invasive Travelers', level: 'MS', score, total: rounds.length });
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col items-center justify-center p-6">
        <Ship className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Journey Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
        <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive Travelers</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_280px] gap-4 max-w-6xl mx-auto">
          {/* LEFT: large weed image */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border-2 border-border bg-secondary aspect-square">
              <WeedImage weedId={current!.weed.id} stage="flower" className="w-full h-full object-cover" />
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="font-bold text-foreground text-lg">{current!.weed.commonName}</p>
              <p className="text-xs text-muted-foreground italic">{current!.weed.scientificName}</p>
              <p className="text-xs text-muted-foreground mt-1">Family: {current!.weed.family}</p>
            </div>
          </div>

          {/* CENTER: arrival options with dashed loop animation when selected */}
          <div>
            <p className="font-bold text-foreground text-center mb-3 text-sm">How did this weed arrive in North America?</p>
            <div className="relative flex flex-col gap-3">
              {(Object.keys(ARRIVAL_LABELS) as ArrivalMethod[]).map(method => {
                const isCorrect = method === current!.method;
                const { label, Icon } = ARRIVAL_LABELS[method];
                const isSel = method === selected;
                const bg = !answered ? 'border-border bg-card hover:border-primary' :
                  isSel ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
                  isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
                return (
                  <button key={method} onClick={() => submit(method)}
                    className={`relative p-3 rounded-lg border-2 text-left transition-all flex items-start gap-2 ${bg}`}>
                    <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{ARRIVAL_DESCRIPTIONS[method]}</p>
                    </div>
                    {isSel && (
                      // Dashed loop SVG to the left edge
                      <svg className="absolute pointer-events-none -left-12 top-1/2 -translate-y-1/2 hidden lg:block" width="48" height="60" viewBox="0 0 48 60" fill="none">
                        <path d="M 0 30 Q -8 15 8 12 Q 24 9 18 30 Q 12 48 30 38 Q 46 30 48 30"
                          stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 3" fill="none"
                          className="animate-pulse" />
                        <circle cx="46" cy="30" r="3" fill="hsl(var(--primary))" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-4 bg-card border border-border rounded-xl p-3">
                <p className={`font-bold mb-2 text-sm ${selected === current!.method ? 'text-green-500' : 'text-destructive'}`}>
                  {selected === current!.method ? 'Correct!' : 'Not quite!'}
                </p>
                <p className="text-xs text-foreground leading-relaxed">{current!.story}</p>
                {current!.weed.memoryHook && (
                  <p className="text-[11px] text-muted-foreground mt-2 italic">Tip: {current!.weed.memoryHook}</p>
                )}
                <button onClick={next} className="mt-3 w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Next →</button>
              </div>
            )}
          </div>

          {/* RIGHT: collection panel grouped by arrival method */}
          <div className="rounded-xl border-2 border-border bg-card p-3 h-fit lg:sticky lg:top-4">
            <p className="text-xs font-bold uppercase text-foreground mb-3">Your Field Notes ({history.length})</p>
            <div className="space-y-3">
              {(Object.keys(ARRIVAL_LABELS) as ArrivalMethod[]).map(m => {
                const items = history.filter(h => h.method === m);
                if (items.length === 0) return null;
                const { label, Icon } = ARRIVAL_LABELS[m];
                return (
                  <div key={m}>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground mb-1">
                      <Icon className="w-3 h-3" /> {label}
                    </div>
                    <div className="space-y-1">
                      {items.map((h, idx) => (
                        <div key={idx} className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded ${h.correct ? 'bg-green-500/10 text-foreground' : 'bg-destructive/10 text-foreground'}`}>
                          <span className={h.correct ? 'text-green-600' : 'text-destructive'}>{h.correct ? '✓' : '✗'}</span>
                          <span className="truncate">{h.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {history.length === 0 && <p className="text-[11px] text-muted-foreground italic">Your guesses will collect here.</p>}
            </div>
          </div>
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Invasive ≠ native. Think origin, spread rate, and impact on the local ecosystem.`} />
</div>
  );
}
