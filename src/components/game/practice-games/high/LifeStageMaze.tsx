import { useState, useMemo, useCallback } from 'react';
import { Sprout, Leaf, Flower2, TreeDeciduous, Shovel, SprayCan, Scissors, Hand, Warehouse, RotateCcw, ChevronLeft, Check, X, AlertTriangle, Info } from 'lucide-react';

const STAGES = [
  { id: 'seedling', label: 'Seedling', Icon: Sprout },
  { id: 'vegetative', label: 'Vegetative', Icon: Leaf },
  { id: 'reproductive', label: 'Reproductive', Icon: Flower2 },
  { id: 'mature', label: 'Mature', Icon: TreeDeciduous },
];

const CONTROLS = [
  { id: 'pre-herb', label: 'Pre-emergent Herbicide', Icon: SprayCan, bestStage: 'seedling' },
  { id: 'cultivation', label: 'Cultivation', Icon: Shovel, bestStage: 'seedling' },
  { id: 'post-herb', label: 'Post-emergent Herbicide', Icon: SprayCan, bestStage: 'vegetative' },
  { id: 'hand-pull', label: 'Hand Removal', Icon: Hand, bestStage: 'vegetative' },
  { id: 'mowing', label: 'Mowing', Icon: Scissors, bestStage: 'reproductive' },
  { id: 'harvest-mgmt', label: 'Harvest Management', Icon: Warehouse, bestStage: 'mature' },
];

const ROWS = 10;
const COLS = 10;

interface GridCell { row: number; col: number; }
interface Connection { stageId: string; controlId: string; path: GridCell[]; }

function getStageExplanation(stageId: string, controlId: string): string {
  const ctrl = CONTROLS.find(c => c.id === controlId);
  const stage = STAGES.find(s => s.id === stageId);
  if (!ctrl || !stage) return '';
  if (ctrl.bestStage === stageId) {
    return `${ctrl.label} is most effective at the ${stage.label} stage.`;
  }
  return `${ctrl.label} works best at the ${STAGES.find(s => s.id === ctrl.bestStage)?.label} stage, not ${stage.label}.`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLayout() {
  // 4 stages on left at fixed rows
  const stageRows = [1, 3, 6, 8];
  const stagePositions = STAGES.map((s, i) => ({ ...s, row: stageRows[i], col: 0 }));

  // Pick one control per stage (best match)
  const picked: typeof CONTROLS[number][] = [];
  for (const s of STAGES) {
    const match = CONTROLS.find(c => c.bestStage === s.id && !picked.find(p => p.id === c.id));
    if (match) picked.push(match);
  }

  // Shuffle control positions so they are NOT directly across from their matching stage
  const controlRowSlots = [1, 3, 6, 8];
  let shuffledSlots = shuffle([...controlRowSlots]);
  // Ensure no control is directly across from its best stage
  let attempts = 0;
  while (attempts < 50) {
    let conflict = false;
    for (let i = 0; i < picked.length; i++) {
      const bestStageIdx = STAGES.findIndex(s => s.id === picked[i].bestStage);
      if (shuffledSlots[i] === stageRows[bestStageIdx]) {
        conflict = true;
        break;
      }
    }
    if (!conflict) break;
    shuffledSlots = shuffle([...controlRowSlots]);
    attempts++;
  }

  const controlPositions = picked.map((c, i) => ({ ...c, row: shuffledSlots[i], col: 9 }));

  const occupied = new Set<string>();
  stagePositions.forEach(s => occupied.add(`${s.row},${s.col}`));
  controlPositions.forEach(c => occupied.add(`${c.row},${c.col}`));

  // Create sparse obstacle islands so paths must navigate around roadblocks,
  // while keeping enough open lanes for all stage-to-control connections.
  const walls = new Set<string>();
  const wallPatterns: GridCell[] = [
    // Left lane blockers (force first detour)
    { row: 1, col: 2 }, { row: 2, col: 2 },
    { row: 4, col: 2 }, { row: 5, col: 2 },
    { row: 7, col: 2 }, { row: 8, col: 2 },

    // Mid lane blockers (second detour points)
    { row: 2, col: 4 }, { row: 3, col: 4 },
    { row: 6, col: 4 }, { row: 7, col: 4 },

    // Right-mid lane blockers (third detour points)
    { row: 1, col: 6 }, { row: 2, col: 6 },
    { row: 4, col: 6 }, { row: 5, col: 6 },
    { row: 7, col: 6 }, { row: 8, col: 6 },

    // Near-control blockers (prevent straight final approach)
    { row: 2, col: 8 }, { row: 3, col: 8 },
    { row: 6, col: 8 }, { row: 7, col: 8 },
  ];
  wallPatterns.forEach(w => {
    const key = `${w.row},${w.col}`;
    if (!occupied.has(key)) walls.add(key);
  });

  return { stagePositions, controlPositions, walls };
}

export default function LifeStageMaze({ onBack }: { onBack: () => void }) {
  const [showInstructions, setShowInstructions] = useState(true);
  const layout = useMemo(() => generateLayout(), []);
  const { stagePositions, controlPositions, walls } = layout;

  const [connections, setConnections] = useState<Connection[]>([]);
  const [drawing, setDrawing] = useState<{ stageId: string; path: GridCell[] } | null>(null);
  const [checked, setChecked] = useState(false);

  const isWall = useCallback((row: number, col: number) => walls.has(`${row},${col}`), [walls]);

  const isOccupied = useCallback((row: number, col: number, excludeStage?: string) => {
    return connections.some(c => {
      if (excludeStage && c.stageId === excludeStage) return false;
      return c.path.some(p => p.row === row && p.col === col);
    });
  }, [connections]);

  const findNode = useCallback((row: number, col: number) => {
    const stage = stagePositions.find(s => s.row === row && s.col === col);
    if (stage) return { type: 'stage' as const, data: stage };
    const control = controlPositions.find(c => c.row === row && c.col === col);
    if (control) return { type: 'control' as const, data: control };
    return null;
  }, [stagePositions, controlPositions]);

  const handleCellClick = (row: number, col: number) => {
    if (checked) return;
    if (isWall(row, col)) return;

    const node = findNode(row, col);

    if (node?.type === 'stage') {
      setConnections(prev => prev.filter(c => c.stageId !== node.data.id));
      setDrawing({ stageId: node.data.id, path: [{ row, col }] });
      return;
    }

    if (node?.type === 'control' && drawing) {
      const last = drawing.path[drawing.path.length - 1];
      if (Math.abs(row - last.row) + Math.abs(col - last.col) === 1) {
        setConnections(prev => {
          const filtered = prev.filter(c => c.controlId !== node.data.id);
          return [...filtered, { stageId: drawing.stageId, controlId: node.data.id, path: [...drawing.path, { row, col }] }];
        });
        setDrawing(null);
      }
      return;
    }

    if (drawing) {
      const last = drawing.path[drawing.path.length - 1];
      const dist = Math.abs(row - last.row) + Math.abs(col - last.col);
      if (dist === 1 && !isOccupied(row, col, drawing.stageId) && !drawing.path.some(p => p.row === row && p.col === col)) {
        setDrawing({ ...drawing, path: [...drawing.path, { row, col }] });
      }
    }
  };

  const undoLast = () => {
    if (!drawing || drawing.path.length <= 1) return;
    setDrawing({ ...drawing, path: drawing.path.slice(0, -1) });
  };

  const cancelDraw = () => setDrawing(null);

  const check = () => setChecked(true);
  const correctCount = connections.filter(c => {
    const ctrl = CONTROLS.find(ct => ct.id === c.controlId);
    return ctrl?.bestStage === c.stageId;
  }).length;

  const restart = () => { setConnections([]); setDrawing(null); setChecked(false); };

  const getCellState = (row: number, col: number) => {
    if (drawing?.path.some(p => p.row === row && p.col === col)) return 'drawing';
    for (const conn of connections) {
      if (conn.path.some(p => p.row === row && p.col === col)) {
        if (checked) {
          const ctrl = CONTROLS.find(c => c.id === conn.controlId);
          return ctrl?.bestStage === conn.stageId ? 'correct' : 'wrong';
        }
        return 'connected';
      }
    }
    return 'empty';
  };

  const getConnectionForCell = (row: number, col: number) => {
    if (drawing?.path.some(p => p.row === row && p.col === col)) return drawing.stageId;
    for (const conn of connections) {
      if (conn.path.some(p => p.row === row && p.col === col)) return conn.stageId;
    }
    return null;
  };

  const stageCount = STAGES.length;

  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <Info className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-3">Life Stage Maze</h2>
        <div className="max-w-md text-left space-y-3 mb-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Goal:</strong> Draw paths through the maze to connect each weed life stage (left) to its best control method (right).
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">How to play:</strong> Click a life stage to start drawing. Click adjacent cells to extend your path. Click a control method to complete the connection.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Roadblocks:</strong> Dark cells are walls — you cannot draw through them. Plan your path around them!
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Rules:</strong> Paths cannot overlap with each other. Connect all {stageCount} stages, then check your answers.
          </p>
        </div>
        <button onClick={() => setShowInstructions(false)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
          Start Maze
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">Life Stage Maze</h1>
            <p className="text-xs text-muted-foreground">Draw paths from stages → controls. Dark cells are roadblocks!</p>
          </div>
          <button onClick={() => setShowInstructions(true)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-3 text-xs">
          {stagePositions.map((s, i) => {
            const colors = ['bg-primary/20 border-primary', 'bg-blue-400/20 border-blue-400', 'bg-orange-400/20 border-orange-400', 'bg-emerald-500/20 border-emerald-500'];
            return (
              <div key={s.id} className={`flex items-center gap-1 px-2 py-1 rounded border ${colors[i]}`}>
                <s.Icon className="w-3 h-3" />
                <span className="text-foreground font-medium">{s.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1 px-2 py-1 rounded border border-foreground/40 bg-foreground/20">
            <div className="w-3 h-3 rounded bg-foreground/60" />
            <span className="text-foreground font-medium">Wall</span>
          </div>
        </div>

        {drawing && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Drawing from: <strong className="text-foreground">{stagePositions.find(s => s.id === drawing.stageId)?.label}</strong></span>
            <button onClick={undoLast} className="text-xs px-2 py-1 rounded bg-secondary text-foreground flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Undo
            </button>
            <button onClick={cancelDraw} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        )}

        <div
          className="grid gap-[2px] mb-4 bg-border rounded-xl p-[2px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const node = findNode(row, col);
              const wall = isWall(row, col);
              const state = getCellState(row, col);
              const connStage = getConnectionForCell(row, col);
              const pathIdx = connStage ? stagePositions.findIndex(s => s.id === connStage) : -1;

              if (wall) {
                return (
                  <div key={`${row}-${col}`} className="aspect-square rounded bg-foreground/40 border border-foreground/20" />
                );
              }

              if (node?.type === 'stage') {
                const s = node.data;
                const conn = connections.find(c => c.stageId === s.id);
                const isDrawing = drawing?.stageId === s.id;
                const isCorrect = checked && conn && CONTROLS.find(c => c.id === conn.controlId)?.bestStage === s.id;
                const isWrong = checked && conn && !isCorrect;
                const idx = stagePositions.findIndex(st => st.id === s.id);
                const borderColors = ['border-primary', 'border-blue-400', 'border-orange-400', 'border-emerald-500'];
                const bgColors = ['bg-primary/15', 'bg-blue-400/15', 'bg-orange-400/15', 'bg-emerald-500/15'];

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isCorrect ? 'border-green-500 bg-green-500/10' :
                      isWrong ? 'border-destructive bg-destructive/10' :
                      isDrawing ? `${borderColors[idx]} ${bgColors[idx]} ring-2 ring-primary/30` :
                      conn ? `${borderColors[idx]} ${bgColors[idx]}` :
                      'border-border bg-card hover:bg-secondary/50'
                    }`}
                  >
                    <s.Icon className="w-4 h-4 text-foreground" />
                    <span className="text-[8px] font-bold text-foreground leading-tight mt-0.5">{s.label}</span>
                  </button>
                );
              }

              if (node?.type === 'control') {
                const c = node.data;
                const conn = connections.find(cn => cn.controlId === c.id);
                const isCorrect = checked && conn && c.bestStage === conn.stageId;
                const isWrong = checked && conn && !isCorrect;

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isCorrect ? 'border-green-500 bg-green-500/10' :
                      isWrong ? 'border-destructive bg-destructive/10' :
                      conn ? 'border-accent bg-accent/10' :
                      'border-border bg-card hover:bg-secondary/50'
                    }`}
                  >
                    <c.Icon className="w-4 h-4 text-foreground" />
                    <span className="text-[7px] font-bold text-foreground leading-tight mt-0.5 text-center">{c.label.split(' ')[0]}</span>
                  </button>
                );
              }

              const pathColors = ['bg-primary/25', 'bg-blue-400/25', 'bg-orange-400/25', 'bg-emerald-500/25'];

              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  className={`aspect-square rounded transition-all ${
                    state === 'drawing' ? `${pathColors[pathIdx >= 0 ? pathIdx : 0]} border border-primary/50` :
                    state === 'correct' ? 'bg-green-500/20 border border-green-500/50' :
                    state === 'wrong' ? 'bg-destructive/20 border border-destructive/50' :
                    state === 'connected' ? `${pathColors[pathIdx >= 0 ? pathIdx : 0]} border border-muted-foreground/20` :
                    'bg-card border border-border/30 hover:bg-secondary/30 cursor-pointer'
                  }`}
                />
              );
            })
          ).flat()}
        </div>

        {!checked && connections.length >= stageCount && (
          <button onClick={check} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Check Connections
          </button>
        )}

        {!checked && connections.length < stageCount && (
          <p className="text-xs text-muted-foreground text-center">
            {connections.length}/{stageCount} connections made. Click a stage (left) to start drawing around walls.
          </p>
        )}

        {checked && (
          <div className="space-y-3 mb-4">
            <div className={`text-center p-3 rounded-xl ${correctCount === stageCount ? 'bg-green-500/10 border border-green-500' : 'bg-destructive/10 border border-destructive'}`}>
              <p className="text-foreground font-bold text-lg">{correctCount}/{stageCount} Correct</p>
              <p className="text-xs text-muted-foreground">{correctCount === stageCount ? 'Perfect maze navigation!' : 'Review the explanations below.'}</p>
            </div>

            {connections.map(conn => {
              const ctrl = CONTROLS.find(c => c.id === conn.controlId);
              const stage = STAGES.find(s => s.id === conn.stageId);
              const correct = ctrl?.bestStage === conn.stageId;
              return (
                <div key={conn.stageId} className={`p-3 rounded-xl border-2 ${correct ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {correct ? <Check className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                    <p className="text-sm font-bold text-foreground">
                      {stage?.label} → {ctrl?.label}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{getStageExplanation(conn.stageId, conn.controlId)}</p>
                </div>
              );
            })}

            <div className="flex gap-3">
              <button onClick={restart} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              <button onClick={onBack} className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
