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
    <div className="fixed inset-0 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-800 z-40 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="flex items-center gap-1 text-amber-900 hover:text-amber-950 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-xs sm:text-sm font-bold text-amber-900">
            Level {levelIdx + 1} · {cfg.weed}
          </div>
          <div className="text-sm font-bold text-amber-900">Score: {score}</div>
        </div>

        {/* Status bar */}
        <div className="bg-white/90 rounded-lg p-2 mb-2 shadow flex items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-amber-900 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {sproutsClaimed}/{cfg.goal} sprouts
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <div className="flex-1 h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-300">
              <div
                className={`h-full transition-all ${energyPct > 40 ? 'bg-emerald-500' : energyPct > 20 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-900 w-10 text-right">{Math.max(0, energy)}</span>
          </div>
        </div>

        {/* Message */}
        <div className="h-8 mb-2 text-center text-sm font-bold text-amber-900">
          {message || 'Click a soil square next to your root tip to grow!'}
        </div>

        {/* Grid */}
        <div className="bg-amber-950 p-2 rounded-lg shadow-inner mx-auto" style={{ maxWidth: 560 }}>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {grid.map((cell, i) => {
              const isTip = i === tip;
              const inPath = path.includes(i);
              const isNeighbor = neighbors.has(i);
              const revealed = inPath || (cell.kind === 'rock' && isNeighbor);

              let bg = 'bg-amber-700';   // unexplored soil
              let content: React.ReactNode = null;

              if (inPath) {
                bg = 'bg-emerald-700';
                if (cell.kind === 'water' && cell.taken) content = <Droplet className="w-full h-full p-1 text-blue-200" />;
                else if (cell.kind === 'nutrient' && cell.taken) content = <Sparkles className="w-full h-full p-1 text-yellow-200" />;
                else if (cell.kind === 'herbicide') content = <Skull className="w-full h-full p-1 text-rose-200" />;
                else if (cell.kind === 'sprout' && cell.claimed) {
                  bg = 'bg-emerald-400';
                  content = <Sprout className="w-full h-full p-0.5 text-emerald-900" />;
                }
                if (isTip) {
                  bg = 'bg-lime-300';
                  content = <Sprout className="w-full h-full p-0.5 text-emerald-900" />;
                }
              } else if (isNeighbor) {
                // Peek what's next to the tip so player can strategize
                if (cell.kind === 'rock') { bg = 'bg-stone-500'; content = <Mountain className="w-full h-full p-1 text-stone-200" />; }
                else if (cell.kind === 'water') { bg = 'bg-blue-500'; content = <Droplet className="w-full h-full p-1 text-white" />; }
                else if (cell.kind === 'nutrient') { bg = 'bg-yellow-500'; content = <Sparkles className="w-full h-full p-1 text-white" />; }
                else if (cell.kind === 'herbicide') { bg = 'bg-rose-500'; content = <Skull className="w-full h-full p-1 text-white" />; }
                else if (cell.kind === 'sprout') { bg = 'bg-emerald-500'; content = <Sprout className="w-full h-full p-0.5 text-white" />; }
                else { bg = 'bg-amber-500'; }
              }

              return (
                <button
                  key={i}
                  onClick={() => grow(i)}
                  disabled={!isNeighbor || cell.kind === 'rock'}
                  aria-label={`cell ${i}`}
                  className={`aspect-square rounded ${bg} ${isNeighbor && cell.kind !== 'rock' ? 'ring-2 ring-white cursor-pointer hover:brightness-110' : ''} ${pulseIdx === i ? 'animate-scale-in' : ''} transition-all`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-3 bg-white/90 rounded-lg p-3 text-xs sm:text-sm text-amber-900 shadow border border-amber-200">
          <b>Did you know?</b> {cfg.fact}
        </div>

        {/* Legend */}
        <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-1 text-[10px] sm:text-xs text-amber-900">
          <div className="flex items-center gap-1 bg-white/70 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Water +5</div>
          <div className="flex items-center gap-1 bg-white/70 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Food +5</div>
          <div className="flex items-center gap-1 bg-white/70 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Sprout +20</div>
          <div className="flex items-center gap-1 bg-white/70 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-stone-500 inline-block" /> Rock</div>
          <div className="flex items-center gap-1 bg-white/70 rounded px-1 py-0.5"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Herbicide</div>
        </div>
      </div>
    </div>
  );
}
