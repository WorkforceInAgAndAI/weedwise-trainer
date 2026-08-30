import { useState, useMemo } from 'react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { FlaskConical } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import { HERBICIDE_MOA, SYMPTOM_TYPES, getBestMOAForWeed, type HerbicideMOA } from '@/data/herbicides';
import FloatingCoach from '@/components/game/FloatingCoach';
import { getDifficulty } from '@/lib/difficulty';

/**
 * Curriculum-aligned MOA pool for 6-8 control matching.
 * Covers every MOA group used in the species → MOA mapping so distractors
 * are realistic and the answer set varies across questions.
 */
const MS_MOA_IDS = [
  'accase', 
  'als-post', 
  'auxin', 
  'psii-5-triazines', 
  'epsps', 
  'gs', 
  'ppo-post', 
  'hppd', 
  'vlcfa-15-chloroacetamides'
] as const;

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type Phase = 'moa' | 'feedback';

/**
 * Robustly resolve a MOA ID from weedKnowledge (which may use shortened codes)
 * to a full record in the herbicide table.
 */
const resolveMOA = (id: string): HerbicideMOA | undefined => {
  return HERBICIDE_MOA.find(h => h.id === id) || 
         HERBICIDE_MOA.find(h => h.id.startsWith(id + '-')) ||
         HERBICIDE_MOA.find(h => h.group === parseInt(id));
};

export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);

  const msPool = useMemo(
    () => MS_MOA_IDS.map(id => HERBICIDE_MOA.find(h => h.id === id)).filter((h): h is HerbicideMOA => !!h),
    [],
  );

  const items = useMemo(() => {
    // Filter the weed pool down to species that actually have usable herbicide/control data
    const validWeeds = weeds.filter(w => {
      const bestId = getBestMOAForWeed(w);
      return !!resolveMOA(bestId);
    });

    if (validWeeds.length === 0) return [];

    // Group every weed by its resolved primary MOA so we can round-robin select for variety.
    const byMoa: Record<string, typeof validWeeds> = {};
    for (const w of validWeeds) {
      const bestId = getBestMOAForWeed(w);
      const moa = resolveMOA(bestId);
      if (moa) {
        (byMoa[moa.id] ||= []).push(w);
      }
    }
    for (const k of Object.keys(byMoa)) byMoa[k] = shuffle(byMoa[k]);

    const targetCount = d.rounds;
    const moaKeys = shuffle(Object.keys(byMoa));
    const offsetByMoa: Record<string, number> = {};
    for (const k of moaKeys) offsetByMoa[k] = (level - 1) % Math.max(byMoa[k].length, 1);

    const selected: typeof validWeeds = [];
    let i = 0;
    while (selected.length < targetCount && moaKeys.length > 0) {
      const k = moaKeys[i % moaKeys.length];
      const list = byMoa[k];
      if (list && list.length > 0) {
        const w = list[(offsetByMoa[k]++) % list.length];
        if (!selected.includes(w)) selected.push(w);
      }
      i++;
      if (i > 500) break;
    }

    return selected.map(w => {
      const bestId = getBestMOAForWeed(w);
      const bestMOA = resolveMOA(bestId);
      
      if (!bestMOA) return null;

      // Distractors: MOAs from the MS pool whose HRAC group differs from the correct group.
      const distractorPool = msPool.filter(h => h.group !== bestMOA.group);
      const usedGroups = new Set<number>([bestMOA.group]);
      const distractors: typeof msPool = [];
      const distractorTarget = Math.max(1, d.options - 1);
      
      for (const h of shuffle(distractorPool)) {
        if (usedGroups.has(h.group)) continue;
        usedGroups.add(h.group);
        distractors.push(h);
        if (distractors.length >= distractorTarget) break;
      }
      const options = shuffle([bestMOA, ...distractors]);
      return { weed: w, bestId: bestMOA.id, bestMOA, options };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [level, msPool, d.rounds, d.options]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('moa');
  const [moaPick, setMoaPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<Array<{ weed: (typeof weeds)[0]; correct: boolean; pickedMOA: string }>>([]);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  const submitMOA = (moaId: string) => {
    if (moaPick || !current) return;
    setMoaPick(moaId);
    const moaCorrect = moaId === current.bestId;
    if (moaCorrect) setScore(s => s + 1);
    const pickedLabel = current.options.find(o => o.id === moaId)?.moa || '';
    setHistory(h => [...h, { weed: current.weed, correct: moaCorrect, pickedMOA: pickedLabel }]);
    setPhase('feedback');
  };

  const next = () => {
    setIdx(i => i + 1);
    setPhase('moa');
    setMoaPick(null);
  };
  
  const restart = () => { setIdx(0); setScore(0); setPhase('moa'); setMoaPick(null); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done || !current) {
    const finalScore = Math.round(score);
    if (items.length > 0) {
      addBadge({ 
        gameId: 'control-matching', 
        gameName: 'Control Method Matching', 
        level: 'MS', 
        score: finalScore, 
        total: items.length 
      });
    }
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col items-center justify-center p-6">
        <FlaskConical className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {items.length > 0 ? 'Great Work!' : 'No weeds available'}
        </h2>
        {items.length > 0 && <p className="text-lg text-foreground mb-6">{finalScore}/{items.length} correct</p>}
        <LevelComplete 
          level={level} 
          score={finalScore} 
          total={items.length} 
          onNextLevel={nextLevel} 
          onStartOver={startOver} 
          onBack={onBack} 
          gradeLabel="6-12" 
        />
      </div>
    );
  }

  const moaCorrect = moaPick === current.bestId;
  const symptomInfo = SYMPTOM_TYPES[current.bestMOA.symptomType];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Control Method Matching</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 h-full max-w-5xl mx-auto">
          <div className="overflow-y-auto flex flex-col items-center w-full">
            <div className="w-44 h-44 rounded-xl overflow-hidden bg-secondary mb-3 shadow-sm border border-border">
              <WeedImage weedId={current.weed.id} stage="flower" className="w-full h-full object-cover" />
            </div>
            <p className="font-bold text-foreground mb-1 text-center">{current.weed.commonName}</p>
            <p className="text-xs text-muted-foreground mb-3">
              Type: {current.weed.plantType} ({current.weed.plantType === 'Monocot' ? 'grass' : 'broadleaf'})
            </p>

            {phase === 'moa' && (
              <>
                <p className="text-xs text-muted-foreground mb-3 text-center">Which mode of action best targets this weed?</p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {current.options.map(g => (
                    <button key={g.id} onClick={() => submitMOA(g.id)}
                      className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-left text-sm transition-colors duration-200">
                      <span className="font-bold text-foreground block">{g.moa} (Group {g.group})</span>
                      {g.brands?.[0] && (
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          Common chemical: <span className="font-medium text-foreground">{g.brands[0]}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        Timing: {g.timing} · Targets: {g.spectrum === 'Both' ? 'grasses & broadleaves' : g.spectrum === 'Grass' ? 'grasses' : 'broadleaves'}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {phase === 'feedback' && (
              <div className="mt-3 bg-card border border-border rounded-xl p-4 max-w-sm w-full shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <p className={`font-bold mb-2 ${moaCorrect ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`}>
                  {moaCorrect ? 'Correct!' : 'Not quite!'}
                </p>
                <div className="space-y-1.5 border-t border-border pt-3">
                  <p className="text-xs text-foreground">
                    <span className="font-semibold text-muted-foreground">Best MOA:</span> {current.bestMOA.moa} (Group {current.bestMOA.group})
                  </p>
                  {current.bestMOA.brands?.[0] && (
                    <p className="text-xs text-foreground">
                      <span className="font-semibold text-muted-foreground">Chemical example:</span> {current.bestMOA.brands[0]}
                    </p>
                  )}
                  {symptomInfo && (
                    <div className="mt-2 bg-secondary/30 p-2 rounded text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-bold text-foreground block mb-0.5">{symptomInfo.label}</span>
                      {symptomInfo.description}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    Resistance risk: <span className="font-medium">{current.bestMOA.resistanceLevel}</span>
                  </p>
                </div>
                <button onClick={next} className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                  Next
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Collection sidebar */}
          <div className="bg-card border border-border rounded-xl p-3 overflow-y-auto hidden lg:block">
            <p className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-wider">Your Matches ({history.length})</p>
            {history.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">Matched weeds appear here.</p>}
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded border ${h.correct ? 'border-green-500/40 bg-green-500/5' : 'border-destructive/40 bg-destructive/5'}`}>
                  <div className="w-10 h-10 rounded overflow-hidden bg-secondary flex-shrink-0 border border-border">
                    <WeedImage weedId={h.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{h.weed.commonName}</p>
                    <p className={`text-[10px] truncate ${h.correct ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`}>{h.pickedMOA}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FloatingCoach grade="6-8" tip={`Match each weed to its most effective herbicide mode of action.`} />
    </div>
  );
}
