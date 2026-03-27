import { useState, useMemo } from 'react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const TOOLS = [
  { id: 'drone', name: 'Drone', icon: '🛸', desc: 'Aerial survey — best for large open fields', best: ['large', 'open'] },
  { id: 'rover', name: 'Rover', icon: '🤖', desc: 'Ground robot — best for row crops and precise mapping', best: ['row', 'precise'] },
  { id: 'manual', name: 'Manual Scouting', icon: '🥾', desc: 'Walking with hand tools — best for small or irregular fields', best: ['small', 'irregular'] },
  { id: 'satellite', name: 'Satellite / Remote', icon: '🛰️', desc: 'Satellite imagery — best for monitoring large areas over time', best: ['monitor', 'vast'] },
];

const FIELDS = [
  { id: 1, desc: 'A 500-acre flat corn field with suspected herbicide-resistant patches across the center.', bestTool: 'drone', note: 'A drone can quickly survey the large flat area and identify resistant patches via NDVI imaging.' },
  { id: 2, desc: 'A 2-acre organic vegetable garden with narrow raised beds and mixed crops.', bestTool: 'manual', note: 'Small, irregular area with obstacles makes manual scouting the most practical approach.' },
  { id: 3, desc: 'A 200-acre soybean field with uniform row spacing needing precise weed density counts.', bestTool: 'rover', note: 'A ground rover can navigate between rows and provide precise per-plant weed density data.' },
  { id: 4, desc: 'A 10,000-acre ranch needing seasonal weed spread monitoring across multiple pastures.', bestTool: 'satellite', note: 'Satellite imagery is ideal for monitoring vast areas over time without physical access.' },
  { id: 5, desc: 'A 50-acre wheat field surrounded by trees with gusty wind conditions.', bestTool: 'manual', note: 'Wind makes drone flight dangerous, and the moderate size is manageable for manual scouting.' },
];

export default function FieldScoutTools({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(FIELDS).slice(0, 4), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [scouted, setScouted] = useState(false);
  const [score, setScore] = useState(0);
  const done = idx >= rounds.length;

  const select = (tId: string) => { if (!scouted) setPicked(tId); };
  const scout = () => { setScouted(true); if (picked === rounds[idx].bestTool) setScore(s => s + 1); };
  const next = () => { setIdx(i => i + 1); setPicked(null); setScouted(false); };
  const restart = () => { setIdx(0); setPicked(null); setScouted(false); setScore(0); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">🥾</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Scouting Complete!</h2>
      <p className="text-foreground mb-6">Score: {score} / {rounds.length}</p>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const f = rounds[idx];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Field Scout Tools</h1>
          <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-foreground">{f.desc}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3 text-center">Which scouting tool is best for this field?</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {TOOLS.map(t => {
            let cls = 'border-border bg-card';
            if (scouted && t.id === f.bestTool) cls = 'border-green-500 bg-green-500/20';
            else if (scouted && t.id === picked) cls = 'border-destructive bg-destructive/20';
            else if (picked === t.id) cls = 'border-primary bg-primary/10';
            return (
              <button key={t.id} onClick={() => select(t.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${cls}`}>
                <p className="text-3xl mb-1">{t.icon}</p>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
              </button>
            );
          })}
        </div>
        {!scouted && picked && <button onClick={scout} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Scout!</button>}
        {scouted && (
          <div>
            <div className="bg-secondary/50 rounded-xl p-3 mb-3">
              <p className="text-sm text-foreground">{f.note}</p>
            </div>
            <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next Field</button>
          </div>
        )}
      </div>
    </div>
  );
}
