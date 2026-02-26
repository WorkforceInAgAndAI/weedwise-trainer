import { useState, useCallback, useEffect } from 'react';
import type { Weed } from '@/types/game';

const STAGE_PREFIX_MAP: Record<string, string> = {
  seedling: 'seedling',
  vegetative: 'veg',
  flower: 'repro',
  whole: 'plant',
};

interface MatchCard {
  id: string;
  content: string;
  type: 'image' | 'name';
  weedId: string;
  flipped: boolean;
  matched: boolean;
}

interface CardFlipMatchProps {
  pairs: { weed: Weed }[];
  xpReward: number;
  onComplete: (correct: number, total: number) => void;
}

export default function CardFlipMatch({ pairs, xpReward, onComplete }: CardFlipMatchProps) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);

  useEffect(() => {
    const cardList: MatchCard[] = [];
    pairs.forEach(({ weed }) => {
      const prefix = STAGE_PREFIX_MAP['vegetative'] || 'veg';
      const variant = Math.random() < 0.5 ? 1 : 2;
      cardList.push({ id: `image-${weed.id}`, content: `/images/${weed.id}/${prefix}_${variant}.jpg`, type: 'image', weedId: weed.id, flipped: false, matched: false });
      cardList.push({ id: `name-${weed.id}`, content: weed.commonName, type: 'name', weedId: weed.id, flipped: false, matched: false });
    });
    // Shuffle
    for (let i = cardList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }
    setCards(cardList);
    setSelected([]);
    setAttempts(0);
    setMatchedCount(0);
  }, [pairs]);

  const handleClick = useCallback((cardId: string) => {
    if (lockBoard) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (selected.includes(cardId)) return;

    const newSelected = [...selected, cardId];
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLockBoard(true);
      setAttempts(a => a + 1);
      const [firstId, secondId] = newSelected;
      const first = cards.find(c => c.id === firstId)!;
      const second = cards.find(c => c.id === secondId)!;

      if (first.weedId === second.weedId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.weedId === first.weedId ? { ...c, matched: true, flipped: true } : c
          ));
          const newMatched = matchedCount + 1;
          setMatchedCount(newMatched);
          setSelected([]);
          setLockBoard(false);
          if (newMatched === pairs.length) {
            setTimeout(() => onComplete(pairs.length, attempts + 1), 600);
          }
        }, 500);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newSelected.includes(c.id) && !c.matched ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setLockBoard(false);
        }, 900);
      }
    }
  }, [cards, selected, lockBoard, matchedCount, pairs.length, attempts, onComplete]);

  return (
    <div className="space-y-4 animate-scale-in">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Matched: {matchedCount}/{pairs.length}</span>
        <span>Attempts: {attempts}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            disabled={card.matched || card.flipped}
            className={`relative h-24 sm:h-28 rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-center p-2
              ${card.matched
                ? 'border-accent bg-accent/20 cursor-default'
                : card.flipped
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary cursor-pointer'
              }`}
          >
            {card.flipped || card.matched ? (
              card.type === 'image' ? (
                <img src={card.content} alt="" className="w-full h-full object-cover rounded-md" />
              ) : (
                <span className="text-xs sm:text-sm font-semibold text-foreground">{card.content}</span>
              )
            ) : (
              <span className="text-2xl text-muted-foreground">❓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
