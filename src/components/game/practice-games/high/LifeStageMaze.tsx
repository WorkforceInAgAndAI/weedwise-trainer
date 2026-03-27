import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

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

export default function LifeStageMaze({ onBack }: { onBack: () => void }) {
  const roundWeeds = useMemo(() => shuffle(weeds).slice(0, 4), []);
  const stageOrder = useMemo(() => shuffle(STAGES), []);
  const controlOrder = useMemo(() => shuffle(CONTROLS).slice(0, 4), []);

  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const selectStage = (sId: string) => {
    if (checked) return;
    if (selected) {
      // selected is a control, sId is a stage — make connection
      setConnections(prev => {
        const n = { ...prev };
        // Remove any existing connection for this control
        Object.keys(n).forEach(k => { if (n[k] === selected) delete n[k]; });
        n[sId] = selected;
        return n;
      });
      setSelected(null);
    } else {
      setSelected(sId);
    }
  };

  const selectControl = (cId: string) => {
    if (checked) return;
    if (selected && STAGES.some(s => s.id === selected)) {
      setConnections(prev => {
        const n = { ...prev };
        Object.keys(n).forEach(k => { if (n[k] === cId) delete n[k]; });
        n[selected] = cId;
        return n;
      });
      setSelected(null);
    } else {
      setSelected(cId);
    }
  };

  const check = () => setChecked(true);
  const correctCount = Object.entries(connections).filter(([stageId, controlId]) => {
    const ctrl = CONTROLS.find(c => c.id === controlId);
    return ctrl?.bestStage === stageId;
  }).length;

  const restart = () => { setConnections({}); setSelected(null); setChecked(false); };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Life Stage Maze</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-4">Connect each life stage to its best control method (1-to-1). Tap a stage, then tap a control.</p>

        <div className="flex justify-between mb-6">
          {/* Stages column */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted-foreground text-center">STAGES</p>
            {stageOrder.map(s => {
              const connected = connections[s.id];
              const isCorrect = checked && connected && CONTROLS.find(c => c.id === connected)?.bestStage === s.id;
              const isWrong = checked && connected && !isCorrect;
              return (
                <button key={s.id} onClick={() => selectStage(s.id)}
                  className={`px-4 py-3 rounded-xl border-2 text-center transition-all ${
                    selected === s.id ? 'border-primary bg-primary/10' :
                    isCorrect ? 'border-green-500 bg-green-500/10' :
                    isWrong ? 'border-destructive bg-destructive/10' :
                    connected ? 'border-blue-400 bg-blue-400/10' :
                    'border-border bg-card'
                  }`}>
                  <p className="text-xl">{s.icon}</p>
                  <p className="text-xs font-bold text-foreground">{s.label}</p>
                  {connected && <p className="text-[10px] text-muted-foreground mt-1">→ {CONTROLS.find(c => c.id === connected)?.label}</p>}
                </button>
              );
            })}
          </div>

          {/* Connection lines area */}
          <div className="flex items-center justify-center text-muted-foreground text-2xl">⟷</div>

          {/* Controls column */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted-foreground text-center">CONTROLS</p>
            {controlOrder.map(c => {
              const usedBy = Object.entries(connections).find(([, cId]) => cId === c.id)?.[0];
              return (
                <button key={c.id} onClick={() => selectControl(c.id)}
                  className={`px-4 py-3 rounded-xl border-2 text-center transition-all ${
                    selected === c.id ? 'border-primary bg-primary/10' :
                    usedBy ? 'border-blue-400 bg-blue-400/10' :
                    'border-border bg-card'
                  }`}>
                  <p className="text-xl">{c.icon}</p>
                  <p className="text-xs font-bold text-foreground">{c.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {!checked && Object.keys(connections).length >= 4 && (
          <button onClick={check} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Check Connections</button>
        )}
        {checked && (
          <div className="text-center">
            <p className="text-foreground font-bold mb-3">{correctCount}/4 correct connections</p>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
              <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
