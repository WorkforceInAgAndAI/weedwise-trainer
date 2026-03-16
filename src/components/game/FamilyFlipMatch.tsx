import { useState, useCallback, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';
import type { Weed } from '@/types/game';

interface MatchCard {
  id: string;
  content: string;
  type: 'scientific' | 'family';
  weedId: string;
  flipped: boolean;
  matched: boolean;
}

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function FamilyFlipMatch({ onComplete, onNext }: Props) {
  const [selectedWeeds] = useState<Weed[]>(() => {
    // Try to pick 3 weeds from different families for variety
    const shuffled = [...weeds].sort(() => Math.random() - 0.5);
    const picked: Weed[] = [];
    const usedFamilies = new Set<string>();
    for (const w of shuffled) {
      if (!usedFamilies.has(w.family)) {
        picked.push(w);
        usedFamilies.add(w.family);
        if (picked.length === 3) break;
      }
    }
    // Fill if needed
    while (picked.length < 3) {
      const remaining = shuffled.filter(w => !picked.some(p => p.id === w.id));
      if (remaining.length === 0) break;
      picked.push(remaining[0]);
    }
    return picked;
  });

  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    const cardList: MatchCard[] = [];
    selectedWeeds.forEach(weed => {
      cardList.push({
        id: `sci-${weed.id}`,
        content: weed.scientificName,
        type: 'scientific',
        weedId: weed.id,
        flipped: false,
        matched: false,
      });
      cardList.push({
        id: `fam-${weed.id}`,
        content: weed.family,
        type: 'family',
        weedId: weed.id,
        flipped: false,
        matched: false,
      });
    });
    for (let i = cardList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }
    setCards(cardList);
  }, [selectedWeeds]);

  const handleClick = useCallback((cardId: string) => {
    if (lockBoard || completed) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (selected.includes(cardId)) return;

    const newSelected = [...selected, cardId];
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLockBoard(true);
      const [firstId, secondId] = newSelected;
      const first = cards.find(c => c.id === firstId)!;
      const second = cards.find(c => c.id === secondId)!;

      if (first.weedId === second.weedId && first.type !== second.type) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.weedId === first.weedId ? { ...c, matched: true, flipped: true } : c
          ));
          const newMatched = matchedCount + 1;
          setMatchedCount(newMatched);
          setSelected([]);
          setLockBoard(false);
          if (newMatched === 3) {
            setCompleted(true);
            onComplete(selectedWeeds.map(w => ({
              weedId: w.id,
              correct: !wrongAttempts[w.id] || wrongAttempts[w.id] === 0,
            })));
          }
        }, 500);
      } else {
        setWrongAttempts(prev => ({
          ...prev,
          [first.weedId]: (prev[first.weedId] || 0) + 1,
          [second.weedId]: (prev[second.weedId] || 0) + 1,
        }));
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newSelected.includes(c.id) && !c.matched ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setLockBoard(false);
        }, 900);
      }
    }
  }, [cards, selected, lockBoard, matchedCount, completed, onComplete, selectedWeeds, wrongAttempts]);

  if (completed) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
        <h2 className="font-display font-bold text-lg text-foreground">🎉 All Matched!</h2>
        <div className="space-y-3">
          {selectedWeeds.map(weed => (
            <div key={weed.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <WeedImage weedId={weed.id} stage="whole" className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary italic">{weed.scientificName}</h3>
                <p className="text-xs text-muted-foreground">{weed.commonName}</p>
                <p className="text-xs text-foreground mt-1">Family: <span className="font-semibold">{weed.family}</span></p>
                <p className="text-xs text-primary mt-1">💡 {weed.memoryHook}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          NEXT →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🧬 Family Match</h2>
        <p className="text-sm text-muted-foreground">Flip two cards to match each weed's scientific name with its plant family.</p>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Matched: {matchedCount}/3</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            disabled={card.matched}
            className={`relative h-28 sm:h-32 rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-center p-2
              ${card.matched
                ? 'border-accent bg-accent/10'
                : card.flipped
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary cursor-pointer'
              }`}
          >
            {card.flipped || card.matched ? (
              <div className="space-y-1">
                <span className={`text-xs sm:text-sm font-semibold ${card.type === 'scientific' ? 'italic text-primary' : 'text-foreground'}`}>
                  {card.content}
                </span>
                <div className="text-[10px] text-muted-foreground">
                  {card.type === 'scientific' ? '🔬 Scientific Name' : '🧬 Family'}
                </div>
              </div>
            ) : (
              <span className="text-2xl text-muted-foreground">❓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
