import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CONTINENTS = [
  { id: 'north-america', label: 'N. America', x: 20, y: 35 },
  { id: 'south-america', label: 'S. America', x: 28, y: 65 },
  { id: 'europe', label: 'Europe', x: 48, y: 28 },
  { id: 'africa', label: 'Africa', x: 50, y: 55 },
  { id: 'asia', label: 'Asia', x: 70, y: 32 },
  { id: 'australia', label: 'Australia', x: 80, y: 70 },
];

function getOriginContinent(w: typeof weeds[0]): string {
  if (w.origin === 'Native') return 'north-america';
  const t = `${w.habitat} ${w.commonName} ${w.scientificName}`.toLowerCase();
  if (t.match(/europ|mediter/)) return 'europe';
  if (t.match(/asia|china|japan|india/)) return 'asia';
  if (t.match(/africa/)) return 'africa';
  if (t.match(/austral/)) return 'australia';
  if (t.match(/south america|brazil|tropical/)) return 'south-america';
  return Math.random() > 0.5 ? 'europe' : 'asia';
}

export default function WeedOrigins({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(weeds).slice(0, 8).map(w => ({ weed: w, continent: getOriginContinent(w) })), []);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = round >= rounds.length;
  const current = !done ? rounds[round] : null;

  const submit = (cId: string) => {
    if (answered) return;
    setSelected(cId);
    setAnswered(true);
    if (cId === current!.continent) setScore(s => s + 1);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setAnswered(false); };
  const restart = () => { setRound(0); setScore(0); setSelected(null); setAnswered(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
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
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Origins</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Full weed info card */}
        <div className="flex items-start gap-4 mb-4 bg-card rounded-xl border border-border p-3">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
            <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-lg">{current!.weed.commonName}</p>
            <p className="text-xs text-muted-foreground italic">{current!.weed.scientificName}</p>
            <p className="text-xs text-muted-foreground mt-1">Origin: {current!.weed.origin}</p>
            <p className="text-xs text-muted-foreground">Family: {current!.weed.family}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{current!.weed.habitat}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-3">Where is this weed originally from? Click on the continent.</p>
        {/* World map SVG */}
        <div className="relative w-full aspect-[2/1] rounded-xl border-2 border-border mb-4 overflow-hidden">
          <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full">
            {/* Ocean */}
            <rect width="1000" height="500" fill="hsl(210 60% 92%)" />
            {/* Simplified continent shapes */}
            {/* North America */}
            <path d="M120,60 L220,50 L260,80 L280,120 L270,160 L250,200 L200,230 L160,250 L120,230 L100,200 L80,160 L70,120 L90,80 Z" fill="hsl(140 30% 60%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
            {/* Central America */}
            <path d="M160,250 L180,260 L190,280 L200,310 L190,330 L170,320 L155,290 L150,270 Z" fill="hsl(140 30% 55%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
            {/* South America */}
            <path d="M200,310 L240,300 L280,320 L310,370 L300,420 L270,450 L240,460 L210,440 L190,400 L180,360 L190,330 Z" fill="hsl(140 30% 58%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
            {/* Europe */}
            <path d="M430,60 L500,50 L530,70 L540,100 L530,130 L510,150 L480,160 L450,150 L430,130 L420,100 L425,80 Z" fill="hsl(140 30% 62%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
            {/* Africa */}
            <path d="M430,180 L490,170 L530,190 L550,230 L560,280 L550,330 L520,370 L480,380 L440,360 L420,320 L410,270 L420,220 Z" fill="hsl(140 30% 56%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
            {/* Asia */}
            <path d="M540,50 L650,40 L730,60 L780,80 L800,120 L790,170 L760,200 L720,220 L670,210 L620,190 L580,160 L550,130 L540,100 Z" fill="hsl(140 30% 64%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
            {/* Australia */}
            <path d="M730,310 L800,300 L840,320 L850,360 L830,390 L790,400 L750,380 L730,350 Z" fill="hsl(140 30% 60%)" stroke="hsl(140 20% 40%)" strokeWidth="1.5" />
          </svg>
          {/* Clickable continent buttons */}
          {CONTINENTS.map(c => {
            const isCorrect = c.id === current!.continent;
            const bg = !answered ? 'bg-secondary/90 hover:bg-primary hover:text-primary-foreground' :
              c.id === selected ? (isCorrect ? 'bg-green-500 text-white' : 'bg-destructive text-white') :
              isCorrect ? 'bg-green-500 text-white' : 'bg-secondary/70';
            return (
              <button key={c.id} onClick={() => submit(c.id)}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${bg}`}>
                {c.label}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="text-center">
            <p className={`font-bold mb-3 ${selected === current!.continent ? 'text-green-500' : 'text-destructive'}`}>
              {selected === current!.continent ? 'Correct!' : `Originally from: ${CONTINENTS.find(c => c.id === current!.continent)?.label}`}
            </p>
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
