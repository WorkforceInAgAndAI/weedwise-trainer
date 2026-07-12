import { useEffect, useMemo, useRef, useState } from 'react';
import { Footprints, Target, Layers, Droplets } from 'lucide-react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import aerialCorn from '@/assets/images/aerial_corn_field.jpg';
import aerialSoybean from '@/assets/images/aerial_soybean_field.jpg';
import aerialPasture from '@/assets/images/aerial_pasture_field.jpg';

/**
 * Field Scout Draw — the student draws their own scouting transect on top
 * of an aerial field image. Path length and herbicide charges are limited,
 * so they must plan a route that (a) hits the most weeds AND (b) touches
 * the widest variety of species. Score = coverage% × diversity%.
 */

const SCOUT_RADIUS_PCT = 6; // % of image dimension — how "wide" the transect sees
const MAX_PATH_UNITS = 340; // total drawable path length in field-percent units
const HERBICIDE_CHARGES = 8;

const CROP_IMAGES = [aerialCorn, aerialSoybean, aerialPasture];

interface FieldSpec {
 id: number;
 label: string;
 layout: 'clumped' | 'edges' | 'scattered' | 'center' | 'diagonal';
 speciesCount: number;
 plantsPerSpecies: [number, number];
}

const FIELDS: FieldSpec[] = [
 { id: 1, label: '80-acre soybean field with two hot patches near the north end.', layout: 'clumped', speciesCount: 3, plantsPerSpecies: [5, 9] },
 { id: 2, label: '40-acre corn field with weed pressure along the tree-line edge.', layout: 'edges', speciesCount: 4, plantsPerSpecies: [4, 7] },
 { id: 3, label: '120-acre pasture with scattered introductions across the whole field.', layout: 'scattered', speciesCount: 5, plantsPerSpecies: [3, 5] },
 { id: 4, label: '60-acre soybean field with a dense center patch surrounded by clean rows.', layout: 'center', speciesCount: 3, plantsPerSpecies: [6, 10] },
 { id: 5, label: '90-acre corn field with weeds spreading diagonally from a low corner.', layout: 'diagonal', speciesCount: 4, plantsPerSpecies: [4, 6] },
];

interface Plant { x: number; y: number; weedId: string; found: boolean; }

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const dist = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.hypot(a.x - b.x, a.y - b.y);

function buildField(spec: FieldSpec, seed: number): { plants: Plant[]; totalSpecies: number } {
 const chosen = shuffle(weeds).slice(0, spec.speciesCount);
 const plants: Plant[] = [];
 chosen.forEach((w, si) => {
  const [lo, hi] = spec.plantsPerSpecies;
  const n = lo + Math.floor(((seed * (si + 3)) % 1000) / 1000 * (hi - lo));
  // Cluster center by layout
  let cx = 50, cy = 50, radius = 12;
  switch (spec.layout) {
   case 'clumped': cx = 25 + si * 25; cy = 30 + (si % 2) * 35; radius = 9; break;
   case 'edges': {
    const side = si % 4;
    if (side === 0) { cx = 10; cy = 50; }
    else if (side === 1) { cx = 90; cy = 50; }
    else if (side === 2) { cx = 50; cy = 8; }
    else { cx = 50; cy = 92; }
    radius = 8;
    break;
   }
   case 'scattered': cx = 15 + Math.random() * 70; cy = 15 + Math.random() * 70; radius = 22; break;
   case 'center': cx = 50; cy = 50; radius = 12; break;
   case 'diagonal': cx = 15 + si * 20; cy = 15 + si * 18; radius = 8; break;
  }
  for (let i = 0; i < n; i++) {
   const r = radius * Math.sqrt(Math.random());
   const t = Math.random() * Math.PI * 2;
   plants.push({
    x: Math.max(3, Math.min(97, cx + r * Math.cos(t))),
    y: Math.max(3, Math.min(97, cy + r * Math.sin(t))),
    weedId: w.id, found: false,
   });
  }
 });
 return { plants, totalSpecies: chosen.length };
}

function pathLength(pts: {x:number;y:number}[]): number {
 let d = 0;
 for (let i = 1; i < pts.length; i++) d += dist(pts[i - 1], pts[i]);
 return d;
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function FieldScoutDraw({ onBack, gameId, gameName, gradeLabel }: Props) {
 const [level, setLevel] = useState(1);
 const rounds = useMemo(() => shuffle([...FIELDS]).slice(0, 5), [level]);
 const [idx, setIdx] = useState(0);
 const finished = idx >= rounds.length;
 const spec = !finished ? rounds[idx] : rounds[0];
 const field = useMemo(() => buildField(spec, spec.id * 7 + idx * 31 + level * 11), [idx, level, spec]);
 const [plants, setPlants] = useState<Plant[]>([]);
 const [path, setPath] = useState<{ x: number; y: number }[]>([]);
 const [drawing, setDrawing] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [sprayed, setSprayed] = useState<Set<number>>(new Set());
 const [totalScore, setTotalScore] = useState(0);
 const cropImg = CROP_IMAGES[idx % CROP_IMAGES.length];
 const containerRef = useRef<HTMLDivElement>(null);

 // Reset per round
 useEffect(() => {
  setPlants(field.plants);
  setPath([]);
  setSubmitted(false);
  setSprayed(new Set());
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [idx, level]);

 const currentLen = pathLength(path);
 const remaining = Math.max(0, MAX_PATH_UNITS - currentLen);

 const pointerToPct = (e: React.PointerEvent) => {
  const el = containerRef.current;
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
 };

 const start = (e: React.PointerEvent) => {
  if (submitted) return;
  const p = pointerToPct(e); if (!p) return;
  setDrawing(true);
  setPath([p]);
 };
 const move = (e: React.PointerEvent) => {
  if (!drawing || submitted) return;
  const p = pointerToPct(e); if (!p) return;
  setPath(prev => {
   const last = prev[prev.length - 1];
   if (!last || dist(last, p) < 1) return prev; // downsample
   const nextLen = pathLength([...prev, p]);
   if (nextLen > MAX_PATH_UNITS) { setDrawing(false); return prev; }
   return [...prev, p];
  });
 };
 const end = () => setDrawing(false);

 // Coverage = plants within SCOUT_RADIUS_PCT of any path segment
 const foundIndices = useMemo(() => {
  if (path.length < 2) return new Set<number>();
  const found = new Set<number>();
  plants.forEach((pl, i) => {
   for (let j = 1; j < path.length; j++) {
    // Distance from point to segment
    const a = path[j - 1], b = path[j];
    const abx = b.x - a.x, aby = b.y - a.y;
    const apx = pl.x - a.x, apy = pl.y - a.y;
    const ab2 = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
    const cx = a.x + abx * t, cy = a.y + aby * t;
    if (Math.hypot(pl.x - cx, pl.y - cy) <= SCOUT_RADIUS_PCT) { found.add(i); break; }
   }
  });
  return found;
 }, [path, plants]);

 const foundPlants = plants.filter((_, i) => foundIndices.has(i));
 const foundSpecies = new Set(foundPlants.map(p => p.weedId));
 const coveragePct = plants.length ? Math.round((foundPlants.length / plants.length) * 100) : 0;
 const diversityPct = field.totalSpecies ? Math.round((foundSpecies.size / field.totalSpecies) * 100) : 0;
 const finalScore = Math.round((coveragePct * diversityPct) / 100);

 const spray = (i: number) => {
  if (!submitted) return;
  if (sprayed.size >= HERBICIDE_CHARGES) return;
  if (sprayed.has(i)) return;
  setSprayed(prev => new Set(prev).add(i));
 };

 const finishRound = () => {
  setSubmitted(true);
 };

 const nextRound = () => {
  setTotalScore(s => s + finalScore);
  setIdx(i => i + 1);
 };

 const restart = () => { setIdx(0); setTotalScore(0); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (finished) {
  const maxScore = rounds.length * 100;
  return <LevelComplete level={level} score={totalScore} total={maxScore} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-display font-bold text-foreground text-lg flex-1">Field Scout — Draw Your Transect</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">Field {idx + 1}/{rounds.length}</span>
   </div>

   <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 p-3 overflow-hidden">
    {/* LEFT: field canvas */}
    <div className="relative rounded-xl border-2 border-border overflow-hidden bg-muted select-none touch-none"
     ref={containerRef}
     onPointerDown={start}
     onPointerMove={move}
     onPointerUp={end}
     onPointerLeave={end}
     style={{ cursor: submitted ? 'default' : 'crosshair' }}
    >
     <img src={cropImg} alt="Aerial field" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
     <div className="absolute inset-0 bg-black/10 pointer-events-none" />

     {/* Plants */}
     {plants.map((pl, i) => {
      const found = foundIndices.has(i);
      const isSprayed = sprayed.has(i);
      return (
       <button key={i}
        onClick={() => spray(i)}
        disabled={!submitted}
        className={`absolute w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 shadow-md overflow-hidden transition-all ${
         isSprayed ? 'border-emerald-500 opacity-40 ring-2 ring-emerald-400' :
         submitted && found ? 'border-amber-400 ring-2 ring-amber-300' :
         found ? 'border-primary' : 'border-white/70'
        }`}
        style={{ left: `${pl.x}%`, top: `${pl.y}%`, transform: 'translate(-50%,-50%)' }}
        aria-label={`Weed at ${Math.round(pl.x)},${Math.round(pl.y)}`}
       >
        <WeedImage weedId={pl.weedId} stage="flower" className="w-full h-full object-cover pointer-events-none" />
       </button>
      );
     })}

     {/* Path overlay */}
     {path.length > 1 && (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
       <polyline
        points={path.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
       />
       {/* Scout radius as a translucent buffer around the path */}
       <polyline
        points={path.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={SCOUT_RADIUS_PCT * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.15"
       />
      </svg>
     )}

     {/* Field caption */}
     <div className="absolute bottom-2 left-2 right-2 bg-background/85 rounded-lg p-2">
      <p className="text-xs text-foreground font-medium">{spec.label}</p>
     </div>
    </div>

    {/* RIGHT: budget + scoring */}
    <div className="overflow-y-auto space-y-3">
     <div className="rounded-xl border-2 border-border bg-card p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Scouting Budget</p>
      <div>
       <div className="flex justify-between text-xs mb-1">
        <span className="flex items-center gap-1 text-foreground"><Footprints className="w-3 h-3" /> Path used</span>
        <span className="font-bold">{Math.round(currentLen)} / {MAX_PATH_UNITS}</span>
       </div>
       <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${Math.min(100, (currentLen / MAX_PATH_UNITS) * 100)}%` }} />
       </div>
       <p className="text-[10px] text-muted-foreground mt-1">
        Remaining: {Math.round(remaining)} — drag on the field to draw your route.
       </p>
      </div>
     </div>

     <div className="rounded-xl border-2 border-border bg-card p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Live Score</p>
      <div className="grid grid-cols-2 gap-2 text-center">
       <div className="bg-secondary/60 rounded-lg p-2">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><Target className="w-3 h-3" /> Coverage</div>
        <p className="font-display font-bold text-xl text-primary">{coveragePct}%</p>
        <p className="text-[10px] text-muted-foreground">{foundPlants.length} / {plants.length} plants</p>
       </div>
       <div className="bg-secondary/60 rounded-lg p-2">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><Layers className="w-3 h-3" /> Diversity</div>
        <p className="font-display font-bold text-xl text-primary">{diversityPct}%</p>
        <p className="text-[10px] text-muted-foreground">{foundSpecies.size} / {field.totalSpecies} species</p>
       </div>
      </div>
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center">
       <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Round score</p>
       <p className="font-display font-extrabold text-3xl text-primary leading-none">{finalScore}</p>
       <p className="text-[10px] text-muted-foreground">coverage × diversity</p>
      </div>
     </div>

     {!submitted ? (
      <div className="space-y-2">
       <button
        onClick={finishRound}
        disabled={path.length < 3}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40"
       >Submit Transect</button>
       <button
        onClick={() => setPath([])}
        disabled={path.length === 0}
        className="w-full py-2 rounded-lg bg-secondary text-foreground font-semibold text-sm disabled:opacity-40"
       >Clear Path</button>
       <p className="text-[11px] text-muted-foreground text-center italic">
        A straight line through one hot patch wastes diversity. A smart W or zigzag wins both.
       </p>
      </div>
     ) : (
      <div className="space-y-2">
       <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3">
        <p className="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1 mb-1">
         <Droplets className="w-3 h-3" /> Spot-spray budget: {HERBICIDE_CHARGES - sprayed.size} / {HERBICIDE_CHARGES}
        </p>
        <p className="text-[11px] text-amber-800 dark:text-amber-200">
         Tap plants you found to spot-spray them. You can't spray weeds you never scouted — that's the whole point of a good transect.
        </p>
       </div>
       <button
        onClick={nextRound}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold"
       >Next Field →</button>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}