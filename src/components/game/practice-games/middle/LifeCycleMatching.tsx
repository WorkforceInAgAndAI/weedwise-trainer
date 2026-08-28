import { useState, useMemo, useEffect, useRef } from 'react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { getDifficulty } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CYCLES = ['Annual', 'Biennial', 'Perennial'] as const;

function getCycleType(w: typeof weeds[0]): string {
  const lc = w.lifeCycle.toLowerCase();
  if (lc.includes('biennial')) return 'Biennial';
  if (lc.includes('perennial')) return 'Perennial';
  return 'Annual';
}

const TOTAL_ROUNDS = 4;
const PER_ROUND = 9;

function pickRoundWeeds(level: number, roundNum: number) {
  const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
  weeds.forEach(w => byType[getCycleType(w)].push(w));
  const offset = (level - 1) * 12 + roundNum * 3;
  const picks: { weed: typeof weeds[0]; correct: string }[] = [];
  for (const type of CYCLES) {
    const pool = byType[type];
    if (pool.length === 0) continue;
    const start = offset % pool.length;
    const rotated = [...pool.slice(start), ...pool.slice(0, start)];
    shuffle(rotated).slice(0, 3).forEach(w => picks.push({ weed: w, correct: type }));
  }
  return shuffle(picks).slice(0, PER_ROUND);
}

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: string;
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function LifeCycleMatching({ onBack, gradeLabel = '6-8' }: Props) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);
  const totalRounds = Math.max(TOTAL_ROUNDS, Math.round(d.rounds / 3));

  const items = useMemo(() => pickRoundWeeds(level, round), [level, round]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [bouncedIds, setBouncedIds] = useState<string[]>([]);
  const [farmerMsg, setFarmerMsg] = useState<{ tone: 'intro' | 'correct' | 'wrong' | 'cheer'; text: string }>(
    { tone: 'intro', text: `Sort each weed into its life-cycle type: Summer annuals germinate in spring and die before winter. Winter annuals germinate in the fall, flower the next spring, and die before summer. Biennials live two years — leafy rosette year one, flower & seed year two. Perennials live three or more years, regrowing from roots, rhizomes, or crowns every season.` }
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [physicsObjects, setPhysicsObjects] = useState<PhysicsState[]>([]);
  const physicsRef = useRef<PhysicsState[]>([]);
  const requestRef = useRef<number>();

  const unplaced = items.filter(i => !placements[i.weed.id]);
  const allPlaced = Object.keys(placements).length === items.length;
  const correctCount = items.filter(i => placements[i.weed.id] === i.correct).length;
  const done = round >= totalRounds;

  // Sync physics objects when unplaced weeds change
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const cardWidth = 140;
    const cardHeight = 160;

    const currentIds = new Set(unplaced.map(u => u.weed.id));
    
    // Filter out removed weeds and add new ones
    const nextPhysics = physicsRef.current.filter(p => currentIds.has(p.id));
    const existingIds = new Set(nextPhysics.map(p => p.id));

    unplaced.forEach(u => {
      if (!existingIds.has(u.weed.id)) {
        nextPhysics.push({
          id: u.weed.id,
          x: Math.random() * (clientWidth - cardWidth),
          y: Math.random() * (clientHeight - cardHeight),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      }
    });

    physicsRef.current = nextPhysics;
    setPhysicsObjects([...nextPhysics]);
  }, [unplaced.length]); // Only re-sync when count changes to avoid jitter

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const { clientWidth, clientHeight } = containerRef.current;
      const cardWidth = 140;
      const cardHeight = 160;
      const radius = 70; // Approximation for circular collision

      const next = physicsRef.current.map(o => ({
        ...o,
        x: o.x + o.vx,
        y: o.y + o.vy
      }));

      // Wall collisions
      for (const o of next) {
        if (o.x < 0) { o.x = 0; o.vx *= -1; }
        if (o.x + cardWidth > clientWidth) { o.x = clientWidth - cardWidth; o.vx *= -1; }
        if (o.y < 0) { o.y = 0; o.vy *= -1; }
        if (o.y + cardHeight > clientHeight) { o.y = clientHeight - cardHeight; o.vy *= -1; }
      }

      // Card collisions (Circular elastic)
      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const dx = (next[i].x + cardWidth/2) - (next[j].x + cardWidth/2);
          const dy = (next[i].y + cardHeight/2) - (next[j].y + cardHeight/2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = radius * 2;

          if (distance < minDistance) {
            // Collision detected - swap velocities roughly
            const angle = Math.atan2(dy, dx);
            const targetX = next[j].x + cardWidth/2 + Math.cos(angle) * minDistance;
            const targetY = next[j].y + cardHeight/2 + Math.sin(angle) * minDistance;
            
            const ax = (targetX - (next[i].x + cardWidth/2)) * 0.1;
            const ay = (targetY - (next[i].y + cardHeight/2)) * 0.1;

            next[i].vx += ax;
            next[i].vy += ay;
            next[j].vx -= ax;
            next[j].vy -= ay;

            // Dampen to prevent explosion
            next[i].vx *= 0.99;
            next[i].vy *= 0.99;
            next[j].vx *= 0.99;
            next[j].vy *= 0.99;
          }
        }
      }

      physicsRef.current = next;
      setPhysicsObjects(next);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const handleDrop = (cycle: string) => {
    const id = draggedId || selected;
    if (!id || checked) return;
    setPlacements(p => ({ ...p, [id]: cycle }));
    setSelected(null);
    setDraggedId(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
  };

  const nextRound = () => {
    setTotalScore(s => s + items.length);
    setRound(r => r + 1);
    setPlacements({}); setSelected(null); setChecked(false); setDraggedId(null); setBouncedIds([]);
    setFarmerMsg({ tone: 'intro', text: `New round, harder set — keep watching for biennials. They look like annuals year one, then bolt year two.` });
  };

  const restart = () => {
    setRound(0); setTotalScore(0); setPlacements({}); setSelected(null); setChecked(false); setDraggedId(null); setBouncedIds([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  useEffect(() => {
    if (bouncedIds.length === 0) return;
    const t = setTimeout(() => {
      setPlacements(p => { const n = { ...p }; bouncedIds.forEach(id => delete n[id]); return n; });
      setChecked(false);
      setBouncedIds([]);
    }, 700);
    return () => clearTimeout(t);
  }, [bouncedIds]);

  const handleCheck = () => {
    const wrong = items.filter(i => placements[i.weed.id] !== i.correct).map(i => i.weed.id);
    setChecked(true);
    if (wrong.length === 0) {
      setFarmerMsg({ tone: 'correct', text: `All ${items.length} sorted correctly. Onto the next round.` });
    } else {
      const example = items.find(i => i.weed.id === wrong[0]);
      setFarmerMsg({
        tone: 'wrong',
        text: `${wrong.length} popped back out — wrong bin. Hint: ${example?.weed.commonName} (${example?.weed.scientificName}) is a ${example?.correct.toLowerCase()}. Re-sort the highlighted ones.`,
      });
      setBouncedIds(wrong);
    }
  };

  if (done) {
    const total = totalRounds * PER_ROUND;
    addBadge({ gameId: 'lifecycle-matching-68', gameName: 'Life Cycle Sort', level: '6-8', score: totalScore, total });
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">All Rounds Complete!</h2>
          <p className="text-muted-foreground mb-6">You sorted {totalScore} / {total} weeds correctly across {totalRounds} rounds!</p>
          <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gradeLabel="6-8" />
        </div>
      </div>
    );
  }

  const allCorrect = checked && bouncedIds.length === 0 && correctCount === items.length;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Sort</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{totalRounds}</span>
      </div>

      <div className="flex-1 overflow-hidden p-4 flex flex-col">
        <FarmerGuide gradeLabel={gradeLabel} tone={farmerMsg.tone} message={farmerMsg.text} className="mb-4 max-w-3xl mx-auto shrink-0" />

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Drop Zones */}
          <div className="space-y-4 flex flex-col overflow-y-auto pr-2">
            {CYCLES.map(cycle => {
              const placed = items.filter(i => placements[i.weed.id] === cycle);
              return (
                <div
                  key={cycle}
                  onClick={() => handleDrop(cycle)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(cycle)}
                  className={`rounded-xl border-2 p-4 min-h-[160px] transition-all flex flex-col ${
                    (selected || draggedId) ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-base font-bold text-foreground">{cycle}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono">{placed.length}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-tight">
                    {cycle === 'Annual' && 'Germinates, flowers, sets seed, dies in 1 year'}
                    {cycle === 'Biennial' && 'Vegetative year 1 → bolts and flowers year 2'}
                    {cycle === 'Perennial' && 'Lives 3+ years from rhizomes, tubers, or crowns'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {placed.map(i => {
                      const isWrong = checked && i.correct !== cycle;
                      const isRight = checked && i.correct === cycle;
                      const isBouncing = bouncedIds.includes(i.weed.id);
                      return (
                        <div
                          key={i.weed.id}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-500 ${
                            isBouncing ? 'opacity-0 -translate-y-12 scale-50 border-destructive' :
                            isWrong ? 'border-destructive bg-destructive/10' :
                            isRight ? 'border-green-500 bg-green-500/10' :
                            'border-border bg-secondary shadow-sm'
                          }`}
                        >
                          <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                            <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-medium text-foreground max-w-[70px] text-center truncate">{i.weed.commonName}</span>
                          {!checked && (
                            <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-[9px] text-muted-foreground hover:text-destructive underline decoration-dotted">remove</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="mt-auto pt-4 space-y-3">
              {allPlaced && !checked && (
                <button onClick={handleCheck} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">Check Answers</button>
              )}
              {allCorrect && (
                <button onClick={nextRound} className="w-full py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all">
                  {round + 1 < totalRounds ? `Start Round ${round + 2} →` : 'Complete Level'}
                </button>
              )}
            </div>
          </div>

          {/* Physics Play Area */}
          <div className="relative flex flex-col h-full min-h-[400px] border-2 border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-inner">
            <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent">
               <div className="w-full h-full border-2 border-dashed border-emerald-500/10 rounded-xl" />
            </div>
            
            <div className="p-3 border-b border-emerald-100 dark:border-emerald-800 flex justify-between items-center bg-white/40 dark:bg-slate-800/40">
               <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Floating Seeds ({unplaced.length})</span>
               <span className="text-[10px] text-muted-foreground italic">Drag & drop into a zone</span>
            </div>

            <div ref={containerRef} className="flex-1 relative overflow-hidden">
              {unplaced.length === 0 && !checked && !allCorrect && (
                <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                  <p className="text-sm text-muted-foreground italic bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    All weeds are in zones. Click "Check Answers" to see how you did!
                  </p>
                </div>
              )}
              
              {physicsObjects.map(obj => {
                const item = items.find(i => i.weed.id === obj.id);
                if (!item) return null;
                const isSelected = selected === obj.id;
                
                return (
                  <div
                    key={obj.id}
                    draggable
                    onDragStart={() => setDraggedId(obj.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onClick={() => setSelected(isSelected ? null : obj.id)}
                    className={`absolute w-[140px] bg-card border-2 rounded-xl shadow-xl cursor-grab active:cursor-grabbing overflow-hidden transition-shadow duration-300 ${
                      isSelected ? 'border-primary ring-4 ring-primary/20 scale-105 z-10' : 'border-border hover:border-emerald-400'
                    }`}
                    style={{ 
                      transform: `translate(${obj.x}px, ${obj.y}px)`,
                      transition: isSelected ? 'transform 0.1s ease-out, border-color 0.2s, box-shadow 0.2s' : 'none'
                    }}
                  >
                    <div className="w-full aspect-square bg-muted relative">
                      <WeedImage weedId={item.weed.id} stage="flower" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[11px] font-bold text-white leading-tight truncate">{item.weed.commonName}</p>
                        <p className="text-[9px] italic text-emerald-200 leading-tight truncate">{item.weed.scientificName}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
