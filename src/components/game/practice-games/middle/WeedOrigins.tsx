import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import worldMap from '@/assets/images/world-map.jpg';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CONTINENTS = [
  { id: 'north-america', label: 'N. America', x: 20, y: 38 },
  { id: 'south-america', label: 'S. America', x: 28, y: 68 },
  { id: 'europe', label: 'Europe', x: 48, y: 28 },
  { id: 'africa', label: 'Africa', x: 50, y: 55 },
  { id: 'asia', label: 'Asia', x: 70, y: 30 },
  { id: 'australia', label: 'Australia', x: 82, y: 72 },
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

const QUESTIONS_PER_LEVEL = 10;

function getRoundsForLevel(level: number) {
  // Build a pool with continent info
  const all = weeds.map(w => ({ weed: w, continent: getOriginContinent(w) }));
  const byCont: Record<string, typeof all> = {};
  all.forEach(e => {
    if (!byCont[e.continent]) byCont[e.continent] = [];
    byCont[e.continent].push(e);
  });

  // Pick from each continent to ensure mix
  const picks: typeof all = [];
  const contKeys = Object.keys(byCont);
  const offset = (level - 1) * QUESTIONS_PER_LEVEL;

  for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
    const contKey = contKeys[i % contKeys.length];
    const pool = byCont[contKey];
    const idx = (offset + Math.floor(i / contKeys.length)) % pool.length;
    const rotated = [...pool.slice(idx), ...pool.slice(0, idx)];
    const pick = rotated.find(p => !picks.some(pp => pp.weed.id === p.weed.id));
    if (pick) picks.push(pick);
  }

  // Fill remaining if needed
  while (picks.length < QUESTIONS_PER_LEVEL) {
    const remaining = all.filter(a => !picks.some(p => p.weed.id === a.weed.id));
    if (remaining.length === 0) break;
    picks.push(shuffle(remaining)[0]);
  }

  return shuffle(picks);
}

export default function WeedOrigins({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => getRoundsForLevel(level), [level]);
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
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Origins</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
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
        <div className="relative w-full aspect-[2/1] rounded-xl border-2 border-border mb-4 overflow-hidden">
          <img src={worldMap} alt="World map" className="absolute inset-0 w-full h-full object-cover" />
          {CONTINENTS.map(c => {
            const isCorrect = c.id === current!.continent;
            const bg = !answered ? 'bg-card/90 hover:bg-primary hover:text-primary-foreground border border-border' :
              c.id === selected ? (isCorrect ? 'bg-green-500 text-white' : 'bg-destructive text-white') :
              isCorrect ? 'bg-green-500 text-white' : 'bg-card/70 border border-border';
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
