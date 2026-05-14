import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import soybeanBg1 from '@/assets/images/soybean_field_1.jpg';
import soybeanBg2 from '@/assets/images/soybean_field_2.jpg';
import soybeanBg3 from '@/assets/images/soybean_field_3.jpg';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const FIELDS_PER_LEVEL = 3;
const FIELD_BGS = [soybeanBg1, soybeanBg2, soybeanBg3];

// Species-specific economic thresholds (weeds per square foot for soybean)
// Sourced from extension publications. Aggressive species have lower thresholds.
const SPECIES_THRESHOLD: Record<string, number> = {
  'waterhemp': 1,
  'palmer-amaranth': 1,
  'giant-ragweed': 1,
  'common-ragweed': 2,
  'velvetleaf': 2,
  'lambsquarters': 3,
  'common-lambsquarters': 3,
  'redroot-pigweed': 3,
  'smooth-pigweed': 3,
  'kochia': 2,
  'marestail': 2,
  'horseweed': 2,
  'giant-foxtail': 4,
  'yellow-foxtail': 5,
  'green-foxtail': 5,
  'large-crabgrass': 5,
  'smooth-crabgrass': 5,
  'barnyardgrass': 4,
  'fall-panicum': 5,
  'shattercane': 2,
  'johnsongrass': 1,
  'quackgrass': 3,
  'yellow-nutsedge': 4,
  'purple-nutsedge': 3,
  'jimsonweed': 1,
  'cocklebur': 2,
  'morningglory': 2,
  'ivyleaf-morningglory': 2,
  'bindweed': 2,
};

function thresholdFor(weedId: string): number {
  return SPECIES_THRESHOLD[weedId] ?? 3; // moderate default
}

interface FieldData {
  weeds: { weed: typeof weeds[0]; x: number; y: number }[];
  bg: string;
}

function buildField(level: number, fieldNum: number): FieldData {
  // 3-5 distinct species, with multiple plants per species (overlap)
  const pool = shuffle(weeds);
  const offset = ((level - 1) * FIELDS_PER_LEVEL + fieldNum) * 4;
  const speciesCount = 3 + Math.floor(Math.random() * 3); // 3-5
  const species = pool.slice(offset % pool.length, (offset % pool.length) + speciesCount).concat(pool).slice(0, speciesCount);

  const fieldWeeds: { weed: typeof weeds[0]; x: number; y: number }[] = [];
  species.forEach(s => {
    // Per-species count varies 1-7, often crossing the threshold
    const cnt = 1 + Math.floor(Math.random() * 7);
    for (let i = 0; i < cnt; i++) {
      fieldWeeds.push({ weed: s, x: 8 + Math.random() * 84, y: 8 + Math.random() * 84 });
    }
  });

  return { weeds: fieldWeeds, bg: FIELD_BGS[fieldNum % FIELD_BGS.length] };
}

export default function EconomicThreshold({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [fieldNum, setFieldNum] = useState(0);
  const [score, setScore] = useState(0);

  const field = useMemo(() => buildField(level, fieldNum), [level, fieldNum]);

  // Counts per species in this field
  const countsBySpecies = useMemo(() => {
    const m: Record<string, number> = {};
    field.weeds.forEach(fw => { m[fw.weed.id] = (m[fw.weed.id] || 0) + 1; });
    return m;
  }, [field]);

  const speciesList = useMemo(() => Object.keys(countsBySpecies).map(id => {
    const w = field.weeds.find(fw => fw.weed.id === id)!.weed;
    return { weed: w, count: countsBySpecies[id], threshold: thresholdFor(id), above: countsBySpecies[id] > thresholdFor(id) };
  }), [countsBySpecies, field]);

  const [phase, setPhase] = useState<'count' | 'decide' | 'result'>('count');
  // user's per-species decision: treat or monitor
  const [decisions, setDecisions] = useState<Record<string, 'treat' | 'monitor'>>({});

  const submitCount = () => setPhase('decide');

  const decide = (id: string, d: 'treat' | 'monitor') => {
    setDecisions(prev => ({ ...prev, [id]: d }));
  };

  const allDecided = speciesList.every(s => decisions[s.weed.id]);

  const submitDecisions = () => {
    let pts = 0;
    speciesList.forEach(s => {
      const correct = (s.above && decisions[s.weed.id] === 'treat') || (!s.above && decisions[s.weed.id] === 'monitor');
      if (correct) pts += 1;
    });
    setScore(s => s + pts);
    setPhase('result');
  };

  const resetField = () => {
    setPhase('count');
    setDecisions({});
  };

  const nextField = () => {
    if (fieldNum + 1 < FIELDS_PER_LEVEL) {
      setFieldNum(f => f + 1);
      resetField();
    }
  };

  const isLevelDone = fieldNum === FIELDS_PER_LEVEL - 1 && phase === 'result';

  const nextLevel = () => { setLevel(l => l + 1); setFieldNum(0); setScore(0); resetField(); };
  const startOver = () => { setLevel(1); setFieldNum(0); setScore(0); resetField(); };

  const totalPossible = speciesList.length * FIELDS_PER_LEVEL;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Economic Threshold</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Field {fieldNum + 1}/{FIELDS_PER_LEVEL}</span>
      </div>

      <div className="flex-1 overflow-hidden p-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 h-full max-w-6xl mx-auto">
          {/* LEFT: field */}
          <div className="relative rounded-xl overflow-hidden border-2 border-border min-h-[300px]">
            <img src={field.bg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/15" />
            {field.weeds.map((fw, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 shadow-lg">
                  <WeedImage weedId={fw.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: collection + decisions */}
          <div className="overflow-y-auto bg-card border border-border rounded-xl p-3 space-y-3">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Field Survey ({field.weeds.length} weeds)</p>

            {phase === 'count' && (
              <>
                <p className="text-xs text-muted-foreground">Tally the weed species in your field, then decide species-by-species.</p>
                <div className="space-y-2">
                  {speciesList.map(s => (
                    <div key={s.weed.id} className="flex items-center gap-2 p-2 rounded border border-border bg-background">
                      <div className="w-10 h-10 rounded overflow-hidden bg-secondary flex-shrink-0">
                        <WeedImage weedId={s.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{s.weed.commonName}</p>
                        <p className="text-[10px] text-muted-foreground">Counted: {s.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={submitCount} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  Compare to Thresholds →
                </button>
              </>
            )}

            {phase === 'decide' && (
              <>
                <p className="text-xs text-muted-foreground">Each species has its own economic threshold. Decide whether to <span className="font-bold text-foreground">treat</span> or <span className="font-bold text-foreground">monitor</span>.</p>
                <div className="space-y-2">
                  {speciesList.map(s => (
                    <div key={s.weed.id} className="p-2 rounded-lg border border-border bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                          <WeedImage weedId={s.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{s.weed.commonName}</p>
                          <p className="text-[10px] text-muted-foreground">Count {s.count} / Threshold {s.threshold} per ft²</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <button onClick={() => decide(s.weed.id, 'treat')}
                          className={`py-1.5 rounded text-[11px] font-bold border-2 ${decisions[s.weed.id] === 'treat' ? 'border-destructive bg-destructive/20 text-destructive' : 'border-border bg-card text-foreground hover:border-destructive/40'}`}>
                          Treat
                        </button>
                        <button onClick={() => decide(s.weed.id, 'monitor')}
                          className={`py-1.5 rounded text-[11px] font-bold border-2 ${decisions[s.weed.id] === 'monitor' ? 'border-green-600 bg-green-600/20 text-green-700' : 'border-border bg-card text-foreground hover:border-green-600/40'}`}>
                          Monitor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={submitDecisions} disabled={!allDecided}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
                  Submit Decisions
                </button>
              </>
            )}

            {phase === 'result' && (
              <>
                <p className="text-sm font-bold text-foreground">Results</p>
                <div className="space-y-2">
                  {speciesList.map(s => {
                    const correctChoice = s.above ? 'treat' : 'monitor';
                    const userChoice = decisions[s.weed.id];
                    const correct = userChoice === correctChoice;
                    return (
                      <div key={s.weed.id} className={`p-2 rounded border-2 ${correct ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                            <WeedImage weedId={s.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{s.weed.commonName}</p>
                            <p className="text-[10px] text-muted-foreground">{s.count}/ft² vs {s.threshold} threshold → {s.above ? 'ABOVE' : 'below'}</p>
                          </div>
                        </div>
                        <p className={`text-[10px] mt-1 font-semibold ${correct ? 'text-green-700' : 'text-destructive'}`}>
                          You chose <span className="capitalize">{userChoice}</span> · Correct: <span className="capitalize">{correctChoice}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
                {!isLevelDone ? (
                  <button onClick={nextField} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    Next Field →
                  </button>
                ) : (
                  <LevelComplete level={level} score={score} total={totalPossible} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <FloatingCoach grade="6-8" tip={`Each species has its own economic threshold — aggressive weeds like waterhemp warrant action at lower densities.`} />
    </div>
  );
}
