import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Card { id: string; content: string; type: 'weed' | 'cycle'; weedId: string; flipped: boolean; matched: boolean; }

export default function LifeCycleMatching({ onBack }: { onBack: () => void }) {
  const selected = useMemo(() => shuffle(weeds).slice(0, 6), []);
  const [cards, setCards] = useState<Card[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    const c: Card[] = [];
    selected.forEach(w => {
      c.push({ id: `w-${w.id}`, content: w.commonName, type: 'weed', weedId: w.id, flipped: false, matched: false });
      const cycle = w.lifeCycle.includes('Annual') ? 'Annual' : w.lifeCycle.includes('Biennial') ? 'Biennial' : 'Perennial';
      c.push({ id: `c-${w.id}`, content: cycle, type: 'cycle', weedId: w.id, flipped: false, matched: false });
    });
    setCards(shuffle(c));
  }, [selected]);

  const done = matchCount === selected.length && cards.length > 0;

  const handleClick = (cardId: string) => {
    if (locked) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const next = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(next);
    const newPicks = [...picks, cardId];
    setPicks(newPicks);

    if (newPicks.length === 2) {
      setLocked(true);
      const [a, b] = newPicks.map(id => next.find(c => c.id === id)!);
      if (a.weedId === b.weedId && a.type !== b.type) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.weedId === a.weedId ? { ...c, matched: true, flipped: true } : c));
          setMatchCount(m => m + 1);
          setPicks([]); setLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newPicks.includes(c.id) && !c.matched ? { ...c, flipped: false } : c));
          setPicks([]); setLocked(false);
        }, 1000);
      }
    }
  };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🃏</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">All Matched!</h2>
        <p className="text-muted-foreground mb-6">You matched all {selected.length} pairs!</p>
        <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Matching</h1>
        <span className="text-sm text-primary font-bold">{matchCount}/{selected.length} matched</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg">
          {cards.map(c => (
            <button key={c.id} onClick={() => handleClick(c.id)}
              className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center p-2 transition-all border-2 ${
                c.matched ? 'bg-primary/20 border-primary text-primary' :
                c.flipped ? 'bg-card border-primary text-foreground' :
                'bg-secondary border-border text-muted-foreground hover:border-primary/50'
              }`}>
              {c.flipped || c.matched ? c.content : '?'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
