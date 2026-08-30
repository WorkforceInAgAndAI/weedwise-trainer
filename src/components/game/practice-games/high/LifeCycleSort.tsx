import { useState, useMemo, useEffect, useRef } from 'react';
import { collegiateWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { Snowflake, Sun, RefreshCw, Calendar, Play } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import { getDifficulty, levelSlice } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CATEGORIES = [
 { id: 'winter-annual', label: 'Winter Annual', Icon: Snowflake, desc: 'Germinates fall, overwinters, seeds spring' },
 { id: 'summer-annual', label: 'Summer Annual', Icon: Sun, desc: 'Germinates spring, seeds summer/fall' },
 { id: 'biennial', label: 'Biennial', Icon: Calendar, desc: '2-year life cycle' },
 { id: 'perennial', label: 'Perennial', Icon: RefreshCw, desc: 'Lives 3+ years' },
];

const WINTER_ANNUALS = ['wild-oat'];
const SUMMER_ANNUALS = ['waterhemp', 'palmer-amaranth', 'giant-foxtail', 'green-foxtail', 'yellow-foxtail', 'lambsquarters', 'large-crabgrass', 'barnyardgrass', 'morningglory', 'kochia', 'velvetleaf', 'giant-ragweed'];

function getCategory(w: typeof weeds[0]): string {
 if (WINTER_ANNUALS.includes(w.id)) return 'winter-annual';
 if (w.lifeCycle.toLowerCase().includes('annual') || SUMMER_ANNUALS.includes(w.id)) return 'summer-annual';
 if (w.lifeCycle.toLowerCase().includes('biennial')) return 'biennial';
 return 'perennial';
}

const ROUNDS_PER_LEVEL = 2;
const CARD_W = 108;
const CARD_H = 132;

function itemsPerRound(level: number) {
 return Math.min(10, 7 + Math.floor((level - 1) / 2));
}

function buildRound(level: number, round: number) {
 const count = itemsPerRound(level);
 const pool = levelSlice(shuffle(weeds), level * 100 + round, count);
 return pool.map((w, i) => ({ weed: w, correct: getCategory(w), key: `${w.id}-${i}` }));
}

type Status = 'falling' | 'dragging' | 'correct' | 'missed';

interface Sprite {
 key: string;
 weed: typeof weeds[0];
 correct: string;
 x: number; // px, left position (fixed at spawn, container-relative)
 y: number; // px, top position (container-relative)
 status: Status;
 resolvedAt: number; // timestamp when correct/missed was set, for fade-out
}

export default function LifeCycleSort({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(0);
 const [totalScore, setTotalScore] = useState(0);
 const { addBadge } = useGameProgress();

 const d = useMemo(() => getDifficulty(level, 'hs'), [level]);
 const items = useMemo(() => buildRound(level, round), [level, round]);

 const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
 const [roundScore, setRoundScore] = useState(0);
 const [missedItems, setMissedItems] = useState<{ weed: typeof weeds[0]; correct: string }[]>([]);
 const [reviewIdx, setReviewIdx] = useState(0);
 const [reviewing, setReviewing] = useState(false);
 const [message, setMessage] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

 const containerRef = useRef<HTMLDivElement>(null);
 const binRefs = useRef<Record<string, HTMLDivElement | null>>({});
 const spritesRef = useRef<Sprite[]>([]);
 const [, forceTick] = useState(0);
 const rafRef = useRef<number | null>(null);
 const lastRef = useRef(0);
 const scoreRef = useRef(0);
 const missedRef = useRef<{ weed: typeof weeds[0]; correct: string }[]>([]);
 const resolvedCountRef = useRef(0);

 const dragKeyRef = useRef<string | null>(null);
 const dragPointerIdRef = useRef<number | null>(null);
 const dragPosRef = useRef<{ x: number; y: number } | null>(null);

 const fallSpeed = 70 * Math.min(1.6, d.speed); // steady fall, ramps with level

 const done = round >= ROUNDS_PER_LEVEL;

 function beginRound() {
  const container = containerRef.current;
  const width = container ? container.clientWidth : 600;
  const slots = items.length;
  const usableW = Math.max(1, width - CARD_W);
  spritesRef.current = items.map((it, i) => {
   const base = slots > 1 ? (usableW * i) / (slots - 1) : usableW / 2;
   const jitter = (Math.random() - 0.5) * Math.min(40, usableW / slots);
   return {
    key: it.key,
    weed: it.weed,
    correct: it.correct,
    x: Math.max(0, Math.min(usableW, base + jitter)),
    y: -(CARD_H + i * 160 + Math.random() * 60),
    status: 'falling' as Status,
    resolvedAt: 0,
   };
  });
  scoreRef.current = 0;
  missedRef.current = [];
  resolvedCountRef.current = 0;
  setRoundScore(0);
  setMissedItems([]);
  setMessage(null);
  dragKeyRef.current = null;
  dragPointerIdRef.current = null;
  dragPosRef.current = null;
  setPhase('playing');
  lastRef.current = performance.now();
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  rafRef.current = requestAnimationFrame(loop);
 }

 function loop() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastRef.current) / 1000);
  lastRef.current = now;
  const container = containerRef.current;
  const groundY = container ? container.clientHeight - CARD_H : 500;

  for (const s of spritesRef.current) {
   if (s.status !== 'falling') continue;
   s.y += fallSpeed * dt;
   if (s.y >= groundY) {
    // Hit the soil line — bounce back to the top and fall again.
    const width = container ? container.clientWidth : 600;
    s.y = -(CARD_H + Math.random() * 80);
    s.x = Math.max(0, Math.min(Math.max(1, width - CARD_W), Math.random() * Math.max(1, width - CARD_W)));
   }
  }

  // Drag follows pointer
  if (dragKeyRef.current && dragPosRef.current && container) {
   const rect = container.getBoundingClientRect();
   const s = spritesRef.current.find(sp => sp.key === dragKeyRef.current);
   if (s) {
    // Allow the card to travel past the field edges so it can be dropped on a bin.
    s.x = Math.max(-CARD_W / 2, Math.min(rect.width - CARD_W / 2, dragPosRef.current.x - rect.left - CARD_W / 2));
    s.y = Math.max(-CARD_H / 2, Math.min(rect.height + 400, dragPosRef.current.y - rect.top - CARD_H / 2));
   }
  }

  forceTick(t => (t + 1) % 1000000);

  if (resolvedCountRef.current >= items.length) {
   setPhase('roundEnd');
   setRoundScore(scoreRef.current);
   setMissedItems(missedRef.current);
   return;
  }

  rafRef.current = requestAnimationFrame(loop);
 }

 useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

 useEffect(() => {
  function onMove(e: PointerEvent) {
   if (dragKeyRef.current == null) return;
   if (dragPointerIdRef.current != null && e.pointerId !== dragPointerIdRef.current) return;
   dragPosRef.current = { x: e.clientX, y: e.clientY };
  }
  function onUp(e: PointerEvent) {
   if (dragKeyRef.current == null) return;
   if (dragPointerIdRef.current != null && e.pointerId !== dragPointerIdRef.current) return;
   releaseDrag(e.clientX, e.clientY);
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  return () => {
   window.removeEventListener('pointermove', onMove);
   window.removeEventListener('pointerup', onUp);
   window.removeEventListener('pointercancel', onUp);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 function startDrag(key: string, e: React.PointerEvent) {
  if (phase !== 'playing') return;
  const s = spritesRef.current.find(sp => sp.key === key);
  if (!s || s.status !== 'falling') return;
  e.preventDefault();
  s.status = 'dragging';
  dragKeyRef.current = key;
  dragPointerIdRef.current = e.pointerId;
  dragPosRef.current = { x: e.clientX, y: e.clientY };
 }

 function binUnder(clientX: number, clientY: number): string | null {
  for (const c of CATEGORIES) {
   const el = binRefs.current[c.id];
   if (!el) continue;
   const r = el.getBoundingClientRect();
   if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return c.id;
  }
  return null;
 }

 function releaseDrag(clientX: number, clientY: number) {
  const key = dragKeyRef.current;
  dragKeyRef.current = null;
  dragPointerIdRef.current = null;
  dragPosRef.current = null;
  if (!key) return;
  const s = spritesRef.current.find(sp => sp.key === key);
  if (!s) return;

  const bin = binUnder(clientX, clientY);
  if (bin && bin === s.correct) {
   s.status = 'correct';
   s.resolvedAt = performance.now();
   scoreRef.current += 1;
   resolvedCountRef.current += 1;
   setMessage({ tone: 'good', text: `${s.weed.commonName} — correct! It's a ${CATEGORIES.find(c => c.id === bin)?.label}.` });
  } else if (bin) {
   // wrong bin — bounces back and keeps falling
   s.status = 'falling';
   setMessage({ tone: 'bad', text: `Not quite — ${s.weed.commonName} keeps falling. Check its life cycle again.` });
  } else {
   // dropped in open space, resumes falling from current spot
   s.status = 'falling';
  }
 }

 const nextRound = () => { setRound(r => r + 1); setPhase('ready'); };
 const restart = () => { setRound(0); setTotalScore(0); setPhase('ready'); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 // Commit round score into total once, when round ends
 const committedRef = useRef(-1);
 useEffect(() => {
  if (phase === 'roundEnd' && committedRef.current !== round) {
   committedRef.current = round;
   setTotalScore(s => s + scoreRef.current);
  }
 }, [phase, round]);

 if (done) {
  const total = ROUNDS_PER_LEVEL * itemsPerRound(level);
  addBadge({ gameId: 'hs-lifecycle', gameName: 'Life Cycle Sort', level: 'HS', score: totalScore, total });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Level {level} Complete</h2>
    <p className="text-lg text-foreground mb-6">{totalScore}/{total} correct</p>
    <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 if (phase === 'roundEnd' && reviewing && missedItems.length > 0) {
  const item = missedItems[reviewIdx];
  const correctCat = CATEGORIES.find(c => c.id === item.correct);
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="font-bold text-lg text-foreground mb-4">Review: {reviewIdx + 1}/{missedItems.length}</h2>
    <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary mb-3">
     <WeedImage weedId={item.weed.id} stage="flower" className="w-full h-full object-cover" />
    </div>
    <p className="font-bold text-foreground text-lg mb-1">{item.weed.commonName}</p>
    <p className="text-xs text-muted-foreground italic mb-2">{item.weed.scientificName}</p>
    <p className="px-3 py-1 rounded bg-destructive/20 text-destructive text-sm font-bold mb-2">Missed — it reached the ground</p>
    <p className="px-3 py-1 rounded bg-green-500/20 text-green-700 text-sm font-bold mb-2">Correct bin: {correctCat?.label}</p>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">Life cycle: {item.weed.lifeCycle}</p>
    <button onClick={() => {
     if (reviewIdx + 1 < missedItems.length) setReviewIdx(i => i + 1);
     else setReviewing(false);
    }} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
     {reviewIdx + 1 < missedItems.length ? 'Next' : 'Continue'}
    </button>
   </div>
  );
 }

 if (phase === 'roundEnd' && !reviewing) {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Round {round + 1} Complete</h2>
    <p className="text-lg text-foreground mb-6">{roundScore}/{items.length} correct</p>
    {missedItems.length > 0 ? (
     <button onClick={() => { setReviewIdx(0); setReviewing(true); }} className="px-8 py-3 rounded-lg bg-secondary text-foreground font-bold mb-3">
      Review {missedItems.length} missed
     </button>
    ) : null}
    <button onClick={nextRound} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
     {round + 1 < ROUNDS_PER_LEVEL ? 'Next Round' : 'Finish Level'}
    </button>
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
    <h1 className="font-display font-bold text-lg text-foreground">Life Cycle Sort</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">Round {round + 1}/{ROUNDS_PER_LEVEL}</span>
   </div>

   <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col p-4 min-h-0">
    <p className="text-sm text-muted-foreground text-center mb-2">
     Weeds fall slowly from the top — drag each one into its correct life-cycle bin before it hits the ground.
    </p>

    {message && (
     <p className={`text-center text-xs font-bold mb-2 ${message.tone === 'good' ? 'text-green-600' : 'text-destructive'}`}>
      {message.text}
     </p>
    )}

    <div
     ref={containerRef}
     className="relative flex-1 min-h-[360px] rounded-xl border-2 border-border bg-secondary/20 overflow-hidden touch-none"
    >
     {phase === 'ready' && (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
       <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
        <h2 className="text-xl font-bold text-foreground mb-2">Round {round + 1}</h2>
        <p className="text-sm text-muted-foreground mb-4">
         Drag each falling weed into its correct life-cycle bin. Wrong bin: it bounces back out and keeps falling.
         Reach the soil line: it bounces back to the top and keeps falling.
        </p>
        <button onClick={beginRound}
         className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:opacity-90">
         <Play className="w-4 h-4" /> Start Round
        </button>
       </div>
      </div>
     )}

     {phase === 'playing' && spritesRef.current.map(s => {
      if (s.status === 'correct' && performance.now() - s.resolvedAt > 350) return null;
      if (s.status === 'missed' && performance.now() - s.resolvedAt > 600) return null;
      const fading = s.status === 'correct' || s.status === 'missed';
      return (
       <div
        key={s.key}
        onPointerDown={e => startDrag(s.key, e)}
        className={`absolute select-none flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 bg-card shadow-md transition-opacity duration-300 ${
         s.status === 'dragging' ? 'z-40 cursor-grabbing border-primary scale-105' :
         s.status === 'correct' ? 'border-green-500 opacity-0' :
         s.status === 'missed' ? 'border-destructive opacity-0' :
         'border-border cursor-grab'
        }`}
        style={{
         left: s.x,
         top: s.y,
         width: CARD_W,
         height: CARD_H,
         transitionProperty: fading ? 'opacity' : 'none',
        }}
       >
        <div className="w-full flex-1 rounded overflow-hidden bg-muted">
         <WeedImage weedId={s.weed.id} stage="flower" className="w-full h-full object-cover" />
        </div>
        <span className="text-[10px] font-bold text-foreground text-center leading-tight truncate w-full">{s.weed.commonName}</span>
       </div>
      );
     })}
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
     {CATEGORIES.map(c => {
      const CatIcon = c.Icon;
      return (
       <div key={c.id}
        ref={el => { binRefs.current[c.id] = el; }}
        className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${dragKeyRef.current ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
       >
        <CatIcon className="w-6 h-6 mx-auto mb-1 text-foreground" />
        <p className="text-xs font-bold text-foreground">{c.label}</p>
        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
       </div>
      );
     })}
    </div>
   </div>
  </div>
 );
}
