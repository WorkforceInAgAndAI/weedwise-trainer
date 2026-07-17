import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Scissors, AlertTriangle, Play, Trash2 } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';
import { elementaryWeeds } from '@/data/gradeWeeds';

// -------- Row Runner (K-5 Explorer) --------------------------------------
// Aerial "drone" view of a crop field scrolling vertically. Weeds pop up
// between the crop rows. Kids click a weed to "snip" it, then drag it to
// the Weed Bin on the side of the screen. If a weed rolls off the bottom
// of the screen without being pulled, the farmer loses ground.
// Don't snip the crops!
// -------------------------------------------------------------------------

const AREA_W = 640;
const AREA_H = 560;
const ROW_COUNT = 5;
const ROUND_SECONDS = 45;
const ROUNDS_PER_LEVEL = 3;
const WEED_SIZE = 74;
const CROP_SIZE = 60;

interface Sprite {
  id: number;
  kind: 'weed' | 'crop';
  weedId: string;   // for weeds only
  lane: number;     // 0..ROW_COUNT-1
  y: number;        // px in area coords, top of sprite
  picked: boolean;  // being dragged
  removed: boolean; // pulled into bin
  escaped: boolean;
  wobble: number;
}

interface FloatingText {
  id: number;
  x: number; y: number;
  text: string;
  color: string;
  life: number;
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function RowRunner({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [pulled, setPulled] = useState(0);
  const [escaped, setEscaped] = useState(0);

  const spritesRef = useRef<Sprite[]>([]);
  const floatsRef = useRef<FloatingText[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const endRef = useRef<number>(0);
  const scrollRef = useRef<number>(0); // background scroll offset
  const idRef = useRef(0);
  const phaseRef = useRef<'ready' | 'playing' | 'roundEnd'>('ready');
  const scoreRef = useRef(0);
  const pulledRef = useRef(0);
  const escapedRef = useRef(0);

  // Dragging
  const dragIdRef = useRef<number | null>(null);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);

  const [, forceTick] = useState(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Global pointer listeners while dragging so we can drop OUTSIDE the play area (over the Weed Bin).
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (dragIdRef.current == null) return;
      if (dragPointerIdRef.current != null && e.pointerId !== dragPointerIdRef.current) return;
      dragPosRef.current = { x: e.clientX, y: e.clientY };
      forceTick(x => (x + 1) % 1000000);
    }
    function onUp(e: PointerEvent) {
      if (dragIdRef.current == null) return;
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
  }, []);

  const scrollSpeed = 70 + (level - 1) * 22; // px/sec — how fast the field scrolls DOWN past the drone
  const spawnInterval = Math.max(520, 1050 - (level - 1) * 130);

  function beginRound() {
    spritesRef.current = [];
    floatsRef.current = [];
    scoreRef.current = 0;
    pulledRef.current = 0;
    escapedRef.current = 0;
    setScore(0);
    setPulled(0);
    setEscaped(0);
    setTimeLeft(ROUND_SECONDS);
    scrollRef.current = 0;
    dragIdRef.current = null;
    dragPosRef.current = null;
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

    scrollRef.current = (scrollRef.current + scrollSpeed * dt) % 80;

    // Move sprites down (except the one being dragged)
    for (const s of spritesRef.current) {
      if (s.removed) continue;
      if (!s.picked) s.y += scrollSpeed * dt;
      s.wobble += dt;
    }

    // Escape check
    for (const s of spritesRef.current) {
      if (s.removed || s.escaped || s.picked) continue;
      if (s.y > AREA_H + 20) {
        s.escaped = true;
        if (s.kind === 'weed') {
          escapedRef.current += 1;
          setEscaped(escapedRef.current);
          scoreRef.current -= 2;
          setScore(scoreRef.current);
        }
      }
    }

    // Floats
    for (const f of floatsRef.current) { f.y -= 45 * dt; f.life -= dt; }
    floatsRef.current = floatsRef.current.filter(f => f.life > 0);

    // Prune
    spritesRef.current = spritesRef.current.filter(s => !s.removed && s.y < AREA_H + 120);

    // Spawn
    if (now - spawnRef.current > spawnInterval) {
      spawnRef.current = now;
      // Alternate: mostly weeds, some crops as distractors
      const isCrop = Math.random() < 0.28;
      const lane = Math.floor(Math.random() * ROW_COUNT);
      const w = elementaryWeeds[Math.floor(Math.random() * elementaryWeeds.length)];
      spritesRef.current.push({
        id: ++idRef.current,
        kind: isCrop ? 'crop' : 'weed',
        weedId: w.id,
        lane,
        y: -WEED_SIZE - Math.random() * 40,
        picked: false, removed: false, escaped: false,
        wobble: Math.random() * 6,
      });
    }

    const remaining = Math.max(0, (endRef.current - now) / 1000);
    setTimeLeft(remaining);
    forceTick(x => (x + 1) % 1000000);

    if (remaining <= 0) {
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

  function laneCenterX(lane: number) {
    const laneW = AREA_W / ROW_COUNT;
    return laneW * lane + laneW / 2;
  }

  function pickAt(clientX: number, clientY: number, pointerId: number) {
    const { x, y } = toAreaCoords(clientX, clientY);
    for (let i = spritesRef.current.length - 1; i >= 0; i--) {
      const s = spritesRef.current[i];
      if (s.removed || s.escaped) continue;
      const cx = laneCenterX(s.lane);
      const cy = s.y + WEED_SIZE / 2;
      const size = s.kind === 'crop' ? CROP_SIZE : WEED_SIZE;
      const r = size / 2;
      if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) {
        if (s.kind === 'crop') {
          // Whoops — snipped a crop!
          scoreRef.current -= 5;
          setScore(scoreRef.current);
          floatsRef.current.push({ id: ++idRef.current, x: cx, y: s.y, text: 'NOT A WEED! -5', color: '#dc2626', life: 1.2 });
          return;
        }
        s.picked = true;
        dragIdRef.current = s.id;
        dragPosRef.current = { x: clientX, y: clientY };
        dragPointerIdRef.current = pointerId;
        return;
      }
    }
  }

  function releaseDrag(clientX: number, clientY: number) {
    if (dragIdRef.current == null) return;
    const s = spritesRef.current.find(z => z.id === dragIdRef.current);
    dragIdRef.current = null;
    dragPosRef.current = null;
    dragPointerIdRef.current = null;
    if (!s) return;

    // Check drop over bin
    const bin = binRef.current?.getBoundingClientRect();
    const overBin = bin && clientX >= bin.left && clientX <= bin.right && clientY >= bin.top && clientY <= bin.bottom;
    if (overBin) {
      s.removed = true;
      pulledRef.current += 1;
      setPulled(pulledRef.current);
      scoreRef.current += 10;
      setScore(scoreRef.current);
      floatsRef.current.push({ id: ++idRef.current, x: AREA_W - 40, y: 40, text: '+10 SNIP!', color: '#16a34a', life: 1.0 });
    } else {
      // Drop back into field
      s.picked = false;
    }
  }

  function commitRoundAndAdvance() {
    const gained = Math.max(0, scoreRef.current);
    const possible = 60 + (level - 1) * 15;
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
        title="Row Runner"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const sprites = spritesRef.current;
  const floats = floatsRef.current;
  const draggingSprite = dragIdRef.current != null ? sprites.find(s => s.id === dragIdRef.current) : null;
  const dragPos = dragPosRef.current;
  const areaRect = areaRef.current?.getBoundingClientRect();

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
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
          <Scissors className="w-6 h-6 text-primary" /> Row Runner
        </h1>
        <p className="text-muted-foreground mb-3">
          You are flying a scouting drone over the crop rows! <strong>Grab every weed</strong> hiding between the crops and drag it to the <strong>Weed Bin</strong> before it scrolls off the field. Don't grab the crops!
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Real-life rule:</strong> Never touch or pull a real weed unless a trusted adult says it's safe.</p>
        </div>

        <div className="grid md:grid-cols-[1fr,220px] gap-4">
          {/* Play area */}
          <div
            ref={areaRef}
            onPointerDown={(e) => phase === 'playing' && pickAt(e.clientX, e.clientY, e.pointerId)}
            className="relative rounded-xl border-4 border-green-900/60 shadow-lg overflow-hidden select-none touch-none"
            style={{
              aspectRatio: `${AREA_W} / ${AREA_H}`,
              background: '#5a7a2a',
              cursor: phase === 'playing' ? (dragIdRef.current != null ? 'grabbing' : 'crosshair') : 'default',
            }}
          >
            {/* Scrolling crop rows */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {/* Row stripes (soil between rows) */}
              {Array.from({ length: ROW_COUNT }).map((_, i) => {
                const laneW = 100 / ROW_COUNT;
                return (
                  <div key={i}
                    className="absolute top-0 bottom-0"
                    style={{
                      left: `${i * laneW}%`,
                      width: `${laneW}%`,
                      background: i % 2 === 0
                        ? 'linear-gradient(90deg, rgba(120,80,40,0.35) 0%, rgba(90,122,42,0) 22%, rgba(90,122,42,0) 78%, rgba(120,80,40,0.35) 100%)'
                        : 'linear-gradient(90deg, rgba(120,80,40,0.25) 0%, rgba(90,122,42,0) 22%, rgba(90,122,42,0) 78%, rgba(120,80,40,0.25) 100%)',
                    }}
                  />
                );
              })}
              {/* Scrolling crop plants (green tufts) */}
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${AREA_W} ${AREA_H}`} preserveAspectRatio="none">
                {Array.from({ length: ROW_COUNT }).map((_, laneIdx) => {
                  const cx = laneCenterX(laneIdx);
                  const tufts: JSX.Element[] = [];
                  for (let y = -80; y < AREA_H + 80; y += 80) {
                    const yy = y + scrollRef.current;
                    tufts.push(
                      <g key={`${laneIdx}-${y}`} transform={`translate(${cx} ${yy})`}>
                        <ellipse cx="0" cy="0" rx="22" ry="16" fill="#2f5111" opacity="0.85" />
                        <ellipse cx="-10" cy="-6" rx="10" ry="8" fill="#3d6a17" />
                        <ellipse cx="10" cy="-6" rx="10" ry="8" fill="#3d6a17" />
                        <ellipse cx="0" cy="-10" rx="10" ry="8" fill="#4b8020" />
                      </g>
                    );
                  }
                  return <g key={laneIdx}>{tufts}</g>;
                })}
              </svg>
            </div>

            {/* HUD bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-md bg-black/50 text-white text-xs font-bold">Time {Math.ceil(timeLeft)}s</div>
              <div className="flex gap-1.5">
                <div className="px-2 py-1 rounded-md bg-emerald-700/80 text-white text-xs font-bold">Pulled {pulled}</div>
                <div className="px-2 py-1 rounded-md bg-red-700/80 text-white text-xs font-bold">Escaped {escaped}</div>
              </div>
            </div>

            {/* Sprites */}
            {sprites.map(s => {
              if (s.removed) return null;
              // If picked and being dragged, we render it as an overlay via portal-like absolute position based on cursor
              if (s.picked && dragPos && areaRect) {
                const localX = ((dragPos.x - areaRect.left) / areaRect.width) * AREA_W;
                const localY = ((dragPos.y - areaRect.top) / areaRect.height) * AREA_H;
                return (
                  <div
                    key={s.id}
                    className="absolute pointer-events-none z-30"
                    style={{
                      left: `${(localX / AREA_W) * 100}%`,
                      top: `${(localY / AREA_H) * 100}%`,
                      width: `${(WEED_SIZE / AREA_W) * 100}%`,
                      transform: 'translate(-50%, -50%) rotate(-8deg) scale(1.05)',
                    }}
                  >
                    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                      <div className="absolute inset-0 rounded-full border-4 border-red-500 ring-2 ring-red-200 bg-white shadow-2xl overflow-hidden">
                        <WeedImage weedId={s.weedId} stage="vegetative" className="w-full h-full" />
                      </div>
                      <div className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 shadow">
                        <Scissors className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              }
              const size = s.kind === 'crop' ? CROP_SIZE : WEED_SIZE;
              const cx = laneCenterX(s.lane);
              const leftPct = (cx / AREA_W) * 100;
              const topPct = (s.y / AREA_H) * 100;
              const sway = Math.sin(s.wobble * 3) * 3;
              return (
                <div
                  key={s.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${(size / AREA_W) * 100}%`,
                    transform: `translate(-50%, 0) rotate(${sway}deg)`,
                  }}
                >
                  <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                    {s.kind === 'weed' ? (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-red-500 ring-2 ring-red-200 bg-white shadow-lg overflow-hidden">
                          <WeedImage weedId={s.weedId} stage="vegetative" className="w-full h-full" />
                        </div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black uppercase tracking-wide shadow">
                          Weed
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-700 ring-2 ring-emerald-200 shadow-lg overflow-hidden"
                        style={{ background: 'radial-gradient(circle at 30% 30%, #7cb342 0%, #33691e 80%)' }}>
                        <div className="absolute inset-2 rounded-full opacity-70"
                          style={{ background: 'repeating-radial-gradient(circle, #558b2f 0 6px, #33691e 6px 10px)' }} />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wide shadow">
                          Crop
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Floating text */}
            {floats.map(f => (
              <div
                key={f.id}
                className="absolute pointer-events-none font-black text-sm md:text-base drop-shadow z-40"
                style={{
                  left: `${(f.x / AREA_W) * 100}%`,
                  top: `${(f.y / AREA_H) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  color: f.color,
                  opacity: Math.max(0, f.life),
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {f.text}
              </div>
            ))}

            {/* Overlays */}
            {phase === 'ready' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <Scissors className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Round {round + 1}</h2>
                  <ul className="text-sm text-left text-muted-foreground space-y-1 mb-4">
                    <li>• Click a <span className="text-red-600 font-bold">WEED</span> and drag it to the Weed Bin: <span className="text-green-600 font-bold">+10</span></li>
                    <li>• Let a weed scroll off the field: <span className="text-red-600 font-bold">-2</span></li>
                    <li>• Snip a <span className="text-emerald-700 font-bold">CROP</span> by mistake: <span className="text-red-600 font-bold">-5</span></li>
                  </ul>
                  <button
                    onClick={beginRound}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:opacity-90"
                  >
                    <Play className="w-4 h-4" /> Start Scouting!
                  </button>
                </div>
              </div>
            )}

            {phase === 'roundEnd' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Field Cleared!</h2>
                  <p className="text-4xl font-black text-primary my-2">{score}</p>
                  <p className="text-sm text-muted-foreground">Weeds pulled: <strong>{pulled}</strong></p>
                  <p className="text-sm text-muted-foreground mb-1">Weeds escaped: <strong>{escaped}</strong></p>
                  <p className="text-xs text-muted-foreground mb-4 italic">Every weed left in the field steals sun, water, and nutrients from the crops!</p>
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

          {/* Side legend + Weed Bin */}
          <div className="space-y-3">
            <div
              ref={binRef}
              className={`rounded-xl border-4 border-dashed p-4 text-center transition-all ${
                dragIdRef.current != null ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-amber-500 bg-amber-50'
              }`}
              style={{ minHeight: 140 }}
            >
              <Trash2 className={`w-10 h-10 mx-auto mb-1 ${dragIdRef.current != null ? 'text-emerald-600' : 'text-amber-700'}`} />
              <p className="font-black text-amber-900 uppercase tracking-wide">Weed Bin</p>
              <p className="text-xs text-amber-800 mt-1">Drop weeds here!</p>
              <div className="mt-2 text-2xl font-black text-emerald-700">{pulled}</div>
              <p className="text-[10px] text-muted-foreground">pulled this round</p>
            </div>

            <div className="rounded-lg border-2 border-red-400 bg-red-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-white" />
                <p className="font-bold text-red-900 text-sm">Weed</p>
              </div>
              <p className="text-xs text-red-900">Click, hold, and drag to the bin!</p>
            </div>
            <div className="rounded-lg border-2 border-emerald-600 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-700"
                  style={{ background: 'radial-gradient(circle at 30% 30%, #7cb342, #33691e)' }} />
                <p className="font-bold text-emerald-900 text-sm">Crop</p>
              </div>
              <p className="text-xs text-emerald-900">Leave crops alone!</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <FarmerGuide
            tone="intro"
            message={`Scout every row! Weeds hide between the crops and steal sun, water, and nutrients. Grab them fast — the field keeps scrolling by!`}
          />
        </div>
      </div>
    </div>
  );
}