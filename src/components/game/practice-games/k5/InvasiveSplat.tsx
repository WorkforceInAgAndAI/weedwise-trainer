import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Droplet, Sparkles, AlertTriangle, RotateCcw, ChevronRight } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { weeds } from '@/data/weeds';

// -------- Invasive Splat! (K-5 Explorer, drag & drop) ---------------------
// Splatter-art game teaching how invasive weeds out-compete native plants.
// Kids drag a "runny" invasive paint blob onto a meadow of native plant dots.
// The invasive splat spreads wide and covers any native it lands on top of.
// -------------------------------------------------------------------------

interface NativeSpot {
  id: string;
  name: string;
  x: number; // px within field
  y: number;
  color: string;
  covered: boolean;
}

interface Splat {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  shape: string; // random border-radius string
  angle: number;
}

interface InvasiveDef {
  name: string;
  color: string;
  funFact: string;
}

const FIELD_W = 640;
const FIELD_H = 380;
const SPLAT_RADIUS = 150; // "runny" invasive splat radius in px
const DROPS_PER_ROUND = 2;
const ROUNDS_PER_LEVEL = 4;

// Curated "playground bully" invasives from the module.
const INVASIVES: InvasiveDef[] = [
  { name: 'Garlic Mustard', color: '#7c3aed', funFact: 'Poisons the soil so nothing else can grow near it!' },
  { name: 'Field Bindweed', color: '#ea580c', funFact: 'Its vines wrap around neighbors and choke them out.' },
  { name: 'Quackgrass', color: '#0891b2', funFact: 'Underground roots shoot out sideways and pop up everywhere.' },
  { name: 'Canada Thistle', color: '#be185d', funFact: 'One plant can spread into a whole patch in a single summer.' },
  { name: 'Downy Brome', color: '#ca8a04', funFact: 'Drops thousands of seeds that sprout before natives wake up.' },
  { name: 'Tall Morningglory', color: '#6d28d9', funFact: 'Twines up other plants and steals their sunlight.' },
];

const NATIVE_COLORS = ['#16a34a', '#059669', '#65a30d', '#15803d', '#22c55e', '#84cc16'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

function randomBlobRadius(): string {
  const r = () => 40 + Math.floor(Math.random() * 40);
  return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
}

function pickNatives(): NativeSpot[] {
  const pool = weeds.filter(w => w.origin === 'Native');
  const chosen = shuffle(pool).slice(0, 8);
  // scatter with padding from edges
  return chosen.map((w, i) => ({
    id: `${w.id}-${i}`,
    name: w.commonName,
    x: 60 + Math.random() * (FIELD_W - 120),
    y: 50 + Math.random() * (FIELD_H - 100),
    color: NATIVE_COLORS[i % NATIVE_COLORS.length],
    covered: false,
  }));
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function InvasiveSplat({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalCovered, setTotalCovered] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [natives, setNatives] = useState<NativeSpot[]>(() => pickNatives());
  const [invasive, setInvasive] = useState<InvasiveDef>(() => rand(INVASIVES));
  const [splats, setSplats] = useState<Splat[]>([]);
  const [dropsLeft, setDropsLeft] = useState(DROPS_PER_ROUND);
  const [phase, setPhase] = useState<'play' | 'result'>('play');
  const fieldRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const covered = natives.filter(n => n.covered).length;

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragging.current || dropsLeft <= 0 || phase !== 'play') return;
    dragging.current = false;
    const rect = fieldRef.current!.getBoundingClientRect();
    const scaleX = FIELD_W / rect.width;
    const scaleY = FIELD_H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    dropAt(x, y);
  }

  function dropAt(x: number, y: number) {
    const splat: Splat = {
      id: Date.now() + Math.random(),
      x, y,
      radius: SPLAT_RADIUS,
      color: invasive.color,
      shape: randomBlobRadius(),
      angle: Math.random() * 360,
    };
    setSplats(s => [...s, splat]);
    setNatives(ns => ns.map(n => {
      if (n.covered) return n;
      const dx = n.x - x, dy = n.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= SPLAT_RADIUS ? { ...n, covered: true } : n;
    }));
    setDropsLeft(d => {
      const next = d - 1;
      if (next <= 0) {
        setTimeout(() => setPhase('result'), 900);
      }
      return next;
    });
  }

  function nextRound() {
    const roundCovered = natives.filter(n => n.covered).length;
    const nextTotalCovered = totalCovered + roundCovered;
    const nextTotalPossible = totalPossible + natives.length;
    const nextRoundNum = round + 1;
    if (nextRoundNum >= ROUNDS_PER_LEVEL) {
      setTotalCovered(nextTotalCovered);
      setTotalPossible(nextTotalPossible);
      setDone(true);
      return;
    }
    setTotalCovered(nextTotalCovered);
    setTotalPossible(nextTotalPossible);
    setRound(nextRoundNum);
    setNatives(pickNatives());
    setInvasive(rand(INVASIVES));
    setSplats([]);
    setDropsLeft(DROPS_PER_ROUND);
    setPhase('play');
  }

  function startOver() {
    setLevel(1); setRound(0); setTotalCovered(0); setTotalPossible(0);
    setNatives(pickNatives()); setInvasive(rand(INVASIVES));
    setSplats([]); setDropsLeft(DROPS_PER_ROUND); setPhase('play'); setDone(false);
  }
  function nextLevel() {
    setLevel(l => l + 1); setRound(0); setTotalCovered(0); setTotalPossible(0);
    setNatives(pickNatives()); setInvasive(rand(INVASIVES));
    setSplats([]); setDropsLeft(DROPS_PER_ROUND); setPhase('play'); setDone(false);
  }

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={totalCovered}
        total={totalPossible}
        onNextLevel={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
        title="Invasive Splat!"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

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
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Invasive Splat!
        </h1>
        <p className="text-muted-foreground mb-3">Drag the runny invasive paint onto the meadow. Watch it spread and cover the native plants — that's how invasive "playground bullies" take over!</p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Real-life rule:</strong> Never touch or pull weeds unless a trusted adult tells you it's safe. Some invasive weeds can sting, prickle, or make you itchy.</p>
        </div>

        <div className="grid md:grid-cols-[1fr,220px] gap-4">
          {/* Field */}
          <div
            ref={fieldRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative rounded-xl overflow-hidden shadow-lg border-4 border-green-800/40 select-none"
            style={{
              aspectRatio: `${FIELD_W} / ${FIELD_H}`,
              background: 'radial-gradient(ellipse at top, #d9f99d 0%, #a7f3d0 40%, #86efac 100%)',
            }}
          >
            <svg viewBox={`0 0 ${FIELD_W} ${FIELD_H}`} className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Native plant spots */}
              {natives.map(n => (
                <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                  <circle
                    r={26}
                    fill={n.covered ? '#374151' : n.color}
                    opacity={n.covered ? 0.35 : 1}
                    stroke="#166534"
                    strokeWidth={2}
                  />
                  <text
                    y={44}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill={n.covered ? '#6b7280' : '#14532d'}
                    style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}
                  >
                    {n.name}
                  </text>
                  {n.covered && (
                    <text y={4} textAnchor="middle" fontSize={14} fontWeight={900} fill="#fff">×</text>
                  )}
                </g>
              ))}
            </svg>

            {/* Invasive splats layer (HTML for animation) */}
            <div className="absolute inset-0 pointer-events-none" style={{ containerType: 'inline-size' }}>
              {splats.map(s => {
                const leftPct = (s.x / FIELD_W) * 100;
                const topPct = (s.y / FIELD_H) * 100;
                const sizePct = (s.radius * 2 / FIELD_W) * 100;
                return (
                  <div
                    key={s.id}
                    className="absolute animate-splat"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${sizePct}%`,
                      aspectRatio: '1 / 1',
                      transform: `translate(-50%, -50%) rotate(${s.angle}deg)`,
                      background: `radial-gradient(circle at 40% 40%, ${s.color}, ${s.color}dd 60%, ${s.color}88 100%)`,
                      borderRadius: s.shape,
                      boxShadow: `0 4px 12px ${s.color}55`,
                      mixBlendMode: 'multiply',
                    }}
                  >
                    {/* Drippy little satellite blobs */}
                    <span className="absolute -top-3 left-1/3 w-4 h-4 rounded-full" style={{ background: s.color }} />
                    <span className="absolute top-1/2 -right-4 w-6 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="absolute -bottom-4 right-1/4 w-5 h-5 rounded-full" style={{ background: s.color }} />
                    <span className="absolute bottom-1/4 -left-3 w-3 h-3 rounded-full" style={{ background: s.color }} />
                  </div>
                );
              })}
            </div>

            {phase === 'result' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fade-in">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <h3 className="text-xl font-bold text-foreground mb-2">Splat Results!</h3>
                  <p className="text-4xl font-bold text-red-600 mb-1">{covered} / {natives.length}</p>
                  <p className="text-sm text-muted-foreground mb-4">native plants out-competed by <span className="font-semibold" style={{ color: invasive.color }}>{invasive.name}</span></p>
                  <button onClick={nextRound} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold hover:opacity-90">
                    Next Round <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paint palette */}
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Today's Invader</p>
              <p className="text-lg font-bold" style={{ color: invasive.color }}>{invasive.name}</p>
              <p className="text-xs text-muted-foreground mt-1 italic">"{invasive.funFact}"</p>
            </div>

            <div className="rounded-lg border-2 border-dashed border-border bg-card p-3 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Paint Blobs Left</p>
              <div className="flex justify-center gap-2 mb-3">
                {Array.from({ length: DROPS_PER_ROUND }).map((_, i) => (
                  <Droplet key={i} className="w-6 h-6" style={{
                    color: i < dropsLeft ? invasive.color : '#d1d5db',
                    fill: i < dropsLeft ? invasive.color : 'none',
                  }} />
                ))}
              </div>
              {dropsLeft > 0 && phase === 'play' ? (
                <>
                  <div
                    draggable
                    onDragStart={() => { dragging.current = true; }}
                    onDragEnd={() => { dragging.current = false; }}
                    className="mx-auto w-24 h-24 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${invasive.color}, ${invasive.color}cc)`,
                      borderRadius: '58% 42% 63% 37% / 45% 60% 40% 55%',
                      boxShadow: `0 6px 16px ${invasive.color}66`,
                    }}
                    title="Drag me onto the meadow!"
                    aria-label={`Drag ${invasive.name} paint blob`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Drag onto the meadow →</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-2">All blobs used!</p>
              )}
            </div>

            <button
              onClick={() => { setSplats([]); setNatives(natives.map(n => ({ ...n, covered: false }))); setDropsLeft(DROPS_PER_ROUND); setPhase('play'); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 rounded border border-border"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-foreground">
              <p className="font-semibold mb-1">Score so far</p>
              <p>{totalCovered + covered} natives covered by invasives</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <FarmerGuide tone="intro" text={`Whoa! ${invasive.name} paint is extra runny — that's like a real invasive weed that spreads super fast. Drop it and watch it out-compete the native plants!`} />
        </div>
      </div>

      <style>{`
        @keyframes splat-pop {
          0% { transform: translate(-50%, -50%) rotate(var(--r,0deg)) scale(0.1); opacity: 0.6; }
          60% { transform: translate(-50%, -50%) rotate(var(--r,0deg)) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--r,0deg)) scale(1); opacity: 1; }
        }
        .animate-splat { animation: splat-pop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>
    </div>
  );
}
