import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const REMOVAL_METHODS = [
 { id: 'gloves', label: 'Wear gloves and pull it out', icon: '', safe: true },
 { id: 'bare', label: 'Pull it out with bare hands', icon: '', safe: false },
 { id: 'tell', label: 'Tell an adult and stay away', icon: '', safe: true },
 { id: 'eat', label: 'Touch it to see if it stings', icon: '', safe: false },
];

export default function SafeVsToxic({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const rounds = useMemo(() => {
 const toxic = weeds.filter(w => w.safetyNote);
 const safe = weeds.filter(w => !w.safetyNote);
 return shuffle(toxic).slice(0, 4).map(tw => {
 const decoys = shuffle(safe.filter(s => s.family === tw.family || Math.random() > 0.5)).slice(0, 3);
 const group = shuffle([tw, ...decoys]);
 return { toxicWeed: tw, group };
 });
 }, []);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState<string | null>(null);
 const [identified, setIdentified] = useState(false);
 const [removalChoice, setRemovalChoice] = useState<string | null>(null);
 const [score, setScore] = useState(0);

 const done = round >= rounds.length;
 const r = !done ? rounds[round] : null;

 const identify = () => {
 setIdentified(true);
 if (selected === r?.toxicWeed.id) setScore(s => s + 1);
 };

 const chooseRemoval = (id: string) => {
 setRemovalChoice(id);
 };

 const next = () => {
 setRound(i => i + 1); setSelected(null); setIdentified(false); setRemovalChoice(null);
 };

 const restart = () => { setRound(0); setSelected(null); setIdentified(false); setRemovalChoice(null); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

 const foundCorrect = identified && selected === r?.toxicWeed.id;

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Safe vs. Toxic</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <p className="text-sm text-muted-foreground mb-3 text-center">
 {!identified ? 'One of these weeds is toxic! Find it!' : foundCorrect ? 'You found it! Now — how should you remove it safely?' : `The toxic weed was ${r?.toxicWeed.commonName}`}
 </p>
 <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-4">
 {r!.group.map(w => (
 <button key={w.id} onClick={() => !identified && setSelected(w.id)}
 className={`rounded-xl overflow-hidden border-2 transition-all ${
 identified ? (w.id === r!.toxicWeed.id ? 'border-destructive ring-2 ring-destructive' : 'border-border opacity-50') :
 selected === w.id ? 'border-primary scale-105' : 'border-border hover:border-primary/50'
 }`}>
 <div className="aspect-square bg-secondary">
 <WeedImage weedId={w.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 <p className="text-xs font-medium text-foreground p-1.5 text-center">{w.commonName}</p>
 </button>
 ))}
 </div>
 {!identified && selected && (
 <button onClick={identify} className="w-full max-w-sm mx-auto block py-3 rounded-lg bg-destructive text-destructive-foreground font-bold">That's the toxic one!</button>
 )}
 {identified && (
 <div className="max-w-sm mx-auto">
 {r!.toxicWeed.safetyNote && (
 <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 mb-3">Warning: {r!.toxicWeed.safetyNote}</p>
 )}
 {foundCorrect && !removalChoice && (
 <div className="space-y-2">
 <p className="text-sm font-bold text-foreground text-center">How should you handle this toxic weed?</p>
 {REMOVAL_METHODS.map(m => (
 <button key={m.id} onClick={() => chooseRemoval(m.id)}
 className="w-full py-2 px-3 rounded-lg border-2 border-border bg-card text-foreground text-sm font-medium text-left hover:border-primary transition-colors">
 {m.icon} {m.label}
 </button>
 ))}
 </div>
 )}
 {(removalChoice || !foundCorrect) && (
 <div className="text-center mt-3">
 {removalChoice && (
 <p className={`text-sm font-bold mb-2 ${REMOVAL_METHODS.find(m => m.id === removalChoice)?.safe ? 'text-green-500' : 'text-destructive'}`}>
 {REMOVAL_METHODS.find(m => m.id === removalChoice)?.safe ? 'Smart and safe choice!' : 'Not safe! Always tell an adult and wear protection.'}
 </p>
 )}
 <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
