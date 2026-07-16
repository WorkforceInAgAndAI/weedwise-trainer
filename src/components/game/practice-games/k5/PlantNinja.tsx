import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Swords, AlertTriangle, Play, Zap } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';
import { elementaryWeeds } from '@/data/gradeWeeds';

// -------- Plant Ninja (K-5 Explorer) --------------------------------------
// Fruit-Ninja style: weeds fall from the top. Slice REPRODUCTIVE (flowering)
// weeds to earn points — they've made seeds, so stopping them helps the
// farmer! Do NOT slice SEEDLING weeds (baby plants) — a good ninja spares
// the young. If a reproductive weed lands without being sliced, it EXPLODES
// into a cloud of seeds — showing why you have to catch weeds before they
// finish reproducing.
// -------------------------------------------------------------------------

const AREA_W = 640;
const AREA_H = 520;
const WEED_SIZE = 96;
const HIT_RADIUS = 52;
const ROUND_SECONDS = 35;
const ROUNDS_PER_LEVEL = 3;
const BASE_SPAWN_MS = 950;
const BASE_FALL = 90; // px/sec

interface FallingWeed {
  id: number;
  weedId: string;
  kind: 'seedling' | 'repro';
  x: number; y: number; vy: number;
  rot: number; vr: number;
  sliced: boolean;
  slicedAt: number;
  exploded: boolean;
}

interface SeedParticle {
  id: number;
  weedId: string;
  x: number; y: number;
  vx: number; vy: number;
  rot: number; vr: number;
  life: number; // seconds remaining
  born: number;
}

interface FloatingText {
  id: number;
  x: number; y: number;
  text: string;
  color: string;
  life: number;
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function PlantNinja({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [misses, setMisses] = useState(0);

  const weedsRef = useRef<FallingWeed[]>([]);
  const seedsRef = useRef<SeedParticle[]>([]);
  const floatsRef = useRef<FloatingText[]>([]);
  const trailRef = useRef<{ x: number; y: number; born: number }[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const endRef = useRef<number>(0);
  const phaseRef = useRef<'ready' | 'playing' | 'roundEnd'>('ready');
  const scoreRef = useRef(0);
  const missRef = useRef(0);
  const pointerActiveRef = useRef(false);

  const [, forceTick] = useState(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  function beginRound() {
    weedsRef.current = [];
    seedsRef.current = [];
    floatsRef.current = [];
    trailRef.current = [];
    scoreRef.current = 0;
    missRef.current = 0;
    setScore(0);
    setMisses(0);
    setTimeLeft(ROUND_SECONDS);
    phaseRef.current = 'playing';
    setPhase('playing');
    lastRef.current = performance.now();
    spawnRef.current = performance.now();
    endRef.current = performance.now() + ROUND_SECONDS * 1000;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }

  function loop() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastRef.current) / 1000);
    lastRef.current = now;

    // update weeds
    for (const w of weedsRef.current) {
      if (w.sliced) {
        w.vy += 500 * dt; // gravity after slice
        w.y += w.vy * dt;
      } else {
        w.y += w.vy * dt;
      }
      w.rot += w.vr * dt;
    }

    // check misses (reproductive weeds hitting the ground)
    for (const w of weedsRef.current) {
      if (!w.sliced && !w.exploded && w.y > AREA_H - 40) {
        w.exploded = true;
        if (w.kind === 'repro') {
          missRef.current += 1;
          setMisses(missRef.current);
          // explode into seed particles
          for (let i = 0; i < 14; i++) {
            const a = (Math.random() * Math.PI) - Math.PI; // upward hemisphere
            const spd = 220 + Math.random() * 260;
            seedsRef.current.push({
              id: ++idRef.current,
              weedId: w.weedId,
              x: w.x, y: AREA_H - 30,
              vx: Math.cos(a) * spd,
              vy: Math.sin(a) * spd,
              rot: Math.random() * 360,
              vr: (Math.random() - 0.5) * 400,
              life: 1.6, born: now,
            });
          }
          floatsRef.current.push({
            id: ++idRef.current, x: w.x, y: AREA_H - 60,
            text: 'SEEDED!', color: '#dc2626', life: 1.0,
          });
        }
      }
    }

    // update seed particles
    for (const s of seedsRef.current) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 520 * dt;
      s.rot += s.vr * dt;
      s.life -= dt;
    }
    seedsRef.current = seedsRef.current.filter(s => s.life > 0 && s.y < AREA_H + 60);

    // floats
    for (const f of floatsRef.current) { f.y -= 50 * dt; f.life -= dt; }
    floatsRef.current = floatsRef.current.filter(f => f.life > 0);

    // prune weeds that have fallen off screen well after being exploded/sliced
    weedsRef.current = weedsRef.current.filter(w => w.y < AREA_H + 220);

    // trail
    trailRef.current = trailRef.current.filter(t => now - t.born < 220);

    // spawn
    const spawnInterval = Math.max(500, BASE_SPAWN_MS - (level - 1) * 120);
    if (now - spawnRef.current > spawnInterval) {
      spawnRef.current = now;
      const weed = elementaryWeeds[Math.floor(Math.random() * elementaryWeeds.length)];
      // ~65% reproductive so there are plenty to slice
      const kind: 'seedling' | 'repro' = Math.random() < 0.65 ? 'repro' : 'seedling';
      const speedMult = 1 + (level - 1) * 0.18;
      weedsRef.current.push({
        id: ++idRef.current,
        weedId: weed.id,
        kind,
        x: 60 + Math.random() * (AREA_W - 120),
        y: -WEED_SIZE,
        vy: (BASE_FALL + Math.random() * 55) * speedMult,
        rot: (Math.random() - 0.5) * 20,
        vr: (Math.random() - 0.5) * 30,
        sliced: false, slicedAt: 0, exploded: false,
      });
    }

    const remaining = Math.max(0, (endRef.current - now) / 1000);
    setTimeLeft(remaining);
    forceTick(x => (x + 1) % 1000000);

    if (remaining <= 0 && seedsRef.current.length === 0 && weedsRef.current.every(w => w.sliced || w.exploded)) {
      phaseRef.current = 'roundEnd';
      setPhase('roundEnd');
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  }

  function toAreaCoords(clientX: number, clientY: number) {
    const rect = areaRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * AREA_W,
      y: ((clientY - rect.top) / rect.height) * AREA_H,
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (phaseRef.current !== 'playing') return;
    pointerActiveRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    tryHit(e.clientX, e.clientY);
  }
  function handlePointerUp(e: React.PointerEvent) {
    pointerActiveRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (phaseRef.current !== 'playing') return;
    if (!pointerActiveRef.current) return;
    tryHit(e.clientX, e.clientY);
  }

  function tryHit(clientX: number, clientY: number) {
    const { x, y } = toAreaCoords(clientX, clientY);
    trailRef.current.push({ x, y, born: performance.now() });
    if (trailRef.current.length > 24) trailRef.current.shift();
    for (const w of weedsRef.current) {
      if (w.sliced) continue;
      const dx = x - w.x, dy = y - (w.y + WEED_SIZE / 2);
      if (dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS) {
        w.sliced = true;
        w.slicedAt = performance.now();
        w.vy = -220;
        w.vr = (Math.random() - 0.5) * 600;
        if (w.kind === 'repro') {
          scoreRef.current += 10;
          floatsRef.current.push({ id: ++idRef.current, x: w.x, y: w.y, text: '+10', color: '#16a34a', life: 0.9 });
        } else {
          scoreRef.current -= 5;
          floatsRef.current.push({ id: ++idRef.current, x: w.x, y: w.y, text: '-5 BABY!', color: '#dc2626', life: 1.0 });
        }
        setScore(scoreRef.current);
      }
    }
  }

  function commitRoundAndAdvance() {
    const gained = Math.max(0, scoreRef.current);
    const possible = ROUND_SECONDS * 2; // rough max target (kids won't hit ceiling)
    const nextTotalScore = totalScore + gained;
    const nextTotalPossible = totalPossible + possible;
    if (round + 1 >= ROUNDS_PER_LEVEL) {
      setTotalScore(nextTotalScore); setTotalPossible(nextTotalPossible);
      setDone(true); return;
    }
    setTotalScore(nextTotalScore); setTotalPossible(nextTotalPossible);
    setRound(r => r + 1);
    setPhase('ready'); phaseRef.current = 'ready';
  }

  function startOver() {
    setLevel(1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false);
    setPhase('ready'); phaseRef.current = 'ready';
  }
  function nextLevel() {
    setLevel(l => l + 1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false);
    setPhase('ready'); phaseRef.current = 'ready';
  }

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={totalScore}
        total={totalPossible || 1}
        onNextLevel={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
        title="Plant Ninja"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const weeds = weedsRef.current;
  const seeds = seedsRef.current;
  const floats = floatsRef.current;
  const trail = trailRef.current;

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Level {level}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground font-semibold">Round {round + 1} / {ROUNDS_PER_LEVEL}</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">Score {score}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Swords className="w-6 h-6 text-primary" /> Plant Ninja
        </h1>
        <p className="text-muted-foreground mb-3">
          Slice the <strong>flowering weeds</strong> before they seed the field! Leave the <strong>seedlings</strong> (baby plants) alone — a true ninja spares the young.
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Real-life rule:</strong> Never touch or pull a real weed unless a trusted adult says it's safe.</p>
        </div>

        <div className="grid md:grid-cols-[1fr,220px] gap-4">
          {/* Play area */}
          <div
            ref={areaRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative rounded-xl border-4 border-green-900/50 shadow-lg overflow-hidden select-none touch-none"
            style={{
              aspectRatio: `${AREA_W} / ${AREA_H}`,
              background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 55%, #86efac 72%, #4d7c0f 100%)',
              cursor: phase === 'playing' ? 'crosshair' : 'default',
            }}
          >
            {/* HUD bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-md bg-black/40 text-white text-xs font-bold">Time {Math.ceil(timeLeft)}s</div>
              <div className="px-2 py-1 rounded-md bg-red-700/70 text-white text-xs font-bold">Escaped {misses}</div>
            </div>

            {/* Falling weeds */}
            {weeds.map(w => {
              const leftPct = (w.x / AREA_W) * 100;
              const topPct = (w.y / AREA_H) * 100;
              const isRepro = w.kind === 'repro';
              return (
                <div
                  key={w.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${(WEED_SIZE / AREA_W) * 100}%`,
                    transform: `translate(-50%, 0) rotate(${w.rot}deg) ${w.sliced ? 'scale(0.85)' : ''}`,
                    opacity: w.sliced ? 0.6 : 1,
                    filter: w.sliced ? 'grayscale(0.4)' : 'none',
                    transition: w.sliced ? 'opacity 0.4s' : 'none',
                  }}
                >
                  <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                    <div
                      className={`absolute inset-0 rounded-full border-4 shadow-lg overflow-hidden ${
                        isRepro ? 'border-amber-400 ring-2 ring-amber-200' : 'border-emerald-500 ring-2 ring-emerald-200'
                      }`}
                      style={{ background: 'white' }}
                    >
                      <WeedImage
                        weedId={w.weedId}
                        stage={isRepro ? 'flower' : 'seedling'}
                        className="w-full h-full"
                      />
                    </div>
                    {/* Kind badge */}
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shadow ${
                        isRepro ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {isRepro ? 'FLOWER' : 'BABY'}
                    </div>
                    {w.sliced && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Zap className="w-10 h-10 text-yellow-400 drop-shadow" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Seed explosion particles */}
            {seeds.map(s => (
              <div
                key={s.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${(s.x / AREA_W) * 100}%`,
                  top: `${(s.y / AREA_H) * 100}%`,
                  width: `${(24 / AREA_W) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
                  opacity: Math.max(0, s.life / 1.6),
                }}
              >
                <div className="w-full rounded-full border-2 border-amber-700 bg-white shadow overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                  <WeedImage weedId={s.weedId} stage="seed" className="w-full h-full" />
                </div>
              </div>
            ))}

            {/* Floating text */}
            {floats.map(f => (
              <div
                key={f.id}
                className="absolute pointer-events-none font-black text-lg drop-shadow"
                style={{
                  left: `${(f.x / AREA_W) * 100}%`,
                  top: `${(f.y / AREA_H) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  color: f.color,
                  opacity: Math.max(0, f.life),
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              >
                {f.text}
              </div>
            ))}

            {/* Slice trail */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${AREA_W} ${AREA_H}`}>
              {trail.length > 1 && (
                <polyline
                  points={trail.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="white"
                  strokeOpacity={0.85}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            {/* Overlays */}
            {phase === 'ready' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <Swords className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Round {round + 1}</h2>
                  <ul className="text-sm text-left text-muted-foreground space-y-1 mb-4">
                    <li>• Slice <span className="text-amber-600 font-bold">FLOWER</span> weeds: <span className="text-green-600 font-bold">+10</span></li>
                    <li>• Slice <span className="text-emerald-600 font-bold">BABY</span> weeds: <span className="text-red-600 font-bold">-5</span></li>
                    <li>• Miss a flower → it explodes into seeds!</li>
                  </ul>
                  <button
                    onClick={beginRound}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:opacity-90"
                  >
                    <Play className="w-4 h-4" /> Start Slicing!
                  </button>
                </div>
              </div>
            )}

            {phase === 'roundEnd' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Round Over!</h2>
                  <p className="text-4xl font-black text-primary my-2">{score}</p>
                  <p className="text-sm text-muted-foreground mb-1">Weeds escaped and re-seeded: <strong>{misses}</strong></p>
                  <p className="text-xs text-muted-foreground mb-4 italic">Every flower you miss drops hundreds of real seeds — that's how weed patches grow fast!</p>
                  <button
                    onClick={commitRoundAndAdvance}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:opacity-90"
                  >
                    {round + 1 >= ROUNDS_PER_LEVEL ? 'Finish Level' : 'Next Round'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side legend */}
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full border-2 border-amber-500 bg-white" />
                <p className="font-bold text-amber-900">Flower weed</p>
              </div>
              <p className="text-xs text-amber-900">Ready to spread seeds. SLICE IT for +10.</p>
            </div>
            <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-600 bg-white" />
                <p className="font-bold text-emerald-900">Baby (seedling)</p>
              </div>
              <p className="text-xs text-emerald-900">Too young to seed. DON'T slice — you'll lose points.</p>
            </div>
            <div className="rounded-lg border-2 border-dashed border-border bg-card p-3 text-xs text-muted-foreground">
              <p className="font-bold text-foreground mb-1">Ninja tip</p>
              <p>Hold and drag through a weed to slice. Watch the sky — flowers fall fast!</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <FarmerGuide
            tone="intro"
            message={`Slice the flower weeds before they hit the ground. If a flower lands, it EXPLODES into seeds — and that's exactly how weeds take over a real field!`}
          />
        </div>
      </div>
    </div>
  );
}
