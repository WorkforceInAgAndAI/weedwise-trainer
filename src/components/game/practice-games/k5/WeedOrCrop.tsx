import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const crops = [
  { name: 'Corn', emoji: '🌽' }, { name: 'Soybeans', emoji: '🫘' },
  { name: 'Wheat', emoji: '🌾' }, { name: 'Oats', emoji: '🌾' },
  { name: 'Alfalfa', emoji: '🍀' }, { name: 'Sorghum', emoji: '🌿' },
  { name: 'Sunflower', emoji: '🌻' }, { name: 'Barley', emoji: '🌾' },
];

interface RoundItem { type: 'weed' | 'crop'; name: string; weedId?: string; emoji?: string; }

export default function WeedOrCrop({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => {
    const items: RoundItem[] = [];
    shuffle(weeds).slice(0, 5).forEach(w => items.push({ type: 'weed', name: w.commonName, weedId: w.id }));
    shuffle(crops).slice(0, 5).forEach(c => items.push({ type: 'crop', name: c.name, emoji: c.emoji }));
    return shuffle(items);
  }, []);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (answered || done) return;
    if (timer <= 0) { setAnswered(true); setCorrect(false); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, answered, done]);

  const handleAnswer = (choice: 'weed' | 'crop') => {
    if (answered) return;
    setAnswered(true);
    const ok = choice === rounds[round].type;
    setCorrect(ok);
    if (ok) setScore(s => s + 1);
  };

  const next = () => {
    if (round + 1 >= rounds.length) { setDone(true); return; }
    setRound(r => r + 1); setTimer(10); setAnswered(false); setCorrect(null);
  };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Game Over!</h2>
        <p className="text-lg text-muted-foreground mb-6">You scored {score} / {rounds.length}</p>
        <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const item = rounds[round];
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed or Crop?</h1>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{rounds.length}</span>
        <span className="text-sm font-bold text-primary ml-2">Score: {score}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
        <div className="w-full max-w-xs">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 rounded-full ${timer <= 3 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${(timer / 10) * 100}%` }} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-1">{timer}s</p>
        </div>
        <div className="w-44 h-44 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
          {item.weedId ? <WeedImage weedId={item.weedId} stage="vegetative" className="w-full h-full object-cover" /> : <span className="text-7xl">{item.emoji}</span>}
        </div>
        <p className="text-xl font-bold text-foreground">{item.name}</p>
        {!answered ? (
          <div className="flex gap-4">
            <button onClick={() => handleAnswer('weed')} className="px-8 py-4 rounded-xl bg-destructive/90 text-destructive-foreground text-lg font-bold hover:bg-destructive transition-colors">Weed</button>
            <button onClick={() => handleAnswer('crop')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90 transition-opacity">Crop</button>
          </div>
        ) : (
          <div className="text-center">
            <p className={`text-xl font-bold mb-3 ${correct ? 'text-primary' : 'text-destructive'}`}>
              {correct ? 'Correct!' : `Wrong — it's a ${item.type}!`}
            </p>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
