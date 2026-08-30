import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Crosshair, Play } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import { getSeedFact } from '@/data/seedFacts';

// -------- Weed Seed Banks: Seed Cannon (9-12) --------------------------
// Arcade phase: weed seeds fall from the top proportional to how many
// seeds that species actually produces. The player drags a cannon along
// the bottom and fires straight up with the space bar to pop seeds before
// they reach the soil. Afterward the player matches the species they saw
// to their common names in a word bank.
// -------------------------------------------------------------------------

const AREA_W = 640;
const AREA_H = 520;
const SEED_SIZE = 48;
const HIT_RADIUS = 34;
const ROUND_SECONDS = 20;
const CANNON_W = 70;
const CANNON_H = 40;
const PROJECTILE_SPEED = 480;

/** Pull the largest number out of a seed-production sentence like "1500-5000 seeds per plant". */
function parseSeedCount(production: string): number {
  const matches = production.match(/[\d,]+/g);
  if (!matches || matches.length === 0) return 500;
  const nums = matches.map(m => parseInt(m.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
  if (nums.length === 0) return 500;
  return Math.max(...nums);
}

/** Scale a real seed count down to a playable number of falling seeds per round. */
function scaleToSpawnCount(realCount: number): number {
  // log scale keeps huge producers (100,000+ seeds) from spawning thousands,
  // while still spawning noticeably more of them than low producers.
  const scaled = Math.round(4 + Math.log10(Math.max(10, realCount)) * 4);
  return Math.min(28, Math.max(4, scaled));
}

interface SpeciesInfo { weed: typeof weeds[0]; spawnCount: number; }

interface FallingSeed {
  id: number;
  weedId: string;
  x: number; y: number; vy: number;
  rot: number; vr: number;
  popped: boolean;
}

interface Projectile { id: number; x: number; y: number; }

interface Pop { id: number; x: number; y: number; life: number; }

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function SeedCannon({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd' | 'match' | 'done'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);

  // Build the pool of species + their scaled spawn counts, weighted by real seed production.
  const speciesPool: SpeciesInfo[] = useMemo(() => {
    const shuffled = [...weeds].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map(w => {
      const fact = getSeedFact(w.commonName, w.family, w.plantType);
      const real = parseSeedCount(fact.production);
      return { weed: w, spawnCount: scaleToSpawnCount(real) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Spawn queue: a shuffled list of weedIds, repeated per species' spawnCount,
  // guaranteed to contain far more seeds than a player can realistically shoot.
  const spawnQueueRef = useRef<string[]>([]);
  const seenSpeciesRef = useRef<Set<string>>(new Set());
  const shotSpeciesRef = useRef<Set<string>>(new Set());
  const missedSpeciesRef = useRef<Set<string>>(new Set());

  const seedsRef = useRef<FallingSeed[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const popsRef = useRef<Pop[]>([]);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const spawnRef = useRef(0);
  const endRef = useRef(0);
  const phaseRef = useRef<'ready' | 'playing' | 'roundEnd' | 'match' | 'done'>('ready');
  const scoreRef = useRef(0);
  const cannonXRef = useRef(AREA_W / 2);
  const draggingRef = useRef(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const [, forceTick] = useState(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  function buildSpawnQueue() {
    const queue: string[] = [];
    for (const s of speciesPool) {
      for (let i = 0; i < s.spawnCount; i++) queue.push(s.weed.id);
    }
    // Shuffle so species are interleaved rather than arriving in blocks.
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    spawnQueueRef.current = queue;
  }

  function beginRound() {
    buildSpawnQueue();
    seedsRef.current = [];
    projectilesRef.current = [];
    popsRef.current = [];
    seenSpeciesRef.current = new Set();
    shotSpeciesRef.current = new Set();
    missedSpeciesRef.current = new Set();
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    cannonXRef.current = AREA_W / 2;
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

    // move falling seeds
    for (const s of seedsRef.current) {
      if (!s.popped) { s.y += s.vy * dt; s.rot += s.vr * dt; }
    }
    for (const s of seedsRef.current) {
      if (!s.popped && s.y >= AREA_H - 30) missedSpeciesRef.current.add(s.weedId);
    }
    seedsRef.current = seedsRef.current.filter(s => s.y < AREA_H + 60 && !s.popped);

    // move projectiles
    for (const p of projectilesRef.current) p.y -= PROJECTILE_SPEED * dt;
    projectilesRef.current = projectilesRef.current.filter(p => p.y > -20);

    // collisions
    for (const p of projectilesRef.current) {
      for (const s of seedsRef.current) {
        if (s.popped) continue;
        const dx = p.x - s.x, dy = p.y - s.y;
        if (dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS) {
          s.popped = true;
          p.y = -9999; // remove projectile next filter pass
          scoreRef.current += 10;
          shotSpeciesRef.current.add(s.weedId);
          popsRef.current.push({ id: ++idRef.current, x: s.x, y: s.y, life: 0.4 });
          setScore(scoreRef.current);
        }
      }
    }
    projectilesRef.current = projectilesRef.current.filter(p => p.y > -20);

    // pop fx
    for (const f of popsRef.current) f.life -= dt;
    popsRef.current = popsRef.current.filter(f => f.life > 0);

    // spawn
    const spawnInterval = 260;
    if (now - spawnRef.current > spawnInterval && now < endRef.current && spawnQueueRef.current.length > 0) {
      spawnRef.current = now;
      const weedId = spawnQueueRef.current.pop()!;
      seenSpeciesRef.current.add(weedId);
      seedsRef.current.push({
        id: ++idRef.current,
        weedId,
        x: 40 + Math.random() * (AREA_W - 80),
        y: -SEED_SIZE,
        vy: 55 + Math.random() * 55,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 60,
        popped: false,
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

  function toAreaX(clientX: number) {
    const rect = areaRef.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * AREA_W;
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (phaseRef.current !== 'playing') return;
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    cannonXRef.current = Math.min(AREA_W - CANNON_W / 2, Math.max(CANNON_W / 2, toAreaX(e.clientX)));
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (phaseRef.current !== 'playing' || !draggingRef.current) return;
    cannonXRef.current = Math.min(AREA_W - CANNON_W / 2, Math.max(CANNON_W / 2, toAreaX(e.clientX)));
  }
  function handlePointerUp(e: React.PointerEvent) {
    draggingRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }

  function fire() {
    if (phaseRef.current !== 'playing') return;
    projectilesRef.current.push({ id: ++idRef.current, x: cannonXRef.current, y: AREA_H - CANNON_H - 10 });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        fire();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function goToMatch() {
    setPhase('match');
    phaseRef.current = 'match';
  }

  const seeds = seedsRef.current;
  const projectiles = projectilesRef.current;
  const pops = popsRef.current;

  if (phase === 'match') {
    return (
      <MatchPhase
        speciesPool={speciesPool}
        missedSpecies={missedSpeciesRef.current}
        seenSpecies={seenSpeciesRef.current}
        score={score}
        level={level}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
        onBack={onBack}
        onNextLevel={() => { setLevel(l => l + 1); setPhase('ready'); phaseRef.current = 'ready'; }}
        onStartOver={() => { setLevel(1); setPhase('ready'); phaseRef.current = 'ready'; }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Level {level}</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">Score {score}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Crosshair className="w-6 h-6 text-primary" /> Weed Seed Banks
        </h1>
        <p className="text-muted-foreground mb-3">
          Drag the cannon and press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-bold">SPACE</kbd> to fire.
          Species that produce more seeds in real life will rain down far more often — pop as many as you can before they hit the soil!
        </p>

        {phase === 'ready' && (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center bg-card">
            <FarmerGuide
              gradeLabel="9-12"
              tone="intro"
              className="mb-4 max-w-xl mx-auto"
              message="Real weed seed banks build up in the soil fast — some species drop tens of thousands of seeds a year! Shoot as many falling seeds as you can in 20 seconds before restocking the seed bank."
            />
            <button onClick={beginRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 mx-auto">
              <Play className="w-4 h-4" /> Start Round
            </button>
          </div>
        )}

        {phase === 'roundEnd' && (
          <div className="rounded-xl border-2 border-border p-8 text-center bg-card">
            <h2 className="text-xl font-bold text-foreground mb-2">Time's Up!</h2>
            <p className="text-muted-foreground mb-4">{missedSpeciesRef.current.size} species made it into the soil. Figure out what seeds you missed and are now in your seed bank.</p>
            <button onClick={goToMatch} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue to Matching</button>
          </div>
        )}

        {(phase === 'playing' || phase === 'roundEnd') && (
          <div
            ref={areaRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative rounded-xl border-4 border-green-900/50 shadow-lg overflow-hidden select-none touch-none mt-2"
            style={{
              aspectRatio: `${AREA_W} / ${AREA_H}`,
              background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 55%, #86efac 72%, #4d7c0f 100%)',
              cursor: phase === 'playing' ? 'grab' : 'default',
            }}
          >
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-md bg-black/40 text-white text-xs font-bold">Time {Math.ceil(timeLeft)}s</div>
              <div className="px-2 py-1 rounded-md bg-black/40 text-white text-xs font-bold">Score {score}</div>
            </div>

            {seeds.map(s => (
              <div
                key={s.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${(s.x / AREA_W) * 100}%`,
                  top: `${(s.y / AREA_H) * 100}%`,
                  width: `${(SEED_SIZE / AREA_W) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
                }}
              >
                <div className="w-full rounded-full border-2 border-amber-700 bg-white shadow overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                  <WeedImage weedId={s.weedId} stage="seed" className="w-full h-full" />
                </div>
              </div>
            ))}

            {projectiles.map(p => (
              <div
                key={p.id}
                className="absolute pointer-events-none rounded-full bg-yellow-300 border border-yellow-600"
                style={{
                  left: `${(p.x / AREA_W) * 100}%`,
                  top: `${(p.y / AREA_H) * 100}%`,
                  width: 10, height: 10,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {pops.map(f => (
              <div
                key={f.id}
                className="absolute pointer-events-none rounded-full border-2 border-yellow-400"
                style={{
                  left: `${(f.x / AREA_W) * 100}%`,
                  top: `${(f.y / AREA_H) * 100}%`,
                  width: 30, height: 30,
                  transform: `translate(-50%, -50%) scale(${1.6 - f.life * 2})`,
                  opacity: Math.max(0, f.life * 2.5),
                }}
              />
            ))}

            {/* Cannon */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(cannonXRef.current / AREA_W) * 100}%`,
                bottom: 6,
                width: `${(CANNON_W / AREA_W) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="w-full rounded-t-full rounded-b-md bg-slate-700 border-2 border-slate-900 shadow-lg" style={{ height: CANNON_H }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Matching phase: species seen during the arcade round must be paired with
// their common names. Wrong drops bounce back to the word bank.
// ---------------------------------------------------------------------------

interface MatchPhaseProps {
  speciesPool: SpeciesInfo[];
  missedSpecies: Set<string>;
  seenSpecies: Set<string>;
  score: number;
  level: number;
  gameId?: string;
  gameName?: string;
  gradeLabel?: string;
  onBack: () => void;
  onNextLevel: () => void;
  onStartOver: () => void;
}

function MatchPhase({ speciesPool, missedSpecies, seenSpecies, score, level, gameId, gameName, gradeLabel, onBack, onNextLevel, onStartOver }: MatchPhaseProps) {
  // Species whose seeds reached the soil — those are the ones now in the seed bank.
  const roundSpecies = useMemo(() => {
    const byId = new Map(speciesPool.map(s => [s.weed.id, s]));
    const missed = [...missedSpecies].map(id => byId.get(id)).filter(Boolean) as SpeciesInfo[];
    const seen = [...seenSpecies].map(id => byId.get(id)).filter(Boolean) as SpeciesInfo[];
    const merged = (missed.length > 0 ? missed : seen).slice(0, 8);
    return merged.length > 0 ? merged : speciesPool.slice(0, 6);
  }, [speciesPool, missedSpecies, seenSpecies]);

  const [matched, setMatched] = useState<Record<string, string>>({}); // weedId -> commonName
  const [rejecting, setRejecting] = useState<string | null>(null); // weedId currently bouncing
  const [dragName, setDragName] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const wordBank = useMemo(
    () => [...roundSpecies.map(s => s.weed.commonName)].sort(() => Math.random() - 0.5),
    [roundSpecies]
  );
  const remainingNames = wordBank.filter(n => !Object.values(matched).includes(n));

  function dropOn(weedId: string, name: string) {
    const correctName = roundSpecies.find(s => s.weed.id === weedId)?.weed.commonName;
    if (name === correctName) {
      const next = { ...matched, [weedId]: name };
      setMatched(next);
      if (Object.keys(next).length >= roundSpecies.length) {
        setTimeout(() => setDone(true), 400);
      }
    } else {
      setRejecting(weedId);
      setTimeout(() => setRejecting(null), 420);
    }
    setDragName(null);
  }

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={Math.max(score, roundSpecies.length * 10 + 10)}
        onNextLevel={onNextLevel}
        onStartOver={onStartOver}
        onBack={onBack}
        title="Weed Seed Banks"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Figure Out What You Missed</h1>
        <span className="text-sm text-muted-foreground">Score {score}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <FarmerGuide
            gradeLabel="9-12"
            tone="intro"
            className="mb-4"
            message="These seeds hit the soil and are now in your seed bank. Figure out what seeds you missed and are now in your seed bank — drag each name onto the seed photo it belongs to. Wrong guesses bounce right back to the word bank."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {roundSpecies.map(s => {
              const name = matched[s.weed.id];
              const bouncing = rejecting === s.weed.id;
              return (
                <div
                  key={s.weed.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => dragName && dropOn(s.weed.id, dragName)}
                  className={`rounded-2xl border-4 p-3 bg-card flex flex-col items-center gap-2 transition-transform ${
                    name ? 'border-green-500 bg-green-500/5' : 'border-dashed border-border'
                  } ${bouncing ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-border bg-secondary">
                    <WeedImage weedId={s.weed.id} stage="seed" className="w-full h-full object-cover" />
                  </div>
                  {name ? (
                    <p className="w-full text-center px-2 py-2 rounded-lg font-bold text-xs border-2 border-green-500 bg-green-500/10 text-green-700">
                      {name}
                    </p>
                  ) : (
                    <div className="w-full text-center px-2 py-2 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground text-xs">
                      Drop name here
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">Word Bank</p>
            <div className="flex flex-wrap gap-2">
              {remainingNames.length === 0 && (
                <p className="text-xs text-muted-foreground">Nice work — every seed matched!</p>
              )}
              {remainingNames.map(name => (
                <button
                  key={name}
                  draggable
                  onDragStart={() => setDragName(name)}
                  onDragEnd={() => setDragName(null)}
                  className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border cursor-grab hover:bg-secondary/70"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
