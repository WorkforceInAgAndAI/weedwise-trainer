import { useState, useMemo, useEffect } from 'react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import soybeanBg from '@/assets/images/soybean_field_1.jpg';
import { Target, Timer, AlertTriangle, Skull, HeartCrack, Info, ArrowRight, PlusCircle } from 'lucide-react';
import {
  HERBICIDE_MOA,
  getMiddleSchoolMOAs,
  getPostMOAs,
  getTopMOAsForWeed,
  getBestMOAForWeed,
  type HerbicideMOA,
} from '@/data/herbicides';
import FloatingCoach from '@/components/game/FloatingCoach';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface FieldWeed { id: string; weed: typeof weeds[0]; x: number; y: number }

const TOTAL_SEASONS = 3;
const SCOUT_SECONDS = 10;

type Phase = 'scout' | 'review' | 'choose' | 'result' | 'choose_second' | 'result_second';

interface SeasonRecord {
  season: number;
  moa?: HerbicideMOA;
  method?: string;
  killed: number;
  damaged: number;
  total: number;
  repeated: boolean;
  message?: string;
}

function buildField(season: number, densityFactor: number = 1): FieldWeed[] {
  const pool = shuffle(weeds);
  const speciesCount = Math.min(pool.length, 5);
  const species = pool.slice(0, speciesCount);
  const items: FieldWeed[] = [];
  species.forEach((s) => {
    const baseCnt = 3 + Math.floor(Math.random() * 3);
    const cnt = Math.max(1, Math.round(baseCnt * densityFactor));
    for (let i = 0; i < cnt; i++) {
      items.push({
        id: `${s.id}-${season}-${items.length}-${Math.random()}`,
        weed: s,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
      });
    }
  });
  return items;
}

function isGroupListedForWeed(groupNum: number, weed: typeof weeds[0]): boolean {
  const top = getTopMOAsForWeed(weed);
  const listedGroups = top ? top.map((m) => m.group) : [HERBICIDE_MOA.find((m) => m.id === getBestMOAForWeed(weed))?.group];
  return listedGroups.includes(groupNum);
}

interface ManagementOption {
  id: string;
  name: string;
  description: string;
}

const SECONDARY_METHODS: ManagementOption[] = [
  { id: 'cultivate', name: 'Cultivate', description: 'Mechanical tillage to bury seedlings.' },
  { id: 'mow', name: 'Mow', description: 'Cuts down tall weeds before seed set.' },
  { id: 'hand_pull', name: 'Hand Pull', description: 'Manual removal of survivors.' },
  { id: 'pre_herbicide', name: 'PRE Herbicide', description: 'Residual soil herbicide for emerging weeds.' },
  { id: 'cover_crop', name: 'Cover Crop', description: 'Crop competition to suppress growth.' },
  { id: 'post_herbicide', name: 'POST Herbicide', description: 'Second herbicide application (different MOA).' },
];

export default function HerbicideApplicator({ 
  onBack, 
  variant = 'middle' 
}: { 
  onBack: () => void;
  variant?: 'middle' | 'high';
}) {
  const groupOptions = useMemo(() => variant === 'high' ? getPostMOAs() : getMiddleSchoolMOAs(), [variant]);

  const [season, setSeason] = useState(1);
  const [phase, setPhase] = useState<Phase>('scout');
  const [field, setField] = useState<FieldWeed[]>(() => buildField(1));
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(SCOUT_SECONDS);
  const [chosenGroups, setChosenGroups] = useState<number[]>([]);
  const [outcomes, setOutcomes] = useState<{ id: string; killed: boolean; damaged: boolean }[]>([]);
  const [records, setRecords] = useState<SeasonRecord[]>([]);
  const [score, setScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [usedSecondMethod, setUsedSecondMethod] = useState(false);
  const [methodIndex, setMethodIndex] = useState(0); // 0 = first, 1 = second

  // Initialize total possible for season 1
  useEffect(() => {
    if (season === 1) {
      setMaxPossibleScore(field.length * 2);
    }
  }, []);

  // Reset each season
  useEffect(() => {
    if (season > 1) {
      // High school variant evolves the field population
      if (variant === 'high') {
        const survivors = field.filter(f => !outcomes.find(o => o.id === f.id && o.killed));
        // Reproduction factor: if 2nd method used, lower growth
        const factor = usedSecondMethod ? 1.2 : 2.5;
        const reproduced: FieldWeed[] = [];
        survivors.forEach(s => {
          reproduced.push({ ...s, id: `${s.id}-survivor` });
          if (Math.random() < (factor - 1)) {
             reproduced.push({ ...s, id: `${s.id}-offspring-${Math.random()}`, x: Math.min(92, Math.max(8, s.x + (Math.random() - 0.5) * 10)), y: Math.min(92, Math.max(8, s.y + (Math.random() - 0.5) * 10)) });
          }
        });
        // New emergence
        const newWeeds = buildField(season, usedSecondMethod ? 0.5 : 1.2);
        const nextField = [...reproduced, ...newWeeds].slice(0, 40); // Cap at 40 for UI
        setField(nextField);
        setMaxPossibleScore(prev => prev + nextField.length * 2);
      } else {
        const nextField = buildField(season);
        setField(nextField);
        setMaxPossibleScore(prev => prev + nextField.length * 2);
      }
      setSelected([]);
      setOutcomes([]);
      setTimeLeft(SCOUT_SECONDS);
      setMethodIndex(0);
      setUsedSecondMethod(false);
      setPhase('scout');
    }
  }, [season]);

  // Scouting countdown
  useEffect(() => {
    if (phase !== 'scout') return;
    if (timeLeft <= 0) {
      setPhase('review');
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const toggleWeed = (id: string) => {
    if (phase !== 'scout') return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectedWeeds = field.filter((f) => selected.includes(f.id));
  const previousGroup = chosenGroups[chosenGroups.length - 1];

  const spray = (moa: HerbicideMOA) => {
    const isRepeat = previousGroup === moa.group;
    const targets = methodIndex === 0 ? selectedWeeds : field.filter(f => !outcomes.find(o => o.id === f.id && o.killed));
    
    const results = targets.map((item) => {
      const listed = isGroupListedForWeed(moa.group, item.weed);
      // Resistance penalty: repeated back-to-back group use downgrades
      const downgraded = isRepeat && listed && Math.random() < 0.6;
      return { id: item.id, killed: listed && !downgraded, damaged: listed && downgraded };
    });

    const killed = results.filter((r) => r.killed).length;
    const damaged = results.filter((r) => r.damaged).length;

    setOutcomes(prev => [...prev, ...results]);
    setChosenGroups((g) => [...g, moa.group]);
    setRecords((r) => [...r, { 
      season, 
      moa, 
      killed, 
      damaged, 
      total: targets.length, 
      repeated: isRepeat 
    }]);
    
    setScore((s) => s + killed * 2 + damaged * 1);
    setPhase(methodIndex === 0 ? 'result' : 'result_second');
  };

  const applySecondMethod = (opt: ManagementOption) => {
    if (opt.id === 'post_herbicide') {
      setMethodIndex(1);
      setPhase('choose');
      return;
    }

    const survivors = field.filter(f => !outcomes.find(o => o.id === f.id && o.killed));
    let killedIds: string[] = [];
    let message = "";

    switch(opt.id) {
      case 'cultivate':
        killedIds = survivors.filter(w => w.weed.lifeCycle.includes('Annual')).map(w => w.id);
        message = "Cultivation uprooted small annual seedlings across the field.";
        break;
      case 'mow':
        killedIds = survivors.filter(w => w.weed.plantType === 'Dicot').map(w => w.id);
        message = "Mowing cut down tall broadleaf weeds, stopping seed production.";
        break;
      case 'hand_pull':
        killedIds = shuffle(survivors).slice(0, Math.floor(survivors.length * 0.7)).map(w => w.id);
        message = "Hand pulling removed most remaining large weeds.";
        break;
      case 'pre_herbicide':
        killedIds = survivors.filter(w => w.weed.lifeCycle.includes('Annual')).map(w => w.id);
        message = "PRE herbicide residual layer controlled emerging annuals.";
        break;
      case 'cover_crop':
        killedIds = shuffle(survivors).slice(0, Math.floor(survivors.length * 0.4)).map(w => w.id);
        message = "Cover crop competition suppressed some of the remaining weed growth.";
        break;
    }

    const newResults = killedIds.map(id => ({ id, killed: true, damaged: false }));
    setOutcomes(prev => [...prev, ...newResults]);
    setUsedSecondMethod(true);
    setRecords((r) => [...r, { 
      season, 
      method: opt.name,
      killed: newResults.length, 
      damaged: 0, 
      total: survivors.length, 
      repeated: false,
      message
    }]);
    setScore(s => s + newResults.length * 2);
    setPhase('result_second');
  };

  const nextSeason = () => {
    if (season < TOTAL_SEASONS) setSeason((s) => s + 1);
    else setShowComplete(true);
  };

  const restart = () => {
    const firstField = buildField(1);
    setSeason(1);
    setRecords([]);
    setChosenGroups([]);
    setScore(0);
    setField(firstField);
    setMaxPossibleScore(firstField.length * 2);
    setShowComplete(false);
    setOutcomes([]);
    setMethodIndex(0);
    setUsedSecondMethod(false);
  };

  if (showComplete) {
    return (
      <LevelComplete
        level={variant === 'high' ? 2 : 1}
        score={score}
        total={maxPossibleScore}
        onNextLevel={restart}
        onStartOver={restart}
        onBack={onBack}
        title={variant === 'high' ? "Sustainable Farm Managed!" : "Fields Sprayed!"}
        gameId="herbicide-applicator"
        gameName="Herbicide Applicator"
        gradeLabel={variant === 'high' ? "9-12" : "6-8"}
      />
    );
  }

  const lastRecord = records[records.length - 1];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Applicator</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold tracking-tight">Season {season}/{TOTAL_SEASONS}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground font-bold tabular-nums">Score {score}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
        {/* LEFT: field */}
        <div className="relative overflow-hidden bg-emerald-900">
          <img src={soybeanBg} alt="Soybean field" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/10" />
          
          {phase === 'scout' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-lg shadow-xl animate-pulse">
              <Timer className="w-5 h-5" /> {timeLeft}s
            </div>
          )}

          {field.map((it) => {
            const isSelected = selected.includes(it.id);
            const outcome = outcomes.find((o) => o.id === it.id);
            return (
              <button key={it.id} onClick={() => toggleWeed(it.id)} disabled={phase !== 'scout'}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-lg transition-transform ${
                  outcome
                    ? outcome.killed 
                      ? 'border-destructive opacity-0 scale-75' 
                      : 'border-amber-500 scale-90'
                    : isSelected ? 'border-primary ring-2 ring-primary/40 scale-110' : 'border-white/80'
                }`}>
                  <WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" />
                </div>
                {outcome?.damaged && (
                   <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5">
                     <HeartCrack className="w-3 h-3" />
                   </div>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT: panel */}
        <div className="bg-card border-l border-border overflow-y-auto p-4 flex flex-col gap-4">
          {phase === 'scout' && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Phase: Scouting</p>
                <h2 className="text-lg font-bold text-foreground leading-tight">Identify the weeds in your field.</h2>
                <p className="text-sm text-muted-foreground mt-1">Tap every weed you find before the timer runs out. Undetected weeds will not be sprayed!</p>
              </div>
              <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
                <p className="text-4xl font-black text-primary tabular-nums">{selected.length}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Weeds Flagged</p>
              </div>
            </>
          )}

          {phase === 'review' && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Scouting Report</p>
                <h2 className="text-lg font-bold text-foreground">Season {season} Targets</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You identified {selected.length} weeds. {field.length - selected.length} weeds were missed and will remain in the field.
                </p>
              </div>
              <div className="bg-background border border-border rounded-xl p-3 flex-1 overflow-y-auto">
                {selectedWeeds.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-8">No weeds were flagged.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {Array.from(new Set(selectedWeeds.map(w => w.weed.id))).map(id => {
                      const weed = selectedWeeds.find(w => w.weed.id === id)!.weed;
                      const count = selectedWeeds.filter(w => w.weed.id === id).length;
                      return (
                        <div key={id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-background">
                            <WeedImage weedId={id} stage="flower" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{weed.commonName}</p>
                            <p className="text-[10px] text-muted-foreground">{count} found</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button onClick={() => setPhase('choose')} disabled={selectedWeeds.length === 0}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                Pick Treatment →
              </button>
            </>
          )}

          {phase === 'choose' && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">
                  {methodIndex === 0 ? "First Application" : "Second Application"}
                </p>
                <h2 className="text-lg font-bold text-foreground">Select Herbicide MOA</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a Group number. Effectiveness depends on the weed species.
                </p>
              </div>
              
              {previousGroup !== undefined && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Resistance Warning</span>
                    Group {previousGroup} was used recently. Repeating it increases resistance risk.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {groupOptions.map((m) => (
                  <button key={m.id} onClick={() => spray(m)}
                    className="w-full p-3 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 text-left transition-colors group">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{m.moa}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-foreground font-bold">Group {m.group}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 italic">Example: {m.brands[0]}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'result' && lastRecord && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Application Results</p>
                <h2 className="text-lg font-bold text-foreground">Season {season} - Sprayed Group {lastRecord.moa?.group}</h2>
              </div>

              {lastRecord.repeated && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive font-bold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  Resistance selection occurred! Some weeds survived despite correct MOA.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border-2 border-destructive/30 bg-destructive/5 text-center">
                  <Skull className="w-6 h-6 mx-auto text-destructive mb-1" />
                  <p className="text-2xl font-black text-foreground tabular-nums">{lastRecord.killed}</p>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Killed</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 text-center">
                  <HeartCrack className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                  <p className="text-2xl font-black text-foreground tabular-nums">{lastRecord.damaged}</p>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Damaged</p>
                </div>
              </div>

              {variant === 'high' ? (
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={() => setPhase('choose_second')}
                    className="w-full py-3 rounded-xl bg-secondary text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Another Control Method
                  </button>
                  <button onClick={nextSeason}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    Finish Season <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={nextSeason}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 mt-auto">
                  {season < TOTAL_SEASONS ? 'Next Season' : 'See Final Results'} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {phase === 'choose_second' && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Integrated Management</p>
                <h2 className="text-lg font-bold text-foreground">Secondary Control Method</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick an additional way to manage the remaining weeds. This reduces next year's population growth.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 overflow-y-auto">
                {SECONDARY_METHODS.map((opt) => (
                  <button key={opt.id} onClick={() => applySecondMethod(opt)}
                    className="w-full p-3 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 text-left transition-colors">
                    <span className="text-xs font-bold text-foreground block">{opt.name}</span>
                    <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">{opt.description}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'result_second' && lastRecord && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Secondary Results</p>
                <h2 className="text-lg font-bold text-foreground">{lastRecord.method || "Second Herbicide"}</h2>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-800 dark:text-emerald-300 italic">
                "{lastRecord.message || `Effective control achieved with ${lastRecord.moa?.moa}.`}"
              </div>

              <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 text-center">
                <Skull className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                <p className="text-2xl font-black text-foreground tabular-nums">{lastRecord.killed}</p>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Additional Kills</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>By using multiple management tactics, you have reduced the weed seeds that will germinate next season.</p>
              </div>

              <button onClick={nextSeason}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 mt-auto">
                {season < TOTAL_SEASONS ? 'Next Season' : 'See Final Results'} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {records.length > 0 && (
            <div className="mt-auto border-t border-border pt-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">History</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {records.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] p-2 rounded bg-secondary/20">
                    <span className="font-medium">S{r.season}: {r.method || `G${r.moa?.group}`}</span>
                    <span className="font-bold text-primary">{r.killed} K · {r.damaged} D</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingCoach 
        grade={variant === 'high' ? '9-12' : '6-8'} 
        tip={variant === 'high' 
          ? "Combine chemical and mechanical controls for the best long-term results. Relying on one MOA will lead to resistant populations."
          : "Scout fast, spray smart — and never spray the same mode of action two seasons in a row or resistance builds up."
        } 
      />
    </div>
  );
}
