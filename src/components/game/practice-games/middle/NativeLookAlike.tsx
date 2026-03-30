import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export default function NativeLookAlike({ onBack }: { onBack: () => void }) {
 const pairs = useMemo(() => {
 const result: { native: typeof weeds[0]; introduced: typeof weeds[0] }[] = [];
 const natives = weeds.filter(w => w.origin === 'Native' && w.lookAlike);
 for (const n of shuffle(natives)) {
 const match = weeds.find(w => w.id === n.lookAlike.id && w.origin === 'Introduced');
 if (match && !result.find(r => r.native.id === n.id || r.introduced.id === match.id)) {
 result.push({ native: n, introduced: match });
 }
 if (result.length >= 5) break;
 }
 if (result.length < 5) {
 const families = [...new Set(weeds.map(w => w.family))];
 for (const fam of shuffle(families)) {
 const nats = weeds.filter(w => w.family === fam && w.origin === 'Native');
 const intros = weeds.filter(w => w.family === fam && w.origin === 'Introduced');
 if (nats.length && intros.length) {
 const n = shuffle(nats)[0];
 const i = shuffle(intros)[0];
 if (!result.find(r => r.native.id === n.id || r.introduced.id === i.id)) {
 result.push({ native: n, introduced: i });
 }
 }
 if (result.length >= 5) break;
 }
 }
 return result;
 }, []);

 const [round, setRound] = useState(0);
 const [checked, setChecked] = useState(false);
 const [score, setScore] = useState(0);
 // Track drag placements: weedId -> 'native' | 'introduced'
 const [placements, setPlacements] = useState<Record<string, 'native' | 'introduced'>>({});
 const [selectedWeed, setSelectedWeed] = useState<string | null>(null);

 const done = round >= pairs.length;
 const pair = !done ? pairs[round] : null;
 const allWeeds = pair ? shuffle([pair.native, pair.introduced]) : [];

 const unplaced = allWeeds.filter(w => !placements[w.id]);
 const allPlaced = pair ? Object.keys(placements).length === 2 : false;

 const handleDrop = (zone: 'native' | 'introduced') => {
 if (!selectedWeed || checked) return;
 setPlacements(p => ({ ...p, [selectedWeed]: zone }));
 setSelectedWeed(null);
 };

 const handleRemove = (weedId: string) => {
 if (checked) return;
 setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
 };

 const checkAnswers = () => {
 setChecked(true);
 const nativeCorrect = pair && placements[pair.native.id] === 'native';
 const introCorrect = pair && placements[pair.introduced.id] === 'introduced';
 if (nativeCorrect && introCorrect) setScore(s => s + 1);
 };

 const next = () => {
 setRound(r => r + 1);
 setChecked(false);
 setPlacements({});
 setSelectedWeed(null);
 };

 const restart = () => { setRound(0); setScore(0); setChecked(false); setPlacements({}); setSelectedWeed(null); };

 if (done) {
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
 <p className="text-lg text-foreground mb-6">{score}/{pairs.length} correct</p>
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
 <h1 className="font-bold text-foreground text-lg flex-1">Native vs. Introduced</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{pairs.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4">
 <p className="text-sm text-muted-foreground text-center">Drag each plant to the correct category: Native or Introduced</p>

 {/* Drop zones */}
 <div className="flex gap-4 w-full max-w-md">
 {(['native', 'introduced'] as const).map(zone => {
 const placed = allWeeds.filter(w => placements[w.id] === zone);
 const isCorrectZone = (weed: typeof weeds[0]) => 
 zone === 'native' ? weed.origin === 'Native' : weed.origin === 'Introduced';
 return (
 <button key={zone} onClick={() => handleDrop(zone)}
 className={`flex-1 rounded-xl border-2 p-4 min-h-[140px] transition-all ${
 selectedWeed ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
 }`}>
 <p className="text-sm font-bold text-foreground text-center mb-3 capitalize">{zone}</p>
 <div className="space-y-2">
 {placed.map(w => (
 <div key={w.id} className={`flex items-center gap-2 p-2 rounded-lg ${
 checked ? (isCorrectZone(w) ? 'bg-green-500/20 border border-green-500' : 'bg-destructive/20 border border-destructive') : 'bg-secondary'
 }`}>
 <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
 <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <span className="text-xs font-medium text-foreground flex-1">{w.commonName}</span>
 {!checked && (
 <button onClick={e => { e.stopPropagation(); handleRemove(w.id); }} className="text-muted-foreground hover:text-foreground text-xs"></button>
 )}
 </div>
 ))}
 </div>
 </button>
 );
 })}
 </div>

 {/* Unplaced weeds */}
 {unplaced.length > 0 && (
 <div className="flex gap-3">
 {unplaced.map(w => (
 <button key={w.id} onClick={() => setSelectedWeed(selectedWeed === w.id ? null : w.id)}
 className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
 selectedWeed === w.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
 }`}>
 <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary mb-2">
 <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <p className="text-sm font-bold text-foreground">{w.commonName}</p>
 </button>
 ))}
 </div>
 )}

 {allPlaced && !checked && (
 <button onClick={checkAnswers} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
 )}

 {checked && (
 <div className="text-center">
 <p className={`font-bold mb-1 ${placements[pair!.native.id] === 'native' && placements[pair!.introduced.id] === 'introduced' ? 'text-green-500' : 'text-destructive'}`}>
 {placements[pair!.native.id] === 'native' && placements[pair!.introduced.id] === 'introduced' ? 'Correct!' : 'Not quite!'}
 </p>
 <p className="text-xs text-muted-foreground mb-3">
 {pair!.native.commonName} is native. {pair!.introduced.commonName} is introduced.
 </p>
 <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
 </div>
 )}
 </div>
 </div>
 );
}
