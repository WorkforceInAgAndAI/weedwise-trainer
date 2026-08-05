import { useState, useEffect, useMemo, useRef } from 'react';
import { Dice5, ArrowLeft, Sprout, Flower2, Leaf, AlertTriangle, Sparkles, Bot, Trophy } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import { getDifficulty } from '@/lib/difficulty';

/** Computer rivals — a different weed racer each level. */
const RIVALS = [
  { name: 'Rowdy Ragweed', emoji: '🌾', taunt: 'Ragweed grows fast — I make a BILLION pollen grains!' },
  { name: 'Speedy Foxtail', emoji: '🌱', taunt: 'Foxtail sprints up in just a few weeks. Keep up!' },
  { name: 'Tricky Bindweed', emoji: '🌀', taunt: 'I twist around anything to climb higher!' },
  { name: 'Wicked Waterhemp', emoji: '💧', taunt: 'I drink your water and grow an inch a day!' },
  { name: 'Prickly Thistle', emoji: '🪻', taunt: 'My roots creep under the whole field!' },
];

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
/**
 * Your pawn IS the plant. It literally grows as you climb the board:
 * seed in the soil -> seedling -> vegetative (leafy) -> reproductive (flower
 * then seed head at the top).
 */
function GrowingPlant({ tile, className = '' }: { tile: number; className?: string }) {
  const p = Math.min(1, Math.max(0, tile / 30));            // 0..1 growth
  const stemTop = 92 - p * 62;                              // stem grows upward
  const showSeedling = tile > 3;
  const showLeaves = tile > 11;
  const showBigLeaves = tile > 17;
  const showBud = tile > 17 && tile <= 23;
  const showFlower = tile > 23 && tile <= 28;
  const showSeedHead = tile > 28;
  return (
    <svg viewBox="0 0 60 100" className={className} role="img" aria-label={`Your plant at growth stage ${tile} of 30`}>
      {/* soil */}
      <rect x="0" y="88" width="60" height="12" rx="3" fill="#6b4423" />
      {/* seed */}
      {!showSeedling && <ellipse cx="30" cy="90" rx="7" ry="5" fill="#d9a441" stroke="#8a5a1b" strokeWidth="1.5" />}
      {/* root */}
      {showSeedling && <path d="M30 92 L30 99 M30 95 L25 99 M30 95 L35 99" stroke="#c68642" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {/* stem */}
      {showSeedling && <line x1="30" y1="92" x2="30" y2={stemTop} stroke="#3f8f29" strokeWidth="4" strokeLinecap="round" />}
      {/* cotyledons / first leaves */}
      {showSeedling && (
        <>
          <ellipse cx="22" cy={stemTop + 12} rx="8" ry="4.5" fill="#7cc243" transform={`rotate(-18 22 ${stemTop + 12})`} />
          <ellipse cx="38" cy={stemTop + 12} rx="8" ry="4.5" fill="#7cc243" transform={`rotate(18 38 ${stemTop + 12})`} />
        </>
      )}
      {showLeaves && (
        <>
          <ellipse cx="17" cy={stemTop + 26} rx="12" ry="6" fill="#2f7d1f" transform={`rotate(-22 17 ${stemTop + 26})`} />
          <ellipse cx="43" cy={stemTop + 26} rx="12" ry="6" fill="#2f7d1f" transform={`rotate(22 43 ${stemTop + 26})`} />
        </>
      )}
      {showBigLeaves && (
        <>
          <ellipse cx="14" cy={stemTop + 40} rx="14" ry="7" fill="#256b19" transform={`rotate(-25 14 ${stemTop + 40})`} />
          <ellipse cx="46" cy={stemTop + 40} rx="14" ry="7" fill="#256b19" transform={`rotate(25 46 ${stemTop + 40})`} />
        </>
      )}
      {showBud && <ellipse cx="30" cy={stemTop - 4} rx="6" ry="9" fill="#4ba32c" stroke="#2f7d1f" strokeWidth="1.5" />}
      {showFlower && (
        <g>
          {[0, 60, 120, 180, 240, 300].map(a => (
            <ellipse key={a} cx="30" cy={stemTop - 10} rx="5" ry="9" fill="#f7c948" transform={`rotate(${a} 30 ${stemTop - 10})`} />
          ))}
          <circle cx="30" cy={stemTop - 10} r="4.5" fill="#b45309" />
        </g>
      )}
      {showSeedHead && (
        <g>
          <circle cx="30" cy={stemTop - 10} r="5" fill="#e7e5e4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <line key={a} x1="30" y1={stemTop - 10} x2={30 + 12 * Math.cos((a * Math.PI) / 180)} y2={stemTop - 10 + 12 * Math.sin((a * Math.PI) / 180)}
              stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round" />
          ))}
        </g>
      )}
    </svg>
  );
}

function stageFor(tile: number): { name: string; Icon: React.ComponentType<{ className?: string }>; fact: string; color: string } {
  if (tile <= 5)  return { name: 'Seed', Icon: Sprout, color: 'bg-amber-500', fact: 'A SEED sleeps in the soil, waiting for water and warmth to wake up.' };
  if (tile <= 11) return { name: 'Seedling', Icon: Sprout, color: 'bg-lime-500', fact: 'A SEEDLING sends a tiny root down and a shoot up toward the light.' };
  if (tile <= 17) return { name: 'Vegetative', Icon: Leaf, color: 'bg-green-500', fact: 'LEAVES make food from sunlight, water, and air. This is photosynthesis!' };
  if (tile <= 23) return { name: 'Bud', Icon: Sprout, color: 'bg-emerald-500', fact: 'A BUD forms — the plant is getting ready to bloom.' };
  if (tile <= 28) return { name: 'Reproductive: Flower', Icon: Flower2, color: 'bg-pink-500', fact: 'FLOWERS attract pollinators like bees so the plant can make seeds.' };
  return { name: 'Reproductive: Seeds!', Icon: Sparkles, color: 'bg-yellow-500', fact: 'The plant makes NEW SEEDS. The life cycle starts all over again!' };
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
  const [cpuTile, setCpuTile] = useState(1);
  const [cpuDice, setCpuDice] = useState<number | null>(null);
  const [winner, setWinner] = useState<'you' | 'cpu' | null>(null);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'vine' | 'weed' | 'move' | 'stage' } | null>(null);
  const [rolls, setRolls] = useState(0);
  const [done, setDone] = useState(false);
  const [prevStage, setPrevStage] = useState('Seed');

  const diff = getDifficulty(level, 'k5');
  const stage = useMemo(() => stageFor(tile), [tile]);
  const rival = RIVALS[(level - 1) % RIVALS.length];
  const cpuRef = useRef(1);

  // The rival gets stronger each level (bigger chance of a bonus step).
  const cpuBoost = Math.min(0.45, 0.1 + level * 0.06);

  useEffect(() => {
    if (stage.name !== prevStage) {
      setMessage({ text: `New life stage: ${stage.name}! ${stage.fact}`, kind: 'stage' });
      setPrevStage(stage.name);
    }
  }, [stage, prevStage]);

  useEffect(() => {
    if (winner && !done) {
      setTimeout(() => setDone(true), 900);
    }
  }, [winner, done]);

  useEffect(() => {
    if (winner) return;
    if (tile >= BOARD_SIZE) setWinner('you');
    else if (cpuTile >= BOARD_SIZE) setWinner('cpu');
  }, [tile, cpuTile, winner]);

  /** The computer rival takes its turn after the player finishes theirs. */
  const cpuTurn = () => {
    const roll = 1 + Math.floor(Math.random() * 6) + (Math.random() < cpuBoost ? 2 : 0);
    setCpuDice(Math.min(6, roll));
    const start = cpuRef.current;
    let step = 0;
    const move = setInterval(() => {
      step++;
      const next = Math.min(BOARD_SIZE, start + step);
      cpuRef.current = next;
      setCpuTile(next);
      if (step >= roll || next >= BOARD_SIZE) {
        clearInterval(move);
        const landed = Math.min(BOARD_SIZE, start + roll);
        const v = VINES[landed];
        const w = WEEDS[landed];
        if (v) { cpuRef.current = v.to; setTimeout(() => setCpuTile(v.to), 350); }
        else if (w) { cpuRef.current = w.to; setTimeout(() => setCpuTile(w.to), 350); }
        setRolling(false);
      }
    }, 130);
  };

  const roll = () => {
    if (rolling || done || winner) return;
    setRolling(true);
    setMessage(null);
    let count = 0;
    const spin = setInterval(() => {
      setDice(1 + Math.floor(Math.random() * 6));
      count++;
      if (count > Math.max(4, Math.round(8 / diff.speed))) {
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
              if (Math.min(BOARD_SIZE, startTile + final) >= BOARD_SIZE) {
                setRolling(false);
              } else {
                setTimeout(cpuTurn, 500);
              }
            }, 300);
          }
        }, Math.max(90, Math.round(220 / diff.speed)));
      }
    }, Math.max(35, Math.round(80 / diff.speed)));
  };

  const reset = () => {
    setTile(1); setDice(null); setMessage(null); setRolls(0); setDone(false); setPrevStage('Seed');
    setCpuTile(1); setCpuDice(null); setWinner(null); cpuRef.current = 1; setRolling(false);
  };

  if (done) {
    // Winning the race is worth the most; finishing quickly adds a bonus.
    const score = winner === 'you' ? Math.min(100, 60 + Math.max(0, 40 - rolls * 3)) : Math.max(10, 40 - rolls);
    return (
      <LevelComplete
        level={level} score={score} total={100}
        title={winner === 'you' ? `You beat ${rival.name}!` : `${rival.name} set seed first — race again!`}
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

        {/* Race scoreboard */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-2xl bg-white/85 border-2 border-primary p-3 shadow">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">You</p>
                <p className="font-bold text-sm text-foreground leading-tight">Tile {tile} / {BOARD_SIZE}</p>
              </div>
              {dice && <span className="text-lg font-black text-primary">{dice}</span>}
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
              <div className="h-full bg-primary transition-all" style={{ width: `${(tile / BOARD_SIZE) * 100}%` }} />
            </div>
          </div>
          <div className="rounded-2xl bg-white/85 border-2 border-rose-400 p-3 shadow">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-base">
                {rival.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Bot className="w-3 h-3" /> {rival.name}
                </p>
                <p className="font-bold text-sm text-foreground leading-tight">Tile {cpuTile} / {BOARD_SIZE}</p>
              </div>
              {cpuDice && <span className="text-lg font-black text-rose-500">{cpuDice}</span>}
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${(cpuTile / BOARD_SIZE) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-rose-50 border-2 border-rose-300 px-3 py-2 mb-3 text-xs text-rose-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 shrink-0" />
          <span><b>{rival.name} says:</b> “{rival.taunt}” Beat the weed to seed set to win the race!</span>
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
                const isCpu = cpuTile === tileNum;
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
                      <div className="absolute inset-0 flex items-center justify-start pl-0.5">
                        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-bounce">
                          <Sprout className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    {isCpu && (
                      <div className="absolute inset-0 flex items-center justify-end pr-0.5">
                        <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg text-sm">
                          {rival.emoji}
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