import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const MOA_GROUPS = [
  { id: 'als', label: 'ALS Inhibitors (Group 2)', moa: 'Inhibits amino acid synthesis', site: 'Acetolactate synthase enzyme' },
  { id: 'accase', label: 'ACCase Inhibitors (Group 1)', moa: 'Inhibits fatty acid synthesis', site: 'Acetyl CoA carboxylase' },
  { id: 'psii', label: 'PSII Inhibitors (Group 5)', moa: 'Blocks photosynthesis', site: 'Photosystem II in chloroplasts' },
  { id: 'glyphosate', label: 'EPSPS Inhibitors (Group 9)', moa: 'Blocks amino acid production', site: 'EPSPS enzyme in shikimate pathway' },
  { id: 'ppo', label: 'PPO Inhibitors (Group 14)', moa: 'Disrupts cell membranes', site: 'Protoporphyrinogen oxidase' },
];

function getMOA(w: typeof weeds[0]): string {
  const m = w.management.toLowerCase();
  if (w.plantType === 'Monocot') return 'accase';
  if (m.includes('group 15') || m.includes('pre')) return 'ppo';
  if (m.includes('post') || m.includes('glyphosate')) return 'glyphosate';
  if (m.includes('als')) return 'als';
  return 'psii';
}

export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
  const items = useMemo(() => shuffle(weeds).slice(0, 8).map(w => ({ weed: w, correct: getMOA(w) })), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const done = idx >= items.length;

  const submit = (gId: string) => { if (answered) return; setPicked(gId); setAnswered(true); if (gId === items[idx].correct) setScore(s => s + 1); };
  const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
  const restart = () => { setIdx(0); setPicked(null); setAnswered(false); setScore(0); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <FlaskConical className="w-10 h-10 text-primary mb-3" />
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Complete!</h2>
      <p className="text-foreground mb-6">Score: {score} / {items.length}</p>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const cur = items[idx];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Mode of Action Match</h1>
          <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
        </div>
        <div className="flex justify-center mb-3">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-border">
            <WeedImage weedId={cur.weed.id} stage="plant" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-center font-bold text-foreground mb-1">{cur.weed.commonName}</p>
        <p className="text-center text-xs text-muted-foreground mb-4">{cur.weed.plantType} · {cur.weed.family}</p>
        <p className="text-sm text-muted-foreground text-center mb-3">Which herbicide mode of action targets this weed?</p>
        <div className="grid gap-2">
          {MOA_GROUPS.map(g => {
            let cls = 'border-border bg-card';
            if (answered && g.id === cur.correct) cls = 'border-green-500 bg-green-500/20';
            else if (answered && g.id === picked) cls = 'border-destructive bg-destructive/20';
            return (
              <button key={g.id} onClick={() => submit(g.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${cls}`}>
                <p className="text-sm font-bold text-foreground">{g.label}</p>
                <p className="text-[10px] text-muted-foreground">MOA: {g.moa} · Site: {g.site}</p>
              </button>
            );
          })}
        </div>
        {answered && <button onClick={next} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>}
      </div>
    </div>
  );
}
