import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Scissors, Play, Leaf, Wheat } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import WeedImage from '@/components/game/WeedImage';
import { middleSchoolWeeds } from '@/data/gradeWeeds';
import { getDifficulty } from '@/lib/difficulty';
import { getCropImages } from '@/lib/imageMap';

/**
 * Monocot or Dicot? (6-8) — same aerial scouting field as the K-5 Row Runner,
 * but the scout has TWO bins. Pull each weed out of the crop rows and drag it
 * into the Monocot bin (grasses: parallel veins, one seed leaf) or the Dicot
 * bin (broadleaves: netted veins, two seed leaves). Leave the crops alone.
 */

const CROP_FOLDERS = ['Alfalfa', 'Barley', 'Canola', 'Corn', 'Cotton', 'Field Peas', 'Millet', 'Oats', 'Rice', 'Sorghum', 'Soybean', 'Wheat'];
const CROP_PHOTOS: { name: string; url: string }[] = CROP_FOLDERS.flatMap(name =>
  getCropImages(name).map(url => ({ name, url }))
);
function randomCropPhoto() {
  if (CROP_PHOTOS.length === 0) return null;
  return CROP_PHOTOS[Math.floor(Math.random() * CROP_PHOTOS.length)];
}

// Only weeds that are clearly one group or the other.
const SORTABLE = middleSchoolWeeds.filter(w => w.plantType === 'Monocot' || w.plantType === 'Dicot');

const AREA_W = 900;
const AREA_H = 700;
const ROW_COUNT = 5;
const ROUND_SECONDS = 50;
const WEED_SIZE = 120;
const CROP_SIZE = 100;

type Bin = 'Monocot' | 'Dicot';

interface Sprite {
  id: number;
  kind: 'weed' | 'crop';
  weedId: string;
  plantType?: Bin;
  cropName?: string;
  cropImage?: string;
  lane: number;
  y: number;
  picked: boolean;
  removed: boolean;
  escaped: boolean;
  wobble: number;
}

interface FloatingText { id: number; x: number; y: number; text: string; color: string; life: number; }

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function MonocotDicotRunner({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const diff = useMemo(() => getDifficulty(level, 'ms'), [level]);
  const roundsPerLevel = Math.max(2, Math.min(4, Math.round(diff.rounds / 3)));
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [sortedRight, setSortedRight] = useState(0);
  const [sortedWrong, setSortedWrong] = useState(0);
  const [escaped, setEscaped] = useState(0);

  const spritesRef = useRef<Sprite[]>([]);
  const floatsRef = useRef<FloatingText[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);
  const monoBinRef = useRef<HTMLDivElement>(null);
  const dicotBinRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const endRef = useRef<number>(0);
  const scrollRef = useRef<number>(0);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const rightRef = useRef(0);
  const wrongRef = useRef(0);
  const escapedRef = useRef(0);

  const dragIdRef = useRef<number | null>(null);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);

  const [, forceTick] = useState(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

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

  const scrollSpeed = 100 * diff.speed;
  const spawnInterval = Math.max(900, 1500 / diff.speed);

  function beginRound() {
    spritesRef.current = [];
    floatsRef.current = [];
    scoreRef.current = 0;
    rightRef.current = 0;
    wrongRef.current = 0;
    escapedRef.current = 0;
    setScore(0); setSortedRight(0); setSortedWrong(0); setEscaped(0);
    setTimeLeft(ROUND_SECONDS);
    scrollRef.current = 0;
    dragIdRef.current = null;
    dragPosRef.current = null;
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

    scrollRef.current = (scrollRef.current + scrollSpeed * dt) % 100;

    for (const s of spritesRef.current) {
      if (s.removed) continue;
      if (!s.picked) s.y += scrollSpeed * dt;
      s.wobble += dt;
    }

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

    for (const f of floatsRef.current) { f.y -= 45 * dt; f.life -= dt; }
    floatsRef.current = floatsRef.current.filter(f => f.life > 0);
    spritesRef.current = spritesRef.current.filter(s => !s.removed && s.y < AREA_H + 120);

    if (now - spawnRef.current > spawnInterval) {
      spawnRef.current = now;
      const isCrop = Math.random() < 0.25;
      const lane = Math.floor(Math.random() * ROW_COUNT);
      const w = SORTABLE[Math.floor(Math.random() * SORTABLE.length)];
      const crop = isCrop ? randomCropPhoto() : null;
      spritesRef.current.push({
        id: ++idRef.current,
        kind: isCrop ? 'crop' : 'weed',
        weedId: w.id,
        plantType: w.plantType as Bin,
        cropName: crop?.name,
        cropImage: crop?.url,
        lane,
        y: -WEED_SIZE - Math.random() * 40,
        picked: false, removed: false, escaped: false,
        wobble: Math.random() * 6,
      });
    }

    const remaining = Math.max(0, (endRef.current - now) / 1000);
    setTimeLeft(remaining);
    forceTick(x => (x + 1) % 1000000);

    if (remaining <= 0) { setPhase('roundEnd'); return; }
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
          scoreRef.current -= 5;
          setScore(scoreRef.current);
          floatsRef.current.push({ id: ++idRef.current, x: cx, y: s.y, text: 'THAT IS A CROP! -5', color: '#dc2626', life: 1.2 });
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

  function binUnder(clientX: number, clientY: number): Bin | null {
    const hit = (el: HTMLDivElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    };
    if (hit(monoBinRef.current)) return 'Monocot';
    if (hit(dicotBinRef.current)) return 'Dicot';
    return null;
  }

  function releaseDrag(clientX: number, clientY: number) {
    if (dragIdRef.current == null) return;
    const s = spritesRef.current.find(z => z.id === dragIdRef.current);
    dragIdRef.current = null;
    dragPosRef.current = null;
    dragPointerIdRef.current = null;
    if (!s) return;

    const bin = binUnder(clientX, clientY);
    if (!bin) { s.picked = false; return; }

    if (bin === s.plantType) {
      s.removed = true;
      rightRef.current += 1;
      setSortedRight(rightRef.current);
      scoreRef.current += 10;
      setScore(scoreRef.current);
      floatsRef.current.push({ id: ++idRef.current, x: AREA_W / 2, y: 40, text: `+10 ${bin}!`, color: '#16a34a', life: 1.0 });
    } else {
      // Wrong bin — the weed bounces back into the field to be sorted again.
      s.picked = false;
      wrongRef.current += 1;
      setSortedWrong(wrongRef.current);
      scoreRef.current -= 3;
      setScore(scoreRef.current);
      floatsRef.current.push({
        id: ++idRef.current, x: AREA_W / 2, y: 70,
        text: s.plantType === 'Monocot' ? 'Grass! Parallel veins = monocot' : 'Broadleaf! Netted veins = dicot',
        color: '#dc2626', life: 1.6,
      });
    }
  }

  function commitRoundAndAdvance() {
    const gained = Math.max(0, scoreRef.current);
    const possible = 80 + (level - 1) * 20;
    const nextTotalScore = totalScore + gained;
    const nextTotalPossible = totalPossible + possible;
    setTotalScore(nextTotalScore); setTotalPossible(nextTotalPossible);
    if (round + 1 >= roundsPerLevel) { setDone(true); return; }
    setRound(r => r + 1);
    setPhase('ready');
  }

  function startOver() {
    setLevel(1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false); setPhase('ready');
  }
  function nextLevel() {
    setLevel(l => l + 1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false); setPhase('ready');
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
        title="Monocot or Dicot?"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const sprites = spritesRef.current;
  const floats = floatsRef.current;
  const dragPos = dragPosRef.current;
  const areaRect = areaRef.current?.getBoundingClientRect();

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto pt-[84px]">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Level {level}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground font-semibold">Round {round + 1} / {roundsPerLevel}</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">Score {score}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" /> Monocot or Dicot?
        </h1>
        <p className="text-muted-foreground mb-3">
          Scout the rows, pull each weed out of the field, and drag it into the right bin:
          <strong> Monocot</strong> (grasses — parallel veins, one cotyledon) or <strong>Dicot</strong> (broadleaves —
          netted veins, two cotyledons). Leave the crops alone.
        </p>

        <div className="grid md:grid-cols-[1fr,220px] gap-4">
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
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {Array.from({ length: ROW_COUNT }).map((_, i) => {
                const laneW = 100 / ROW_COUNT;
                return (
                  <div key={i} className="absolute top-0 bottom-0"
                    style={{
                      left: `${i * laneW}%`,
                      width: `${laneW}%`,
                      background: 'linear-gradient(90deg, rgba(120,80,40,0.3) 0%, rgba(90,122,42,0) 22%, rgba(90,122,42,0) 78%, rgba(120,80,40,0.3) 100%)',
                    }}
                  />
                );
              })}
              {Array.from({ length: ROW_COUNT }).map((_, laneIdx) => {
                const cx = laneCenterX(laneIdx);
                const plants: JSX.Element[] = [];
                const STEP = 100;
                const PLANT = 60;
                for (let y = -PLANT; y < AREA_H + PLANT; y += STEP) {
                  const yy = ((y + scrollRef.current) % (AREA_H + PLANT * 2)) - PLANT;
                  const seed = (laneIdx * 31 + y) % 7;
                  plants.push(
                    <div key={`${laneIdx}-${y}`} className="absolute rounded-full"
                      style={{
                        left: `${((cx + (seed - 3) * 4) / AREA_W) * 100}%`,
                        top: `${(yy / AREA_H) * 100}%`,
                        width: `${(PLANT / AREA_W) * 100}%`,
                        height: `${(PLANT / AREA_H) * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${seed * 17}deg)`,
                        background: seed % 2 === 0
                          ? 'radial-gradient(circle at 35% 30%, #7cb342 0%, #4c8c2b 55%, #33691e 100%)'
                          : 'radial-gradient(circle at 60% 40%, #8bc34a 0%, #558b2f 55%, #2e5d16 100%)',
                        opacity: 0.7,
                      }}
                    />
                  );
                }
                return <div key={laneIdx} className="absolute inset-0">{plants}</div>;
              })}
            </div>

            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-md bg-black/50 text-white text-xs font-bold">Time {Math.ceil(timeLeft)}s</div>
              <div className="flex gap-1.5">
                <div className="px-2 py-1 rounded-md bg-emerald-700/80 text-white text-xs font-bold">Sorted {sortedRight}</div>
                <div className="px-2 py-1 rounded-md bg-amber-700/80 text-white text-xs font-bold">Wrong bin {sortedWrong}</div>
                <div className="px-2 py-1 rounded-md bg-red-700/80 text-white text-xs font-bold">Escaped {escaped}</div>
              </div>
            </div>

            {sprites.map(s => {
              if (s.removed) return null;
              const weedInfo = s.kind === 'weed' ? middleSchoolWeeds.find(w => w.id === s.weedId) : null;
              const commonName = s.kind === 'weed' ? (weedInfo?.commonName || 'Weed') : (s.cropName || 'Crop');
              
              if (s.picked && dragPos && areaRect) {
                const localX = ((dragPos.x - areaRect.left) / areaRect.width) * AREA_W;
                const localY = ((dragPos.y - areaRect.top) / areaRect.height) * AREA_H;
                return (
                  <div key={s.id} className="absolute pointer-events-none z-30"
                    style={{
                      left: `${(localX / AREA_W) * 100}%`,
                      top: `${(localY / AREA_H) * 100}%`,
                      width: `${(WEED_SIZE / AREA_W) * 100}%`,
                      transform: 'translate(-50%, -50%) rotate(-8deg) scale(1.05)',
                    }}
                  >
                    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                      <div className="absolute inset-0 rounded-full border-4 border-primary bg-white shadow-2xl overflow-hidden">
                        <WeedImage weedId={s.weedId} stage="vegetative" className="w-full h-full" />
                      </div>
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wide shadow-md whitespace-nowrap">
                        {commonName}
                      </div>
                    </div>
                  </div>
                );
              }
              const size = s.kind === 'crop' ? CROP_SIZE : WEED_SIZE;
              const cx = laneCenterX(s.lane);
              const sway = Math.sin(s.wobble * 3) * 3;
              return (
                <div key={s.id} className="absolute pointer-events-none"
                  style={{
                    left: `${(cx / AREA_W) * 100}%`,
                    top: `${(s.y / AREA_H) * 100}%`,
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
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wide shadow whitespace-nowrap">
                          {commonName}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-700 ring-2 ring-emerald-200 shadow-lg overflow-hidden bg-emerald-900">
                          {s.cropImage ? (
                            <img src={s.cropImage} alt={s.cropName || 'Crop'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" style={{ background: 'radial-gradient(circle at 30% 30%, #7cb342 0%, #33691e 80%)' }} />
                          )}
                        </div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wide shadow whitespace-nowrap">
                          {commonName}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {floats.map(f => (
              <div key={f.id} className="absolute pointer-events-none font-black text-sm md:text-base drop-shadow z-40"
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

            {phase === 'ready' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <Scissors className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Round {round + 1}</h2>
                  <ul className="text-sm text-left text-muted-foreground space-y-1 mb-4">
                    <li>• Drag a weed to the correct bin: <span className="text-green-600 font-bold">+10</span></li>
                    <li>• Wrong bin: <span className="text-red-600 font-bold">-3</span> (it drops back in the field)</li>
                    <li>• Weed escapes off the field: <span className="text-red-600 font-bold">-2</span></li>
                    <li>• Pull a crop by mistake: <span className="text-red-600 font-bold">-5</span></li>
                  </ul>
                  <button onClick={beginRound}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:opacity-90">
                    <Play className="w-4 h-4" /> Start Scouting
                  </button>
                </div>
              </div>
            )}

            {phase === 'roundEnd' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                <div className="bg-card rounded-xl p-6 max-w-sm text-center shadow-2xl border-2 border-primary">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Round Complete</h2>
                  <p className="text-4xl font-black text-primary my-2">{score}</p>
                  <p className="text-sm text-muted-foreground">Sorted correctly: <strong>{sortedRight}</strong></p>
                  <p className="text-sm text-muted-foreground">Wrong bin: <strong>{sortedWrong}</strong></p>
                  <p className="text-sm text-muted-foreground mb-4">Escaped: <strong>{escaped}</strong></p>
                  <button onClick={commitRoundAndAdvance}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:opacity-90">
                    {round + 1 >= roundsPerLevel ? 'Finish Level' : 'Next Round'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Two sorting bins */}
          <div className="space-y-3">
            <div ref={monoBinRef}
              className={`rounded-xl border-4 border-dashed p-4 text-center transition-all ${
                dragIdRef.current != null ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 scale-105' : 'border-sky-400 bg-sky-50/60 dark:bg-sky-950/20'
              }`}
              style={{ minHeight: 130 }}
            >
              <Wheat className="w-9 h-9 mx-auto mb-1 text-sky-700 dark:text-sky-300" />
              <p className="font-black uppercase tracking-wide text-foreground">Monocot</p>
              <p className="text-[11px] text-muted-foreground mt-1">Grasses · parallel veins · one seed leaf</p>
            </div>

            <div ref={dicotBinRef}
              className={`rounded-xl border-4 border-dashed p-4 text-center transition-all ${
                dragIdRef.current != null ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 scale-105' : 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20'
              }`}
              style={{ minHeight: 130 }}
            >
              <Leaf className="w-9 h-9 mx-auto mb-1 text-emerald-700 dark:text-emerald-300" />
              <p className="font-black uppercase tracking-wide text-foreground">Dicot</p>
              <p className="text-[11px] text-muted-foreground mt-1">Broadleaves · netted veins · two seed leaves</p>
            </div>

            <div className="rounded-lg border-2 border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                Grab a weed, hold, and drop it all the way inside a bin. Crops stay in the field.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
