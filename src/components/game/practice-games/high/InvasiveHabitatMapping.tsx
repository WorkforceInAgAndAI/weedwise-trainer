import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CONTINENTS = [
 { id: 'europe', label: 'Europe / Eurasia' },
 { id: 'asia', label: 'Asia' },
 { id: 'africa', label: 'Africa' },
 { id: 'americas', label: 'Americas (native spread)' },
];

const ARRIVAL_METHODS: Record<string, string> = {
 'canada-thistle': 'Contaminated imported crop seed in the 1700s',
 'caraway': 'Introduced for culinary/medicinal use; spread with cultivation',
 'lambsquarters': 'Likely introduced by early settlers as a food crop; also spread in contaminated seed lots',
 'kochia': 'Introduced to the U.S. from Europe and Asia as an ornamental in the 1800s',
 'velvetleaf': 'Brought intentionally from China in the early 1700s for fiber, then became a weed',
 'wild-oat': 'Introduced from Eurasia, likely as a crop contaminant',
 'wild-parsnip': 'Introduced from Europe as a food/medicinal plant and escaped cultivation',
 'poison-hemlock': 'Introduced from Europe/West Asia as an accidental contaminant',
 'morningglory': 'Introduced from tropical Americas and spread as an escaped ornamental',
 'johnsongrass': 'Introduced from the Mediterranean as a forage grass',
 'marestail': 'Native to North America but spread globally as a weed',
 'palmer-amaranth': 'Native to North America (Southwest), spread by contaminated hay, feed, seed, equipment',
 'waterhemp': 'Native to North America, spread through agricultural movement',
 'giant-ragweed': 'Native to North America, spread through disturbance',
 'giant-foxtail': 'Introduced from East Asia, likely through contaminated seed',
 'green-foxtail': 'Introduced from Eurasia, spread via contaminated seed',
 'yellow-foxtail': 'Introduced from Eurasia via contaminated grain',
 'large-crabgrass': 'Introduced from Europe, spread in crop and lawn seed',
 'barnyardgrass': 'Introduced from Eurasia, spread through rice and crop seed',
 'yellow-nutsedge': 'Introduced from Eurasia, spread through tubers and soil movement',
 'golden-alexanders': 'Native to North America',
 'pennsylvania-smartweed': 'Native to North America',
 'volunteer-sunflower': 'Native to North America, weedy volunteer from cultivation',
};

function getContinent(w: typeof weeds[0]): string {
 if (w.origin === 'Native' || ['palmer-amaranth', 'waterhemp', 'giant-ragweed', 'marestail', 'golden-alexanders', 'pennsylvania-smartweed', 'volunteer-sunflower'].includes(w.id)) return 'americas';
 const id = w.id.toLowerCase();
 if (['velvetleaf', 'giant-foxtail'].includes(id)) return 'asia';
 return 'europe';
}

function getArrivalMethod(w: typeof weeds[0]): string {
 return ARRIVAL_METHODS[w.id] || 'Introduced through contaminated seed or intentional planting';
}

const ARRIVAL_OPTIONS = [
 'Contaminated crop seed',
 'Intentional introduction (food/fiber/ornamental)',
 'Ship ballast or livestock feed',
 'Native species that spread through agriculture',
 'Escaped cultivation',
];

export default function InvasiveHabitatMapping({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [idx, setIdx] = useState(0);
 const [score, setScore] = useState(0);

 const items = useMemo(() => {
  const pool = shuffle(weeds.filter(w => w.origin === 'Introduced' || w.origin === 'Native'));
  const offset = ((level - 1) * 8) % pool.length;
  return pool.slice(offset).concat(pool).slice(0, 8);
 }, [level]);

 const QUESTIONS_PER_LEVEL = items.length;
 const current = items[idx];
 const done = idx >= QUESTIONS_PER_LEVEL;

 // Phases: id -> continent -> arrival -> feedback
 const [phase, setPhase] = useState<'id' | 'continent' | 'arrival' | 'feedback'>('id');
 const [idOptions, setIdOptions] = useState<string[]>([]);
 const [idAnswer, setIdAnswer] = useState<string | null>(null);
 const [continentAnswer, setContinentAnswer] = useState<string | null>(null);
 const [arrivalAnswer, setArrivalAnswer] = useState<string | null>(null);

 useMemo(() => {
  if (!current) return;
  const wrong = shuffle(weeds.filter(w => w.id !== current.id)).slice(0, 3).map(w => w.commonName);
  setIdOptions(shuffle([current.commonName, ...wrong]));
  setIdAnswer(null);
  setContinentAnswer(null);
  setArrivalAnswer(null);
  setPhase('id');
 }, [idx, current]);

 const submitId = (name: string) => {
  setIdAnswer(name);
  if (name === current.commonName) setScore(s => s + 1);
  setPhase('continent');
 };

 const submitContinent = (cId: string) => {
  setContinentAnswer(cId);
  if (cId === getContinent(current)) setScore(s => s + 1);
  setPhase('arrival');
 };

 const submitArrival = (method: string) => {
  setArrivalAnswer(method);
  setPhase('feedback');
 };

 const next = () => { setIdx(i => i + 1); };
 const restart = () => { setIdx(0); setScore(0); setPhase('id'); setIdAnswer(null); setContinentAnswer(null); setArrivalAnswer(null); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Level {level} Complete</h2>
    <p className="text-lg text-foreground mb-6">{score}/{QUESTIONS_PER_LEVEL * 2} correct</p>
    <LevelComplete level={level} score={score} total={QUESTIONS_PER_LEVEL * 2} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
   <div className="max-w-lg mx-auto p-4">
    <div className="flex items-center gap-3 mb-4">
     <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
     <h1 className="font-display font-bold text-lg text-foreground">Invasive ID</h1>
     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
     <span className="text-sm text-muted-foreground">{idx + 1}/{QUESTIONS_PER_LEVEL}</span>
    </div>

    <div className="flex justify-center mb-4">
     <div className="w-40 h-40 rounded-xl overflow-hidden bg-secondary border-2 border-border">
      <WeedImage weedId={current.id} stage="plant" className="w-full h-full object-cover" />
     </div>
    </div>

    {phase === 'id' && (
     <>
      <p className="text-sm text-muted-foreground text-center mb-3">Which weed is this?</p>
      <div className="grid grid-cols-2 gap-2">
       {idOptions.map(name => (
        <button key={name} onClick={() => submitId(name)}
         className="p-3 rounded-lg border-2 border-border bg-card text-sm font-bold text-foreground hover:border-primary transition-all">
         {name}
        </button>
       ))}
      </div>
     </>
    )}

    {phase === 'continent' && (
     <>
      <p className="text-center font-bold text-foreground mb-1">{current.commonName}</p>
      {idAnswer !== current.commonName && <p className="text-xs text-destructive text-center mb-2">You guessed: {idAnswer}</p>}
      <p className="text-sm text-muted-foreground text-center mb-3">Where did this weed originate from?</p>
      <div className="grid grid-cols-2 gap-2">
       {CONTINENTS.map(c => (
        <button key={c.id} onClick={() => submitContinent(c.id)}
         className="p-3 rounded-lg border-2 border-border bg-card text-sm font-bold text-foreground hover:border-primary transition-all">
         {c.label}
        </button>
       ))}
      </div>
     </>
    )}

    {phase === 'arrival' && (
     <>
      <p className="text-center font-bold text-foreground mb-1">{current.commonName}</p>
      <div className="flex gap-2 justify-center mb-3">
       <span className={`text-xs px-2 py-0.5 rounded ${continentAnswer === getContinent(current) ? 'bg-green-500/20 text-green-700' : 'bg-destructive/20 text-destructive'}`}>
        Origin: {CONTINENTS.find(c => c.id === getContinent(current))?.label}
       </span>
      </div>
      <p className="text-sm text-muted-foreground text-center mb-3">How was it introduced to North America?</p>
      <div className="flex flex-col gap-2">
       {ARRIVAL_OPTIONS.map(opt => (
        <button key={opt} onClick={() => submitArrival(opt)}
         className="p-3 rounded-lg border-2 border-border bg-card text-sm text-foreground hover:border-primary transition-all text-left">
         {opt}
        </button>
       ))}
      </div>
     </>
    )}

    {phase === 'feedback' && (
     <div className="text-center">
      <p className="font-bold text-foreground text-lg mb-2">{current.commonName}</p>
      <p className="text-xs text-muted-foreground italic mb-3">{current.scientificName}</p>
      <div className="bg-card border border-border rounded-xl p-4 mb-4 text-left">
       <p className="text-sm text-foreground mb-2"><strong>How it arrived:</strong> {getArrivalMethod(current)}</p>
       <p className="text-sm text-foreground mb-2"><strong>Origin:</strong> {CONTINENTS.find(c => c.id === getContinent(current))?.label}</p>
       <p className="text-sm text-foreground"><strong>Status:</strong> {current.origin}</p>
      </div>
      <button onClick={next} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
     </div>
    )}
   </div>
  </div>
 );
}
