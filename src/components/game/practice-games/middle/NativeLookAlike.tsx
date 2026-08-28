import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { getDifficulty } from '@/lib/difficulty';
import { WEED_ARRIVAL_KNOWLEDGE } from '@/data/weedKnowledge';
import { Lightbulb, Timer } from 'lucide-react';

/**
 * Native or Introduced? — weeds drift down the screen and the student drags
 * each one into the Native bin or the Introduced bin. A weed dropped in the
 * wrong bin bounces back out into the air with a hint so it can be re-sorted.
 */

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const GROUP_SIZE = 10;
type Zone = 'native' | 'introduced';
type Weed = typeof weeds[0];

function buildHint(weed: Weed): string {
  if (weed.origin === 'Native') {
    const habitat = (weed.primaryHabitat || weed.habitat || '').toLowerCase();
    if (habitat.includes('wet')) {
      return `${weed.commonName} is Native — it belongs in North American wetlands and wet field edges.`;
    }
    if (habitat.includes('warm-season') || habitat.includes('full sun') || habitat.includes('dry')) {
      return `${weed.commonName} is Native — it evolved in sunny North American prairies and open ground.`;
    }
    if (habitat.includes('cool-season')) {
      return `${weed.commonName} is Native — it grows in cooler North American fields and roadsides.`;
    }
    return `${weed.commonName} is Native — it has lived in North America for thousands of years, not brought from another continent.`;
  }

  const knowledge = WEED_ARRIVAL_KNOWLEDGE[weed.id];
  if (knowledge) {
    const continentNames: Record<string, string> = {
      europe: 'Europe',
      asia: 'Asia',
      africa: 'Africa',
      americas: 'the Americas',
      mediterranean: 'the Mediterranean',
    };
    return `${weed.commonName} is Introduced — it originally came from ${continentNames[knowledge.continent] || 'another continent'} and then spread into Midwest fields.`;
  }
  return `${weed.commonName} is Introduced — it traveled here from another continent and then spread into farms and roadsides.`;
}

function buildGroup(level: number, groupSize = GROUP_SIZE): Weed[] {
  const natives = shuffle(weeds.filter(w => w.origin === 'Native'));
  const intros = shuffle(weeds.filter(w => w.origin === 'Introduced'));
  const nCount = Math.min(Math.round(groupSize / 2), natives.length);
  const iCount = Math.min(groupSize - nCount, intros.length);
  const offsetN = ((level - 1) * Math.round(groupSize / 2)) % Math.max(1, natives.length);
  const offsetI = ((level - 1) * Math.round(groupSize / 2)) % Math.max(1, intros.length);
  const pickN = [...natives.slice(offsetN), ...natives.slice(0, offsetN)].slice(0, nCount);
  const pickI = [...intros.slice(offsetI), ...intros.slice(0, offsetI)].slice(0, iCount);
  return shuffle([...pickN, ...pickI]);
}

interface Faller {
  key: string;
  weed: Weed;
  x: number;      // % of play area width (centre)
  y: number;      // % of play area height (centre)
  vy: number;     // % per second
  bouncing: boolean;
  bounceVx: number;
  isMissed?: boolean;
}

const CARD_W = 108;
const CARD_H = 132;

export default function NativeLookAlike({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);
  const groupSize = Math.max(GROUP_SIZE, d.rounds);
  const group = useMemo(() => buildGroup(level, groupSize), [level, groupSize]);

  const [queue, setQueue] = useState<Weed[]>([]);
  const [fallers, setFallers] = useState<Faller[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ zone: Zone; ok: boolean } | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const areaRef = useRef<HTMLDivElement>(null);
  const nativeBinRef = useRef<HTMLDivElement>(null);
  const introBinRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);

  const fallSpeed = 5.5 + level * 0.9;            // % of height per second
  const spawnEvery = Math.max(700, 1600 - level * 100);

  const reset = useCallback(() => {
    setQueue(buildGroup(level, groupSize));
    setFallers([]);
    setScore(0);
    setCorrectCount(0);
    setResolved(0);
    setHint(null);
    setDragKey(null);
    setDone(false);
    setTimeLeft(60);
    spawnRef.current = 0;
  }, [level, groupSize]);

  useEffect(() => { setQueue(group); }, [group]);

  // Timer loop
  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [done]);

  // Animation + spawn loop
  useEffect(() => {
    if (done) return;
    const step = (t: number) => {
      const dt = lastRef.current ? Math.min(0.05, (t - lastRef.current) / 1000) : 0;
      lastRef.current = t;

      // spawn
      spawnRef.current += dt * 1000;
      if (spawnRef.current >= spawnEvery) {
        spawnRef.current = 0;
        setQueue(q => {
          let currentQueue = q;
          if (currentQueue.length === 0) {
            currentQueue = shuffle(group);
          }
          const [next, ...rest] = currentQueue;
          setFallers(f => f.filter(x => !x.isMissed).length >= 6 ? f : [...f, {
            key: `${next.id}-${Date.now()}`,
            weed: next,
            x: 18 + Math.random() * 64,
            y: -12,
            vy: fallSpeed,
            bouncing: false,
            bounceVx: 0,
          }]);
          return rest;
        });
      }

      setFallers(prev => {
        const survivors: Faller[] = [];
        let missedNow = 0;
        prev.forEach(f => {
          if (f.key === dragKey) { survivors.push(f); return; }
          
          let { x, y, bouncing, bounceVx, vy, isMissed } = f;
          
          if (isMissed) {
            y += vy * dt;
            x += bounceVx * dt;
            vy += 120 * dt; // Gravity
            if (y > 120 || y < -50 || x < -20 || x > 120) return; // Discard
          } else if (bouncing) {
            x += bounceVx * dt;
            y += vy * dt * 0.6;
            if (x < 6 || x > 94) bounceVx = -bounceVx;
            if (y > -2) bouncing = y < 12 ? true : false;
          } else {
            y += vy * dt;
          }

          if (y > 98 && !isMissed) {
            isMissed = true;
            vy = -fallSpeed * 1.5;
            bounceVx = (Math.random() - 0.5) * 60;
            missedNow++;
          }
          
          survivors.push({ ...f, x, y, bouncing, bounceVx, vy, isMissed });
        });
        
        if (missedNow) {
          setScore(s => Math.max(0, s - 5));
          setResolved(r => r + missedNow);
        }
        return survivors;
      });

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [done, dragKey, fallSpeed, spawnEvery, group]);

  const pointerToPct = (clientX: number, clientY: number) => {
    const el = areaRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };

  const onPointerDown = (key: string) => (e: React.PointerEvent) => {
    const faller = fallers.find(f => f.key === key);
    if (!faller || faller.isMissed) return;
    
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragKey(key);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragKey) return;
    const p = pointerToPct(e.clientX, e.clientY);
    if (!p) return;
    setFallers(prev => prev.map(f => f.key === dragKey
      ? { ...f, x: Math.max(6, Math.min(94, p.x)), y: Math.max(-5, Math.min(100, p.y)), bouncing: false }
      : f));
  };

  const binUnderPointer = (clientX: number, clientY: number): Zone | null => {
    const hit = (el: HTMLDivElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    };
    if (hit(nativeBinRef.current)) return 'native';
    if (hit(introBinRef.current)) return 'introduced';
    return null;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragKey) return;
    const key = dragKey;
    setDragKey(null);
    const zone = binUnderPointer(e.clientX, e.clientY);
    if (!zone) return;                       // released in open air — keep falling
    const target = fallers.find(f => f.key === key);
    if (!target) return;
    const ok = zone === (target.weed.origin === 'Native' ? 'native' : 'introduced');
    setFlash({ zone, ok });
    window.setTimeout(() => setFlash(null), 600);
    if (ok) {
      setFallers(prev => prev.filter(f => f.key !== key));
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      setResolved(r => r + 1);
      setHint(null);
    } else {
      // Wrong bin — the weed bounces back out into the air with a hint.
      setHint(buildHint(target.weed));
      setFallers(prev => prev.map(f => f.key === key
        ? { ...f, y: 8, x: zone === 'native' ? 30 : 70, bouncing: true, bounceVx: zone === 'native' ? 26 : -26 }
        : f));
    }
  };

  const nextLevel = () => { setLevel(l => l + 1); reset(); };
  const startOver = () => { setLevel(1); reset(); };

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={resolved * 10}
        onNextLevel={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
        gradeLabel="6-8"
        title={`Native or Introduced? Lv.${level}`}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-900 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <div className="flex-1">
          <h1 className="font-bold text-foreground text-lg">Native or Introduced?</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {timeLeft}s
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-primary">{score} pts</div>
          <div className="text-[10px] text-muted-foreground">{correctCount} sorted</div>
        </div>
      </div>

      {hint && (
        <div className="flex items-start gap-2 mx-4 mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 animate-scale-in">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-foreground font-medium">{hint}</p>
        </div>
      )}

      <div
        ref={areaRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative flex-1 m-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900 bg-white/40 dark:bg-slate-900/40 overflow-hidden touch-none select-none"
      >
        <p className="absolute top-2 left-0 right-0 text-center text-xs text-muted-foreground pointer-events-none">
          Drag falling weeds into bins. Correct: +10, Missed: -5.
        </p>

        {fallers.map(f => (
          <div
            key={f.key}
            onPointerDown={onPointerDown(f.key)}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: CARD_W,
              height: CARD_H,
              transform: `translate(-50%,-50%) ${f.isMissed ? `rotate(${f.y * 2}deg)` : ''}`,
              touchAction: 'none',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
            className={`absolute rounded-xl border-2 shadow-lg overflow-hidden transition-transform duration-75 ${
              f.isMissed 
                ? 'border-destructive bg-destructive/20 z-0 pointer-events-none' 
                : dragKey === f.key 
                  ? 'border-primary ring-4 ring-primary/30 z-20 bg-card cursor-grabbing' 
                  : 'border-border bg-card cursor-grab active:cursor-grabbing z-10'
            }`}
          >
            <div className={`h-[86px] pointer-events-none ${f.isMissed ? 'grayscale opacity-50' : 'bg-secondary'}`}>
              <WeedImage weedId={f.weed.id} stage="flower" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] font-bold text-foreground leading-tight text-center px-1 py-1 pointer-events-none">
              {f.weed.commonName}
            </p>
          </div>
        ))}

        {/* Bins */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-3 p-3">
          <div
            ref={nativeBinRef}
            className={`rounded-xl border-4 border-dashed p-3 h-24 flex flex-col items-center justify-center transition-colors ${
              flash?.zone === 'native'
                ? flash.ok ? 'border-green-500 bg-green-500/25' : 'border-destructive bg-destructive/25'
                : 'border-green-600/60 bg-green-600/10'
            }`}
          >
            <p className="font-extrabold text-foreground">NATIVE</p>
            <p className="text-[11px] text-muted-foreground text-center">North America</p>
          </div>
          <div
            ref={introBinRef}
            className={`rounded-xl border-4 border-dashed p-3 h-24 flex flex-col items-center justify-center transition-colors ${
              flash?.zone === 'introduced'
                ? flash.ok ? 'border-green-500 bg-green-500/25' : 'border-destructive bg-destructive/25'
                : 'border-amber-600/60 bg-amber-600/10'
            }`}
          >
            <p className="font-extrabold text-foreground text-center">INTRODUCED</p>
            <p className="text-[11px] text-muted-foreground text-center">Other Continents</p>
          </div>
        </div>
      </div>

      <FloatingCoach grade="6-8" tip="Correct sorts give +10 points! Don't let them reach the bottom or you'll lose 5 points." />
    </div>
  );
}
