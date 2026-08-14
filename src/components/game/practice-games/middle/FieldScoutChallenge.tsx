import { useEffect, useMemo, useRef, useState } from 'react';
import { Footprints, DollarSign, Sprout, Leaf, Flower2, Target, RotateCcw, MapPin } from 'lucide-react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import aerialCorn from '@/assets/images/aerial_corn_field.jpg';
import aerialSoybean from '@/assets/images/aerial_soybean_field.jpg';
import aerialPasture from '@/assets/images/aerial_pasture_field.jpg';

/**
 * Field Scout Challenge — the student is an agronomist scouting one field at
 * THREE points in a growing season (soon after planting, vegetative, and
 * reproductive). Each trip they draw the walking path their scout takes.
 * Longer path = more money spent. Weeds seen depend on where the path went,
 * and the photos shown match the seasonal growth stage. Skipping big blocks
 * of the field lets weed pressure build for the next trip; a pattern that
 * samples the whole field (a W, a zig-zag, an X) keeps pressure down.
 * Money left at the end — after scouting cost and end-of-season yield loss —
 * is the score.
 */

const START_MONEY = 1000;
const COST_PER_UNIT = 1.2;          // $ per percent-unit of path walked
const SCOUT_RADIUS_PCT = 7;         // how wide the scout can see either side
const YIELD_LOSS_PER_WEED = 22;     // $ lost per weed left undetected at season end
const GRID = 3;                     // field is scored on a 3x3 block grid

type Trip = 0 | 1 | 2;
const TRIPS = [
  { key: 'seedling' as const, name: 'Soon after planting', sub: 'Seedling stage', Icon: Sprout, blurb: 'Crop rows are just emerging. Early weed escapes are small and easy to miss.' },
  { key: 'vegetative' as const, name: 'Vegetative stages', sub: 'Vegetative stage', Icon: Leaf, blurb: 'The canopy is closing. Weeds that survived the first pass are getting bigger.' },
  { key: 'reproductive' as const, name: 'Reproductive stages', sub: 'Flowering / seed set', Icon: Flower2, blurb: 'Last look before harvest. Anything setting seed now feeds next year\u2019s seed bank.' },
];

const CROP_IMAGES = [aerialCorn, aerialSoybean, aerialPasture];

interface Plant { x: number; y: number; weedId: string; }

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

function pathLength(pts: { x: number; y: number }[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += dist(pts[i - 1], pts[i]);
  return d;
}

/** Scatter `count` weeds across the field in a few loose patches. */
function buildPlants(count: number, speciesCount: number): Plant[] {
  const chosen = shuffle(weeds).slice(0, Math.max(2, speciesCount));
  const patches = Array.from({ length: Math.max(2, Math.round(count / 5)) }, () => ({
    cx: 12 + Math.random() * 76,
    cy: 12 + Math.random() * 76,
  }));
  return Array.from({ length: count }, (_, i) => {
    const p = patches[i % patches.length];
    const r = 14 * Math.sqrt(Math.random());
    const t = Math.random() * Math.PI * 2;
    return {
      x: Math.max(3, Math.min(97, p.cx + r * Math.cos(t))),
      y: Math.max(3, Math.min(97, p.cy + r * Math.sin(t))),
      weedId: chosen[i % chosen.length].id,
    };
  });
}

function distToSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const apx = p.x - a.x, apy = p.y - a.y;
  const ab2 = abx * abx + aby * aby || 1;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
  return Math.hypot(p.x - (a.x + abx * t), p.y - (a.y + aby * t));
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

export default function FieldScoutChallenge({ onBack, gameId, gameName, gradeLabel }: Props) {
  const title = gameName ?? 'Field Scout Challenge';
  const [season, setSeason] = useState(1);
  const [trip, setTrip] = useState<Trip>(0);
  const [money, setMoney] = useState(START_MONEY);
  const [pressure, setPressure] = useState(14);      // weeds present this trip
  const [log, setLog] = useState<{ trip: number; cost: number; found: number; total: number; blocks: number }[]>([]);
  const [plants, setPlants] = useState<Plant[]>(() => buildPlants(14, 4));
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [seasonOver, setSeasonOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropImg = CROP_IMAGES[(season - 1) % CROP_IMAGES.length];
  const stage = TRIPS[trip];

  useEffect(() => {
    setPlants(buildPlants(pressure, 3 + trip));
    setPath([]);
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, season]);

  const pointerToPct = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
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
      if (!last || dist(last, p) < 1.2) return prev;
      return [...prev, p];
    });
  };
  const end = () => setDrawing(false);

  const walked = pathLength(path);
  const cost = Math.round(walked * COST_PER_UNIT);

  const foundIdx = useMemo(() => {
    const found = new Set<number>();
    if (path.length < 2) return found;
    plants.forEach((pl, i) => {
      for (let j = 1; j < path.length; j++) {
        if (distToSegment(pl, path[j - 1], path[j]) <= SCOUT_RADIUS_PCT) { found.add(i); break; }
      }
    });
    return found;
  }, [path, plants]);

  /** How many of the 9 field blocks the path actually sampled. */
  const blocksCovered = useMemo(() => {
    if (path.length < 2) return 0;
    const seen = new Set<string>();
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const centre = { x: (c + 0.5) * (100 / GRID), y: (r + 0.5) * (100 / GRID) };
        for (let j = 1; j < path.length; j++) {
          if (distToSegment(centre, path[j - 1], path[j]) <= 100 / GRID / 1.4) { seen.add(`${r}-${c}`); break; }
        }
      }
    }
    return seen.size;
  }, [path]);

  const missed = plants.length - foundIdx.size;

  const submit = () => {
    if (path.length < 3) return;
    setSubmitted(true);
    setMoney(m => m - cost);
    setLog(l => [...l, { trip, cost, found: foundIdx.size, total: plants.length, blocks: blocksCovered }]);
  };

  const nextTrip = () => {
    // Good coverage of the whole field keeps pressure down; skipping blocks lets it explode.
    const missedBlocks = GRID * GRID - blocksCovered;
    const next = Math.max(6, Math.round(plants.length * 0.55 + missedBlocks * 2.2 + missed * 0.4));
    setPressure(next);
    if (trip === 2) setSeasonOver(true);
    else setTrip((t) => (t + 1) as Trip);
  };

  const clearPath = () => setPath([]);

  const totalSpent = log.reduce((s, l) => s + l.cost, 0);
  const yieldLoss = seasonOver ? missed * YIELD_LOSS_PER_WEED : 0;
  const finalMoney = Math.max(0, START_MONEY - totalSpent - yieldLoss);
  const rating =
    finalMoney >= 750 ? 'Master Agronomist' :
    finalMoney >= 550 ? 'Sharp Scout' :
    finalMoney >= 350 ? 'Getting There' : 'Field Overgrown';

  if (seasonOver) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto pt-[84px]">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          <div className="rounded-xl border-2 border-primary/40 bg-card p-4 text-center">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Season {season} report</p>
            <p className="font-display font-extrabold text-4xl text-primary">${finalMoney}</p>
            <p className="text-sm font-bold text-foreground">{rating}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Starting budget</span><span className="font-bold text-foreground">${START_MONEY}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Scouting cost (3 trips)</span><span className="font-bold text-destructive">-${totalSpent}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Yield loss from {missed} missed weeds</span><span className="font-bold text-destructive">-${yieldLoss}</span></div>
            <div className="border-t border-border pt-2 flex justify-between"><span className="font-bold text-foreground">Money kept</span><span className="font-extrabold text-primary">${finalMoney}</span></div>
            <p className="text-xs text-muted-foreground pt-2">
              Walk cheap, but walk smart. A pattern that crosses the whole field — a W, a zig-zag, an X — costs a little
              more than hugging the outside, but it finds the patches before they set seed.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {log.map((l, i) => (
              <div key={i} className="rounded-lg border border-border bg-secondary/40 p-2 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">{TRIPS[l.trip].sub}</p>
                <p className="text-sm font-bold text-foreground">{l.found}/{l.total} found</p>
                <p className="text-[10px] text-muted-foreground">${l.cost} · {l.blocks}/9 blocks</p>
              </div>
            ))}
          </div>
          <LevelComplete
            level={season}
            score={finalMoney}
            total={START_MONEY}
            onNextLevel={() => { setSeason(s => s + 1); setTrip(0); setMoney(START_MONEY); setPressure(14); setLog([]); setSeasonOver(false); }}
            onStartOver={() => { setSeason(1); setTrip(0); setMoney(START_MONEY); setPressure(14); setLog([]); setSeasonOver(false); }}
            onBack={onBack}
            title={title}
            gameId={gameId}
            gameName={gameName}
            gradeLabel={gradeLabel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col pt-[84px]">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
        <stage.Icon className="w-5 h-5 text-primary" />
        <h1 className="font-display font-bold text-foreground text-base sm:text-lg flex-1">{title}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Season {season}</span>
        <span className="text-sm text-muted-foreground">Trip {trip + 1}/3</span>
        <span className="inline-flex items-center gap-1 text-sm font-extrabold text-foreground">
          <DollarSign className="w-4 h-4 text-primary" />{money - (submitted ? 0 : cost)}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 p-3 overflow-hidden">
        {/* Field canvas */}
        <div
          ref={containerRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="relative rounded-xl border-2 border-border overflow-hidden bg-muted select-none touch-none min-h-[320px]"
          style={{ cursor: submitted ? 'default' : 'crosshair' }}
        >
          <img src={cropImg} alt="Aerial view of the field being scouted" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Block grid guide */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[1, 2].map(i => (
              <g key={i} stroke="hsl(var(--background))" strokeWidth="0.3" opacity="0.35">
                <line x1={(100 / GRID) * i} y1="0" x2={(100 / GRID) * i} y2="100" />
                <line x1="0" y1={(100 / GRID) * i} x2="100" y2={(100 / GRID) * i} />
              </g>
            ))}
            {path.length > 1 && (
              <>
                <polyline points={path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth={SCOUT_RADIUS_PCT * 2} strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
                <polyline points={path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>

          {/* Weeds — only revealed once the path has been submitted or they fall in the scouted band */}
          {plants.map((pl, i) => {
            const found = foundIdx.has(i);
            if (!found && !submitted) return null;
            return (
              <div
                key={i}
                className={`absolute w-9 h-9 rounded-full overflow-hidden border-2 shadow-md ${found ? 'border-primary ring-2 ring-primary/40' : 'border-destructive opacity-70'}`}
                style={{ left: `${pl.x}%`, top: `${pl.y}%`, transform: 'translate(-50%,-50%)' }}
                title={found ? 'Scouted' : 'Missed — this one keeps growing'}
              >
                <WeedImage weedId={pl.weedId} stage={stage.key} className="w-full h-full object-cover" />
              </div>
            );
          })}

          <div className="absolute bottom-2 left-2 right-2 bg-background/85 rounded-lg p-2">
            <p className="text-xs font-bold text-foreground">{stage.name} — {stage.sub}</p>
            <p className="text-[11px] text-muted-foreground">{stage.blurb}</p>
          </div>
        </div>

        {/* Side panel */}
        <div className="overflow-y-auto space-y-3">
          <div className="rounded-xl border-2 border-border bg-card p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Your job</p>
            <p className="text-xs text-foreground">
              Find the best representation of the weeds in your field. Draw the path you make your agronomist walk —
              the longer the path, the more it costs. Do it as cheaply as you can while still sampling the whole field.
            </p>
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-foreground"><Footprints className="w-3 h-3" /> Path walked</span>
              <span className="font-bold text-foreground">{Math.round(walked)} units</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-foreground"><DollarSign className="w-3 h-3" /> Scouting cost</span>
              <span className="font-bold text-destructive">-${cost}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-foreground"><MapPin className="w-3 h-3" /> Field blocks sampled</span>
              <span className="font-bold text-foreground">{blocksCovered}/9</span>
            </div>
            {submitted && (
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-foreground"><Target className="w-3 h-3" /> Weeds found</span>
                <span className="font-bold text-primary">{foundIdx.size}/{plants.length}</span>
              </div>
            )}
          </div>

          {!submitted ? (
            <div className="space-y-2">
              <button onClick={submit} disabled={path.length < 3}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">
                Send the Scout
              </button>
              <button onClick={clearPath} disabled={!path.length}
                className="w-full py-2 rounded-lg bg-secondary text-foreground font-semibold text-sm disabled:opacity-40 inline-flex items-center justify-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" /> Clear Path
              </button>
              <p className="text-[11px] text-muted-foreground italic text-center">
                Walking only the outside edge is cheap but misses the middle — those patches come back bigger next trip.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className={`rounded-xl border-2 p-3 ${blocksCovered >= 7 ? 'border-primary/50 bg-primary/10' : 'border-destructive/50 bg-destructive/10'}`}>
                <p className="text-sm font-bold text-foreground">
                  {blocksCovered >= 7 ? 'Strong sample of the field.' : 'You skipped part of the field.'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {blocksCovered >= 7
                    ? 'Weed pressure should stay lower on your next trip.'
                    : `${GRID * GRID - blocksCovered} blocks were never walked — expect more weeds next time.`}
                </p>
              </div>
              <button onClick={nextTrip} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                {trip === 2 ? 'Finish the Season' : `Next Trip: ${TRIPS[trip + 1].name}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
