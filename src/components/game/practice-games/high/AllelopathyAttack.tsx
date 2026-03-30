import { useState, useMemo } from 'react';
import { Leaf, Droplets, Layers, Wind, Swords } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STRATEGIES = [
 { id: 'root-exudate', label: 'Root Exudates', Icon: Leaf, desc: 'Release chemicals from roots into soil' },
 { id: 'leaf-leach', label: 'Leaf Leachate', Icon: Droplets, desc: 'Rain washes inhibitors off your leaves into soil' },
 { id: 'decomposition', label: 'Decomposition Toxins', Icon: Layers, desc: 'Your decaying matter releases inhibitory compounds' },
 { id: 'volatile', label: 'Volatile Emissions', Icon: Wind, desc: 'Release gaseous inhibitors from leaves' },
];

const SCENARIOS = [
 { enemy: 'Crabgrass', situation: 'A shallow-rooted grass is invading your territory by spreading rapidly at the soil surface.', best: 'root-exudate', why: 'Root exudates directly suppress shallow-rooted competitors by inhibiting their root growth in the surrounding soil.' },
 { enemy: 'Morning Glory', situation: 'A climbing vine is using your stem for support and stealing your sunlight from above.', best: 'leaf-leach', why: 'Leaf leachate compounds wash down onto the vine below during rain, inhibiting its growth at the contact point.' },
 { enemy: 'Lambsquarters', situation: 'A fast-growing broadleaf is taking over the area where your old leaves fell last autumn.', best: 'decomposition', why: 'Your decomposing leaf litter releases phenolic acids that prevent Lambsquarters seedlings from establishing.' },
 { enemy: 'Foxtail', situation: 'A grass is growing nearby but not touching you. You need to suppress it at a distance.', best: 'volatile', why: 'Volatile chemical emissions can travel through air to inhibit nearby plant growth without physical contact.' },
 { enemy: 'Velvetleaf', situation: 'A competitor\'s roots are intertwined with yours underground, competing for water.', best: 'root-exudate', why: 'Exudates released directly from your roots create a chemical zone of inhibition around competing root systems.' },
 { enemy: 'Ragweed', situation: 'A competitor germinates each spring in the same soil patch where your biomass accumulated.', best: 'decomposition', why: 'The persistent allelopathic compounds from your decomposing tissues prevent seedling establishment in your territory.' },
];

export default function AllelopathyAttack({ onBack }: { onBack: () => void }) {
 const { addBadge } = useGameProgress();
 const rounds = useMemo(() => shuffle(SCENARIOS).slice(0, 4), []);
 const [idx, setIdx] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);
 const done = idx >= rounds.length;

 const submit = (sId: string) => { if (answered) return; setPicked(sId); setAnswered(true); if (sId === rounds[idx].best) setScore(s => s + 1); };
 const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
 const restart = () => { setIdx(0); setPicked(null); setAnswered(false); setScore(0); };

 if (done) {
 addBadge({ gameId: 'allelopathy', gameName: 'Allelopathy Attack', level: 'HS', score, total: rounds.length });
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
 <Swords className="w-10 h-10 text-primary mb-3" />
 <h2 className="font-display font-bold text-2xl text-foreground mb-2">Battle Won!</h2>
 <p className="text-foreground mb-6">Score: {score} / {rounds.length}</p>
 <div className="flex gap-3">
 <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
 </div>
 </div>
 );
 }

 const s = rounds[idx];
 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Allelopathy Attack</h1>
 <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
 </div>
 <p className="text-center text-sm text-muted-foreground mb-2">You are a weed! Choose an allelopathy strategy to suppress your enemy.</p>
 <div className="bg-destructive/10 rounded-xl p-4 mb-4 border border-destructive/30">
 <div className="flex items-center gap-2 mb-1">
 <Swords className="w-4 h-4 text-destructive" />
 <p className="text-xs text-destructive font-bold">Enemy: {s.enemy}</p>
 </div>
 <p className="text-sm text-foreground">{s.situation}</p>
 </div>
 <div className="grid grid-cols-2 gap-3 mb-4">
 {STRATEGIES.map(st => {
 const StIcon = st.Icon;
 let cls = 'border-border bg-card';
 if (answered && st.id === s.best) cls = 'border-green-500 bg-green-500/20';
 else if (answered && st.id === picked) cls = 'border-destructive bg-destructive/20';
 return (
 <button key={st.id} onClick={() => submit(st.id)}
 className={`p-3 rounded-xl border-2 text-center transition-all ${cls}`}>
 <StIcon className="w-6 h-6 mx-auto mb-1 text-foreground" />
 <p className="text-xs font-bold text-foreground">{st.label}</p>
 <p className="text-[10px] text-muted-foreground">{st.desc}</p>
 </button>
 );
 })}
 </div>
 {answered && (
 <div>
 <div className="bg-secondary/50 rounded-xl p-3 mb-3"><p className="text-sm text-foreground">{s.why}</p></div>
 <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>
 </div>
 )}
 </div>
 </div>
 );
}
