import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, AlertTriangle, Play, Droplet, Sprout, Sparkles, Mountain, Skull, Zap } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';

// -------- Root Rush (K-5 Explorer) --------------------------------------
// You ARE a weed root growing underground. Tunnel through the soil to
// collect water and nutrients, and pop up in new patches of the field to
// "spread." Watch out for rocks (blocked) and herbicide zones (danger!).
// Teaches how perennial weeds like Canada thistle, field bindweed,
// quackgrass, and yellow nutsedge spread through underground rhizomes.
// -------------------------------------------------------------------------

const COLS = 10;
const ROWS = 12;

type Cell =
  | { kind: 'soil'; explored: boolean }
  | { kind: 'water'; taken: boolean }
  | { kind: 'nutrient'; taken: boolean }
  | { kind: 'rock' }
  | { kind: 'herbicide'; hit: boolean }
  | { kind: 'sprout'; claimed: boolean };

interface LevelCfg {
  water: number;
  nutrients: number;
  rocks: number;
  herbicide: number;
  sprouts: number;
  startEnergy: number;
  goal: number; // sprout points needed
  fact: string;
  weed: string;
}

const LEVELS: LevelCfg[] = [
  {
    water: 8, nutrients: 6, rocks: 6, herbicide: 2, sprouts: 3,
    startEnergy: 30, goal: 2,
    weed: 'Yellow Nutsedge',
    fact: 'Yellow Nutsedge spreads underground with little tubers called "nutlets." One plant can grow hundreds of new shoots!',
  },
  {
    water: 7, nutrients: 5, rocks: 10, herbicide: 4, sprouts: 4,
    startEnergy: 28, goal: 3,
    weed: 'Canada Thistle',
    fact: 'Canada Thistle roots can travel more than 15 feet sideways underground before popping up as a brand-new plant.',
  },
  {
    water: 6, nutrients: 5, rocks: 14, herbicide: 6, sprouts: 5,
    startEnergy: 26, goal: 4,
    weed: 'Field Bindweed',
    fact: 'Field Bindweed roots can dig 20 FEET deep! That is why farmers say it is one of the hardest weeds to control.',
  },
];

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

function buildGrid(cfg: LevelCfg): { grid: Cell[]; start: number } {
  const total = ROWS * COLS;
  const cells: Cell[] = Array.from({ length: total }, () => ({ kind: 'soil', explored: false }));
  const start = Math.floor(COLS / 2); // top row, middle
  const taken = new Set<number>([start]);

  const place = (kind: Cell['kind'], count: number) => {
    let tries = 0;
    while (count > 0 && tries < 500) {
      tries++;
      const i = Math.floor(Math.random() * total);
      if (taken.has(i)) continue;
      // keep row 0 mostly clear so start has options
      if (i < COLS && kind !== 'soil') continue;
      taken.add(i);
      if (kind === 'water') cells[i] = { kind: 'water', taken: false };
      else if (kind === 'nutrient') cells[i] = { kind: 'nutrient', taken: false };
      else if (kind === 'rock') cells[i] = { kind: 'rock' };
      else if (kind === 'herbicide') cells[i] = { kind: 'herbicide', hit: false };
      else if (kind === 'sprout') cells[i] = { kind: 'sprout', claimed: false };
      count--;
    }
  };

  // Sprouts weighted toward bottom half so player has to tunnel
  let sproutsPlaced = 0;
  let tries = 0;
  while (sproutsPlaced < cfg.sprouts && tries < 500) {
    tries++;
    const row = Math.floor(Math.random() * (ROWS - 3)) + 3;
    const col = Math.floor(Math.random() * COLS);
    const i = row * COLS + col;
    if (taken.has(i)) continue;
    taken.add(i);
    cells[i] = { kind: 'sprout', claimed: false };
    sproutsPlaced++;
  }
  place('water', cfg.water);
  place('nutrient', cfg.nutrients);
  place('rock', cfg.rocks);
  place('herbicide', cfg.herbicide);

  cells[start] = { kind: 'soil', explored: true };
  return { grid: cells, start };
}

export default function RootRush({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [levelIdx, setLevelIdx] = useState(0);
  const cfg = LEVELS[levelIdx];

  const [phase, setPhase] = useState<'ready' | 'playing' | 'roundEnd'>('ready');
  const [grid, setGrid] = useState<Cell[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [energy, setEnergy] = useState(cfg.startEnergy);
  const [maxEnergy, setMaxEnergy] = useState(cfg.startEnergy);
  const [sproutsClaimed, setSproutsClaimed] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);
  const [pulseIdx, setPulseIdx] = useState<number | null>(null);

  const flashTimer = useRef<number | null>(null);

  const startRound = (idx: number) => {
    const c = LEVELS[idx];
    const { grid: g, start } = buildGrid(c);
    setGrid(g);
    setPath([start]);
    setEnergy(c.startEnergy);
    setMaxEnergy(c.startEnergy);
    setSproutsClaimed(0);
    setScore(0);
    setMessage('');
    setPhase('playing');
  };

  useEffect(() => () => { if (flashTimer.current) window.clearTimeout(flashTimer.current); }, []);

  const tip = path[path.length - 1];
  const tipRow = tip !== undefined ? Math.floor(tip / COLS) : 0;
  const tipCol = tip !== undefined ? tip % COLS : 0;

  const neighbors = useMemo(() => {
    if (tip === undefined) return new Set<number>();
    const out = new Set<number>();
    const push = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      const i = r * COLS + c;
      if (path.includes(i)) return;
      out.add(i);
    };
    push(tipRow + 1, tipCol);
    push(tipRow - 1, tipCol);
    push(tipRow, tipCol - 1);
    push(tipRow, tipCol + 1);
    return out;
  }, [tip, tipRow, tipCol, path]);

  const flash = (text: string) => {
    setMessage(text);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setMessage(''), 1600);
  };

  const grow = (idx: number) => {
    if (phase !== 'playing') return;
    if (!neighbors.has(idx)) return;
    const cell = grid[idx];
    if (cell.kind === 'rock') {
      flash('Rock! Roots cannot push through — try another way.');
      return;
    }
    // move cost 1 energy
    let newEnergy = energy - 1;
    let addScore = 0;
    let sprouted = false;
    const newGrid = grid.slice();

    if (cell.kind === 'water' && !cell.taken) {
      newGrid[idx] = { kind: 'water', taken: true };
      newEnergy = Math.min(maxEnergy, newEnergy + 5);
      addScore = 5;
      flash('+5 Water! Your root drinks up energy.');
    } else if (cell.kind === 'nutrient' && !cell.taken) {
      newGrid[idx] = { kind: 'nutrient', taken: true };
      newEnergy = Math.min(maxEnergy, newEnergy + 4);
      addScore = 5;
      flash('+5 Nutrients! Yum, growing strong.');
    } else if (cell.kind === 'herbicide' && !cell.hit) {
      newGrid[idx] = { kind: 'herbicide', hit: true };
      newEnergy -= 8;
      addScore = -5;
      flash('Herbicide zone! -8 energy. That is how farmers stop invasive roots.');
    } else if (cell.kind === 'sprout' && !cell.claimed) {
      newGrid[idx] = { kind: 'sprout', claimed: true };
      addScore = 20;
      sprouted = true;
      flash('+20 Sprout! You popped up in a new patch of field!');
    } else if (cell.kind === 'soil' && !cell.explored) {
      newGrid[idx] = { kind: 'soil', explored: true };
    }

    setPulseIdx(idx);
    window.setTimeout(() => setPulseIdx(null), 350);

    const newPath = [...path, idx];
    const newSprouts = sprouted ? sproutsClaimed + 1 : sproutsClaimed;
    setGrid(newGrid);
    setPath(newPath);
    setEnergy(newEnergy);
    setScore(s => s + addScore);
    setSproutsClaimed(newSprouts);

    // Win / lose checks
    if (newSprouts >= cfg.goal) {
      const bonus = Math.max(0, newEnergy) * 2;
      setScore(s => s + bonus);
      flash(`Field colonized! +${bonus} energy bonus.`);
      window.setTimeout(() => endRound(true, addScore + bonus), 900);
    } else if (newEnergy <= 0) {
      window.setTimeout(() => endRound(false, addScore), 900);
    }
  };

  const endRound = (won: boolean, lastAdd: number) => {
    const finalScore = Math.max(0, score + lastAdd);
    const possible = cfg.goal * 20 + 30; // rough target
    setTotalScore(t => t + finalScore);
    setTotalPossible(t => t + possible);
    setPhase('roundEnd');
  };

  const onNextLevel = () => {
    setDone(false);
    if (levelIdx + 1 >= LEVELS.length) {
      setLevelIdx(0);
      setTotalScore(0);
      setTotalPossible(0);
      startRound(0);
    } else {
      const next = levelIdx + 1;
      setLevelIdx(next);
      startRound(next);
    }
  };
  const onStartOver = () => {
    setDone(false);
    setLevelIdx(0);
    setTotalScore(0);
    setTotalPossible(0);
    startRound(0);
  };

  // -------------------- READY SCREEN --------------------
  if (phase === 'ready') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-amber-100 z-40 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <button onClick={onBack} className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200">
            <h1 className="text-3xl font-display font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Sprout className="w-8 h-8 text-primary" /> Root Rush
            </h1>
            <p className="text-amber-900/80 mb-4">
              You are the tip of a sneaky weed root growing underground!
              Tunnel through the soil to <b>spread</b> into new patches of the field.
            </p>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
              <p className="font-bold text-amber-900 mb-2">How to play</p>
              <ul className="space-y-2 text-sm text-amber-900/90">
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" /> Click a soil square next to your root tip to grow into it. Each move costs 1 energy.</li>
                <li className="flex items-start gap-2"><Droplet className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> <b>Water</b> and <b>nutrients</b> restore energy and give points.</li>
                <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> <b>Sprout points</b> are new patches of field. Reach them to spread and earn +20!</li>
                <li className="flex items-start gap-2"><Mountain className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" /> <b>Rocks</b> block roots. Grow around them.</li>
                <li className="flex items-start gap-2"><Skull className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" /> <b>Herbicide</b> zones drain energy. Real farmers use them to stop invasive roots!</li>
              </ul>
            </div>
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded flex items-start gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900">
                <b>Safety rule:</b> Never pull up or touch a real weed unless a trusted adult tells you it is safe. Some weeds sting or are poisonous.
              </p>
            </div>
            <p className="text-sm text-amber-900/70 mb-4 italic">
              Level {levelIdx + 1}: You are a <b>{cfg.weed}</b>. Spread to {cfg.goal} sprout points!
            </p>
            <button
              onClick={() => startRound(levelIdx)}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90"
            >
              <Play className="w-4 h-4" /> Start Tunneling
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- ROUND END --------------------
  if (phase === 'roundEnd') {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-amber-100 z-40" />
        <LevelComplete
          level={levelIdx + 1}
          score={totalScore}
          total={totalPossible}
          onNextLevel={onNextLevel}
          onStartOver={onStartOver}
          onBack={onBack}
          title={`Root Rush · ${cfg.weed}`}
          gameId={gameId}
          gameName={gameName}
          gradeLabel={gradeLabel}
        />
      </>
    );
  }

  // -------------------- PLAYING --------------------
  const energyPct = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{
      background: 'radial-gradient(ellipse at top, #6b3410 0%, #3a1c08 40%, #1a0d04 100%)'
    }}>
      {/* Cartoon rocky cave ceiling silhouette */}
      <svg className="absolute top-0 left-0 w-full h-16 pointer-events-none" viewBox="0 0 100 16" preserveAspectRatio="none">
        <path d="M0,0 L0,6 Q5,10 10,5 T22,7 T35,4 T50,9 T65,3 T80,8 T95,5 L100,6 L100,0 Z" fill="#1a0d04" />
        <path d="M0,0 L0,4 Q8,7 16,3 T32,5 T48,2 T64,6 T82,3 T100,4 L100,0 Z" fill="#2a1508" opacity="0.7" />
      </svg>

      <div className="max-w-3xl mx-auto p-3 sm:p-4 relative">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <button onClick={onBack} className="flex items-center gap-1 text-amber-100 hover:text-yellow-300 text-sm font-medium bg-stone-900/70 px-3 py-1 rounded-full border border-amber-700">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-xs sm:text-sm font-bold text-amber-100 bg-stone-900/70 px-3 py-1 rounded-full border border-amber-700 flex items-center gap-1">
            <span className="text-yellow-400">⛏</span> Tunnel {levelIdx + 1} · {cfg.weed}
          </div>
          <div className="text-sm font-bold text-yellow-300 bg-stone-900/70 px-3 py-1 rounded-full border border-amber-700">Score: {score}</div>
        </div>

        {/* Status bar - looks like wooden mine sign */}
        <div className="rounded-lg p-2 mb-2 shadow-lg flex items-center gap-3 text-xs sm:text-sm border-y-4 border-amber-900" style={{
          background: 'repeating-linear-gradient(90deg, #8b5a2b 0px, #a0693a 6px, #8b5a2b 12px)'
        }}>
          <div className="flex items-center gap-1 text-amber-50 font-bold drop-shadow">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {sproutsClaimed}/{cfg.goal} sprouts
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-300" />
            <div className="flex-1 h-3 bg-stone-900 rounded-full overflow-hidden border-2 border-amber-950">
              <div
                className={`h-full transition-all ${energyPct > 40 ? 'bg-emerald-500' : energyPct > 20 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-50 w-10 text-right drop-shadow">{Math.max(0, energy)}</span>
          </div>
        </div>

        {/* Message */}
        <div className="h-8 mb-2 text-center text-sm font-bold text-yellow-100 drop-shadow-[0_0_6px_rgba(255,200,50,0.5)]">
          {message || 'Click a soil square next to your root tip to grow!'}
        </div>

        {/* Cartoon coal-mine tunnel frame */}
        <div className="relative mx-auto rounded-xl shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] p-3 border-8 border-amber-900" style={{
          maxWidth: 560,
          background: 'radial-gradient(circle at 50% 40%, #5a2f10 0%, #2a1408 60%, #0f0602 100%)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.6)'
        }}>
          {/* Wooden support beams at corners */}
          <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-amber-950 to-amber-800 rounded-l" />
          <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-amber-950 to-amber-800 rounded-r" />
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-amber-950 to-amber-800" />
          <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-amber-950 to-amber-800" />

          <div
            className="grid gap-[3px] relative"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, padding: '8px' }}
          >
            {grid.map((cell, i) => {
              const isTip = i === tip;
              const inPath = path.includes(i);
              const isNeighbor = neighbors.has(i);

              // Distance from tip for lantern glow effect
              const dRow = Math.abs(Math.floor(i / COLS) - tipRow);
              const dCol = Math.abs((i % COLS) - tipCol);
              const dist = Math.max(dRow, dCol);
              const glow = Math.max(0, 1 - dist / 5);

              let bg = 'bg-stone-900';   // unexplored dark rock
              let content: React.ReactNode = null;
              let extraStyle: React.CSSProperties = {
                filter: inPath ? 'none' : `brightness(${0.35 + glow * 0.65})`,
              };

              if (inPath) {
                // Dug-out tunnel with warm lantern light
                bg = '';
                extraStyle.background = 'radial-gradient(circle at 50% 40%, #d4a574 0%, #8b5a2b 60%, #4a2c10 100%)';
                extraStyle.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -2px 3px rgba(255,220,150,0.3)';
                if (cell.kind === 'water' && cell.taken) content = <Droplet className="w-full h-full p-1 text-blue-200" />;
                else if (cell.kind === 'nutrient' && cell.taken) content = <Sparkles className="w-full h-full p-1 text-yellow-300" />;
                else if (cell.kind === 'herbicide') content = <Skull className="w-full h-full p-1 text-rose-200" />;
                else if (cell.kind === 'sprout' && cell.claimed) {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle, #86efac 0%, #22c55e 70%)';
                  extraStyle.boxShadow = '0 0 12px rgba(134,239,172,0.8)';
                  content = <Sprout className="w-full h-full p-0.5 text-emerald-900" />;
                }
                if (isTip) {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle, #fef08a 0%, #facc15 50%, #a16207 100%)';
                  extraStyle.boxShadow = '0 0 20px rgba(250,204,21,0.9), 0 0 40px rgba(250,204,21,0.5)';
                  // Cartoon worm-root with headlamp
                  content = (
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <ellipse cx="12" cy="14" rx="7" ry="6" fill="#f0abfc" stroke="#701a75" strokeWidth="1.2" />
                      <circle cx="9.5" cy="12" r="1.2" fill="#701a75" />
                      <circle cx="14.5" cy="12" r="1.2" fill="#701a75" />
                      <circle cx="9.8" cy="11.7" r="0.4" fill="#fff" />
                      <circle cx="14.8" cy="11.7" r="0.4" fill="#fff" />
                      <path d="M9 16 Q12 18 15 16" stroke="#701a75" strokeWidth="1" fill="none" strokeLinecap="round" />
                      <circle cx="12" cy="6" r="2.2" fill="#fef08a" stroke="#a16207" strokeWidth="0.8" />
                      <path d="M12 8 L12 10" stroke="#4a2c10" strokeWidth="1" />
                    </svg>
                  );
                }
              } else if (isNeighbor) {
                // Faintly lit by lantern - shows what's next
                extraStyle.filter = 'brightness(0.95)';
                if (cell.kind === 'rock') {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle at 30% 30%, #78716c 0%, #44403c 70%, #1c1917 100%)';
                  content = <Mountain className="w-full h-full p-1 text-stone-300" />;
                }
                else if (cell.kind === 'water') {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle, #60a5fa 0%, #1e40af 100%)';
                  extraStyle.boxShadow = '0 0 10px rgba(96,165,250,0.7)';
                  content = <Droplet className="w-full h-full p-1 text-white" />;
                }
                else if (cell.kind === 'nutrient') {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle, #fde047 0%, #a16207 100%)';
                  extraStyle.boxShadow = '0 0 10px rgba(253,224,71,0.7)';
                  content = <Sparkles className="w-full h-full p-1 text-white" />;
                }
                else if (cell.kind === 'herbicide') {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle, #f87171 0%, #7f1d1d 100%)';
                  extraStyle.boxShadow = '0 0 10px rgba(248,113,113,0.7)';
                  content = <Skull className="w-full h-full p-1 text-white" />;
                }
                else if (cell.kind === 'sprout') {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle, #4ade80 0%, #14532d 100%)';
                  extraStyle.boxShadow = '0 0 12px rgba(74,222,128,0.8)';
                  content = <Sprout className="w-full h-full p-0.5 text-white" />;
                }
                else {
                  bg = '';
                  extraStyle.background = 'radial-gradient(circle at 40% 40%, #92400e 0%, #451a03 100%)';
                }
              } else {
                // Deep dark rock with subtle texture
                bg = '';
                extraStyle.background = 'radial-gradient(circle at 30% 30%, #292524 0%, #0c0a09 100%)';
              }

              return (
                <button
                  key={i}
                  onClick={() => grow(i)}
                  disabled={!isNeighbor || cell.kind === 'rock'}
                  aria-label={`cell ${i}`}
                  style={extraStyle}
                  className={`aspect-square rounded ${bg} ${isNeighbor && cell.kind !== 'rock' ? 'ring-2 ring-yellow-300/80 cursor-pointer hover:brightness-125' : ''} ${pulseIdx === i ? 'animate-scale-in' : ''} transition-all`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fun fact - looks like a mine notice board */}
        <div className="mt-3 rounded-lg p-3 text-xs sm:text-sm text-amber-50 shadow-lg border-4 border-amber-900 relative" style={{
          background: 'linear-gradient(180deg, #78350f 0%, #451a03 100%)'
        }}>
          <span className="absolute -top-2 left-3 w-2 h-2 rounded-full bg-stone-800 shadow" />
          <span className="absolute -top-2 right-3 w-2 h-2 rounded-full bg-stone-800 shadow" />
          <b className="text-yellow-300">Miner's Notebook:</b> {cfg.fact}
        </div>

        {/* Legend */}
        <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-1 text-[10px] sm:text-xs text-amber-100">
          <div className="flex items-center gap-1 bg-stone-900/70 border border-amber-800 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Water +5</div>
          <div className="flex items-center gap-1 bg-stone-900/70 border border-amber-800 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Food +5</div>
          <div className="flex items-center gap-1 bg-stone-900/70 border border-amber-800 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Sprout +20</div>
          <div className="flex items-center gap-1 bg-stone-900/70 border border-amber-800 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-stone-500 inline-block" /> Rock</div>
          <div className="flex items-center gap-1 bg-stone-900/70 border border-amber-800 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Herbicide</div>
        </div>
      </div>
    </div>
  );
}
