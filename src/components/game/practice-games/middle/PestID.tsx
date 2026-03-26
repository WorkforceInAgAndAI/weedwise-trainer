import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CATEGORIES = ['Terrestrial', 'Aquatic', 'Parasitic'] as const;

function getCategory(w: typeof weeds[0]): string {
  const t = `${w.habitat} ${w.primaryHabitat}`.toLowerCase();
  if (t.match(/parasit/)) return 'Parasitic';
  if (t.match(/aquatic|water|flood|wetland|pond|river|moist|bottom/)) return 'Aquatic';
  return 'Terrestrial';
}

export default function PestID({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(weeds).slice(0, 10).map(w => ({ weed: w, answer: getCategory(w) })), []);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = round >= rounds.length;
  const current = !done ? rounds[round] : null;

  const submit = (cat: string) => {
    if (answered) return;
    setSelected(cat);
    setAnswered(true);
    if (cat === current!.answer) setScore(s => s + 1);
  };

  const next = () => { setRound(r => r + 1); setSelected(''); setAnswered(false); };
  const restart = () => { setRound(0); setScore(0); setSelected(''); setAnswered(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Pest ID</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-44 h-44 rounded-xl overflow-hidden bg-secondary mb-3">
          <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-sm">{current!.weed.habitat}</p>
        <div className="flex gap-3">
          {CATEGORIES.map(cat => {
            const isCorrect = cat === current!.answer;
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              cat === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
            return (
              <button key={cat} onClick={() => submit(cat)}
                className={`px-5 py-3 rounded-lg border-2 font-bold text-sm text-foreground transition-all ${bg}`}>
                {cat}
              </button>
            );
          })}
        </div>
        {answered && (
          <button onClick={next} className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
        )}
      </div>
    </div>
  );
}
