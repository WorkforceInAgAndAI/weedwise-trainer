import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Droplets, Sun, Sprout, Play, AlertTriangle, Trophy } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import WeedImage from '@/components/game/WeedImage';
import { elementaryWeeds } from '@/data/gradeWeeds';
import { resolveCropImageUrl } from '@/lib/imageMap';

// -------- Crop Care Crew (K-5 Explorer) --------------------------------
// Kids give Water, Sunlight, and Plant Food to CROPS so they grow tall
// enough to harvest. But WEEDS pop up in the plots too — feeding a weed
// makes it choke the crops around it. Choose your target carefully!
// ------------------------------------------------------------------------

const ROWS = 2;
const COLS = 3;
const PLOTS = ROWS * COLS;
const ROUND_SECONDS = 60;
const ROUNDS_PER_LEVEL = 3;
const CROP_MAX = 4;   // 0..4 growth stages -> harvest at 4
const WEED_MAX = 3;   // weed chokes when it hits 3

type PlantKind = 'crop' | 'weed';
type Resource = 'water' | 'sun' | 'food';

interface Plant {
  id: number;
  kind: PlantKind;
  name: string;      // crop folder OR weed id
  growth: number;
  need?: Resource;   // resource the crop is currently asking for (bubble)
  needSetAt?: number;
  shake: number;     // ms remaining for a shake animation on feed
}

interface Floater {
  id: number;
  plot: number;
  text: string;
  color: string;
  born: number;
}

const CROP_POOL = ['Corn', 'Soybean', 'Wheat', 'Oats', 'Alfalfa', 'Pumpkin'];

const RESOURCES: { id: Resource; label: string; color: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'water', label: 'Water',    color: 'text-sky-600',     Icon: Droplets },
  { id: 'sun',   label: 'Sunlight', color: 'text-amber-500',   Icon: Sun },
  { id: 'food',  label: 'Plant Food', color: 'text-emerald-600', Icon: Sprout },
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randRes(): Resource { return RESOURCES[Math.floor(Math.random() * 3)].id; }

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function CropCare({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
  const [tool, setTool] = useState<Resource>('water');
  const [score, setScore] = useState(0);
  const [harvested, setHarvested] = useState(0);
  const [choked, setChoked] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);

  const plotsRef = useRef<(Plant | null)[]>(Array(PLOTS).fill(null));
  const floatersRef = useRef<Floater[]>([]);
  const scoreRef = useRef(0);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const endRef = useRef(0);
  const weedTimerRef = useRef(0);
  const needTimerRef = useRef(0);
  const phaseRef = useRef<'ready' | 'playing' | 'roundEnd'>('ready');
  const [, forceTick] = useState(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  function makeCrop(): Plant {
    return {
      id: ++idRef.current, kind: 'crop', name: rand(CROP_POOL),
      growth: 0, need: randRes(), needSetAt: performance.now(), shake: 0,
    };
  }
  function makeWeed(): Plant {
    return {
      id: ++idRef.current, kind: 'weed',
      name: rand(elementaryWeeds).id, growth: 0, shake: 0,
    };
  }

  function beginRound() {
    plotsRef.current = Array.from({ length: PLOTS }, () => makeCrop());
    floatersRef.current = [];
    scoreRef.current = 0;
    setScore(0); setHarvested(0); setChoked(0);
    setTool('water');
    setTimeLeft(ROUND_SECONDS);
    phaseRef.current = 'playing'; setPhase('playing');
    const now = performance.now();
    endRef.current = now + ROUND_SECONDS * 1000;
    weedTimerRef.current = now + weedSpawnInterval();
    needTimerRef.current = now + 1200;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }

  function weedSpawnInterval() {
    // gets faster with level
    return Math.max(2500, 5500 - (level - 1) * 700);
  }

  function spawnWeedInRandomPlot() {
    // Prefer replacing a low-growth crop or empty plot; never a growing weed
    const cropCandidates: number[] = [];
    const emptyCandidates: number[] = [];
    plotsRef.current.forEach((p, i) => {
      if (!p) emptyCandidates.push(i);
      else if (p.kind === 'crop' && p.growth <= 1) cropCandidates.push(i);
    });
    const pool = emptyCandidates.length ? emptyCandidates : cropCandidates;
    if (!pool.length) return;
    const idx = pool[Math.floor(Math.random() * pool.length)];
    plotsRef.current[idx] = makeWeed();
    floatersRef.current.push({
      id: ++idRef.current, plot: idx,
      text: 'Weed!', color: '#dc2626', born: performance.now(),
    });
  }

  function loop() {
    const now = performance.now();

    // spawn weeds periodically
    if (now > weedTimerRef.current && now < endRef.current) {
      spawnWeedInRandomPlot();
      weedTimerRef.current = now + weedSpawnInterval();
    }

    // rotate crop resource needs
    if (now > needTimerRef.current) {
      needTimerRef.current = now + 2600;
      for (const p of plotsRef.current) {
        if (p && p.kind === 'crop' && p.growth < CROP_MAX) {
          p.need = randRes();
          p.needSetAt = now;
        }
      }
    }

    // decay shake
    for (const p of plotsRef.current) if (p && p.shake > 0) p.shake = Math.max(0, p.shake - 16);

    // prune floaters
    floatersRef.current = floatersRef.current.filter(f => now - f.born < 1000);

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

  function feed(plot: number) {
    if (phaseRef.current !== 'playing') return;
    const p = plotsRef.current[plot];
    if (!p) return;

    if (p.kind === 'crop') {
      const match = p.need === tool;
      if (match) {
        p.growth = Math.min(CROP_MAX, p.growth + 1);
        scoreRef.current += 5;
        p.shake = 200;
        p.need = undefined;
        floatersRef.current.push({
          id: ++idRef.current, plot,
          text: '+5 GROW!', color: '#16a34a', born: performance.now(),
        });
        if (p.growth >= CROP_MAX) {
          scoreRef.current += 15;
          setHarvested(n => n + 1);
          floatersRef.current.push({
            id: ++idRef.current, plot,
            text: '+15 HARVEST!', color: '#0e7c2b', born: performance.now(),
          });
          // Replant a fresh crop
          plotsRef.current[plot] = makeCrop();
        }
      } else {
        // Wrong resource — plant shrugs it off, tiny score penalty to teach matching
        scoreRef.current -= 1;
        p.shake = 120;
        floatersRef.current.push({
          id: ++idRef.current, plot,
          text: 'Wrong resource', color: '#a16207', born: performance.now(),
        });
      }
    } else {
      // WEED — feeding a weed helps it choke the crops
      p.growth += 1;
      scoreRef.current -= 8;
      p.shake = 200;
      floatersRef.current.push({
        id: ++idRef.current, plot,
        text: '-8 FED A WEED!', color: '#dc2626', born: performance.now(),
      });
      if (p.growth >= WEED_MAX) {
        // Weed chokes: knock growth off neighboring crops, then remove weed
        chokeNeighbors(plot);
        scoreRef.current -= 10;
        setChoked(n => n + 1);
        floatersRef.current.push({
          id: ++idRef.current, plot,
          text: '-10 CHOKED!', color: '#7f1d1d', born: performance.now(),
        });
        plotsRef.current[plot] = makeCrop();
      }
    }
    setScore(scoreRef.current);
  }

  function chokeNeighbors(plot: number) {
    const r = Math.floor(plot / COLS);
    const c = plot % COLS;
    const nbrs = [
      [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
    ];
    for (const [nr, nc] of nbrs) {
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const idx = nr * COLS + nc;
      const n = plotsRef.current[idx];
      if (n && n.kind === 'crop') {
        n.growth = Math.max(0, n.growth - 2);
        n.shake = 220;
      }
    }
  }

  function pullWeed(plot: number) {
    // Right-click / long option in future; here we let a small "pull" button do it.
    const p = plotsRef.current[plot];
    if (!p || p.kind !== 'weed') return;
    scoreRef.current += 3;
    floatersRef.current.push({
      id: ++idRef.current, plot, text: '+3 PULLED!',
      color: '#166534', born: performance.now(),
    });
    plotsRef.current[plot] = makeCrop();
    setScore(scoreRef.current);
  }

  function commitRoundAndAdvance() {
    const gained = Math.max(0, scoreRef.current);
    const possible = 120; // soft ceiling per round
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
        title="Crop Care Crew"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const now = performance.now();

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
          <Sprout className="w-6 h-6 text-primary" /> Crop Care Crew
        </h1>
        <p className="text-muted-foreground mb-3">
          Give <strong>Water</strong>, <strong>Sunlight</strong>, and <strong>Plant Food</strong> to the crops so they grow tall enough to harvest.
          Watch out for weeds — if you feed a weed, it will <strong>choke</strong> the crops around it! Pull weeds instead.
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            <strong>Real-life rule:</strong> Never touch or pull a real weed unless a trusted adult says it's safe.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr,220px] gap-4">
          {/* Field */}
          <div
            className="relative rounded-xl border-4 border-green-900/50 shadow-lg overflow-hidden p-4"
            style={{
              aspectRatio: '4 / 3',
              background: 'linear-gradient(180deg, #a3e635 0%, #86efac 40%, #4d7c0f 100%)',
            }}
          >
            {/* HUD */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-md bg-black/40 text-white text-xs font-bold">Time {Math.ceil(timeLeft)}s</div>
              <div className="flex gap-1">
                <div className="px-2 py-1 rounded-md bg-green-700/80 text-white text-xs font-bold flex items-center gap-1"><Trophy className="w-3 h-3" /> {harvested}</div>
                <div className="px-2 py-1 rounded-md bg-red-700/80 text-white text-xs font-bold">Choked {choked}</div>
              </div>
            </div>

            <div
              className="relative w-full h-full grid gap-3 pt-8"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              }}
            >
              {plotsRef.current.map((p, i) => (
                <Plot key={i} plant={p} onFeed={() => feed(i)} onPull={() => pullWeed(i)} tool={tool} />
              ))}
            </div>

            {/* Floaters */}
            {floatersRef.current.map(f => {
              const row = Math.floor(f.plot / COLS);
              const col = f.plot % COLS;
              const leftPct = ((col + 0.5) / COLS) * 100;
              const topPct = 15 + (row / ROWS) * 70;
              const age = (now - f.born) / 1000;
              return (
                <div key={f.id}
                  className="absolute pointer-events-none font-black text-sm drop-shadow z-30"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct - age * 8}%`,
                    transform: 'translate(-50%, -50%)',
                    color: f.color,
                    opacity: Math.max(0, 1 - age),
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}>
                  {f.text}
                </div>
              );
            })}

            {/* Overlays */}
            {phase === 'ready' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <Sprout className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Round {round + 1}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pick a resource, then tap the crop that is asking for it. Pull weeds — don't feed them!
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
                  <h2 className="text-2xl font-bold text-foreground mb-1">Harvest Time!</h2>
                  <p className="text-sm text-muted-foreground mb-1">Crops harvested: <strong>{harvested}</strong></p>
                  <p className="text-sm text-muted-foreground mb-1">Crops choked: <strong>{choked}</strong></p>
                  <p className="text-lg font-bold text-foreground mb-4">Round score: {Math.max(0, scoreRef.current)}</p>
                  <button onClick={commitRoundAndAdvance}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90">
                    {round + 1 >= ROUNDS_PER_LEVEL ? 'Finish Level' : 'Next Round'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side panel: resource tools + guide */}
          <div className="rounded-xl border-2 border-border bg-card p-4 space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground mb-2">Pick a Resource</p>
              <div className="grid grid-cols-3 gap-2">
                {RESOURCES.map(r => {
                  const active = tool === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTool(r.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                        active
                          ? 'border-primary bg-primary/10 scale-105'
                          : 'border-border bg-secondary/40 hover:border-primary/50'
                      }`}
                    >
                      <r.Icon className={`w-6 h-6 ${r.color}`} />
                      <span className="text-[11px] font-bold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Tap a plant to give it the selected resource. Match the bubble above the crop!
              </p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Field Guide</p>
              <p className="text-foreground">
                <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-1 align-middle" />
                <strong>Crop</strong> — feed the resource it's asking for. +5 per feed, +15 when it's ready to harvest.
              </p>
              <p className="text-foreground mt-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />
                <strong>Weed</strong> — tap the little scissors to <strong>pull it</strong> (+3). Feeding a weed grows it, and a full-grown weed <strong>chokes</strong> the crops next to it.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Why It Matters</p>
              <p className="text-foreground">Weeds want the same water, sun, and food as crops. If they get the resources first, the crop loses out. Real farmers pull or spot-spray weeds so crops get what they need!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Plot ---------------------------------------------------------
function Plot({ plant, onFeed, onPull, tool }: {
  plant: Plant | null;
  onFeed: () => void;
  onPull: () => void;
  tool: Resource;
}) {
  const shakeStyle = plant && plant.shake > 0
    ? { transform: `translateX(${Math.sin(performance.now() / 30) * 3}px)` }
    : undefined;

  return (
    <div className="relative">
      {/* Soil bed */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] rounded-b-2xl rounded-t-lg shadow-inner"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #8b5a2b 0%, #5a3a1e 70%, #3d2611 100%)' }}
      />
      {!plant && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70 text-xs">Empty</div>
      )}

      {plant && (
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onFeed(); }}
          className="absolute inset-0 flex flex-col items-center justify-end focus:outline-none group"
          aria-label={plant.kind === 'crop' ? `Feed ${plant.name}` : 'Feed weed (risky!)'}
        >
          {/* Need bubble (crops only) */}
          {plant.kind === 'crop' && plant.need && plant.growth < CROP_MAX && (
            <NeedBubble need={plant.need} matches={tool === plant.need} />
          )}
          {/* Growth bar */}
          <GrowthBar
            growth={plant.growth}
            max={plant.kind === 'crop' ? CROP_MAX : WEED_MAX}
            kind={plant.kind}
          />
          {/* Plant art */}
          <div
            className={`relative w-[70%] rounded-full border-4 shadow-lg overflow-hidden bg-white mb-1 ${
              plant.kind === 'weed'
                ? 'border-red-500 ring-2 ring-red-200'
                : 'border-green-600 ring-2 ring-green-200'
            }`}
            style={{
              aspectRatio: '1 / 1',
              // crops start small and grow bigger, weeds also grow
              transform: `scale(${plant.kind === 'crop'
                ? 0.55 + (plant.growth / CROP_MAX) * 0.45
                : 0.6 + (plant.growth / WEED_MAX) * 0.4})`,
              transition: 'transform 200ms ease-out',
              ...shakeStyle,
            }}
          >
            {plant.kind === 'weed'
              ? <WeedImage weedId={plant.name} stage="flower" className="w-full h-full" />
              : <CropImg name={plant.name} />}
          </div>
          <div className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shadow mb-1 ${
            plant.kind === 'weed' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
          }`}>
            {plant.kind === 'weed' ? 'WEED' : plant.name}
          </div>
        </button>
      )}

      {/* Pull-weed action (safe way to remove weed without feeding it) */}
      {plant && plant.kind === 'weed' && (
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onPull(); }}
          className="absolute -top-1 -right-1 z-10 bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white hover:bg-emerald-700"
          aria-label="Pull weed"
          title="Pull the weed (safe!)"
        >
          <span className="text-lg font-black leading-none">✂</span>
        </button>
      )}
    </div>
  );
}

function NeedBubble({ need, matches }: { need: Resource; matches: boolean }) {
  const meta = RESOURCES.find(r => r.id === need)!;
  const Icon = meta.Icon;
  return (
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 bg-white rounded-full p-1 border-2 shadow ${
      matches ? 'border-primary animate-pulse' : 'border-border'
    }`}>
      <Icon className={`w-4 h-4 ${meta.color}`} />
    </div>
  );
}

function GrowthBar({ growth, max, kind }: { growth: number; max: number; kind: PlantKind }) {
  return (
    <div className="absolute top-2 left-2 right-2 flex gap-0.5 z-10">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < growth
              ? kind === 'weed' ? 'bg-red-500' : 'bg-green-500'
              : 'bg-white/50'
          }`}
        />
      ))}
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