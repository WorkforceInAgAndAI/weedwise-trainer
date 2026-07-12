import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Sun, Droplet, Sprout, Trophy, Flag, ArrowLeft } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

// Maze layout: '#' wall, '.' pellet path.
// The flower (player) starts bottom-left, the weed (AI) starts top-right.
const MAZE_ROWS = [
  '#############',
  '#...........#',
  '#.##.###.##.#',
  '#...........#',
  '#.##.#.#.##.#',
  '#...........#',
  '#.##.###.##.#',
  '#...........#',
  '#############',
];
const COLS = MAZE_ROWS[0].length;
const ROWS = MAZE_ROWS.length;
const CELL = 40; // px

type Pos = { x: number; y: number };
type PelletKind = 'sun' | 'water' | 'nutrient';
interface Pellet { x: number; y: number; kind: PelletKind }

const isWall = (x: number, y: number) =>
  x < 0 || y < 0 || x >= COLS || y >= ROWS || MAZE_ROWS[y][x] === '#';

function buildPellets(): Pellet[] {
  const kinds: PelletKind[] = ['sun', 'water', 'nutrient'];
  const out: Pellet[] = [];
  let i = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (MAZE_ROWS[y][x] === '.') {
        // Skip the two spawn cells so nobody starts on top of a pellet.
        if ((x === 1 && y === 7) || (x === COLS - 2 && y === 1)) continue;
        out.push({ x, y, kind: kinds[i % 3] });
        i++;
      }
    }
  }
  return out;
}

// BFS from a starting cell to the nearest pellet; returns the first step direction.
function nextStepTowardPellet(start: Pos, pellets: Pellet[]): Pos | null {
  if (pellets.length === 0) return null;
  const target = new Set(pellets.map(p => `${p.x},${p.y}`));
  const visited = new Set<string>([`${start.x},${start.y}`]);
  const queue: { pos: Pos; first: Pos | null }[] = [{ pos: start, first: null }];
  const dirs: Pos[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  while (queue.length) {
    const cur = queue.shift()!;
    if (target.has(`${cur.pos.x},${cur.pos.y}`) && cur.first) return cur.first;
    for (const d of dirs) {
      const nx = cur.pos.x + d.x, ny = cur.pos.y + d.y;
      const key = `${nx},${ny}`;
      if (isWall(nx, ny) || visited.has(key)) continue;
      visited.add(key);
      queue.push({ pos: { x: nx, y: ny }, first: cur.first ?? d });
    }
  }
  return null;
}

// Cartoon-style flower and weed SVG icons — no external images.
function FlowerSprite({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <line x1="20" y1="22" x2="20" y2="38" stroke="#2f7a2f" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 34 Q17 28 20 32" fill="none" stroke="#2f7a2f" strokeWidth="2" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="20" cy="10" rx="5" ry="8" fill="#ffd23f" stroke="#c98a00" strokeWidth="1.2"
          transform={`rotate(${a} 20 18)`} />
      ))}
      <circle cx="20" cy="18" r="4" fill="#ff7a1a" stroke="#a44300" strokeWidth="1.2" />
    </svg>
  );
}

function WeedSprite({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <line x1="20" y1="14" x2="20" y2="38" stroke="#3a5d1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 30 L10 24 M20 26 L12 18 M20 22 L10 14 M20 30 L30 24 M20 26 L28 18 M20 22 L30 14"
        stroke="#4a8b1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 14 L16 6 M20 14 L24 6 M20 14 L20 4"
        stroke="#4a8b1a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PelletIcon({ kind }: { kind: PelletKind }) {
  if (kind === 'sun') return <Sun className="w-4 h-4 text-yellow-500" />;
  if (kind === 'water') return <Droplet className="w-4 h-4 text-blue-500" />;
  return <Sprout className="w-4 h-4 text-emerald-600" />;
}

const CHECKER = 'repeating-linear-gradient(45deg,#000 0 10px,#fff 10px 20px)';

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

export default function GreatGardenRace({ onBack, gameId, gameName, gradeLabel }: Props) {
  const TOTAL_ROUNDS = 3;
  const [round, setRound] = useState(1);
  const [pellets, setPellets] = useState<Pellet[]>(() => buildPellets());
  const [flower, setFlower] = useState<Pos>({ x: 1, y: 7 });
  const [weed, setWeed] = useState<Pos>({ x: COLS - 2, y: 1 });
  const [flowerScore, setFlowerScore] = useState<Record<PelletKind, number>>({ sun: 0, water: 0, nutrient: 0 });
  const [weedScore, setWeedScore] = useState<Record<PelletKind, number>>({ sun: 0, water: 0, nutrient: 0 });
  const [flowerHeight, setFlowerHeight] = useState(2); // cm
  const [weedHeight, setWeedHeight] = useState(2);
  const [showTally, setShowTally] = useState(false);
  const [done, setDone] = useState(false);
  const dirRef = useRef<Pos>({ x: 0, y: 0 });
  const [paused, setPaused] = useState(false);

  const totalPellets = useMemo(() => buildPellets().length, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Pos> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      };
      const d = map[e.key];
      if (d) { e.preventDefault(); dirRef.current = d; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Game tick
  useEffect(() => {
    if (paused || showTally || done) return;
    const tick = setInterval(() => {
      // Move flower in requested direction if not into a wall
      setFlower(prev => {
        const d = dirRef.current;
        const nx = prev.x + d.x, ny = prev.y + d.y;
        if (isWall(nx, ny)) return prev;
        return { x: nx, y: ny };
      });
      // Weed AI moves toward nearest pellet
      setWeed(prev => {
        const step = nextStepTowardPellet(prev, pellets);
        if (!step) return prev;
        const nx = prev.x + step.x, ny = prev.y + step.y;
        if (isWall(nx, ny)) return prev;
        return { x: nx, y: ny };
      });
    }, 220);
    return () => clearInterval(tick);
  }, [paused, showTally, done, pellets]);

  // Pellet collection
  useEffect(() => {
    setPellets(prev => {
      const remaining: Pellet[] = [];
      let collected: { by: 'flower' | 'weed'; kind: PelletKind } | null = null;
      for (const p of prev) {
        if (p.x === flower.x && p.y === flower.y) { collected = { by: 'flower', kind: p.kind }; continue; }
        if (p.x === weed.x && p.y === weed.y) { collected = { by: 'weed', kind: p.kind }; continue; }
        remaining.push(p);
      }
      if (collected) {
        if (collected.by === 'flower') {
          setFlowerScore(s => ({ ...s, [collected!.kind]: s[collected!.kind] + 1 }));
        } else {
          setWeedScore(s => ({ ...s, [collected!.kind]: s[collected!.kind] + 1 }));
        }
      }
      return remaining;
    });
  }, [flower, weed]);

  // End of round when all pellets are gone
  useEffect(() => {
    if (pellets.length === 0 && !showTally && !done) {
      // Growth: weed grows faster per pellet (1.5 cm) than flower (1 cm)
      // to teach that weeds outgrow crops when they win the resource race.
      const fGain = flowerScore.sun + flowerScore.water + flowerScore.nutrient;
      const wGain = weedScore.sun + weedScore.water + weedScore.nutrient;
      setFlowerHeight(h => h + fGain * 1);
      setWeedHeight(h => h + wGain * 1.5);
      setShowTally(true);
    }
  }, [pellets, showTally, done, flowerScore, weedScore]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) { setDone(true); return; }
    setRound(r => r + 1);
    setPellets(buildPellets());
    setFlower({ x: 1, y: 7 });
    setWeed({ x: COLS - 2, y: 1 });
    setFlowerScore({ sun: 0, water: 0, nutrient: 0 });
    setWeedScore({ sun: 0, water: 0, nutrient: 0 });
    dirRef.current = { x: 0, y: 0 };
    setShowTally(false);
  }, [round]);

  const restart = () => {
    setRound(1); setPellets(buildPellets());
    setFlower({ x: 1, y: 7 }); setWeed({ x: COLS - 2, y: 1 });
    setFlowerScore({ sun: 0, water: 0, nutrient: 0 });
    setWeedScore({ sun: 0, water: 0, nutrient: 0 });
    setFlowerHeight(2); setWeedHeight(2);
    setShowTally(false); setDone(false); dirRef.current = { x: 0, y: 0 };
  };

  if (done) {
    const flowerWon = flowerHeight >= weedHeight;
    return (
      <LevelComplete
        level={1}
        score={flowerWon ? 3 : 1}
        total={3}
        onNextLevel={restart}
        onStartOver={restart}
        onBack={onBack}
        title={flowerWon ? 'Flower wins the Great Garden Race!' : 'The weed outgrew the flower — try again!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const dPad = (dir: Pos) => () => { dirRef.current = dir; };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Checker banner header */}
      <div className="max-w-4xl mx-auto rounded-lg overflow-hidden border-2 border-foreground mb-4">
        <div className="h-6" style={{ background: CHECKER }} />
        <div className="bg-card px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Flag className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">The Great Garden Race</h1>
            <p className="text-xs text-muted-foreground">Day {round} of {TOTAL_ROUNDS} — grab Sun, Water, and Nutrients before the weed does!</p>
          </div>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="h-6" style={{ background: CHECKER }} />
      </div>

      <div className="max-w-4xl mx-auto grid gap-4 lg:grid-cols-[auto_1fr]">
        {/* Maze */}
        <div className="mx-auto">
          <div className="relative bg-emerald-50 border-4 border-foreground rounded-lg"
               style={{ width: COLS * CELL, height: ROWS * CELL }}>
            {/* Walls */}
            {MAZE_ROWS.map((row, y) => row.split('').map((c, x) => c === '#' ? (
              <div key={`w-${x}-${y}`} className="absolute bg-emerald-900 rounded-sm"
                   style={{ left: x * CELL, top: y * CELL, width: CELL, height: CELL }} />
            ) : null))}
            {/* Pellets */}
            {pellets.map((p, i) => (
              <div key={i} className="absolute flex items-center justify-center"
                   style={{ left: p.x * CELL, top: p.y * CELL, width: CELL, height: CELL }}>
                <PelletIcon kind={p.kind} />
              </div>
            ))}
            {/* Weed sprite */}
            <div className="absolute transition-all duration-200 flex items-center justify-center"
                 style={{ left: weed.x * CELL, top: weed.y * CELL, width: CELL, height: CELL }}>
              <WeedSprite size={34} />
            </div>
            {/* Flower (player) */}
            <div className="absolute transition-all duration-200 flex items-center justify-center"
                 style={{ left: flower.x * CELL, top: flower.y * CELL, width: CELL, height: CELL }}>
              <FlowerSprite size={34} />
            </div>
          </div>

          {/* Mobile D-pad */}
          <div className="mt-3 grid grid-cols-3 gap-2 w-40 mx-auto lg:hidden">
            <div />
            <button onClick={dPad({ x: 0, y: -1 })} className="bg-primary text-primary-foreground rounded py-2">▲</button>
            <div />
            <button onClick={dPad({ x: -1, y: 0 })} className="bg-primary text-primary-foreground rounded py-2">◀</button>
            <button onClick={() => setPaused(p => !p)} className="bg-muted rounded py-2 text-xs">{paused ? 'Play' : 'Pause'}</button>
            <button onClick={dPad({ x: 1, y: 0 })} className="bg-primary text-primary-foreground rounded py-2">▶</button>
            <div />
            <button onClick={dPad({ x: 0, y: 1 })} className="bg-primary text-primary-foreground rounded py-2">▼</button>
            <div />
          </div>
          <p className="hidden lg:block text-center text-xs text-muted-foreground mt-2">Use arrow keys or WASD to steer the flower</p>
        </div>

        {/* Scoreboard */}
        <div className="space-y-3">
          <div className="border-2 border-foreground rounded-lg overflow-hidden">
            <div className="h-3" style={{ background: CHECKER }} />
            <div className="p-3 bg-card space-y-2">
              <div className="flex items-center gap-2">
                <FlowerSprite size={28} />
                <span className="font-bold text-foreground">Your Flower</span>
                <span className="ml-auto text-sm text-muted-foreground">{flowerHeight.toFixed(1)} cm tall</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="flex items-center gap-1"><Sun className="w-4 h-4 text-yellow-500" />{flowerScore.sun}</span>
                <span className="flex items-center gap-1"><Droplet className="w-4 h-4 text-blue-500" />{flowerScore.water}</span>
                <span className="flex items-center gap-1"><Sprout className="w-4 h-4 text-emerald-600" />{flowerScore.nutrient}</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-foreground rounded-lg overflow-hidden">
            <div className="h-3" style={{ background: CHECKER }} />
            <div className="p-3 bg-card space-y-2">
              <div className="flex items-center gap-2">
                <WeedSprite size={28} />
                <span className="font-bold text-foreground">The Weed</span>
                <span className="ml-auto text-sm text-muted-foreground">{weedHeight.toFixed(1)} cm tall</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="flex items-center gap-1"><Sun className="w-4 h-4 text-yellow-500" />{weedScore.sun}</span>
                <span className="flex items-center gap-1"><Droplet className="w-4 h-4 text-blue-500" />{weedScore.water}</span>
                <span className="flex items-center gap-1"><Sprout className="w-4 h-4 text-emerald-600" />{weedScore.nutrient}</span>
              </div>
              <p className="text-xs text-muted-foreground italic">Weeds grow ~50% faster per resource — outrun them!</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            Resources left: {pellets.length}/{totalPellets}
          </div>
        </div>
      </div>

      {/* End-of-day tally */}
      {showTally && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card border-2 border-foreground rounded-lg max-w-md w-full overflow-hidden">
            <div className="h-6" style={{ background: CHECKER }} />
            <div className="p-6 space-y-4 text-center">
              <h2 className="font-display font-bold text-2xl text-foreground">End of Day {round}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <FlowerSprite size={40} />
                  <div className="font-bold mt-1">Flower</div>
                  <div className="text-sm text-muted-foreground">{flowerHeight.toFixed(1)} cm</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <WeedSprite size={40} />
                  <div className="font-bold mt-1">Weed</div>
                  <div className="text-sm text-muted-foreground">{weedHeight.toFixed(1)} cm</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {weedHeight > flowerHeight
                  ? 'The weed is outgrowing your flower! Grab more Sun, Water, and Nutrients tomorrow.'
                  : 'Great work! Your flower is holding its own against the weed.'}
              </p>
              <button onClick={nextRound}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                {round >= TOTAL_ROUNDS ? 'See Final Result' : `Start Day ${round + 1}`}
              </button>
            </div>
            <div className="h-6" style={{ background: CHECKER }} />
          </div>
        </div>
      )}

      <FarmerGuide />
    </div>
  );
}
