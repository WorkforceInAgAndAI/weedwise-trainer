import { useState, useMemo, useEffect } from 'react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import soybeanBg from '@/assets/images/soybean_field_1.jpg';
import { Target, Timer, AlertTriangle, Skull, HeartCrack } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import {
  HERBICIDE_MOA,
  getMiddleSchoolMOAs,
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

type Phase = 'scout' | 'review' | 'choose' | 'result';

interface WeedOutcome { item: FieldWeed; killed: boolean; groupUsed: number }

interface SeasonRecord {
  season: number;
  moa: HerbicideMOA;
  killed: number;
  damaged: number;
  total: number;
  repeated: boolean;
}

function buildField(season: number): FieldWeed[] {
  const pool = shuffle(weeds);
  const speciesCount = Math.min(pool.length, 5);
  const species = pool.slice(0, speciesCount);
  const items: FieldWeed[] = [];
  species.forEach((s) => {
    const cnt = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < cnt; i++) {
      items.push({
        id: `${s.id}-${season}-${items.length}`,
        weed: s,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
      });
    }
  });
  return items;
}

/** True if this MOA's group number is "listed" (effective, per curated data) for the weed. */
function isGroupListedForWeed(groupNum: number, weed: typeof weeds[0]): boolean {
  const top = getTopMOAsForWeed(weed);
  const listedGroups = top ? top.map((m) => m.group) : [HERBICIDE_MOA.find((m) => m.id === getBestMOAForWeed(weed))?.group];
  return listedGroups.includes(groupNum);
}

export default function HerbicideApplicator({ onBack }: { onBack: () => void }) {
  const { addBadge } = useGameProgress();
  const groupOptions = useMemo(() => getMiddleSchoolMOAs(), []);

  const [season, setSeason] = useState(1);
  const [phase, setPhase] = useState<Phase>('scout');
  const [field, setField] = useState<FieldWeed[]>(() => buildField(1));
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(SCOUT_SECONDS);
  const [chosenGroups, setChosenGroups] = useState<number[]>([]);
  const [outcomes, setOutcomes] = useState<WeedOutcome[]>([]);
  const [records, setRecords] = useState<SeasonRecord[]>([]);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  // Reset each season
  useEffect(() => {
    setField(buildField(season));
    setSelected([]);
    setTimeLeft(SCOUT_SECONDS);
    setPhase('scout');
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

  useEffect(() => {
    if (showComplete) {
      addBadge({ gameId: 'herbicide-applicator', gameName: 'Herbicide Applicator', level: 'MS', score, total: TOTAL_SEASONS * 10 });
    }
  }, [showComplete]);

  const toggleWeed = (id: string) => {
    if (phase !== 'scout') return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectedWeeds = field.filter((f) => selected.includes(f.id));
  const previousGroup = chosenGroups[chosenGroups.length - 1];

  const spray = (moa: HerbicideMOA) => {
    const isRepeat = previousGroup === moa.group;
    const results: WeedOutcome[] = selectedWeeds.map((item) => {
      const listed = isGroupListedForWeed(moa.group, item.weed);
      // Resistance penalty: repeated back-to-back group use downgrades roughly
      // half of what would otherwise be kills to only "damaged".
      const downgraded = isRepeat && listed && Math.random() < 0.5;
      return { item, killed: listed && !downgraded, groupUsed: moa.group };
    });
    const killed = results.filter((r) => r.killed).length;
    const damaged = results.length - killed;

    setOutcomes(results);
    setChosenGroups((g) => [...g, moa.group]);
    setRecords((r) => [...r, { season, moa, killed, damaged, total: results.length, repeated: isRepeat }]);
    setScore((s) => s + killed * 2 + damaged * 1);
    setPhase('result');
  };

  const nextSeason = () => {
    if (season < TOTAL_SEASONS) setSeason((s) => s + 1);
    else setShowComplete(true);
  };

  const restart = () => {
    setSeason(1);
    setRecords([]);
    setChosenGroups([]);
    setScore(0);
    setShowComplete(false);
  };

  if (showComplete) {
    return (
      <LevelComplete
        score={score}
        total={TOTAL_SEASONS * 10}
        onNext={restart}
        onBack={onBack}
        title="Fields Sprayed!"
        subtitle="3 seasons of scouting and spraying complete."
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Applicator</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Season {season}/{TOTAL_SEASONS}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground font-bold">Score {score}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] overflow-hidden">
        {/* LEFT: field */}
        <div className="relative overflow-hidden">
          <img src={soybeanBg} alt="Soybean field" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/15" />
          {phase === 'scout' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-lg shadow-lg">
              <Timer className="w-5 h-5" /> {timeLeft}s
            </div>
          )}
          {field.map((it) => {
            const isSelected = selected.includes(it.id);
            const outcome = outcomes.find((o) => o.item.id === it.id);
            return (
              <button key={it.id} onClick={() => toggleWeed(it.id)} disabled={phase !== 'scout'}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-lg ${
                  outcome
                    ? outcome.killed ? 'border-destructive opacity-30 grayscale' : 'border-amber-500'
                    : isSelected ? 'border-primary ring-2 ring-primary/40 scale-110' : 'border-white/80'
                }`}>
                  <WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" />
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: panel */}
        <div className="bg-card border-l border-border overflow-y-auto p-3 space-y-3">
          {phase === 'scout' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Scouting — Time is running out!</p>
              <p className="text-xs text-muted-foreground">Click every weed you can find before the timer hits zero.</p>
              <div className="p-3 rounded-lg border-2 border-primary/40 bg-primary/5 text-center">
                <p className="text-3xl font-black text-primary">{selected.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Weeds Flagged</p>
              </div>
            </>
          )}

          {phase === 'review' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Scouting Report</p>
              <p className="text-xs text-muted-foreground">Here's every weed you flagged this season.</p>
              <div className="bg-background border border-border rounded-lg p-2 max-h-72 overflow-y-auto">
                {selectedWeeds.length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">You didn't flag any weeds in time!</p>
                )}
                <div className="space-y-1">
                  {selectedWeeds.map((it) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden bg-secondary flex-shrink-0">
                        <WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-foreground flex-1 truncate">{it.weed.commonName}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setPhase('choose')} disabled={selectedWeeds.length === 0}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
                Choose a Herbicide →
              </button>
            </>
          )}

          {phase === 'choose' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Pick ONE Mode of Action to Spray</p>
              <p className="text-xs text-muted-foreground">Every flagged weed in the field gets this one herbicide group.</p>
              {previousGroup !== undefined && (
                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Spraying Group {previousGroup} again will risk selecting for resistance.
                </div>
              )}
              <div className="space-y-2">
                {groupOptions.map((m) => (
                  <button key={m.id} onClick={() => spray(m)}
                    className="w-full p-2.5 rounded-lg border-2 border-border bg-background hover:border-primary text-left">
                    <span className="text-xs font-bold text-foreground">{m.moa} (Group {m.group})</span>
                    <span className="text-[10px] text-muted-foreground block">e.g. {m.brands[0]}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'result' && records.length > 0 && (() => {
            const last = records[records.length - 1];
            return (
              <>
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Season {last.season} Results</p>
                {last.repeated && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-destructive/10 border border-destructive/40 text-[11px] text-destructive font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Repeated Group {last.moa.group} applications are selecting for herbicide resistance in this field.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg border-2 border-destructive/50 bg-destructive/10 text-center">
                    <Skull className="w-4 h-4 mx-auto text-destructive" />
                    <p className="text-xl font-black text-foreground">{last.killed}</p>
                    <p className="text-[10px] text-muted-foreground">Killed</p>
                  </div>
                  <div className="p-2 rounded-lg border-2 border-amber-500/50 bg-amber-500/10 text-center">
                    <HeartCrack className="w-4 h-4 mx-auto text-amber-600" />
                    <p className="text-xl font-black text-foreground">{last.damaged}</p>
                    <p className="text-[10px] text-muted-foreground">Only Damaged</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Sprayed: {last.moa.moa} (Group {last.moa.group})</p>
                <div className="bg-background border border-border rounded-lg p-2 max-h-56 overflow-y-auto">
                  <p className="text-[11px] font-bold text-foreground mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Per-Weed Breakdown</p>
                  <div className="space-y-1">
                    {outcomes.map((o) => (
                      <div key={o.item.id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded overflow-hidden bg-secondary flex-shrink-0">
                          <WeedImage weedId={o.item.weed.id} stage="flower" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] text-foreground flex-1 truncate">{o.item.weed.commonName}</span>
                        <span className={`text-[10px] font-bold ${o.killed ? 'text-destructive' : 'text-amber-600'}`}>
                          {o.killed ? 'Killed' : 'Damaged'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={nextSeason} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  {season < TOTAL_SEASONS ? 'Next Season →' : 'Finish →'}
                </button>
              </>
            );
          })()}

          {records.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Season History</p>
              <div className="space-y-1">
                {records.map((r, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground flex justify-between">
                    <span>S{r.season}: {r.moa.moa} (Group {r.moa.group}){r.repeated ? ' ⚠' : ''}</span>
                    <span className="font-bold text-foreground">{r.killed} killed / {r.damaged} damaged</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingCoach grade="6-8" tip="Scout fast, spray smart — and never spray the same mode of action two seasons in a row or resistance builds up." />
    </div>
  );
}
