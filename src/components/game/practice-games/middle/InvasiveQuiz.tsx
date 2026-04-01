import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Ship, Truck, Bug, Anchor, Package, TreePine } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type ArrivalMethod = 'accident' | 'purpose' | 'other-species';

const ARRIVAL_LABELS: Record<ArrivalMethod, { label: string; Icon: typeof Ship }> = {
 accident: { label: 'By Accident', Icon: Ship },
 purpose: { label: 'On Purpose', Icon: Package },
 'other-species': { label: 'Through Other Species', Icon: Bug },
};

const ARRIVAL_DESCRIPTIONS: Record<ArrivalMethod, string> = {
 accident: 'Arrived unintentionally through shipping, contaminated seed, or ballast water.',
 purpose: 'Brought intentionally for agriculture, landscaping, or erosion control.',
 'other-species': 'Spread by attaching to animals, livestock, or through other plant trade.',
};

function getArrivalMethod(w: typeof weeds[0]): ArrivalMethod {
 const t = `${w.habitat} ${w.commonName} ${w.management}`.toLowerCase();
 if (t.match(/ornament|garden|crop|forage|pasture|erosion|medicin|landscap/)) return 'purpose';
 if (t.match(/animal|bird|livest|fur|attach|hitchhik/)) return 'other-species';
 return 'accident';
}

// Weed-specific stories with real details
const WEED_STORIES: Record<string, Record<ArrivalMethod, string>> = {
 'johnsongrass': {
 purpose: 'Johnsongrass (Sorghum halepense) was deliberately imported from the Mediterranean region in the 1830s as a forage crop. It escaped cultivation due to its aggressive rhizome system and is now one of the most problematic weeds in the southern United States.',
 accident: 'Johnsongrass likely spread through contaminated sorghum seed shipments from the Mediterranean.',
 'other-species': 'Johnsongrass seeds can spread via livestock that consume and pass viable seeds.',
 },
 'canada-thistle': {
 purpose: 'Canada Thistle (Cirsium arvense) was likely introduced to North America by early European settlers, possibly as a contaminant in crop seed or packing materials. Despite its name, it originated in southeastern Europe.',
 accident: 'Canada Thistle arrived in North America accidentally through contaminated crop seed brought by European colonists in the 1600s.',
 'other-species': 'Canada Thistle seeds have feathery pappus for wind dispersal and can also be spread by birds.',
 },
 'kochia': {
 purpose: 'Kochia (Bassia scoparia) was introduced to North America from Eurasia as an ornamental and drought-tolerant forage. It became naturalized and is now highly invasive in the Great Plains, with tumbleweed-like seed dispersal.',
 accident: 'Kochia likely spread through contaminated grain shipments from central Asia.',
 'other-species': 'Kochia plants break off at the base and tumble across landscapes, dispersing seeds over great distances.',
 },
};

function getStory(w: typeof weeds[0], method: ArrivalMethod): string {
 if (WEED_STORIES[w.id]?.[method]) return WEED_STORIES[w.id][method];
 switch (method) {
 case 'purpose':
 return `${w.commonName} (${w.scientificName}) was likely brought to the Midwest intentionally for agricultural use, ornamental planting, or erosion control. Over time it escaped managed areas and established wild populations, becoming a persistent weed in ${w.habitat.toLowerCase()}.`;
 case 'other-species':
 return `${w.commonName} (${w.scientificName}) likely spread to the Midwest by hitchhiking on animals or livestock. Its seeds can attach to fur, feathers, or clothing. It is now commonly found in ${w.habitat.toLowerCase()}.`;
 case 'accident':
 default:
 return `${w.commonName} (${w.scientificName}) likely arrived in the Midwest accidentally through contaminated crop seed, shipping materials, or soil transported from ${w.origin === 'Introduced' ? 'its native range' : 'other regions'}. It now thrives in ${w.habitat.toLowerCase()}.`;
 }
}

export default function InvasiveQuiz({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const rounds = useMemo(() => {
 const introduced = shuffle(weeds.filter(w => w.origin === 'Introduced')).slice(0, 8);
 return introduced.map(w => {
 const method = getArrivalMethod(w);
 return { weed: w, method, story: getStory(w, method) };
 });
 }, []);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState<ArrivalMethod | null>(null);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);

 const done = round >= rounds.length;
 const current = !done ? rounds[round] : null;

 const submit = (method: ArrivalMethod) => {
 if (answered) return;
 setSelected(method);
 setAnswered(true);
 if (method === current!.method) setScore(s => s + 1);
 };

 const next = () => { setRound(r => r + 1); setSelected(null); setAnswered(false); };
 const restart = () => { setRound(0); setScore(0); setSelected(null); setAnswered(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
 addBadge({ gameId: 'invasive-travelers', gameName: 'Invasive Travelers', level: 'MS', score, total: rounds.length });
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <Ship className="w-10 h-10 text-primary mb-3" />
 <h2 className="text-2xl font-bold text-foreground mb-2">Journey Complete!</h2>
 <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
 <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Invasive Travelers</h1>
 <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
 <div className="bg-card border border-border rounded-xl p-4 max-w-md w-full flex gap-4 items-center mb-4">
 <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
 <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-foreground text-lg">{current!.weed.commonName}</p>
 <p className="text-xs text-muted-foreground italic">{current!.weed.scientificName}</p>
 <p className="text-xs text-muted-foreground mt-1">Family: {current!.weed.family}</p>
 </div>
 </div>

 <p className="font-bold text-foreground text-center mb-4">How did this weed most likely arrive in the Midwest?</p>

 <div className="flex flex-col gap-3 w-full max-w-md">
 {(Object.keys(ARRIVAL_LABELS) as ArrivalMethod[]).map(method => {
 const isCorrect = method === current!.method;
 const { label, Icon } = ARRIVAL_LABELS[method];
 const bg = !answered ? 'border-border bg-card hover:border-primary' :
 method === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
 isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
 return (
 <button key={method} onClick={() => submit(method)}
 className={`p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3 ${bg}`}>
 <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
 <div>
 <p className="font-bold text-sm text-foreground">{label}</p>
 <p className="text-xs text-muted-foreground mt-1">{ARRIVAL_DESCRIPTIONS[method]}</p>
 </div>
 </button>
 );
 })}
 </div>

 {answered && (
 <div className="mt-4 bg-card border border-border rounded-xl p-4 max-w-md w-full">
 <p className={`font-bold mb-2 ${selected === current!.method ? 'text-green-500' : 'text-destructive'}`}>
 {selected === current!.method ? 'Correct!' : 'Not quite!'}
 </p>
 <p className="text-sm text-muted-foreground">{current!.story}</p>
 <button onClick={next} className="mt-3 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold w-full">Next</button>
 </div>
 )}
 </div>
 </div>
 );
}
