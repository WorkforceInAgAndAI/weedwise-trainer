import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Scissors, AlertTriangle, Play } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import WeedImage from '@/components/game/WeedImage';
import { elementaryWeeds } from '@/data/gradeWeeds';
import { resolveCropImageUrl } from '@/lib/imageMap';

// -------- Whack-A-Weed (K-5 Explorer) -----------------------------------
// Weeds and crops pop up out of soil mounds. SNIP the weeds (+10). If you
// snip a CROP by mistake you lose 15 — a good scout protects the harvest!
// -------------------------------------------------------------------------

const ROWS = 3;
const COLS = 3;
const HOLES = ROWS * COLS;
const ROUND_SECONDS = 35;
const ROUNDS_PER_LEVEL = 3;

type Kind = 'weed' | 'crop';

interface Popper {
  id: number;
  hole: number;
  kind: Kind;
  name: string;      // weed id or crop folder name
  bornAt: number;
  lifeMs: number;
  snipped: boolean;
  missed: boolean;
}

interface Splat {
  id: number;
  hole: number;
  text: string;
  color: string;
  born: number;
}

const CROP_POOL = [
  { name: 'Corn', label: 'Corn' },
  { name: 'Soybean', label: 'Soybean' },
  { name: 'Wheat', label: 'Wheat' },
  { name: 'Oats', label: 'Oats' },
  { name: 'Alfalfa', label: 'Alfalfa' },
  { name: 'Pumpkin', label: 'Pumpkin' },
];

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function WhackAWeed({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [snipped, setSnipped] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const poppersRef = useRef<Popper[]>([]);
  const splatsRef = useRef<Splat[]>([]);
  const scoreRef = useRef(0);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const spawnRef = useRef(0);
  const endRef = useRef(0);
  const phaseRef = useRef<'ready' | 'playing' | 'roundEnd'>('ready');
  const [, forceTick] = useState(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  function beginRound() {
    poppersRef.current = [];
    splatsRef.current = [];
    scoreRef.current = 0;
    setScore(0); setSnipped(0); setMistakes(0);
    setTimeLeft(ROUND_SECONDS);
    phaseRef.current = 'playing';
    setPhase('playing');
    spawnRef.current = performance.now();
    endRef.current = performance.now() + ROUND_SECONDS * 1000;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }

  function spawnOne(now: number) {
    // Available holes (not currently occupied by a live popper)
    const occupied = new Set(
      poppersRef.current
        .filter(p => !p.snipped && !p.missed && now - p.bornAt < p.lifeMs)
        .map(p => p.hole)
    );
    const free: number[] = [];
    for (let i = 0; i < HOLES; i++) if (!occupied.has(i)) free.push(i);
    if (free.length === 0) return;
    const hole = free[Math.floor(Math.random() * free.length)];
    // ~65% weeds, 35% crops. Weed share climbs slightly with level.
    const weedChance = Math.min(0.8, 0.6 + (level - 1) * 0.06);
    const kind: Kind = Math.random() < weedChance ? 'weed' : 'crop';
    const life = Math.max(900, 1700 - (level - 1) * 180);
    const name = kind === 'weed'
      ? elementaryWeeds[Math.floor(Math.random() * elementaryWeeds.length)].id
      : CROP_POOL[Math.floor(Math.random() * CROP_POOL.length)].name;
    poppersRef.current.push({
      id: ++idRef.current, hole, kind, name,
      bornAt: now, lifeMs: life,
      snipped: false, missed: false,
    });
  }

  function loop() {
    const now = performance.now();

    // spawn
    const spawnInterval = Math.max(450, 900 - (level - 1) * 100);
    if (now - spawnRef.current > spawnInterval && now < endRef.current) {
      spawnRef.current = now;
      spawnOne(now);
    }

    // mark missed (weeds that pop back down un-snipped are just lost — no penalty,
    // but they don't help either)
    for (const p of poppersRef.current) {
      if (!p.snipped && !p.missed && now - p.bornAt > p.lifeMs) {
        p.missed = true;
      }
    }
    // prune old
    poppersRef.current = poppersRef.current.filter(p => now - p.bornAt < p.lifeMs + 500);
    splatsRef.current = splatsRef.current.filter(s => now - s.born < 900);

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

  function snip(popperId: number) {
    if (phaseRef.current !== 'playing') return;
    const p = poppersRef.current.find(x => x.id === popperId);
    if (!p || p.snipped || p.missed) return;
    p.snipped = true;
    if (p.kind === 'weed') {
      scoreRef.current += 10;
      setSnipped(n => n + 1);
      splatsRef.current.push({
        id: ++idRef.current, hole: p.hole,
        text: '+10 SNIP!', color: '#16a34a', born: performance.now(),
      });
    } else {
      scoreRef.current -= 15;
      setMistakes(n => n + 1);
      splatsRef.current.push({
        id: ++idRef.current, hole: p.hole,
        text: '-15 CROP!', color: '#dc2626', born: performance.now(),
      });
    }
    setScore(scoreRef.current);
  }

  function commitRoundAndAdvance() {
    const gained = Math.max(0, scoreRef.current);
    const possible = ROUND_SECONDS * 3; // soft ceiling
    const nextScore = totalScore + gained;
    const nextPossible = totalPossible + possible;
    if (round + 1 >= ROUNDS_PER_LEVEL) {
      setTotalScore(nextScore); setTotalPossible(nextPossible);
      setDone(true); return;
    }
    setTotalScore(nextScore); setTotalPossible(nextPossible);
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
        title="Whack-A-Weed"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const now = performance.now();
  // Only render live (currently visible) poppers in each hole
  const perHole: Record<number, Popper | undefined> = {};
  for (const p of poppersRef.current) {
    if (p.snipped) continue;
    if (p.missed) continue;
    if (now - p.bornAt >= p.lifeMs) continue;
    perHole[p.hole] = p;
  }

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 text-sm flex-wrap justify-end">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Level {level}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground font-semibold">Round {round + 1} / {ROUNDS_PER_LEVEL}</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">Score {score}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" /> Whack-A-Weed
        </h1>
        <p className="text-muted-foreground mb-3">
          Plants pop up out of the soil! <strong>Snip the weeds</strong> for +10.
          Don't touch the <strong>crops</strong> — snipping a crop costs you 15.
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            <strong>Real-life rule:</strong> Never touch or pull a real weed unless a trusted adult says it's safe.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr,220px] gap-4">
          {/* Field with holes */}
          <div
            className="relative rounded-xl border-4 border-green-900/50 shadow-lg overflow-hidden p-4"
            style={{
              aspectRatio: '4 / 3',
              background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 35%, #86efac 55%, #4d7c0f 100%)',
            }}
          >
            {/* HUD */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-md bg-black/40 text-white text-xs font-bold">Time {Math.ceil(timeLeft)}s</div>
              <div className="flex gap-1">
                <div className="px-2 py-1 rounded-md bg-green-700/80 text-white text-xs font-bold">Snipped {snipped}</div>
                <div className="px-2 py-1 rounded-md bg-red-700/80 text-white text-xs font-bold">Oops {mistakes}</div>
              </div>
            </div>

            <div
              className="relative w-full h-full grid gap-3 pt-8"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: HOLES }).map((_, i) => {
                const p = perHole[i];
                return (
                  <Hole key={i} popper={p} onSnip={snip} now={now} />
                );
              })}
            </div>

            {/* Splats (score popups) — pinned above holes */}
            {splatsRef.current.map(s => {
              const row = Math.floor(s.hole / COLS);
              const col = s.hole % COLS;
              const leftPct = ((col + 0.5) / COLS) * 100;
              const topPct = 10 + (row / ROWS) * 80;
              const age = (now - s.born) / 900;
              return (
                <div key={s.id}
                  className="absolute pointer-events-none font-black text-lg drop-shadow z-30"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct - age * 8}%`,
                    transform: 'translate(-50%, -50%)',
                    color: s.color,
                    opacity: Math.max(0, 1 - age),
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}>
                  {s.text}
                </div>
              );
            })}

            {/* Overlays */}
            {phase === 'ready' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <Scissors className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Round {round + 1}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Snip <strong>weeds</strong> only. Leave the <strong>crops</strong> alone!
                  </p>
                  <button onClick={beginRound}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90">
                    <Play className="w-4 h-4" /> Start
                  </button>
                </div>
              </div>
            )}
            {phase === 'roundEnd' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Time's Up!</h2>
                  <p className="text-sm text-muted-foreground mb-1">Weeds snipped: <strong>{snipped}</strong></p>
                  <p className="text-sm text-muted-foreground mb-1">Crops harmed: <strong>{mistakes}</strong></p>
                  <p className="text-lg font-bold text-foreground mb-4">Round score: {Math.max(0, scoreRef.current)}</p>
                  <button onClick={commitRoundAndAdvance}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90">
                    {round + 1 >= ROUNDS_PER_LEVEL ? 'Finish Level' : 'Next Round'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="rounded-xl border-2 border-border bg-card p-4 space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Field Guide</p>
              <p className="text-foreground">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />
                <strong>Red ring</strong> = Weed. Snip it! (+10)
              </p>
              <p className="text-foreground">
                <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-1 align-middle" />
                <strong>Green ring</strong> = Crop. Leave it! (-15 if snipped)
              </p>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Why It Matters</p>
              <p className="text-foreground">Farmers scout their fields to remove weeds without damaging the crop. Careful looking = healthy harvest.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Single hole ---------------------------------------------------
function Hole({ popper, onSnip, now }: { popper?: Popper; onSnip: (id: number) => void; now: number }) {
  const visible = !!popper;
  // Pop-up animation: rise fast, hold, fall fast.
  let progress = 0; // 0 = down, 1 = fully up
  if (popper) {
    const age = now - popper.bornAt;
    const life = popper.lifeMs;
    const riseMs = 180;
    const fallMs = 200;
    if (age < riseMs) progress = age / riseMs;
    else if (age > life - fallMs) progress = Math.max(0, (life - age) / fallMs);
    else progress = 1;
  }

  return (
    <div className="relative">
      {/* Soil mound */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] rounded-b-[50%] rounded-t-[45%] shadow-inner"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #8b5a2b 0%, #5a3a1e 70%, #3d2611 100%)' }}
      />
      {/* Dark hole opening */}
      <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[70%] h-[18%] rounded-[50%]"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0f05 0%, #2a180a 80%)' }}
      />

      {/* The popper */}
      {visible && popper && (
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onSnip(popper.id); }}
          className="absolute left-1/2 -translate-x-1/2 w-[72%] focus:outline-none"
          style={{
            bottom: `${18 + progress * 55}%`,
            aspectRatio: '1 / 1',
            transition: 'none',
          }}
        >
          <div
            className={`w-full h-full rounded-full border-4 shadow-lg overflow-hidden bg-white ${
              popper.kind === 'weed'
                ? 'border-red-500 ring-2 ring-red-200'
                : 'border-green-600 ring-2 ring-green-200'
            }`}
          >
            {popper.kind === 'weed' ? (
              <WeedImage weedId={popper.name} stage="flower" className="w-full h-full" />
            ) : (
              <CropImg name={popper.name} />
            )}
          </div>
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shadow ${
            popper.kind === 'weed' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
          }`}>
            {popper.kind === 'weed' ? 'WEED' : 'CROP'}
          </div>
        </button>
      )}
    </div>
  );
}

function CropImg({ name }: { name: string }) {
  const src = resolveCropImageUrl(name, 'crop_1.jpg') || resolveCropImageUrl(name, 'crop_2.jpg');
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-800 text-xs font-bold text-center p-1">
        {name}
      </div>
    );
  }
  return <img src={src} alt="" className="w-full h-full object-cover" />;
}