import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Card { id: string; content: string; type: 'name' | 'cycle'; weedId: string; flipped: boolean; matched: boolean; }

function getCycleType(w: typeof weeds[0]): string {
  const lc = w.lifeCycle.toLowerCase();
  if (lc.includes('biennial')) return 'Biennial';
  if (lc.includes('perennial')) return 'Perennial';
  return 'Annual';
}

function pickThreeWeeds(): typeof weeds[0][] {
  const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
  weeds.forEach(w => { const t = getCycleType(w); byType[t].push(w); });
  const picks: typeof weeds[0][] = [];
  for (const type of ['Annual', 'Biennial', 'Perennial']) {
    const pool = shuffle(byType[type]);
    if (pool.length) picks.push(pool[0]);
  }
  while (picks.length < 3) {
    const extra = shuffle(weeds.filter(w => !picks.find(p => p.id === w.id)));
    if (extra.length) picks.push(extra[0]);
  }
  return picks;
}

export default function LifeCycleMatching({ onBack }: { onBack: () => void }) {
  const [roundNum, setRoundNum] = useState(1);
  const [roundWeeds, setRoundWeeds] = useState<typeof weeds[0][]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    const selected = pickThreeWeeds();
    setRoundWeeds(selected);
    const newCards: Card[] = [];
    selected.forEach(w => {
      newCards.push({ id: `name-${w.id}`, content: w.commonName, type: 'name', weedId: w.id, flipped: false, matched: false });
      newCards.push({ id: `cycle-${w.id}`, content: getCycleType(w), type: 'cycle', weedId: w.id, flipped: false, matched: false });
    });
    setCards(shuffle(newCards));
    setPicks([]);
    setMatchCount(0);
    setLocked(false);
  }, [roundNum]);

  const handleClick = (cardId: string) => {
    if (locked) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    const updated = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(updated);
    const newPicks = [...picks, cardId];
    setPicks(newPicks);

    if (newPicks.length === 2) {
      setLocked(true);
      const [a, b] = newPicks.map(id => updated.find(c => c.id === id)!);
      if (a.weedId === b.weedId && a.type !== b.type) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.weedId === a.weedId ? { ...c, matched: true, flipped: true } : c));
          setMatchCount(m => m + 1);
          setTotalMatches(t => t + 1);
          setPicks([]); setLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newPicks.includes(c.id) ? { ...c, flipped: false } : c));
          setPicks([]); setLocked(false);
        }, 800);
      }
    }
  };

  const allMatched = matchCount === 3;
  const gameOver = roundNum >= 3 && allMatched;

  if (gameOver) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">All Rounds Complete!</h2>
        <p className="text-lg text-foreground mb-6">{totalMatches} matches found</p>
        <div className="flex gap-3">
          <button onClick={() => { setRoundNum(1); setTotalMatches(0); }} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  if (allMatched && roundNum < 3) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold text-green-500 mb-4">Round {roundNum} Complete!</h2>
        <button onClick={() => setRoundNum(r => r + 1)} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Round</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Matching</h1>
        <span className="text-sm text-muted-foreground">Round {roundNum}/3</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Match each weed with its life cycle type</p>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {cards.map(card => (
            <button key={card.id} onClick={() => handleClick(card.id)}
              className={`h-28 rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                card.matched ? 'border-green-500 bg-green-500/20' :
                card.flipped ? 'border-primary bg-primary/10' :
                'border-border bg-card hover:border-primary/50'
              }`}>
              {card.flipped || card.matched ? (
                <>
                  {card.type === 'name' && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden mb-1">
                      <WeedImage weedId={card.weedId} stage="vegetative" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className={`text-xs font-bold text-foreground ${card.type === 'cycle' ? 'text-base' : ''}`}>{card.content}</span>
                </>
              ) : (
                <span className="text-2xl">?</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
