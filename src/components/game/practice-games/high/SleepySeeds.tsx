import { useState, useMemo } from 'react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const MECHANISMS = [
  { id: 'physical', label: 'Physical Dormancy', icon: '🛡️', desc: 'Hard seed coat prevents water absorption' },
  { id: 'physiological', label: 'Physiological Dormancy', icon: '🧬', desc: 'Internal hormones inhibit germination until conditions change' },
  { id: 'chemical', label: 'Chemical Dormancy', icon: '🧪', desc: 'Chemical inhibitors prevent germination until leached out' },
  { id: 'morphological', label: 'Morphological Dormancy', icon: '🌱', desc: 'Embryo not fully developed at seed maturity' },
];

const SCENARIOS = [
  { desc: 'It\'s mid-winter and the soil is frozen solid. You need to survive until spring thaw.', best: 'physical', why: 'A tough seed coat protects you from freezing damage and mechanical stress until temperatures warm.' },
  { desc: 'Heavy rains have saturated the soil. Other seeds are germinating and dying from a late frost.', best: 'physiological', why: 'Internal hormone regulation keeps you dormant despite favorable moisture, waiting for consistent warmth.' },
  { desc: 'The soil is rich with allelopathic chemicals from a previous crop that kills young seedlings.', best: 'chemical', why: 'Your own chemical inhibitors keep you dormant until rain leaches the toxins from the surrounding soil.' },
  { desc: 'You\'ve just been shed from the parent plant in late summer. Other seeds that germinate now will die in winter.', best: 'morphological', why: 'Your embryo is still developing, forcing a delay that ensures germination in the optimal spring window.' },
  { desc: 'A farmer just tilled the field, burying you 6 inches deep with no light exposure.', best: 'physical', why: 'Your impermeable seed coat lets you persist in the soil seed bank for years until brought back to the surface.' },
  { desc: 'A hot, dry summer has parched the topsoil. Seeds germinating now will die of drought.', best: 'physiological', why: 'Hormonal regulation detects insufficient moisture signals and keeps germination suppressed until fall rains arrive.' },
];

export default function SleepySeeds({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(SCENARIOS).slice(0, 4), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const done = idx >= rounds.length;

  const submit = (mId: string) => { if (answered) return; setPicked(mId); setAnswered(true); if (mId === rounds[idx].best) setScore(s => s + 1); };
  const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
  const restart = () => { setIdx(0); setPicked(null); setAnswered(false); setScore(0); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">😴</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Seeds Survived!</h2>
      <p className="text-foreground mb-6">Score: {score} / {rounds.length}</p>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const s = rounds[idx];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Sleepy Seeds</h1>
          <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-2">You are a seed! Choose the best dormancy strategy to survive.</p>
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <p className="text-foreground text-sm">{s.desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {MECHANISMS.map(m => {
            let cls = 'border-border bg-card';
            if (answered && m.id === s.best) cls = 'border-green-500 bg-green-500/20';
            else if (answered && m.id === picked) cls = 'border-destructive bg-destructive/20';
            else if (picked === m.id && !answered) cls = 'border-primary bg-primary/10';
            return (
              <button key={m.id} onClick={() => submit(m.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${cls}`}>
                <p className="text-2xl mb-1">{m.icon}</p>
                <p className="text-xs font-bold text-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              </button>
            );
          })}
        </div>
        {answered && (
          <div>
            <div className="bg-secondary/50 rounded-xl p-3 mb-3">
              <p className="text-sm text-foreground">{s.why}</p>
            </div>
            <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
