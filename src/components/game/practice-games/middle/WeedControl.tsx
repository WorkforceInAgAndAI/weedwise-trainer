import { useState, useEffect, useMemo } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import FloatingCoach from '@/components/game/FloatingCoach';
import BetweenLevelShop from '@/components/game/BetweenLevelShop';
import { usePracticeShop, type ShopItem } from '@/lib/practiceShop';
import { Lock, DollarSign } from 'lucide-react';
import { getDifficulty } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const ROUNDS_PER_LEVEL = 2;
const REWARD_CORRECT = 60;
const REWARD_WRONG = 10;

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

// Start with only the two simplest tools — buy the rest between levels.
const STARTER_OWNED = ['hoe', 'pull'];
const SHOP_CATALOG: ShopItem[] = [
  { id: 'cultivate',  name: 'Cultivator',              cost: 80,  tag: 'Mechanical', desc: 'Unlocks Cultivation.' },
  { id: 'tillage',    name: 'Tillage Equipment',       cost: 100, tag: 'Mechanical', desc: 'Unlocks Tillage.' },
  { id: 'mow',        name: 'Mower',                   cost: 80,  tag: 'Mechanical', desc: 'Unlocks Mowing.' },
  { id: 'cover',      name: 'Cover-Crop Seed',         cost: 110, tag: 'Cultural',   desc: 'Unlocks Cover Crop.' },
  { id: 'rotate',     name: 'Rotation Planning',       cost: 100, tag: 'Cultural',   desc: 'Unlocks Crop Rotation.' },
  { id: 'pre',        name: 'Pre-emergent Herbicide',  cost: 110, tag: 'Chemical',   desc: 'Unlocks Pre-emergent Herbicide.' },
  { id: 'post',       name: 'Post-emergent Herbicide', cost: 130, tag: 'Chemical',   desc: 'Unlocks Post-emergent Herbicide.' },
  { id: 'spot-spray', name: 'Precision Spot Sprayer',  cost: 160, tag: 'Chemical',   desc: 'Unlocks Spot-spray Herbicide.' },
];

// Diversified per-species best methods. Different species → different recommended controls.
// Each species mapped to its single most-effective non-chemical OR chemical control,
// intentionally spread across all 10 methods so the game doesn't always reward pre/post.
const BEST_BY_SPECIES: Record<string, string> = {
  'waterhemp': 'pre',
  'palmer-amaranth': 'rotate',
  'lambsquarters': 'cultivate',
  'common-lambsquarters': 'cultivate',
  'redroot-pigweed': 'hoe',
  'smooth-pigweed': 'hoe',
  'kochia': 'rotate',
  'marestail': 'cover',
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
  let selection = pool.slice(offset % pool.length).concat(pool).slice(0, 8);
  // Guarantee at least one weed per round whose correct answer is Hoeing or Hand Pull,
  // so the two starter tools always have a genuinely correct target — especially level 1.
  const hasStarterCorrect = selection.some(w => ['hoe', 'pull'].includes(getBestMethod(w)));
  if (!hasStarterCorrect) {
    const starterWeed = shuffle(weeds).find(w => ['hoe', 'pull'].includes(getBestMethod(w)));
    if (starterWeed) selection = [starterWeed, ...selection.slice(1)];
  }
  return selection.map((w, i) => ({
    id: `${w.id}-${i}`,
    weed: w,
    x: 12 + Math.random() * 76,
    y: 12 + Math.random() * 76,
  }));
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);
  const STARTING_MONEY = 150;
  const shop = usePracticeShop('ms-weed-control', STARTER_OWNED, STARTING_MONEY);
  const [earnedThisLevel, setEarnedThisLevel] = useState(0);
  const [showShop, setShowShop] = useState(false);

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

  useEffect(() => { setTimeLeft(d.seconds); }, [level, round]);

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
    if (!shop.owns(mId)) return;
    setMethodPick(mId);
    const best = getBestMethod(fw.weed);
    const correct = mId === best;
    if (correct) setScore(s => s + 1);
    const reward = correct ? REWARD_CORRECT : REWARD_WRONG;
    shop.earn(reward);
    setEarnedThisLevel(v => v + reward);
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
    setTimeLeft(d.seconds); setShowReview(false);
  };

  const nextRound = () => {
    if (round < ROUNDS_PER_LEVEL) { setRound(r => r + 1); resetRound(); }
  };
  const isLevelDone = round === ROUNDS_PER_LEVEL && showReview;
  const cheapestLocked = SHOP_CATALOG.filter(item => !shop.owns(item.id)).sort((a, b) => a.cost - b.cost)[0];
  const moneyBarMax = Math.max(cheapestLocked ? cheapestLocked.cost : 100, shop.money, 100);
  // Guaranteed level-completion stipend so no student can be stuck at $0.
  useEffect(() => {
    if (isLevelDone) {
      const BONUS = 100;
      shop.earn(BONUS);
      setEarnedThisLevel(v => v + BONUS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLevelDone]);
  const nextLevel = () => { setLevel(l => l + 1); setRound(1); setScore(0); setEarnedThisLevel(0); setShowShop(false); resetRound(); };
  const startOver = () => { setLevel(1); setRound(1); setScore(0); shop.reset(); setEarnedThisLevel(0); setShowShop(false); resetRound(); };

  if (showShop) {
    return (
      <BetweenLevelShop
        title="Weed-Control Shed"
        level={level}
        score={score}
        total={fieldWeeds.length * ROUNDS_PER_LEVEL}
        money={shop.money}
        owned={shop.owned}
        earnedThisLevel={earnedThisLevel}
        catalog={SHOP_CATALOG}
        onBuy={shop.buy}
        onContinue={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
        gradeLabel="6-8"
      />
    );
  }

  if (showReview) {
    const wrong = history.filter(r => !r.correct);
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
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
            <button onClick={() => setShowShop(true)} className="w-full max-w-md mx-auto py-3 rounded-lg bg-primary text-primary-foreground font-bold block">
              Visit Shop →
            </button>
          ) : (
            <button onClick={nextRound} className="w-full max-w-md mx-auto py-3 rounded-lg bg-primary text-primary-foreground font-bold block">Next Round</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <DollarSign className="w-3 h-3" />{shop.money}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">R{round}/{ROUNDS_PER_LEVEL}</span>
        <span className="text-sm font-bold text-foreground">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
      </div>

      {/* Persistent money HUD bar so students can watch their earnings climb */}
      <div className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border-b border-emerald-200/70 dark:border-emerald-900/70 flex items-center gap-3">
        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (shop.money / moneyBarMax) * 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-foreground flex-shrink-0">${shop.money}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden min-h-0">
        {/* LEFT: scrollable field grid — every weed stays visible and tappable */}
        <div className="relative overflow-y-auto min-h-0">
          <img src={fieldBg} alt="" aria-hidden className="fixed lg:absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          <div className="relative p-3 sm:p-4">
            <p className="text-xs font-bold text-white/90 mb-2 drop-shadow">
              Scout the field — tap a weed to identify and manage it ({fieldWeeds.length - done.length} left)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {fieldWeeds.map(f => (
                <button key={f.id} onClick={() => clickWeed(f.id)}
                  disabled={done.includes(f.id)}
                  className={`rounded-xl overflow-hidden border-2 bg-secondary shadow-lg transition-all ${
                    done.includes(f.id) ? 'opacity-30 border-white/40 cursor-not-allowed' : 'border-white/80 hover:border-primary hover:scale-[1.03]'
                  }`}>
                  <div className="w-full aspect-square">
                    <WeedImage weedId={f.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: methods + collection */}
        <div className="bg-card border-l border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Management Options</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_METHODS.map(m => {
                const owned = shop.owns(m.id);
                const shopEntry = SHOP_CATALOG.find(s => s.id === m.id);
                return (
                  <button key={m.id} onClick={() => identified && !methodPick && owned && pickMethod(m.id)}
                    disabled={!identified || !!methodPick || !owned}
                    className={`p-2 rounded-lg border-2 text-[11px] font-bold transition-all text-left flex items-center justify-between gap-1 ${
                      owned ? 'border-border bg-background text-foreground hover:border-primary'
                            : 'border-dashed border-border bg-background/50 text-muted-foreground'
                    } disabled:cursor-not-allowed`}>
                    <span>{m.label}</span>
                    {!owned && <span className="text-[9px] inline-flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />{shopEntry ? `$${shopEntry.cost}` : ''}</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground italic">Locked tools unlock in the shop between levels.</p>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Field Log ({history.length})</p>
            {history.length === 0 && <p className="text-xs text-muted-foreground italic">Managed weeds appear here.</p>}
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded border ${h.correct ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                  <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                    <WeedImage weedId={h.weedId.split('-')[0]} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{h.weedName}</p>
                    <p className={`text-[10px] truncate ${h.correct ? 'text-success' : 'text-destructive'}`}>
                      {ALL_METHODS.find(m => m.id === h.method)?.label} {h.correct ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected weed workspace — centered so the photo is always fully visible */}
      {current && fw && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-card border-2 border-border rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-64 flex-shrink-0 rounded-xl overflow-hidden bg-secondary border-2 border-border">
                <WeedImage weedId={fw.weed.id} stage="flower" className="w-full h-56 sm:h-64 object-contain bg-secondary" />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                {!identified ? (
                  <>
                    <p className="text-sm font-bold text-foreground">Identify this weed:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {idOptions.map(name => (
                        <button key={name} onClick={() => identify(name)}
                          className="p-2.5 rounded-lg border-2 border-border bg-background text-sm font-bold text-foreground hover:border-primary">
                          {name}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-foreground text-lg">{fw.weed.commonName}</p>
                    {!methodPick && (
                      <>
                        <p className="text-xs text-muted-foreground">Choose a control method you own:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {ALL_METHODS.map(m => {
                            const owned = shop.owns(m.id);
                            const shopEntry = SHOP_CATALOG.find(s => s.id === m.id);
                            return (
                              <button key={m.id} onClick={() => owned && pickMethod(m.id)} disabled={!owned}
                                className={`p-2 rounded-lg border-2 text-[11px] font-bold text-left flex items-center justify-between gap-1 ${
                                  owned ? 'border-border bg-background text-foreground hover:border-primary'
                                        : 'border-dashed border-border bg-background/50 text-muted-foreground cursor-not-allowed'
                                }`}>
                                <span>{m.label}</span>
                                {!owned && <span className="text-[9px] inline-flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />{shopEntry ? `$${shopEntry.cost}` : ''}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {methodPick && (() => {
                      const best = getBestMethod(fw.weed);
                      const isCorrect = methodPick === best;
                      return (
                        <div className={`rounded-lg p-3 ${isCorrect ? 'bg-success/10 border border-success/40' : 'bg-destructive/10 border border-destructive/40'}`}>
                          <p className={`font-extrabold text-sm ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                            {isCorrect ? 'Correct!' : 'Not quite'}
                          </p>
                          <p className={`text-xs mt-1 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                            {isCorrect
                              ? `${ALL_METHODS.find(m => m.id === best)?.label} works well here: ${fw.weed.management}`
                              : `Best option was ${ALL_METHODS.find(m => m.id === best)?.label} — ${fw.weed.management}. More weeds appeared!`}
                          </p>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingCoach grade="6-8" tip={`Match the method to the weed — perennials need different control than annuals.`} />
    </div>
  );
}
