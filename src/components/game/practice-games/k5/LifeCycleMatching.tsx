import { useState, useEffect, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Card { id: string; content: string; type: 'weed' | 'cycle'; weedId: string; flipped: boolean; matched: boolean; }

function getCycleType(w: typeof weeds[0]): string {
 if (w.lifeCycle.includes('Biennial')) return 'Biennial';
 if (w.lifeCycle.includes('Perennial')) return 'Perennial';
 return 'Annual';
}

function pickThreeWeeds(): typeof weeds[0][] {
 const annuals = shuffle(weeds.filter(w => getCycleType(w) === 'Annual'));
 const biennials = shuffle(weeds.filter(w => getCycleType(w) === 'Biennial'));
 const perennials = shuffle(weeds.filter(w => getCycleType(w) === 'Perennial'));
 const picks: typeof weeds[0][] = [];
 if (annuals.length) picks.push(annuals[0]);
 if (biennials.length) picks.push(biennials[0]);
 else picks.push(shuffle(weeds.filter(w => !picks.find(p => p.id === w.id)))[0]);
 if (perennials.length) picks.push(perennials[0]);
 else picks.push(shuffle(weeds.filter(w => !picks.find(p => p.id === w.id)))[0]);
 return picks;
}

export default function LifeCycleMatching({ onBack }: { onBack: () => void }) {
 const [roundNum, setRoundNum] = useState(0);
 const totalRounds = 3;

 const selected = useMemo(() => pickThreeWeeds(), [roundNum]);
 const [cards, setCards] = useState<Card[]>([]);
 const [picks, setPicks] = useState<string[]>([]);
 const [locked, setLocked] = useState(false);
 const [matchCount, setMatchCount] = useState(0);
 const [totalMatched, setTotalMatched] = useState(0);

 useEffect(() => {
 const c: Card[] = [];
 selected.forEach(w => {
 c.push({ id: `w-${w.id}`, content: w.commonName, type: 'weed', weedId: w.id, flipped: false, matched: false });
 c.push({ id: `c-${w.id}`, content: getCycleType(w), type: 'cycle', weedId: w.id, flipped: false, matched: false });
 });
 setCards(shuffle(c));
 setMatchCount(0);
 setPicks([]);
 setLocked(false);
 }, [selected]);

 const roundDone = matchCount === selected.length && cards.length > 0;
 const allDone = roundNum >= totalRounds;

 const restart = () => { setRoundNum(0); setTotalMatched(0); };

 const nextRound = useCallback(() => {
 setTotalMatched(t => t + matchCount);
 setRoundNum(r => r + 1);
 }, [matchCount]);

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

 if (allDone) return (
 <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
 <h2 className="text-2xl font-bold text-foreground mb-2">All Rounds Complete!</h2>
 <p className="text-muted-foreground mb-6">You matched {totalMatched} / {totalRounds * 3} pairs across {totalRounds} rounds!</p>
 <div className="flex gap-3 justify-center">
 <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
 </div>
 </div>
 </div>
 );

 if (roundDone) return (
 <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
 <h2 className="text-2xl font-bold text-green-500 mb-2">Round {roundNum + 1} Complete!</h2>
 <p className="text-muted-foreground mb-6">All {selected.length} pairs matched!</p>
 <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
 {roundNum + 1 < totalRounds ? `Round ${roundNum + 2} →` : 'See Results'}
 </button>
 </div>
 </div>
 );

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Matching</h1>
 <span className="text-sm text-muted-foreground">Round {roundNum + 1}/{totalRounds}</span>
 <span className="text-sm text-primary font-bold ml-2">{matchCount}/{selected.length} matched</span>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center p-4">
 <div className="bg-secondary/50 rounded-lg px-4 py-2 mb-4 max-w-md text-center">
 <p className="text-sm text-muted-foreground">Flip two tiles to find matching pairs. Match each weed name with its life cycle type (Annual, Biennial, or Perennial).</p>
 </div>
 <div className="grid grid-cols-3 gap-3 max-w-md w-full">
 {cards.map(c => (
 <button key={c.id} onClick={() => handleClick(c.id)}
 className={`h-28 rounded-xl font-bold flex flex-col items-center justify-center p-2 transition-all border-2 ${
 c.matched ? 'bg-green-500/20 border-green-500' :
 c.flipped ? 'bg-card border-primary' :
 'bg-secondary border-border hover:border-primary/50'
 }`}>
 {c.flipped || c.matched ? (
 <>
 {c.type === 'weed' && (
 <div className="w-12 h-12 rounded-lg overflow-hidden mb-1">
 <WeedImage weedId={c.weedId} stage="plant" className="w-full h-full object-cover" />
 </div>
 )}
 <span className={`text-xs text-foreground ${c.type === 'cycle' ? 'text-base' : ''}`}>{c.content}</span>
 </>
 ) : (
 <span className="text-2xl text-muted-foreground">?</span>
 )}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}
