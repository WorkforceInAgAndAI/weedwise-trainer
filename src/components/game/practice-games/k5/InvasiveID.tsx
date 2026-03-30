import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import midwestMap from '@/assets/images/midwest-map.jpg';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Coordinates aligned to the actual Midwest.jpg map image
const MIDWEST_STATES: { name: string; x: number; y: number }[] = [
 { name: 'Minnesota', x: 52, y: 24 },
 { name: 'Wisconsin', x: 60, y: 28 },
 { name: 'Iowa', x: 50, y: 42 },
 { name: 'Illinois', x: 58, y: 50 },
 { name: 'Indiana', x: 65, y: 50 },
 { name: 'Ohio', x: 72, y: 46 },
 { name: 'Missouri', x: 52, y: 60 },
 { name: 'Kansas', x: 40, y: 58 },
 { name: 'Nebraska', x: 38, y: 40 },
 { name: 'Michigan', x: 67, y: 30 },
 { name: 'North Dakota', x: 42, y: 18 },
 { name: 'South Dakota', x: 42, y: 28 },
];

const ORIGINS: Record<string, string> = {};
weeds.forEach(w => {
 if (w.origin === 'Introduced') {
 const regions = ['Asia', 'Europe', 'South America', 'Africa', 'Central America'];
 ORIGINS[w.id] = regions[Math.abs(w.id.charCodeAt(0)) % regions.length];
 }
});

export default function InvasiveID({ onBack }: { onBack: () => void }) {
 const rounds = useMemo(() => shuffle(weeds).slice(0, 8).map((w, i) => {
 const state = MIDWEST_STATES[i % MIDWEST_STATES.length];
 return {
 weed: w,
 state,
 originRegion: w.origin === 'Introduced' ? (ORIGINS[w.id] || 'Europe') : 'North America',
 };
 }), []);

 const [round, setRound] = useState(0);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);
 const [choice, setChoice] = useState<string | null>(null);
 const [clickedDot, setClickedDot] = useState(false);

 const restart = () => { setRound(0); setAnswered(false); setScore(0); setChoice(null); setClickedDot(false); };

 const done = round >= rounds.length;
 const r = !done ? rounds[round] : null;
 const isInvasive = r?.weed.origin === 'Introduced';

 const submit = (ans: 'native' | 'invasive') => {
 setChoice(ans);
 setAnswered(true);
 const correct = (ans === 'invasive') === isInvasive;
 if (correct) setScore(s => s + 1);
 };

 const next = () => { setRound(i => i + 1); setAnswered(false); setChoice(null); setClickedDot(false); };

 if (done) return (
 <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
 <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
 <p className="text-muted-foreground mb-6">Score: {score}/{rounds.length}</p>
 <div className="flex gap-3 justify-center">
 <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
 </div>
 </div>
 </div>
 );

 const correct = choice ? ((choice === 'invasive') === isInvasive) : false;

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Invasive ID</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
 {/* Map with real Midwest background */}
 <div className="relative w-full max-w-lg aspect-[16/10] rounded-2xl border-2 border-border overflow-hidden">
 <img src={midwestMap} alt="U.S. Midwest map" className="absolute inset-0 w-full h-full object-cover" />

 {/* State dots */}
 {MIDWEST_STATES.map(s => {
 const isCurrentDot = r && s.name === r.state.name;
 return (
 <button key={s.name}
 onClick={() => isCurrentDot && !clickedDot && setClickedDot(true)}
 className={`absolute w-5 h-5 rounded-full border-2 transition-all ${
 isCurrentDot
 ? clickedDot ? 'bg-primary border-primary scale-125' : 'bg-rose-500 border-rose-400 animate-pulse scale-110 cursor-pointer'
 : 'bg-muted-foreground/30 border-border/50'
 }`}
 style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
 title={s.name}
 />
 );
 })}
 </div>

 {!clickedDot ? (
 <p className="text-sm text-muted-foreground text-center animate-pulse">Tap the glowing dot on the map to investigate!</p>
 ) : (
 <>
 <div className="bg-card border border-border rounded-xl p-4 max-w-md w-full flex gap-4 items-center">
 <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border bg-secondary flex-shrink-0">
 <WeedImage weedId={r!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <div className="flex-1 min-w-0">
 <h2 className="text-lg font-bold text-foreground">{r!.weed.commonName}</h2>
 <p className="text-sm text-muted-foreground">Found in: <strong>{r!.state.name}</strong></p>
 <p className="text-sm text-muted-foreground">Originally from: <strong>{r!.originRegion}</strong></p>
 </div>
 </div>

 {!answered ? (
 <div className="flex gap-4">
 <button onClick={() => submit('native')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold">Native</button>
 <button onClick={() => submit('invasive')} className="px-8 py-4 rounded-xl bg-destructive/90 text-destructive-foreground text-lg font-bold">Invasive</button>
 </div>
 ) : (
 <div className="text-center max-w-sm">
 <p className={`text-lg font-bold mb-2 ${correct ? 'text-green-500' : 'text-destructive'}`}>
 {correct ? 'Correct!' : `Not quite — this plant is ${isInvasive ? 'invasive' : 'native'}!`}
 </p>
 <p className="text-sm text-muted-foreground mb-3">
 {isInvasive ? `${r!.weed.commonName} was brought from ${r!.originRegion} and doesn't naturally belong in ${r!.state.name}.` : `${r!.weed.commonName} naturally grows in North America.`}
 </p>
 <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 );
}
