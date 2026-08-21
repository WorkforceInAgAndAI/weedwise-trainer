import { useState } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import { DollarSign, Check, X, Lock, ShoppingCart } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const SEASONS = 3;
const START_BUDGET = 600;
// Methods a student owns from day one; the rest must be bought in the shed.
const STARTER_METHODS = ['pull', 'hoe', 'mow', 'cultivate'];
// One-time unlock price for each purchasable method.
const UNLOCK_COST: Record<string, number> = {
  tillage: 70,
  cover: 80,
  rotate: 80,
  pre: 100,
  post: 100,
  'spot-spray': 90,
};
// Crop revenue earned for each weed controlled correctly.
const REVENUE_PER_CORRECT = 90;
// Extra harvest bonus paid at the end of a season, based on control success.
function seasonBonus(correct: number, total: number) {
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 0.9) return 250;
  if (rate >= 0.7) return 150;
  if (rate >= 0.5) return 75;
  return 0;
}

interface Method { id: string; label: string; cost: number; tag: string }
const ALL_METHODS: Method[] = [
  { id: 'hoe',        label: 'Hoeing',                  cost: 20, tag: 'Mechanical' },
  { id: 'pull',       label: 'Hand Pull',               cost: 15, tag: 'Mechanical' },
  { id: 'cultivate',  label: 'Cultivation',             cost: 35, tag: 'Mechanical' },
  { id: 'tillage',    label: 'Tillage',                 cost: 40, tag: 'Mechanical' },
  { id: 'mow',        label: 'Mowing',                  cost: 25, tag: 'Mechanical' },
  { id: 'cover',      label: 'Cover Crop',              cost: 45, tag: 'Cultural' },
  { id: 'rotate',     label: 'Crop Rotation',           cost: 45, tag: 'Cultural' },
  { id: 'pre',        label: 'Pre-emergent Herbicide',  cost: 55, tag: 'Chemical' },
  { id: 'post',       label: 'Post-emergent Herbicide', cost: 55, tag: 'Chemical' },
  { id: 'spot-spray', label: 'Spot-spray Herbicide',    cost: 50, tag: 'Chemical' },
];

const BEST_BY_SPECIES: Record<string, string> = {
  'waterhemp': 'pre',
  'palmer-amaranth': 'rotate',
  'lambsquarters': 'cultivate',
  'common-lambsquarters': 'cultivate',
  'redroot-pigweed': 'hoe',
  'smooth-pigweed': 'hoe',
  'kochia': 'rotate',
  'horseweed': 'cover',
  'giant-foxtail': 'post',
  'yellow-foxtail': 'tillage',
  'green-foxtail': 'cultivate',
  'large-crabgrass': 'cultivate',
  'smooth-crabgrass': 'pre',
  'barnyardgrass': 'cover',
  'fall-panicum': 'post',
  'shattercane': 'spot-spray',
  'johnsongrass': 'spot-spray',
  'quackgrass': 'tillage',
  'yellow-nutsedge': 'spot-spray',
  'purple-nutsedge': 'spot-spray',
  'common-ragweed': 'mow',
  'giant-ragweed': 'pull',
  'velvetleaf': 'hoe',
  'jimsonweed': 'pull',
  'cocklebur': 'pull',
  'morningglory': 'cultivate',
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

interface FieldWeed { id: string; weed: typeof weeds[0]; x: number; y: number }

/** Scatter weed bubbles across the field, keeping them apart from each other. */
function scatter(count: number): { x: number; y: number }[] {
  const spots: { x: number; y: number }[] = [];
  let guard = 0;
  while (spots.length < count && guard < 800) {
    guard++;
    const p = { x: 8 + Math.random() * 78, y: 14 + Math.random() * 72 };
    if (spots.every(s => Math.hypot(s.x - p.x, (s.y - p.y) * 0.6) > 14)) spots.push(p);
  }
  while (spots.length < count) {
    const i = spots.length;
    spots.push({ x: 10 + (i % 5) * 19, y: 18 + Math.floor(i / 5) * 22 });
  }
  return spots;
}

function buildField(count: number): FieldWeed[] {
  const pool = shuffle(weeds);
  const spots = scatter(count);
  return Array.from({ length: count }, (_, i) => ({
    id: `${pool[i % pool.length].id}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    weed: pool[i % pool.length],
    x: spots[i].x,
    y: spots[i].y,
  }));
}

/** Good control shrinks next season's population; escapes and mistakes grow it. */
function nextPopulation(population: number, correct: number, missedOrWrong: number) {
  return Math.max(2, Math.min(10, Math.round(population + missedOrWrong * 1.5 - correct * 2)));
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const [season, setSeason] = useState(1);
  const [population, setPopulation] = useState(6);
  const [field, setField] = useState<FieldWeed[]>(() => buildField(6));
  const [budget, setBudget] = useState(START_BUDGET);
  const [current, setCurrent] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [handled, setHandled] = useState<{ id: string; correct: boolean; weedName: string; weedId: string; method: string }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [owned, setOwned] = useState<string[]>(STARTER_METHODS);
  const [income, setIncome] = useState(0);
  const [seasonBonusPaid, setSeasonBonusPaid] = useState(0);

  const fw = current ? field.find(f => f.id === current) : null;
  const remaining = field.filter(f => !handled.some(h => h.id === f.id));
  const seasonCorrect = handled.filter(h => h.correct).length;

  const pickMethod = (m: Method) => {
    if (!fw || feedback) return;
    if (budget < m.cost) return;
    if (!owned.includes(m.id)) return;
    const best = getBestMethod(fw.weed);
    const correct = m.id === best;
    const bestLabel = ALL_METHODS.find(x => x.id === best)?.label ?? best;
    setBudget(b => b - m.cost);
    setHandled(h => [...h, { id: fw.id, correct, weedName: fw.weed.commonName, weedId: fw.weed.id, method: m.id }]);
    if (correct) setTotalCorrect(c => c + 1);
    setFeedback({
      correct,
      text: correct
        ? `Correct! ${m.label} is the best control for ${fw.weed.commonName}. ${fw.weed.management}`
        : `${m.label} is not the best choice for ${fw.weed.commonName}. ${bestLabel} works best because: ${fw.weed.management}`,
    });
  };

  const closeWeed = () => { setCurrent(null); setFeedback(null); };

  const endSeason = () => {
    setCurrent(null);
    setFeedback(null);
    const bonus = seasonBonus(seasonCorrect, field.length);
    const earned = seasonCorrect * REVENUE_PER_CORRECT + bonus;
    setIncome(earned);
    setSeasonBonusPaid(bonus);
    setBudget(b => b + earned);
    setShowSummary(true);
  };

  const nextSeason = () => {
    const wrong = handled.length - seasonCorrect + remaining.length;
    const next = nextPopulation(population, seasonCorrect, wrong);
    if (season >= SEASONS) { setGameOver(true); setShowSummary(false); return; }
    setSeason(s => s + 1);
    setPopulation(next);
    setField(buildField(next));
    setHandled([]);
    setShowSummary(false);
  };

  const startOver = () => {
    setSeason(1); setPopulation(6); setField(buildField(6)); setBudget(START_BUDGET);
    setHandled([]); setCurrent(null); setFeedback(null); setShowSummary(false);
    setGameOver(false); setTotalCorrect(0); setOwned(STARTER_METHODS); setIncome(0); setSeasonBonusPaid(0);
  };

  const buyMethod = (m: Method) => {
    const cost = UNLOCK_COST[m.id] ?? 100;
    if (owned.includes(m.id) || budget < cost) return;
    setBudget(b => b - cost);
    setOwned(o => [...o, m.id]);
  };

  const shell = 'fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col pt-[56px]';

  if (gameOver) {
    return (
      <div className={shell}>
        <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Three Seasons Complete</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-md mx-auto w-full">
          <div className="bg-card border border-border rounded-xl p-5 space-y-2 text-center">
            <p className="text-3xl font-bold text-primary">{totalCorrect}</p>
            <p className="text-sm text-muted-foreground">correct control decisions</p>
            <p className="text-sm text-foreground">Budget left: <strong>${budget}</strong></p>
            <p className="text-sm text-foreground">Final weed pressure: <strong>{population} weeds</strong></p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Matching the control method to the weed keeps pressure — and cost — down season after season.
          </p>
          <button onClick={startOver} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="w-full py-3 rounded-lg border border-border text-foreground font-bold">Back to Practice</button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const wrong = handled.filter(h => !h.correct);
    const nextPop = nextPopulation(population, seasonCorrect, wrong.length + remaining.length);
    return (
      <div className={shell}>
        <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Season {season} Results</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
          <p className="text-lg font-bold text-foreground text-center">
            {seasonCorrect}/{field.length} weeds controlled correctly
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Crop revenue earned: <strong className="text-success">+${income}</strong>
            {seasonBonusPaid > 0 && <> (includes a <strong className="text-success">${seasonBonusPaid}</strong> harvest bonus for strong control)</>}
            {' '}· Budget: <strong>${budget}</strong>
          </p>
          {wrong.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Mismanaged weeds:</p>
              {wrong.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <WeedImage weedId={r.weedId} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{r.weedName}</p>
                    <p className="text-xs text-destructive">Your pick: {ALL_METHODS.find(m => m.id === r.method)?.label}</p>
                    {(() => {
                      const sp = weeds.find(w => w.id === r.weedId);
                      const best = sp ? getBestMethod(sp) : null;
                      return best ? <p className="text-xs text-success">Best: {ALL_METHODS.find(m => m.id === best)?.label}</p> : null;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-card border border-border rounded-xl p-4 text-sm text-foreground">
            {season < SEASONS ? (
              <>Next season's weed pressure: <strong>{nextPop} weeds</strong>{' '}
              {nextPop < population ? '— good control means fewer weeds!' : '— missed weeds set seed and come back stronger.'}</>
            ) : (
              <>That was the last season. Let's see how the farm did.</>
            )}
          </div>

          {/* Between-season store */}
          {season < SEASONS && (
            <div className="bg-card border-2 border-primary/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <p className="font-bold text-foreground">Control Methods Shed</p>
                <span className="ml-auto text-sm font-extrabold text-success">${budget}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Buy new control methods with your crop revenue. Once bought, a method is yours for every future season.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_METHODS.filter(m => !STARTER_METHODS.includes(m.id)).map(m => {
                  const cost = UNLOCK_COST[m.id] ?? 100;
                  const have = owned.includes(m.id);
                  const afford = budget >= cost;
                  return (
                    <button
                      key={m.id}
                      onClick={() => buyMethod(m)}
                      disabled={have || !afford}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        have
                          ? 'border-success/50 bg-success/10'
                          : afford
                            ? 'border-border bg-background hover:border-primary'
                            : 'border-border bg-background/50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <span className="block text-sm font-bold text-foreground">{m.label}</span>
                      <span className="text-[11px] text-muted-foreground">{m.tag} · use cost ${m.cost}</span>
                      <span className={`block text-xs font-bold mt-1 ${have ? 'text-success' : 'text-primary'}`}>
                        {have ? 'Owned' : `Buy — $${cost}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={nextSeason} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {season < SEASONS ? `Start Season ${season + 1}` : 'See Final Report'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur flex-wrap">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <DollarSign className="w-3 h-3" />{budget}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Season {season}/{SEASONS}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="relative min-h-[46vh] lg:min-h-0 lg:overflow-y-auto">
          <img src={fieldBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          <div className="relative p-3 sm:p-4 h-full min-h-[46vh]">
            <p className="text-xs font-bold text-white/90 mb-2 drop-shadow">
              Scout the field — tap a weed and choose a control method ({remaining.length} left)
            </p>
            <div className="relative w-full h-[38vh] lg:h-[calc(100%-5rem)] min-h-[280px]">
              {field.map(f => {
                const rec = handled.find(h => h.id === f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => !rec && setCurrent(f.id)}
                    disabled={!!rec}
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-[3px] bg-secondary shadow-xl transition-all ${
                      rec ? 'opacity-40 border-white/40 cursor-not-allowed' : 'border-white hover:border-primary hover:scale-110'
                    }`}
                  >
                    <WeedImage weedId={f.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={endSeason}
              className="mt-3 w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-extrabold border-4 border-white shadow-2xl hover:scale-[1.03] transition-transform animate-pulse"
            >
              End Season {season} →
            </button>
          </div>
        </div>

        <div className="bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col lg:overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Season Log</p>
            <p className="text-sm text-foreground">{seasonCorrect} correct · {handled.length - seasonCorrect} missed</p>
            <p className="text-xs text-muted-foreground mt-1">
              You start with hand pull, hoeing, mowing and cultivation plus a ${START_BUDGET} budget. Each correct
              control earns ${REVENUE_PER_CORRECT}, and a strong season pays an extra harvest bonus you can spend in
              the shed to unlock new methods.
            </p>
          </div>
          <div className="p-3 flex-1 lg:overflow-y-auto space-y-1.5">
            {handled.length === 0 && <p className="text-xs text-muted-foreground italic">Managed weeds appear here.</p>}
            {handled.map((h, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded border ${h.correct ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                  <WeedImage weedId={h.weedId} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{h.weedName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ALL_METHODS.find(m => m.id === h.method)?.label}</p>
                </div>
                {h.correct ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weed detail / method chooser */}
      {fw && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 pt-[70px]">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-full overflow-y-auto">
            <div className="p-4 flex items-center gap-3 border-b border-border">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <WeedImage weedId={fw.weed.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{fw.weed.commonName}</p>
                <p className="text-xs italic text-primary">{fw.weed.scientificName}</p>
              </div>
              <button onClick={closeWeed} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            {!feedback ? (
              <div className="p-4">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
                  Choose a control method — budget ${budget}
                </p>
                <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-1">
                  <p className="text-[11px] text-foreground">
                    <span className="font-bold">Scouting hint:</span> {fw.weed.management}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Best timing: {fw.weed.controlTiming} · Look for a{' '}
                    <strong className="text-foreground">
                      {ALL_METHODS.find(m => m.id === getBestMethod(fw.weed))?.tag}
                    </strong>{' '}
                    method.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_METHODS.map(m => {
                    const have = owned.includes(m.id);
                    const afford = have && budget >= m.cost;
                    return (
                      <button
                        key={m.id}
                        onClick={() => pickMethod(m)}
                        disabled={!afford}
                        className={`p-2 rounded-lg border-2 text-xs font-bold text-left transition-all ${
                          afford ? 'border-border bg-background text-foreground hover:border-primary' : 'border-border bg-background/50 text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {!have && <Lock className="w-3 h-3" />}
                          {m.label}
                        </span>
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {have ? `${m.tag} · $${m.cost}` : `Locked — buy in the shed between seasons`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className={`p-3 rounded-lg border ${feedback.correct ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                  <p className="text-sm text-foreground">{feedback.text}</p>
                </div>
                <button onClick={closeWeed} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">
                  Back to Field
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
