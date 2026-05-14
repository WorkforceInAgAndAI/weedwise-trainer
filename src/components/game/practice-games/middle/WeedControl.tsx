import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const ROUNDS_PER_LEVEL = 3;

interface Method { id: string; label: string }
const ALL_METHODS: Method[] = [
  { id: 'cultivate',  label: 'Cultivation' },
  { id: 'tillage',    label: 'Tillage' },
  { id: 'hoe',        label: 'Hoeing' },
  { id: 'pull',       label: 'Hand Pull' },
  { id: 'mow',        label: 'Mowing' },
  { id: 'cover',      label: 'Cover Crop' },
  { id: 'pre',        label: 'Pre-emergent Herbicide' },
  { id: 'post',       label: 'Post-emergent Herbicide' },
  { id: 'spot-spray', label: 'Spot-spray Herbicide' },
  { id: 'rotate',     label: 'Crop Rotation' },
];

// Diversified per-species best methods. Different species → different recommended controls.
const BEST_BY_SPECIES: Record<string, string> = {
  'waterhemp': 'pre',
  'palmer-amaranth': 'pre',
  'lambsquarters': 'pre',
  'common-lambsquarters': 'pre',
  'redroot-pigweed': 'pre',
  'kochia': 'rotate',
  'marestail': 'pre',
  'horseweed': 'pre',
  'giant-foxtail': 'post',
  'yellow-foxtail': 'post',
  'green-foxtail': 'post',
  'large-crabgrass': 'cultivate',
  'smooth-crabgrass': 'cultivate',
  'barnyardgrass': 'post',
  'fall-panicum': 'post',
  'shattercane': 'spot-spray',
  'johnsongrass': 'spot-spray',
  'quackgrass': 'tillage',
  'yellow-nutsedge': 'spot-spray',
  'purple-nutsedge': 'spot-spray',
  'common-ragweed': 'post',
  'giant-ragweed': 'pull',
  'velvetleaf': 'cultivate',
  'jimsonweed': 'pull',
  'cocklebur': 'pull',
  'morningglory': 'post',
  'ivyleaf-morningglory': 'post',
  'bindweed': 'cover',
  'canada-thistle': 'mow',
  'bull-thistle': 'pull',
  'common-burdock': 'mow',
  'poison-hemlock': 'mow',
  'poison-ivy': 'spot-spray',
  'horsenettle': 'mow',
  'stinging-nettle': 'mow',
};

function getBestMethod(w: typeof weeds[0]): string {
  if (BEST_BY_SPECIES[w.id]) return BEST_BY_SPECIES[w.id];
  // Fallback: heuristics for any weed not in the map above
  const m = (w.management || '').toLowerCase();
  if (m.includes('pre')) return 'pre';
  if (m.includes('post')) return 'post';
  if (m.includes('cover')) return 'cover';
  if (m.includes('rotation')) return 'rotate';
  if (m.includes('mow')) return 'mow';
  if (m.includes('cultivat')) return 'cultivate';
  if (m.includes('till')) return 'tillage';
  if (m.includes('pull') || m.includes('roguing')) return 'pull';
  return 'hoe';
}

interface FieldWeed { weed: typeof weeds[0]; x: number; y: number; id: string }

function buildRound(level: number, round: number): FieldWeed[] {
  const offset = ((level - 1) * ROUNDS_PER_LEVEL + (round - 1)) * 8;
  const pool = shuffle(weeds);
  return pool.slice(offset % pool.length).concat(pool).slice(0, 8).map((w, i) => ({
    id: `${w.id}-${i}`,
    weed: w,
    x: 12 + Math.random() * 76,
    y: 12 + Math.random() * 76,
  }));
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);

  const [fieldWeeds, setFieldWeeds] = useState<FieldWeed[]>(() => buildRound(1, 1));
  useEffect(() => { setFieldWeeds(buildRound(level, round)); }, [level, round]);

  const [current, setCurrent] = useState<string | null>(null);
  const [identified, setIdentified] = useState(false);
  const [idChoice, setIdChoice] = useState<string | null>(null);
  const [methodPick, setMethodPick] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [history, setHistory] = useState<{ weedId: string; weedName: string; method: string; correct: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);

  const fw = current ? fieldWeeds.find(f => f.id === current) : null;
  const roundDone = done.length >= fieldWeeds.length || timeLeft <= 0;
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (roundDone) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [roundDone]);

  useEffect(() => {
    if (roundDone && !showReview) setShowReview(true);
  }, [roundDone]);

  const idOptions = useMemo(() => {
    if (!fw) return [];
    const wrong = shuffle(fieldWeeds.filter(f => f.weed.id !== fw.weed.id)).slice(0, 3).map(f => f.weed.commonName);
    return shuffle([fw.weed.commonName, ...wrong]);
  }, [fw, fieldWeeds]);

  const clickWeed = (id: string) => {
    if (roundDone || done.includes(id) || current) return;
    setCurrent(id);
    setIdentified(false);
    setIdChoice(null);
    setMethodPick(null);
  };

  const identify = (name: string) => {
    setIdChoice(name);
    setIdentified(true);
  };

  const pickMethod = (mId: string) => {
    if (!fw) return;
    setMethodPick(mId);
    const best = getBestMethod(fw.weed);
    const correct = mId === best;
    if (correct) setScore(s => s + 1);
    setHistory(h => [...h, { weedId: fw.id, weedName: fw.weed.commonName, method: mId, correct }]);
    setDone(d => [...d, fw.id]);
    // If failed: add 1-2 more of same species nearby
    if (!correct) {
      const extra = 1 + Math.floor(Math.random() * 2);
      setFieldWeeds(prev => [
        ...prev,
        ...Array.from({ length: extra }, (_, i) => ({
          id: `${fw.weed.id}-extra-${Date.now()}-${i}`,
          weed: fw.weed,
          x: Math.max(5, Math.min(95, fw.x + (Math.random() * 14 - 7))),
          y: Math.max(5, Math.min(95, fw.y + (Math.random() * 14 - 7))),
        })),
      ]);
    }
    setTimeout(() => { setCurrent(null); }, 700);
  };

  const resetRound = () => {
    setCurrent(null); setIdentified(false); setIdChoice(null);
    setMethodPick(null); setDone([]); setHistory([]);
    setTimeLeft(180); setShowReview(false);
  };

  const nextRound = () => {
    if (round < ROUNDS_PER_LEVEL) { setRound(r => r + 1); resetRound(); }
  };
  const isLevelDone = round === ROUNDS_PER_LEVEL && showReview;
  const nextLevel = () => { setLevel(l => l + 1); setRound(1); setScore(0); resetRound(); };
  const startOver = () => { setLevel(1); setRound(1); setScore(0); resetRound(); };

  if (showReview) {
    const wrong = history.filter(r => !r.correct);
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Round {round} Results</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-lg font-bold text-foreground text-center mb-3">
            {timeLeft <= 0 ? "Time's Up!" : 'Field Clear!'} — {history.filter(h => h.correct).length}/{history.length} correct
          </p>
          {wrong.length > 0 && (
            <div className="space-y-2 max-w-md mx-auto mb-4">
              <p className="text-sm text-muted-foreground text-center">Mismanaged weeds:</p>
              {wrong.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <WeedImage weedId={r.weedId.split('-')[0]} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{r.weedName}</p>
                    <p className="text-xs text-destructive">Your pick: {ALL_METHODS.find(m => m.id === r.method)?.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLevelDone ? (
            <LevelComplete level={level} score={score} total={fieldWeeds.length * ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
          ) : (
            <button onClick={nextRound} className="w-full max-w-md mx-auto py-3 rounded-lg bg-primary text-primary-foreground font-bold block">Next Round</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">R{round}/{ROUNDS_PER_LEVEL}</span>
        <span className="text-sm font-bold text-foreground">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
        {/* LEFT: field + ID/method overlay */}
        <div className="relative overflow-hidden">
          <img src={fieldBg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          {fieldWeeds.map(f => (
            <button key={f.id} onClick={() => clickWeed(f.id)}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${done.includes(f.id) ? 'opacity-30 pointer-events-none' : 'animate-pulse'}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/70 bg-secondary shadow-lg">
                <WeedImage weedId={f.weed.id} stage="flower" className="w-full h-full object-cover" />
              </div>
            </button>
          ))}

          {current && fw && (
            <div className="absolute bottom-0 left-0 right-0 bg-card/95 border-t-2 border-border p-4 backdrop-blur">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden bg-secondary border-2 border-border flex-shrink-0">
                  <WeedImage weedId={fw.weed.id} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  {!identified ? (
                    <p className="text-sm font-bold text-foreground">Identify this weed:</p>
                  ) : (
                    <p className="font-bold text-foreground">{fw.weed.commonName}</p>
                  )}
                </div>
              </div>
              {!identified && (
                <div className="grid grid-cols-2 gap-2">
                  {idOptions.map(name => (
                    <button key={name} onClick={() => identify(name)}
                      className="p-2 rounded-lg border-2 border-border bg-background text-xs font-bold text-foreground hover:border-primary">
                      {name}
                    </button>
                  ))}
                </div>
              )}
              {identified && !methodPick && (
                <p className="text-xs text-muted-foreground">Pick a control method on the right →</p>
              )}
              {methodPick && (
                <p className={`font-bold text-sm text-center ${methodPick === getBestMethod(fw.weed) ? 'text-green-500' : 'text-destructive'}`}>
                  {methodPick === getBestMethod(fw.weed)
                    ? 'Effective control!'
                    : `Mismanaged — best: ${ALL_METHODS.find(m => m.id === getBestMethod(fw.weed))?.label}. More appeared!`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: methods + collection */}
        <div className="bg-card border-l border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Management Options</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_METHODS.map(m => (
                <button key={m.id} onClick={() => identified && !methodPick && pickMethod(m.id)}
                  disabled={!identified || !!methodPick}
                  className="p-2 rounded-lg border-2 border-border bg-background text-[11px] font-bold text-foreground hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left">
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Field Log ({history.length})</p>
            {history.length === 0 && <p className="text-xs text-muted-foreground italic">Managed weeds appear here.</p>}
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded border ${h.correct ? 'border-green-500/40 bg-green-500/10' : 'border-destructive/40 bg-destructive/10'}`}>
                  <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                    <WeedImage weedId={h.weedId.split('-')[0]} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{h.weedName}</p>
                    <p className={`text-[10px] truncate ${h.correct ? 'text-green-600' : 'text-destructive'}`}>
                      {ALL_METHODS.find(m => m.id === h.method)?.label} {h.correct ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FloatingCoach grade="6-8" tip={`Match the method to the weed — perennials need different control than annuals.`} />
    </div>
  );
}
