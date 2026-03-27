import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const STAGES = [
  { id: 'seedling', label: 'Seedling', icon: '🌱' },
  { id: 'vegetative', label: 'Vegetative', icon: '🌿' },
  { id: 'reproductive', label: 'Reproductive', icon: '🌸' },
  { id: 'mature', label: 'Mature', icon: '🌾' },
];

const CONTROLS = [
  { id: 'pre-herb', label: 'Pre-emergent Herbicide', icon: '💧', bestStage: 'seedling' },
  { id: 'cultivation', label: 'Cultivation', icon: '🚜', bestStage: 'seedling' },
  { id: 'post-herb', label: 'Post-emergent Herbicide', icon: '🧪', bestStage: 'vegetative' },
  { id: 'mowing', label: 'Mowing', icon: '✂️', bestStage: 'reproductive' },
  { id: 'hand-pull', label: 'Hand Removal', icon: '🤚', bestStage: 'vegetative' },
  { id: 'harvest-mgmt', label: 'Harvest Management', icon: '🌾', bestStage: 'mature' },
];

const GRID_SIZE = 6;

interface GridCell { row: number; col: number; }
interface Connection { stageId: string; controlId: string; path: GridCell[]; }

function getStageExplanation(stageId: string, controlId: string): string {
  const ctrl = CONTROLS.find(c => c.id === controlId);
  const stage = STAGES.find(s => s.id === stageId);
  if (!ctrl || !stage) return '';
  if (ctrl.bestStage === stageId) {
    const explanations: Record<string, string> = {
      'seedling-pre-herb': 'Pre-emergent herbicides target seeds and young seedlings before they establish — the seedling stage is ideal.',
      'seedling-cultivation': 'Cultivation disrupts tiny seedlings effectively before roots take hold.',
      'vegetative-post-herb': 'Post-emergent herbicides are most effective on actively growing vegetative plants before they set seed.',
      'vegetative-hand-pull': 'Hand removal works well on vegetative plants — they\'re large enough to grab but haven\'t seeded yet.',
      'reproductive-mowing': 'Mowing at the reproductive stage prevents seed production, cutting off the plant\'s reproduction.',
      'mature-harvest-mgmt': 'Harvest management (chaff collection, seed capture) targets mature plants to prevent seeds entering the seed bank.',
    };
    return explanations[`${stageId}-${controlId}`] || `${ctrl.label} is most effective at the ${stage.label} stage.`;
  }
  return `${ctrl.label} works best at the ${STAGES.find(s => s.id === ctrl.bestStage)?.label} stage, not ${stage.label}. At the ${stage.label} stage, weeds are ${stageId === 'seedling' ? 'too young for this method' : stageId === 'mature' ? 'too established for this to be effective' : 'not at the optimal growth phase for this control'}.`;
}

export default function LifeStageMaze({ onBack }: { onBack: () => void }) {
  const stagesUsed = useMemo(() => STAGES.slice(0, 4), []);
  const controlsUsed = useMemo(() => {
    const picked: typeof CONTROLS[0][] = [];
    for (const s of stagesUsed) {
      const match = CONTROLS.find(c => c.bestStage === s.id && !picked.find(p => p.id === c.id));
      if (match) picked.push(match);
    }
    return picked;
  }, [stagesUsed]);

  // Place stages on left column, controls on right column of grid
  const stagePositions = useMemo(() => stagesUsed.map((s, i) => ({ ...s, row: i * 2, col: 0 })), [stagesUsed]);
  const controlPositions = useMemo(() => controlsUsed.map((c, i) => ({ ...c, row: i * 2, col: GRID_SIZE - 1 })), [controlsUsed]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [drawing, setDrawing] = useState<{ stageId: string; path: GridCell[] } | null>(null);
  const [checked, setChecked] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const isOccupied = useCallback((row: number, col: number, excludeStage?: string) => {
    return connections.some(c => {
      if (excludeStage && c.stageId === excludeStage) return false;
      return c.path.some(p => p.row === row && p.col === col);
    });
  }, [connections]);

  const handleCellClick = (row: number, col: number) => {
    if (checked) return;

    // Check if clicking a stage (start)
    const stage = stagePositions.find(s => s.row === row && s.col === col);
    if (stage) {
      // Remove existing connection for this stage
      setConnections(prev => prev.filter(c => c.stageId !== stage.id));
      setDrawing({ stageId: stage.id, path: [{ row, col }] });
      return;
    }

    // Check if clicking a control (end)
    const control = controlPositions.find(c => c.row === row && c.col === col);
    if (control && drawing) {
      const lastCell = drawing.path[drawing.path.length - 1];
      const dr = Math.abs(row - lastCell.row);
      const dc = Math.abs(col - lastCell.col);
      if ((dr + dc === 1) || (dr <= 1 && dc <= 1)) {
        // Remove any existing connection to this control
        setConnections(prev => {
          const filtered = prev.filter(c => c.controlId !== control.id);
          return [...filtered, { stageId: drawing.stageId, controlId: control.id, path: [...drawing.path, { row, col }] }];
        });
        setDrawing(null);
      }
      return;
    }

    // Extending path
    if (drawing) {
      const lastCell = drawing.path[drawing.path.length - 1];
      const dr = Math.abs(row - lastCell.row);
      const dc = Math.abs(col - lastCell.col);
      if (dr + dc === 1 && !isOccupied(row, col, drawing.stageId) && !drawing.path.some(p => p.row === row && p.col === col)) {
        setDrawing({ ...drawing, path: [...drawing.path, { row, col }] });
      }
    }
  };

  const check = () => { setChecked(true); setShowExplanations(true); };
  const correctCount = connections.filter(c => {
    const ctrl = CONTROLS.find(ct => ct.id === c.controlId);
    return ctrl?.bestStage === c.stageId;
  }).length;

  const restart = () => { setConnections([]); setDrawing(null); setChecked(false); setShowExplanations(false); };

  // Build grid rendering
  const getCellType = (row: number, col: number) => {
    const stage = stagePositions.find(s => s.row === row && s.col === col);
    if (stage) return { type: 'stage' as const, data: stage };
    const control = controlPositions.find(c => c.row === row && c.col === col);
    if (control) return { type: 'control' as const, data: control };
    return { type: 'empty' as const, data: null };
  };

  const getCellColor = (row: number, col: number) => {
    // Check if part of drawing path
    if (drawing?.path.some(p => p.row === row && p.col === col)) return 'bg-primary/30 border-primary';
    // Check if part of a connection
    for (const conn of connections) {
      if (conn.path.some(p => p.row === row && p.col === col)) {
        if (checked) {
          const ctrl = CONTROLS.find(c => c.id === conn.controlId);
          return ctrl?.bestStage === conn.stageId ? 'bg-green-500/20 border-green-500' : 'bg-destructive/20 border-destructive';
        }
        return 'bg-blue-400/20 border-blue-400';
      }
    }
    return 'bg-card border-border hover:bg-secondary/50';
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Life Stage Maze</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-4">Draw paths through the grid to connect each life stage (left) to its best control method (right). Paths cannot overlap!</p>

        {/* Grid */}
        <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array.from({ length: (stagesUsed.length * 2) }, (_, row) =>
            Array.from({ length: GRID_SIZE }, (_, col) => {
              const cell = getCellType(row, col);
              const cellColor = getCellColor(row, col);

              if (cell.type === 'stage') {
                const conn = connections.find(c => c.stageId === cell.data!.id);
                const isCorrect = checked && conn && CONTROLS.find(c => c.id === conn.controlId)?.bestStage === cell.data!.id;
                const isWrong = checked && conn && !isCorrect;
                return (
                  <button key={`${row}-${col}`} onClick={() => handleCellClick(row, col)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                      drawing?.stageId === cell.data!.id ? 'border-primary bg-primary/20' :
                      isCorrect ? 'border-green-500 bg-green-500/10' :
                      isWrong ? 'border-destructive bg-destructive/10' :
                      conn ? 'border-blue-400 bg-blue-400/10' : 'border-border bg-card'
                    }`}>
                    <span>{cell.data!.icon}</span>
                    <span className="leading-tight">{cell.data!.label}</span>
                  </button>
                );
              }

              if (cell.type === 'control') {
                return (
                  <button key={`${row}-${col}`} onClick={() => handleCellClick(row, col)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                      connections.find(c => c.controlId === cell.data!.id) ? 'border-blue-400 bg-blue-400/10' : 'border-border bg-card'
                    }`}>
                    <span>{cell.data!.icon}</span>
                    <span className="leading-tight text-center">{cell.data!.label.split(' ')[0]}</span>
                  </button>
                );
              }

              return (
                <button key={`${row}-${col}`} onClick={() => handleCellClick(row, col)}
                  className={`aspect-square rounded-lg border transition-all ${cellColor}`} />
              );
            })
          ).flat()}
        </div>

        {!checked && connections.length >= stagesUsed.length && (
          <button onClick={check} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Check Connections</button>
        )}

        {checked && showExplanations && (
          <div className="space-y-3 mb-4">
            <p className="text-foreground font-bold text-center text-lg">{correctCount}/{stagesUsed.length} correct connections</p>
            {connections.map(conn => {
              const ctrl = CONTROLS.find(c => c.id === conn.controlId);
              const stage = STAGES.find(s => s.id === conn.stageId);
              const correct = ctrl?.bestStage === conn.stageId;
              return (
                <div key={conn.stageId} className={`p-3 rounded-xl border-2 ${correct ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
                  <p className="text-sm font-bold text-foreground">{stage?.icon} {stage?.label} → {ctrl?.icon} {ctrl?.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getStageExplanation(conn.stageId, conn.controlId)}</p>
                </div>
              );
            })}
            <div className="flex gap-3">
              <button onClick={restart} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
              <button onClick={onBack} className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
