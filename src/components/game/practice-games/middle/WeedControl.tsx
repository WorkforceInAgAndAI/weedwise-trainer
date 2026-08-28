import { useState } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import { DollarSign, Check, X } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const SEASONS = 3;
const START_BUDGET = 1000;
const REVENUE_PER_CORRECT = 90;

/** Extra harvest bonus paid at the end of a season, based on control success. */
function seasonBonus(correct: number, total: number) {
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 0.9) return 250;
  if (rate >= 0.7) return 150;
  if (rate >= 0.5) return 75;
  return 0;
}

// ---------------------------------------------------------------------------
// Step 1 — the broad management approach
// ---------------------------------------------------------------------------
type CategoryId = 'mechanical' | 'pre' | 'post' | 'biological';

const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'mechanical', label: 'Mechanical', blurb: 'Physically remove or cut the weed.' },
  { id: 'pre', label: 'PRE Herbicide', blurb: 'Applied before the weed emerges, to the soil.' },
  { id: 'post', label: 'POST Herbicide', blurb: 'Applied to weeds that have already emerged.' },
  { id: 'biological', label: 'Biological / Cultural', blurb: 'Use competition, rotation, cover crops, or grazing.' },
];

// ---------------------------------------------------------------------------
// Step 2 — the equipment used to carry the approach out. Cheap tools save
// money but let more weeds survive; expensive tools work well but drain the
// budget. Neither is "wrong" — the trade-off is the lesson.
// ---------------------------------------------------------------------------
type Tier = 'cheap' | 'moderate' | 'expensive';

interface Equipment { id: string; label: string; cost: number; tier: Tier; control: number; note: string }

const EQUIPMENT: Record<CategoryId, Equipment[]> = {
  mechanical: [
    { id: 'hoe', label: 'Hoeing', cost: 20, tier: 'cheap', control: 0.55, note: 'Slow, hand work — escapes are common.' },
    { id: 'mow', label: 'Mowing', cost: 45, tier: 'moderate', control: 0.8, note: 'Cuts the tops off before seed set.' },
    { id: 'cultivate', label: 'Cultivation', cost: 80, tier: 'expensive', control: 0.95, note: 'Tractor cultivator — thorough but costly.' },
  ],
  pre: [
    { id: 'backpack-pre', label: 'Backpack Sprayer', cost: 25, tier: 'cheap', control: 0.55, note: 'Small area at a time; coverage is uneven.' },
    { id: 'tractor-pre', label: 'Tractor-mounted Sprayer', cost: 60, tier: 'moderate', control: 0.82, note: 'Even coverage across the whole field.' },
    { id: 'drone-pre', label: 'Drone Sprayer', cost: 95, tier: 'expensive', control: 0.95, note: 'Precise, works on wet ground — expensive.' },
  ],
  post: [
    { id: 'backpack-post', label: 'Backpack Sprayer', cost: 25, tier: 'cheap', control: 0.55, note: 'Good for spots, misses scattered escapes.' },
    { id: 'tractor-post', label: 'Tractor-mounted Sprayer', cost: 60, tier: 'moderate', control: 0.82, note: 'Covers the whole field in one pass.' },
    { id: 'drone-post', label: 'Drone Sprayer', cost: 95, tier: 'expensive', control: 0.95, note: 'Targets patches without crushing the crop.' },
  ],
  biological: [
    { id: 'cover', label: 'Cover Crop', cost: 30, tier: 'cheap', control: 0.55, note: 'Shades weed seedlings out — takes time.' },
    { id: 'rotate', label: 'Crop Rotation', cost: 60, tier: 'moderate', control: 0.8, note: 'Breaks the weed\u2019s life cycle.' },
    { id: 'grazing', label: 'Managed Grazing', cost: 90, tier: 'expensive', control: 0.95, note: 'Livestock eat the weeds down — needs fencing.' },
  ],
};

const BEST_BY_SPECIES: Record<string, CategoryId> = {
  'waterhemp': 'pre',
  'palmer-amaranth': 'biological',
  'lambsquarters': 'mechanical',
  'common-lambsquarters': 'mechanical',
  'redroot-pigweed': 'mechanical',
  'smooth-pigweed': 'mechanical',
  'kochia': 'biological',
  'horseweed': 'biological',
  'giant-foxtail': 'post',
  'yellow-foxtail': 'pre',
  'green-foxtail': 'mechanical',
  'large-crabgrass': 'pre',
  'smooth-crabgrass': 'pre',
  'barnyardgrass': 'biological',
  'fall-panicum': 'post',
  'shattercane': 'post',
  'johnsongrass': 'post',
  'quackgrass': 'mechanical',
  'yellow-nutsedge': 'post',
  'purple-nutsedge': 'post',
  'common-ragweed': 'mechanical',
  'giant-ragweed': 'mechanical',
  'velvetleaf': 'mechanical',
  'jimsonweed': 'mechanical',
  'cocklebur': 'mechanical',
  'morningglory': 'post',
  'ivyleaf-morningglory': 'post',
  'bindweed': 'biological',
  'canada-thistle': 'mechanical',
  'bull-thistle': 'mechanical',
  'common-burdock': 'mechanical',
  'poison-hemlock': 'mechanical',
  'poison-ivy': 'post',
  'horsenettle': 'mechanical',
  'stinging-nettle': 'mechanical',
};

function getBestCategory(w: typeof weeds[0]): CategoryId {
  if (BEST_BY_SPECIES[w.id]) return BEST_BY_SPECIES[w.id];
  const m = (w.management || '').toLowerCase();
  if (m.includes('pre-emerg') || m.includes('pre ')) return 'pre';
  if (m.includes('post')) return 'post';
  if (m.includes('cover') || m.includes('rotation') || m.includes('graz')) return 'biological';
  return 'mechanical';
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

/** Good control shrinks next season's population; survivors and escapes grow it. */
function nextPopulation(population: number, controlled: number, survived: number) {
  return Math.max(2, Math.min(10, Math.round(population + survived * 1.5 - controlled * 2)));
}

interface Handled {
  id: string;
  weedName: string;
  weedId: string;
  category: CategoryId;
  categoryCorrect: boolean;
  equipment: string;
  tier: Tier;
  survived: boolean;
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const [season, setSeason] = useState(1);
  const [population, setPopulation] = useState(6);
  const [field, setField] = useState<FieldWeed[]>(() => buildField(6));
  const [budget, setBudget] = useState(START_BUDGET);
  const [current, setCurrent] = useState<string | null>(null);
  const [step, setStep] = useState<'category' | 'category-result' | 'equipment' | 'result'>('category');
  const [pickedCategory, setPickedCategory] = useState<CategoryId | null>(null);
  const [categoryCorrect, setCategoryCorrect] = useState(false);
  const [result, setResult] = useState<{ text: string; survived: boolean } | null>(null);
  const [handled, setHandled] = useState<Handled[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [income, setIncome] = useState(0);
  const [seasonBonusPaid, setSeasonBonusPaid] = useState(0);

  const fw = current ? field.find(f => f.id === current) : null;
  const remaining = field.filter(f => !handled.some(h => h.id === f.id));
  const seasonCorrect = handled.filter(h => h.categoryCorrect).length;
  const seasonControlled = handled.filter(h => h.categoryCorrect && !h.survived).length;
  const cheapPicks = handled.filter(h => h.tier === 'cheap').length;
  const expensivePicks = handled.filter(h => h.tier === 'expensive').length;

  const openWeed = (id: string) => {
    setCurrent(id);
    setStep('category');
    setPickedCategory(null);
    setResult(null);
  };

  const chooseCategory = (c: CategoryId) => {
    if (!fw) return;
    const best = getBestCategory(fw.weed);
    setPickedCategory(c);
    setCategoryCorrect(c === best);
    setStep('category-result');
  };

  const bestCategoryFor = fw ? getBestCategory(fw.weed) : null;

  const chooseEquipment = (e: Equipment) => {
    if (!fw || !bestCategoryFor) return;
    if (budget < e.cost) return;
    // Cheap tools let weeds slip through; expensive ones almost always work.
    const survived = Math.random() > e.control;
    setBudget(b => b - e.cost);
    if (categoryCorrect) setTotalCorrect(c => c + 1);
    setHandled(h => [...h, {
      id: fw.id,
      weedName: fw.weed.commonName,
      weedId: fw.weed.id,
      category: pickedCategory ?? bestCategoryFor,
      categoryCorrect,
      equipment: e.label,
      tier: e.tier,
      survived,
    }]);
    setResult({
      survived,
      text: survived
        ? `${e.label} did not finish the job on ${fw.weed.commonName}. ${e.note} Some plants survived and will add to next season's pressure.`
        : `${e.label} controlled ${fw.weed.commonName}. ${e.note}`,
    });
    setStep('result');
  };

  const closeWeed = () => { setCurrent(null); setStep('category'); setPickedCategory(null); setResult(null); };

  const endSeason = () => {
    closeWeed();
    const bonus = seasonBonus(seasonCorrect, field.length);
    const earned = seasonCorrect * REVENUE_PER_CORRECT + bonus;
    setIncome(earned);
    setSeasonBonusPaid(bonus);
    setBudget(b => b + earned);
    setShowSummary(true);
  };

  const survivorCount = handled.filter(h => h.survived).length + remaining.length;

  const nextSeason = () => {
    const next = nextPopulation(population, seasonControlled, survivorCount);
    if (season >= SEASONS) { setGameOver(true); setShowSummary(false); return; }
    setSeason(s => s + 1);
    setPopulation(next);
    setField(buildField(next));
    setHandled([]);
    setShowSummary(false);
  };

  const startOver = () => {
    setSeason(1); setPopulation(6); setField(buildField(6)); setBudget(START_BUDGET);
    setHandled([]); closeWeed(); setShowSummary(false);
    setGameOver(false); setTotalCorrect(0); setIncome(0); setSeasonBonusPaid(0);
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
            <p className="text-sm text-muted-foreground">correct management decisions</p>
            <p className="text-sm text-foreground">Budget left: <strong>${budget}</strong></p>
            <p className="text-sm text-foreground">Final weed pressure: <strong>{population} weeds</strong></p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Match the management method to the weed, then pick equipment you can afford. Always going cheap leaves
            survivors that build next year's population; always going top-of-the-line drains the budget.
          </p>
          <button onClick={startOver} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="w-full py-3 rounded-lg border border-border text-foreground font-bold">Back to Practice</button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const wrong = handled.filter(h => !h.categoryCorrect);
    const nextPop = nextPopulation(population, seasonControlled, survivorCount);
    return (
      <div className={shell}>
        <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Season {season} Results</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
          <p className="text-lg font-bold text-foreground text-center">
            {seasonCorrect}/{field.length} weeds matched to the right method
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Crop revenue earned: <strong className="text-success">+${income}</strong>
            {seasonBonusPaid > 0 && <> (includes a <strong className="text-success">${seasonBonusPaid}</strong> harvest bonus)</>}
            {' '}· Budget: <strong>${budget}</strong>
          </p>
          <div className="bg-card border border-border rounded-xl p-3 text-sm text-foreground space-y-1">
            <p>Weeds that survived your equipment: <strong>{handled.filter(h => h.survived).length}</strong></p>
            <p>Weeds never treated: <strong>{remaining.length}</strong></p>
            {cheapPicks >= Math.max(2, Math.round(handled.length * 0.7)) && (
              <p className="text-xs text-destructive">
                You chose the cheapest equipment nearly every time. It saved money, but the survivors mean more weeds next season.
              </p>
            )}
            {expensivePicks >= Math.max(2, Math.round(handled.length * 0.7)) && (
              <p className="text-xs text-destructive">
                You chose the most expensive equipment nearly every time. Control was excellent, but the season cost a lot of money.
              </p>
            )}
          </div>
          {wrong.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Wrong management method:</p>
              {wrong.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <WeedImage weedId={r.weedId} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{r.weedName}</p>
                    <p className="text-xs text-destructive">Your pick: {CATEGORIES.find(c => c.id === r.category)?.label}</p>
                    {(() => {
                      const sp = weeds.find(w => w.id === r.weedId);
                      const best = sp ? getBestCategory(sp) : null;
                      return best ? <p className="text-xs text-success">Best: {CATEGORIES.find(c => c.id === best)?.label}</p> : null;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-card border border-border rounded-xl p-4 text-sm text-foreground">
            {season < SEASONS ? (
              <>Next season's weed pressure: <strong>{nextPop} weeds</strong>{' '}
              {nextPop < population ? '— good control means fewer weeds!' : '— survivors set seed and come back stronger.'}</>
            ) : (
              <>That was the last season. Let's see how the farm did.</>
            )}
          </div>

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
              Scout the field — tap a weed, choose a management method, then choose your equipment ({remaining.length} left)
            </p>
            <div className="relative w-full h-[38vh] lg:h-[calc(100%-5rem)] min-h-[280px]">
              {field.map(f => {
                const rec = handled.find(h => h.id === f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => !rec && openWeed(f.id)}
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
            <p className="text-sm text-foreground">{seasonCorrect} right method · {handled.filter(h => h.survived).length} survived</p>
            <p className="text-xs text-muted-foreground mt-1">
              You start each farm with ${START_BUDGET}. Every method is available from day one. Each correct method
              earns ${REVENUE_PER_CORRECT}, and a strong season pays a harvest bonus.
            </p>
          </div>
          <div className="p-3 flex-1 lg:overflow-y-auto space-y-1.5">
            {handled.length === 0 && <p className="text-xs text-muted-foreground italic">Managed weeds appear here.</p>}
            {handled.map((h, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded border ${h.categoryCorrect && !h.survived ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                  <WeedImage weedId={h.weedId} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{h.weedName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {CATEGORIES.find(c => c.id === h.category)?.label} · {h.equipment}{h.survived ? ' · survived' : ''}
                  </p>
                </div>
                {h.categoryCorrect ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weed detail — two-step decision */}
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

            {step === 'category' && (
              <div className="p-4 space-y-3">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  Step 1 — how will you manage this weed?
                </p>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
                  <p className="text-[11px] text-foreground"><span className="font-bold">Scouting hint:</span> {fw.weed.management}</p>
                  <p className="text-[11px] text-muted-foreground">Best timing: {fw.weed.controlTiming}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => chooseCategory(c.id)}
                      className="p-3 rounded-lg border-2 border-border bg-background text-left hover:border-primary transition-all">
                      <span className="block text-sm font-bold text-foreground">{c.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{c.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'category-result' && bestCategoryFor && (
              <div className="p-4 space-y-3">
                <div className={`p-3 rounded-lg border ${categoryCorrect ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                  <p className="text-sm font-bold text-foreground">
                    {categoryCorrect ? 'Correct method!' : `Not the best method here.`}
                  </p>
                  <p className="text-sm text-foreground">
                    The recommended approach for {fw.weed.commonName} is{' '}
                    <strong>{CATEGORIES.find(c => c.id === bestCategoryFor)?.label}</strong>. {fw.weed.management}
                  </p>
                </div>
                <button onClick={() => setStep('equipment')} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">
                  Choose Equipment →
                </button>
              </div>
            )}

            {step === 'equipment' && (
              <div className="p-4 space-y-3">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  Step 2 — what equipment will you use? Budget ${budget}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Cheaper equipment saves money but lets more weeds survive. Expensive equipment works better but eats
                  your season budget.
                </p>
                <div className="space-y-2">
                  {EQUIPMENT[pickedCategory ?? (bestCategoryFor as CategoryId)].map(e => {
                    const afford = budget >= e.cost;
                    return (
                      <button key={e.id} onClick={() => chooseEquipment(e)} disabled={!afford}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          afford ? 'border-border bg-background hover:border-primary' : 'border-border bg-background/50 opacity-60 cursor-not-allowed'
                        }`}>
                        <span className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">{e.label}</span>
                          <span className="text-sm font-extrabold text-primary">${e.cost}</span>
                        </span>
                        <span className="block text-[11px] text-muted-foreground capitalize">{e.tier} · {e.note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'result' && result && (
              <div className="p-4 space-y-3">
                <div className={`p-3 rounded-lg border ${result.survived ? 'border-destructive/40 bg-destructive/10' : 'border-success/40 bg-success/10'}`}>
                  <p className="text-sm text-foreground">{result.text}</p>
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
