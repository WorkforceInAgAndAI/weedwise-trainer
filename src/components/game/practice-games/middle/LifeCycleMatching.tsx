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

interface PhysicsObj {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function LifeCycleMatching({ onBack, gradeLabel = '6-8' }: { onBack: () => void, gradeLabel?: string }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);
  const totalRounds = Math.max(TOTAL_ROUNDS, Math.round(d.rounds / 3));

  const items = useMemo(() => pickRoundWeeds(level, round), [level, round]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [bouncedIds, setBouncedIds] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [physicsObjects, setPhysicsObjects] = useState<PhysicsObj[]>([]);
  const requestRef = useRef<number>();

  const unplacedWeeds = useMemo(() => items.filter(i => !placements[i.weed.id]), [items, placements]);

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPhysicsObjects(prev => 
        unplacedWeeds.map(w => {
          const existing = prev.find(p => p.id === w.weed.id);
          return existing || {
            id: w.weed.id,
            x: Math.random() * (clientWidth - 100),
            y: Math.random() * (clientHeight - 100),
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: 50,
          };
        })
      );
    }
  }, [unplacedWeeds]);

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      setPhysicsObjects(prev => {
        let next = prev.map(o => ({ ...o, x: o.x + o.vx, y: o.y + o.vy }));

        // Collision with walls
        next = next.map(o => {
          if (o.x < 0 || o.x + 100 > clientWidth) o.vx *= -1;
          if (o.y < 0 || o.y + 100 > clientHeight) o.vy *= -1;
          return {
            ...o,
            x: Math.max(0, Math.min(o.x, clientWidth - 100)),
            y: Math.max(0, Math.min(o.y, clientHeight - 100))
          };
        });

        // Collision with each other (simple)
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[i].x - next[j].x;
            const dy = next[i].y - next[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              const nx = dx / dist;
              const ny = dy / dist;
              next[i].vx += nx * 0.5;
              next[i].vy += ny * 0.5;
              next[j].vx -= nx * 0.5;
              next[j].vy -= ny * 0.5;
            }
          }
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const handleDrop = (cycle: string, id: string) => {
    if (checked) return;
    setPlacements(p => ({ ...p, [id]: cycle }));
  };

  const allPlaced = Object.keys(placements).length === items.length;
  const correctCount = items.filter(i => placements[i.weed.id] === i.correct).length;
  const done = round >= totalRounds;

  const handleCheck = () => {
    const wrong = items.filter(i => placements[i.weed.id] !== i.correct).map(i => i.weed.id);
    setChecked(true);
    if (wrong.length === 0) {
      // Logic for correct
    } else {
      setBouncedIds(wrong);
    }
  };

  const nextRound = () => {
    setTotalScore(s => s + items.length);
    setRound(r => r + 1);
    setPlacements({}); setChecked(false); setBouncedIds([]);
  };

  const restart = () => { setRound(0); setTotalScore(0); setPlacements({}); setChecked(false); setBouncedIds([]); };
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

  if (done) {
    const total = totalRounds * PER_ROUND;
    addBadge({ gameId: 'lifecycle-matching-68', gameName: 'Life Cycle Sort', level: '6-8', score: totalScore, total });
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">All Rounds Complete!</h2>
          <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gradeLabel="6-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-emerald-50/50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <h1 className="font-bold">Life Cycle Sort</h1>
        <button onClick={onBack}>← Back</button>
      </div>
      
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Floating Play Area */}
        <div ref={containerRef} className="flex-1 relative bg-white/50 rounded-xl overflow-hidden border-2 border-dashed border-emerald-200">
          {physicsObjects.map(obj => {
            const weed = items.find(i => i.weed.id === obj.id);
            if (!weed) return null;
            return (
              <div
                key={obj.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('weedId', obj.id)}
                className="absolute w-24 h-24 p-1 bg-white rounded shadow-lg cursor-grab"
                style={{ left: obj.x, top: obj.y }}
              >
                <WeedImage weedId={weed.weed.id} stage="flower" className="w-full h-full object-cover rounded" />
                <p className="text-[10px] text-center truncate">{weed.weed.commonName}</p>
              </div>
            );
          })}
        </div>

        {/* Zones */}
        <div className="h-40 grid grid-cols-3 gap-4">
          {CYCLES.map(cycle => (
            <div
              key={cycle}
              onDragOver={e => e.preventDefault()}
              onDrop={(e) => handleDrop(cycle, e.dataTransfer.getData('weedId'))}
              className="border-2 border-emerald-500 bg-emerald-100/50 rounded-xl flex flex-col items-center justify-center"
            >
              <h2 className="font-bold">{cycle}</h2>
              <div className="text-xs">{items.filter(i => placements[i.weed.id] === cycle).length} placed</div>
            </div>
          ))}
        </div>
        
        {allPlaced && !checked && <button onClick={handleCheck} className="bg-primary text-white p-4 rounded-xl">Check Answers</button>}
        {checked && correctCount === items.length && <button onClick={nextRound} className="bg-emerald-600 text-white p-4 rounded-xl">Next Round</button>}
      </div>
    </div>
  );
}
