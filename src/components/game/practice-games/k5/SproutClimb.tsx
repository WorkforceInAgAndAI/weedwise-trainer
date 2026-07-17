import { useState, useEffect, useMemo } from 'react';
import { Dice5, ArrowLeft, Sprout, Flower2, Leaf, AlertTriangle, Sparkles } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';

/**
 * Sprout Climb — a Chutes & Ladders inspired K-5 game that walks the player
 * through the plant life cycle. Roll the dice, land on a resource tile to
 * climb a "vine" (ladder) up to the next life stage, or land on a weed
 * tile and slide down a "chute" as weeds out-compete you.
 *
 * Board is 30 tiles arranged 6x5, snake order from bottom-left up. The
 * stages advance as the pawn climbs: Seed -> Sprout -> Leaf -> Bud -> Flower -> Seeds!
 */

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

const BOARD_SIZE = 30;
const COLS = 6;
const ROWS = 5;

// tile => target tile. Positive = ladder (vine), negative meaning target<from = chute (weed)
const VINES: Record<number, { to: number; reason: string; resource: string }> = {
  3:  { to: 11, reason: 'A gentle rain soaks your seed — you sprout up fast!', resource: '💧 Water' },
  6:  { to: 17, reason: 'Warm sunlight pours down. Photosynthesis kicks in!', resource: '☀️ Sunlight' },
  9:  { to: 21, reason: 'Rich compost feeds your roots. Big growth spurt!', resource: '🌱 Nutrients' },
  14: { to: 26, reason: 'A friendly earthworm loosens the soil. Roots dig deep!', resource: '🪱 Healthy soil' },
  20: { to: 29, reason: 'A honeybee pollinates your flower. Almost to seed!', resource: '🐝 Pollinator' },
};

const WEEDS: Record<number, { to: number; reason: string; weed: string }> = {
  13: { to: 4,  reason: 'Foxtail grass shades your leaves. You lose energy!', weed: 'Foxtail' },
  18: { to: 7,  reason: 'Bindweed twists around your stem and pulls you down.', weed: 'Field Bindweed' },
  23: { to: 10, reason: 'Waterhemp steals your water. You wilt back down.', weed: 'Waterhemp' },
  27: { to: 15, reason: 'Canada Thistle roots crowd yours. Slide down!', weed: 'Canada Thistle' },
  28: { to: 19, reason: 'Lambsquarters blocks your sun. Back you go.', weed: 'Lambsquarters' },
};

// Life stage banner based on tile position
function stageFor(tile: number): { name: string; Icon: React.ComponentType<{ className?: string }>; fact: string; color: string } {
  if (tile <= 5)  return { name: 'Seed', Icon: Sprout, color: 'bg-amber-500', fact: 'A SEED sleeps in the soil, waiting for water and warmth to wake up.' };
  if (tile <= 11) return { name: 'Sprout', Icon: Sprout, color: 'bg-lime-500', fact: 'A SPROUT sends a tiny root down and a shoot up toward the light.' };
  if (tile <= 17) return { name: 'Leafy Plant', Icon: Leaf, color: 'bg-green-500', fact: 'LEAVES make food from sunlight, water, and air. This is photosynthesis!' };
  if (tile <= 23) return { name: 'Bud', Icon: Sprout, color: 'bg-emerald-500', fact: 'A BUD forms — the plant is getting ready to bloom.' };
  if (tile <= 28) return { name: 'Flower', Icon: Flower2, color: 'bg-pink-500', fact: 'FLOWERS attract pollinators like bees so the plant can make seeds.' };
  return { name: 'Seeds! 🎉', Icon: Sparkles, color: 'bg-yellow-500', fact: 'The plant makes NEW SEEDS. The life cycle starts all over again!' };
}

// Convert 1..30 to grid row/col (snake order, tile 1 bottom-left)
function tileToRC(tile: number): { row: number; col: number } {
  const idx = tile - 1;
  const rowFromBottom = Math.floor(idx / COLS);
  const row = ROWS - 1 - rowFromBottom;
  const colInRow = idx % COLS;
  const col = rowFromBottom % 2 === 0 ? colInRow : COLS - 1 - colInRow;
  return { row, col };
}

export default function SproutClimb({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [tile, setTile] = useState(1);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'vine' | 'weed' | 'move' | 'stage' } | null>(null);
  const [rolls, setRolls] = useState(0);
  const [done, setDone] = useState(false);
  const [prevStage, setPrevStage] = useState('Seed');

  const stage = useMemo(() => stageFor(tile), [tile]);

  useEffect(() => {
    if (stage.name !== prevStage) {
      setMessage({ text: `New life stage: ${stage.name}! ${stage.fact}`, kind: 'stage' });
      setPrevStage(stage.name);
    }
  }, [stage, prevStage]);

  useEffect(() => {
    if (tile >= BOARD_SIZE && !done) {
      setTimeout(() => setDone(true), 900);
    }
  }, [tile, done]);

  const roll = () => {
    if (rolling || done) return;
    setRolling(true);
    setMessage(null);
    let count = 0;
    const spin = setInterval(() => {
      setDice(1 + Math.floor(Math.random() * 6));
      count++;
      if (count > 8) {
        clearInterval(spin);
        const final = 1 + Math.floor(Math.random() * 6);
        setDice(final);
        setRolls(r => r + 1);
        // Move step-by-step
        let step = 0;
        const startTile = tile;
        const move = setInterval(() => {
          step++;
          const next = Math.min(BOARD_SIZE, startTile + step);
          setTile(next);
          if (step >= final || next >= BOARD_SIZE) {
            clearInterval(move);
            setTimeout(() => {
              const landed = Math.min(BOARD_SIZE, startTile + final);
              const v = VINES[landed];
              const w = WEEDS[landed];
              if (v) {
                setMessage({ text: `${v.resource} — ${v.reason}`, kind: 'vine' });
                setTimeout(() => setTile(v.to), 500);
              } else if (w) {
                setMessage({ text: `${w.weed} — ${w.reason}`, kind: 'weed' });
                setTimeout(() => setTile(w.to), 500);
              }
              setRolling(false);
            }, 300);
          }
        }, 220);
      }
    }, 80);
  };

  const reset = () => {
    setTile(1); setDice(null); setMessage(null); setRolls(0); setDone(false); setPrevStage('Seed');
  };

  if (done) {
    // Score: fewer rolls = higher score. Best case ~5 rolls with big vines.
    const score = Math.max(20, 120 - rolls * 5);
    return (
      <LevelComplete
        level={level} score={score} total={100}
        onNextLevel={() => { setLevel(l => l + 1); reset(); }}
        onStartOver={() => { setLevel(1); reset(); }}
        onBack={onBack}
        gameId={gameId} gameName={gameName} gradeLabel={gradeLabel}
      />
    );
  }

  const StageIcon = stage.Icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #e0f2fe 0%, #dcfce7 40%, #fef3c7 100%)' }}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground flex-1">Sprout Climb</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 text-foreground font-bold">Rolls: {rolls}</span>
        </div>

        {/* Life stage banner */}
        <div className={`${stage.color} text-white rounded-2xl p-3 mb-3 flex items-center gap-3 shadow-lg`}>
          <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center">
            <StageIcon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider opacity-80">Current life stage</p>
            <p className="font-bold text-lg leading-tight">{stage.name}</p>
            <p className="text-xs opacity-95">{stage.fact}</p>
          </div>
        </div>

        {/* Board */}
        <div className="rounded-2xl border-4 border-amber-800/40 p-2 bg-gradient-to-b from-amber-50 to-amber-100 shadow-inner mb-3">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
            {Array.from({ length: BOARD_SIZE }, (_, i) => {
              const t = BOARD_SIZE - i; // fill top-to-bottom, but tiles start bottom
              // We build using tileToRC positions instead — render row-by-row
              return null;
            })}
            {Array.from({ length: ROWS }).flatMap((_, r) =>
              Array.from({ length: COLS }).map((_, c) => {
                // find tile whose position matches
                let tileNum = 0;
                for (let n = 1; n <= BOARD_SIZE; n++) {
                  const pos = tileToRC(n);
                  if (pos.row === r && pos.col === c) { tileNum = n; break; }
                }
                const v = VINES[tileNum];
                const w = WEEDS[tileNum];
                const isPawn = tile === tileNum;
                const isFinish = tileNum === BOARD_SIZE;
                return (
                  <div key={`${r}-${c}`}
                    className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                      isPawn ? 'ring-4 ring-primary scale-105 z-10 ' : ''
                    }${
                      isFinish ? 'bg-gradient-to-br from-yellow-300 to-orange-400 border-orange-500' :
                      v ? 'bg-gradient-to-br from-lime-200 to-green-300 border-green-500' :
                      w ? 'bg-gradient-to-br from-red-200 to-rose-300 border-rose-500' :
                      'bg-white/70 border-amber-300'
                    }`}>
                    <span className="absolute top-0.5 left-1 text-[9px] text-foreground/50">{tileNum}</span>
                    {v && <span className="text-lg leading-none">🌿</span>}
                    {w && <span className="text-lg leading-none">🌾</span>}
                    {isFinish && <span className="text-lg leading-none">🌻</span>}
                    {isPawn && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-bounce">
                          <Sprout className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-foreground/70">
            <span className="flex items-center gap-1">🌿 Resource (climb)</span>
            <span className="flex items-center gap-1">🌾 Weed (slide)</span>
            <span className="flex items-center gap-1">🌻 Seed set (goal)</span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-xl p-3 mb-3 text-sm font-medium shadow ${
            message.kind === 'vine' ? 'bg-green-100 text-green-900 border-2 border-green-400' :
            message.kind === 'weed' ? 'bg-rose-100 text-rose-900 border-2 border-rose-400' :
            message.kind === 'stage' ? 'bg-amber-100 text-amber-900 border-2 border-amber-400' :
            'bg-white/80 text-foreground border-2 border-border'
          }`}>
            {message.kind === 'weed' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
            {message.text}
          </div>
        )}

        {/* Dice + roll */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-20 h-20 rounded-2xl bg-white border-4 border-primary flex items-center justify-center shadow-lg ${rolling ? 'animate-spin' : ''}`}>
            {dice ? <span className="text-4xl font-black text-primary">{dice}</span> : <Dice5 className="w-10 h-10 text-primary/40" />}
          </div>
          <button onClick={roll} disabled={rolling}
            className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg active:scale-95 disabled:opacity-50">
            {rolling ? 'Rolling...' : 'Roll the Dice!'}
          </button>
        </div>

        <div className="rounded-xl bg-white/70 border-2 border-amber-300 p-3 text-xs text-foreground">
          <p className="font-bold mb-1">How to grow up the board:</p>
          <p>Every tile is a step in the plant life cycle. Land on a 🌿 <b>resource</b> (water, sun, nutrients, soil, pollinator) and climb a vine to the next stage. Land on a 🌾 <b>weed</b> and slide back — weeds compete with your plant for what it needs. Reach 🌻 to set new seeds and finish the cycle!</p>
          <p className="mt-2 text-rose-700 font-semibold">Never touch real weeds unless a trusted adult says it's safe.</p>
        </div>
      </div>
    </div>
  );
}