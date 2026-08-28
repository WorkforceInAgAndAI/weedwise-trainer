import { useState } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import { DollarSign, Check, X, Info } from 'lucide-react';
import type { Weed } from '@/types/game';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const SEASONS = 3;
const START_BUDGET = 1000;
const REVENUE_PER_CORRECT = 150;
const METHOD_COST = 30;

const CONTROL_METHODS = [
  'Hand Pulling',
  'Hoeing',
  'Cultivation',
  'PRE Herbicide',
  'POST Herbicide',
  'Cover Cropping',
  'Mulching'
] as const;

type ControlMethod = typeof CONTROL_METHODS[number];

/** Maps a weed to its applicable control methods based on dataset keywords. */
function getCorrectMethods(weed: Weed): ControlMethod[] {
  const m = (weed.management || '').toLowerCase();
  const res: ControlMethod[] = [];

  if (m.includes('hand') || m.includes('pulling')) res.push('Hand Pulling');
  if (m.includes('hoeing') || m.includes('cutting') || m.includes('mowing') || m.includes('mechanical')) res.push('Hoeing');
  if (m.includes('cultivation') || m.includes('tillage') || m.includes('plowing')) res.push('Cultivation');
  if (m.includes('pre-emerg') || m.includes('pre ') || m.includes('pre-herbicide')) res.push('PRE Herbicide');
  if (m.includes('post-emerg') || m.includes('post ') || m.includes('post-herbicide') || m.includes('glyphosate')) res.push('POST Herbicide');
  if (m.includes('cover crop') || m.includes('competition') || m.includes('rotation')) res.push('Cover Cropping');
  if (m.includes('mulch') || m.includes('shade') || m.includes('shading')) res.push('Mulching');

  // Fallbacks if data is sparse
  if (res.length === 0) {
    res.push('Hand Pulling');
    res.push('Hoeing');
  }
  return Array.from(new Set(res));
}

/** Extra harvest bonus paid at the end of a season, based on control success. */
function seasonBonus(correct: number, total: number) {
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 0.9) return 250;
  if (rate >= 0.7) return 150;
  if (rate >= 0.5) return 75;
  return 0;
}

interface FieldWeed { id: string; weed: Weed; x: number; y: number }

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

function nextPopulation(population: number, controlled: number, survived: number) {
  return Math.max(2, Math.min(10, Math.round(population + survived * 1.5 - controlled * 2)));
}

interface Handled {
  id: string;
  weedName: string;
  weedId: string;
  selected: ControlMethod[];
  correctPicks: ControlMethod[];
  wrongPicks: ControlMethod[];
  missedPicks: ControlMethod[];
  survived: boolean;
  cost: number;
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const [season, setSeason] = useState(1);
  const [population, setPopulation] = useState(6);
  const [field, setField] = useState<FieldWeed[]>(() => buildField(6));
  const [budget, setBudget] = useState(START_BUDGET);
  const [current, setCurrent] = useState<string | null>(null);
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [selectedMethods, setSelectedMethods] = useState<ControlMethod[]>([]);
  const [handled, setHandled] = useState<Handled[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [totalCorrectWeeds, setTotalCorrectWeeds] = useState(0);
  const [income, setIncome] = useState(0);
  const [seasonBonusPaid, setSeasonBonusPaid] = useState(0);

  const fw = current ? field.find(f => f.id === current) : null;
  const remaining = field.filter(f => !handled.some(h => h.id === f.id));
  const seasonControlled = handled.filter(h => !h.survived).length;
  const seasonCorrectCount = handled.filter(h => h.missedPicks.length === 0 && h.wrongPicks.length === 0).length;

  const openWeed = (id: string) => {
    setCurrent(id);
    setStep('quiz');
    setSelectedMethods([]);
  };

  const toggleMethod = (m: ControlMethod) => {
    setSelectedMethods(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const submitQuiz = () => {
    if (!fw) return;
    const correct = getCorrectMethods(fw.weed);
    const correctPicks = selectedMethods.filter(m => correct.includes(m));
    const wrongPicks = selectedMethods.filter(m => !correct.includes(m));
    const missedPicks = correct.filter(m => !selectedMethods.includes(m));
    
    const cost = selectedMethods.length * METHOD_COST;
    // Survives if we missed any correct methods
    const survived = missedPicks.length > 0;
    
    if (!survived && wrongPicks.length === 0) {
      setTotalCorrectWeeds(c => c + 1);
    }

    setBudget(b => b - cost);
    setHandled(h => [...h, {
      id: fw.id,
      weedName: fw.weed.commonName,
      weedId: fw.weed.id,
      selected: selectedMethods,
      correctPicks,
      wrongPicks,
      missedPicks,
      survived,
      cost
    }]);
    setStep('result');
  };

  const closeWeed = () => { setCurrent(null); setStep('quiz'); setSelectedMethods([]); };

  const endSeason = () => {
    closeWeed();
    const bonus = seasonBonus(seasonCorrectCount, field.length);
    const earned = seasonCorrectCount * REVENUE_PER_CORRECT + bonus;
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
    setGameOver(false); setTotalCorrectWeeds(0); setIncome(0); setSeasonBonusPaid(0);
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
            <p className="text-3xl font-bold text-primary">{totalCorrectWeeds}</p>
            <p className="text-sm text-muted-foreground">weeds perfectly managed</p>
            <p className="text-sm text-foreground">Budget left: <strong>${budget}</strong></p>
            <p className="text-sm text-foreground">Final weed pressure: <strong>{population} weeds</strong></p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Managing weeds requires selecting the right methods while watching your budget. Missing methods allows weeds to survive, while picking unnecessary ones wastes money.
          </p>
          <button onClick={startOver} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="w-full py-3 rounded-lg border border-border text-foreground font-bold">Back to Practice</button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const nextPop = nextPopulation(population, seasonControlled, survivorCount);
    return (
      <div className={shell}>
        <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Season {season} Results</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
          <p className="text-lg font-bold text-foreground text-center">
            {seasonCorrectCount}/{field.length} weeds perfectly managed
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Crop revenue earned: <strong className="text-success">+${income}</strong>
            {seasonBonusPaid > 0 && <> (includes a <strong className="text-success">${seasonBonusPaid}</strong> harvest bonus)</>}
            {' '}· Budget: <strong>${budget}</strong>
          </p>
          <div className="bg-card border border-border rounded-xl p-3 text-sm text-foreground space-y-1 text-center">
            <p>Survivors building for next year: <strong>{survivorCount}</strong></p>
          </div>

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
              Scout the field — select a weed and choose all applicable management methods ({remaining.length} left)
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
            <p className="text-sm text-foreground">{seasonCorrectCount} perfect · {handled.filter(h => h.survived).length} survivors</p>
          </div>
          <div className="p-3 flex-1 lg:overflow-y-auto space-y-1.5">
            {handled.length === 0 && <p className="text-xs text-muted-foreground italic">Managed weeds appear here.</p>}
            {handled.map((h, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded border ${!h.survived && h.wrongPicks.length === 0 ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                <div className="w-9 h-9 rounded overflow-hidden bg-secondary flex-shrink-0">
                  <WeedImage weedId={h.weedId} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{h.weedName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {h.selected.length > 0 ? h.selected.join(', ') : 'No methods selected'}
                  </p>
                </div>
                {!h.survived && h.wrongPicks.length === 0 ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
              </div>
            ))}
          </div>
        </div>
      </div>

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

            {step === 'quiz' && (
              <div className="p-4 space-y-4">
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-1">
                  <p className="text-[11px] text-foreground font-bold">Scouting Evidence:</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{fw.weed.management}</p>
                </div>
                
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  Select all control methods that apply:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONTROL_METHODS.map(m => {
                    const isSelected = selectedMethods.includes(m);
                    return (
                      <button 
                        key={m} 
                        onClick={() => toggleMethod(m)}
                        className={`p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">{m}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Estimated Cost:</span>
                    <span className="text-sm font-bold text-primary">${selectedMethods.length * METHOD_COST}</span>
                  </div>
                  <button 
                    onClick={submitQuiz}
                    className="px-8 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-transform"
                  >
                    Implement Control
                  </button>
                </div>
              </div>
            )}

            {step === 'result' && (
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  {(() => {
                    const h = handled[handled.length - 1];
                    const correctSet = getCorrectMethods(fw.weed);
                    return (
                      <>
                        <div className={`p-3 rounded-lg border ${!h.survived && h.wrongPicks.length === 0 ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'}`}>
                          <p className="text-sm font-bold text-foreground mb-1">
                            {!h.survived && h.wrongPicks.length === 0 
                              ? 'Perfect management!' 
                              : h.survived 
                                ? 'Weeds survived treatment.' 
                                : 'Control successful, but costly.'}
                          </p>
                          <p className="text-xs text-foreground/80">
                            {h.survived ? 'You missed some critical control steps.' : 'All necessary control methods were implemented.'}
                            {h.wrongPicks.length > 0 && ' You also used unnecessary methods that drained your budget.'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Control Analysis</p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {CONTROL_METHODS.map(m => {
                              const wasSelected = h.selected.includes(m);
                              const isCorrect = correctSet.includes(m);
                              
                              if (!wasSelected && !isCorrect) return null;

                              let status: 'correct-hit' | 'wrong-hit' | 'missed' = 'correct-hit';
                              if (wasSelected && !isCorrect) status = 'wrong-hit';
                              if (!wasSelected && isCorrect) status = 'missed';

                              return (
                                <div key={m} className={`flex items-center justify-between p-2 rounded-md border ${
                                  status === 'wrong-hit' ? 'border-destructive/20 bg-destructive/5' : 'border-success/20 bg-success/5'
                                }`}>
                                  <span className={`text-sm font-medium ${
                                    status === 'wrong-hit' ? 'text-destructive line-through' : 'text-success'
                                  }`}>
                                    {m} {status === 'missed' && <span className="text-[10px] opacity-70 ml-1">(Missed)</span>}
                                  </span>
                                  {status === 'wrong-hit' ? <X className="w-4 h-4 text-destructive" /> : <Check className="w-4 h-4 text-success" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <button 
                  onClick={closeWeed} 
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-transform"
                >
                  Return to Field
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
