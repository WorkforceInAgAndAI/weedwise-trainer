import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Sparkles, AlertTriangle, RotateCcw, ChevronRight, Wind } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

// -------- Invasive Splat! (K-5 Explorer, spin-art paint canvas) -----------
// Kids drop invasive (watery) and native (thick) paint blobs onto a round
// paper on a spinning wheel. When they hit SPIN, the paints smear outward:
// the runny invasive paint spreads much further than the thick native paint,
// showing how invasive weeds out-compete natives for space.
// -------------------------------------------------------------------------

interface PaintDef { key: 'invasive' | 'native'; name: string; label: string; color: string; funFact: string; }

interface Round { invasive: PaintDef; native: PaintDef; }

const INVASIVES: PaintDef[] = [
  { key: 'invasive', name: 'Garlic Mustard', label: 'Invasive · watery', color: '#7c3aed', funFact: 'Its runny roots poison the soil so nothing else grows nearby.' },
  { key: 'invasive', name: 'Field Bindweed', label: 'Invasive · watery', color: '#ea580c', funFact: 'Vines slip out and grab neighbors before they can react.' },
  { key: 'invasive', name: 'Canada Thistle', label: 'Invasive · watery', color: '#be185d', funFact: 'One plant becomes a whole patch in a single summer.' },
  { key: 'invasive', name: 'Quackgrass',      label: 'Invasive · watery', color: '#0891b2', funFact: 'Sneaky underground stems pop up everywhere.' },
];
const NATIVES: PaintDef[] = [
  { key: 'native', name: 'Milkweed',      label: 'Native · thick', color: '#16a34a', funFact: 'Stays put — feeds monarch caterpillars in one tidy patch.' },
  { key: 'native', name: 'Purple Coneflower', label: 'Native · thick', color: '#7e22ce', funFact: 'Roots dig down instead of spreading sideways.' },
  { key: 'native', name: 'Little Bluestem',   label: 'Native · thick', color: '#0f766e', funFact: 'Grows slow and steady, sharing space with neighbors.' },
  { key: 'native', name: 'Black-eyed Susan',  label: 'Native · thick', color: '#ca8a04', funFact: 'Bright and cheerful — but polite about its space.' },
];

const CANVAS = 480;              // canvas pixel size
const CENTER = CANVAS / 2;
const R_MAX = CANVAS / 2 - 8;    // paper radius
const ROUNDS_PER_LEVEL = 3;

// Physics-ish constants
const INVASIVE_SPREAD = 6.0;     // radial stretch factor when spinning
const NATIVE_SPREAD   = 1.6;
const INVASIVE_WIDTH  = 26;      // drop base radius in px
const NATIVE_WIDTH    = 22;

interface Drop { id: number; x: number; y: number; type: 'invasive' | 'native'; color: string; }

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }

function newRound(): Round { return { invasive: pick(INVASIVES), native: pick(NATIVES) }; }

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function InvasiveSplat({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalInv, setTotalInv] = useState(0);
  const [totalNat, setTotalNat] = useState(0);
  const [done, setDone] = useState(false);

  const [roundData, setRoundData] = useState<Round>(() => newRound());
  const [drops, setDrops] = useState<Drop[]>([]);
  const [selected, setSelected] = useState<'invasive' | 'native'>('invasive');
  const [phase, setPhase] = useState<'setup' | 'spinning' | 'result'>('setup');
  const [coverage, setCoverage] = useState<{ invasive: number; native: number; blank: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropIdRef = useRef(0);

  // Render dots (setup phase) and streaks (spinning/result phase)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Paper background (circular clip)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, R_MAX, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#fefdf8';
    ctx.fill();
    ctx.clip();

    if (phase === 'setup') {
      // Just render drop dots at their spots
      for (const d of drops) {
        const w = d.type === 'invasive' ? INVASIVE_WIDTH : NATIVE_WIDTH;
        if (d.type === 'invasive') {
          // Watery halo — wide, translucent puddle around the main drop
          const halo = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, w * 1.9);
          halo.addColorStop(0, d.color + 'aa');
          halo.addColorStop(0.55, d.color + '55');
          halo.addColorStop(1, d.color + '00');
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(d.x, d.y, w * 1.9, 0, Math.PI * 2); ctx.fill();
          // Main wet blob — slightly darker, glossy
          const grad = ctx.createRadialGradient(d.x - w * 0.25, d.y - w * 0.25, w * 0.05, d.x, d.y, w);
          grad.addColorStop(0, '#ffffffaa');
          grad.addColorStop(0.25, d.color + 'ee');
          grad.addColorStop(1, d.color + 'cc');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(d.x, d.y, w, 0, Math.PI * 2); ctx.fill();
          // Scattered droplet spray around the drop
          for (let i = 0; i < 7; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = w * (1.1 + Math.random() * 1.4);
            const dr = 1.5 + Math.random() * 4;
            ctx.fillStyle = d.color + 'aa';
            ctx.beginPath(); ctx.arc(d.x + Math.cos(a) * r, d.y + Math.sin(a) * r, dr, 0, Math.PI * 2); ctx.fill();
          }
          // A drip trail running downward — screams "watery"
          const dripLen = w * (1.4 + Math.random() * 0.8);
          const dripGrad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + dripLen);
          dripGrad.addColorStop(0, d.color + 'cc');
          dripGrad.addColorStop(1, d.color + '00');
          ctx.fillStyle = dripGrad;
          ctx.beginPath();
          ctx.moveTo(d.x - w * 0.35, d.y);
          ctx.quadraticCurveTo(d.x, d.y + dripLen * 0.7, d.x - 2, d.y + dripLen);
          ctx.quadraticCurveTo(d.x + 4, d.y + dripLen * 0.7, d.x + w * 0.35, d.y);
          ctx.closePath(); ctx.fill();
          // Little pooled bead at the drip tip
          ctx.fillStyle = d.color + 'cc';
          ctx.beginPath(); ctx.arc(d.x + 1, d.y + dripLen, 3, 0, Math.PI * 2); ctx.fill();
          // Glossy highlight
          ctx.fillStyle = '#ffffff66';
          ctx.beginPath(); ctx.ellipse(d.x - w * 0.3, d.y - w * 0.35, w * 0.35, w * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
        } else {
          // Thick native paint — solid, matte, minimal spread
          const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, w);
          grad.addColorStop(0, d.color);
          grad.addColorStop(0.85, d.color);
          grad.addColorStop(1, d.color + 'ee');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(d.x, d.y, w, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else {
      // Streak the drops outward from center — invasive stretches further
      for (const d of drops) {
        const dx = d.x - CENTER, dy = d.y - CENTER;
        const r0 = Math.sqrt(dx * dx + dy * dy) + 4;
        const angle = Math.atan2(dy, dx);
        const spread = d.type === 'invasive' ? INVASIVE_SPREAD : NATIVE_SPREAD;
        const w = d.type === 'invasive' ? INVASIVE_WIDTH : NATIVE_WIDTH;
        const rEnd = Math.min(R_MAX, r0 * spread);

        // Draw many overlapping circles along the streak for a paint-smear look
        const steps = 48;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const r = r0 + (rEnd - r0) * t;
          // slight tangential curl so it looks spun
          const curl = (d.type === 'invasive' ? 0.55 : 0.25) * t;
          const a = angle + curl;
          const px = CENTER + Math.cos(a) * r;
          const py = CENTER + Math.sin(a) * r;
          const width = w * (1 - t * 0.6); // taper outward
          ctx.globalAlpha = 0.85 - t * 0.15;
          ctx.fillStyle = d.color;
          ctx.beginPath(); ctx.arc(px, py, width, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    // Compute coverage once the spin animation lands
    if (phase === 'result' && !coverage) {
      const img = ctx.getImageData(0, 0, CANVAS, CANVAS).data;
      let inv = 0, nat = 0, blank = 0, total = 0;
      // Sample every 4th pixel for speed
      for (let y = 0; y < CANVAS; y += 4) {
        for (let x = 0; x < CANVAS; x += 4) {
          const cx = x - CENTER, cy = y - CENTER;
          if (cx * cx + cy * cy > R_MAX * R_MAX) continue;
          total++;
          const i = (y * CANVAS + x) * 4;
          const r = img[i], g = img[i + 1], b = img[i + 2];
          // near-white paper?
          if (r > 240 && g > 240 && b > 220) { blank++; continue; }
          // classify by nearest paint color
          const dInv = colorDist(r, g, b, roundData.invasive.color);
          const dNat = colorDist(r, g, b, roundData.native.color);
          if (dInv < dNat) inv++; else nat++;
        }
      }
      const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;
      setCoverage({ invasive: pct(inv), native: pct(nat), blank: pct(blank) });
    }
  }, [drops, phase, roundData, coverage]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (phase !== 'setup') return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS;
    // clip to paper
    const dx = x - CENTER, dy = y - CENTER;
    if (dx * dx + dy * dy > (R_MAX - 10) * (R_MAX - 10)) return;
    const color = selected === 'invasive' ? roundData.invasive.color : roundData.native.color;
    setDrops(d => [...d, { id: ++dropIdRef.current, x, y, type: selected, color }]);
  }

  function spin() {
    if (phase !== 'setup' || drops.length === 0) return;
    setPhase('spinning');
    setCoverage(null);
    // After spin animation, land in result
    setTimeout(() => setPhase('result'), 1800);
  }

  function resetCanvas() {
    setDrops([]); setPhase('setup'); setCoverage(null);
  }

  function nextRound() {
    if (!coverage) return;
    const nextInv = totalInv + coverage.invasive;
    const nextNat = totalNat + coverage.native;
    if (round + 1 >= ROUNDS_PER_LEVEL) {
      setTotalInv(nextInv); setTotalNat(nextNat); setDone(true); return;
    }
    setTotalInv(nextInv); setTotalNat(nextNat);
    setRound(r => r + 1);
    setRoundData(newRound());
    setDrops([]); setPhase('setup'); setCoverage(null);
  }

  function startOver() {
    setLevel(1); setRound(0); setTotalInv(0); setTotalNat(0);
    setRoundData(newRound()); setDrops([]); setPhase('setup'); setCoverage(null); setDone(false);
  }
  function nextLevel() {
    setLevel(l => l + 1); setRound(0); setTotalInv(0); setTotalNat(0);
    setRoundData(newRound()); setDrops([]); setPhase('setup'); setCoverage(null); setDone(false);
  }

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={totalInv}
        total={totalInv + totalNat || 1}
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

  const invCount = drops.filter(d => d.type === 'invasive').length;
  const natCount = drops.filter(d => d.type === 'native').length;

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
          <Sparkles className="w-6 h-6 text-primary" /> Invasive Splat! · Spin-Art Lab
        </h1>
        <p className="text-muted-foreground mb-3">
          Drop paint on the paper, then hit <strong>SPIN</strong>! The runny invasive paint smears way out — just like an invasive weed spreading fast — while the thick native paint stays close to home.
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Real-life rule:</strong> Never touch or pull weeds unless a trusted adult tells you it's safe.</p>
        </div>

        <div className="grid md:grid-cols-[1fr,260px] gap-4">
          {/* Spinning wheel + canvas */}
          <div className="relative rounded-xl border-4 border-amber-700/60 bg-gradient-to-b from-amber-800 to-amber-950 shadow-lg overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
            {/* Wooden wheel base texture */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400 shadow-inner" />
            {/* Spinning paper */}
            <div
              className={`absolute inset-8 rounded-full overflow-hidden shadow-xl ${phase === 'spinning' ? 'animate-spin-paper' : ''}`}
              style={{ transformOrigin: 'center center' }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS}
                height={CANVAS}
                onClick={handleCanvasClick}
                className={`w-full h-full rounded-full ${phase === 'setup' ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ background: '#fefdf8' }}
              />
              {/* center hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-500 pointer-events-none" />
            </div>

            {phase === 'result' && coverage && (
              <div className="absolute inset-0 flex items-end justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto bg-card/95 backdrop-blur rounded-xl p-4 border-2 border-primary shadow-2xl max-w-xs w-full text-center animate-fade-in">
                  <h3 className="text-lg font-bold text-foreground mb-2">Spin Results</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="rounded-lg p-2 border-2" style={{ borderColor: roundData.invasive.color }}>
                      <p className="text-[10px] uppercase font-bold" style={{ color: roundData.invasive.color }}>Invasive</p>
                      <p className="text-2xl font-black" style={{ color: roundData.invasive.color }}>{coverage.invasive}%</p>
                    </div>
                    <div className="rounded-lg p-2 border-2" style={{ borderColor: roundData.native.color }}>
                      <p className="text-[10px] uppercase font-bold" style={{ color: roundData.native.color }}>Native</p>
                      <p className="text-2xl font-black" style={{ color: roundData.native.color }}>{coverage.native}%</p>
                    </div>
                  </div>
                  <button onClick={nextRound} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                    Next Round <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paint palette */}
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pick your paint</p>
              <div className="space-y-2">
                {[roundData.invasive, roundData.native].map(paint => (
                  <button
                    key={paint.key}
                    onClick={() => setSelected(paint.key)}
                    disabled={phase !== 'setup'}
                    className={`w-full text-left rounded-lg border-2 p-2 flex items-center gap-3 transition-all ${
                      selected === paint.key ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/60'
                    } ${phase !== 'setup' ? 'opacity-60' : ''}`}
                  >
                    <div
                      className="shrink-0 w-10 h-10 rounded-full shadow"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${paint.color}, ${paint.color}cc)`,
                        filter: paint.key === 'invasive' ? 'blur(0.5px)' : 'none',
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{paint.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: paint.color }}>{paint.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 italic">"{(selected === 'invasive' ? roundData.invasive : roundData.native).funFact}"</p>
            </div>

            <div className="rounded-lg border-2 border-dashed border-border bg-card p-3 text-xs space-y-1">
              <p className="font-bold text-foreground mb-1">Drops on paper</p>
              <p><span className="inline-block w-3 h-3 rounded-full align-middle mr-1" style={{ background: roundData.invasive.color }} /> Invasive: <strong>{invCount}</strong></p>
              <p><span className="inline-block w-3 h-3 rounded-full align-middle mr-1" style={{ background: roundData.native.color }} /> Native: <strong>{natCount}</strong></p>
            </div>

            {phase === 'setup' && (
              <>
                <button
                  onClick={spin}
                  disabled={drops.length === 0}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Wind className="w-5 h-5" /> SPIN!
                </button>
                <button
                  onClick={resetCanvas}
                  disabled={drops.length === 0}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 rounded border border-border disabled:opacity-40"
                >
                  <RotateCcw className="w-4 h-4" /> Clear paper
                </button>
              </>
            )}

            {phase === 'spinning' && (
              <div className="text-center text-primary font-bold animate-pulse">Spinning…</div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <FarmerGuide
            tone="intro"
            message={`Drop paint anywhere on the paper, then hit SPIN. Watch how the watery invasive paint takes over — that's the same trick real invasive weeds use in a real field!`}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin-paper {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        .animate-spin-paper { animation: spin-paper 1.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
}

// Distance in RGB space between a sampled pixel and a target hex color
function colorDist(r: number, g: number, b: number, hex: string): number {
  const h = hex.replace('#', '');
  const R = parseInt(h.slice(0, 2), 16);
  const G = parseInt(h.slice(2, 4), 16);
  const B = parseInt(h.slice(4, 6), 16);
  const dr = r - R, dg = g - G, db = b - B;
  return dr * dr + dg * dg + db * db;
}