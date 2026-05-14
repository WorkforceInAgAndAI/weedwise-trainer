import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import worldMap from '@/assets/images/world-map.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

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
  const [collected, setCollected] = useState<Array<{ weedId: string; commonName: string; continent: string }>>([]);

  const done = round >= rounds.length;
  const current = !done ? rounds[round] : null;

  const submit = (cId: string) => {
    if (answered) return;
    setSelected(cId);
    setAnswered(true);
    if (cId === current!.continent) setScore(s => s + 1);
    setCollected(prev => [...prev, { weedId: current!.weed.id, commonName: current!.weed.commonName, continent: current!.continent }]);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setAnswered(false); };
  const restart = () => { setRound(0); setScore(0); setSelected(null); setAnswered(false); setCollected([]); };
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 max-w-6xl mx-auto">
          {/* LEFT: larger world map */}
          <div>
            <p className="text-sm text-muted-foreground text-center mb-3">Where did this weed originate? Click a continent.</p>
            <div className="relative w-full max-w-3xl mx-auto aspect-[2/1] rounded-xl border-2 border-border overflow-hidden">
              <img src={worldMap} alt="World map" className="absolute inset-0 w-full h-full object-cover" />
              {CONTINENTS.map(c => {
                const isCorrect = c.id === current!.continent;
                const bg = !answered ? 'bg-card/90 hover:bg-primary hover:text-primary-foreground border border-border' :
                  c.id === selected ? (isCorrect ? 'bg-green-500 text-white' : 'bg-destructive text-white') :
                  isCorrect ? 'bg-green-500 text-white' : 'bg-card/70 border border-border';
                return (
                  <button key={c.id} onClick={() => submit(c.id)}
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-md ${bg}`}>
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Collected — sorted by continent */}
            {collected.length > 0 && (
              <div className="mt-4 max-w-3xl mx-auto">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Identified weeds by continent</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTINENTS.map(c => {
                    const list = collected.filter(x => x.continent === c.id);
                    if (list.length === 0) return null;
                    return (
                      <div key={c.id} className="bg-card border border-border rounded-lg p-2">
                        <p className="text-[11px] font-bold text-foreground mb-1">{c.label} <span className="text-muted-foreground font-normal">({list.length})</span></p>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map(w => (
                            <div key={w.weedId} className="flex items-center gap-1 bg-secondary rounded pr-1.5">
                              <div className="w-7 h-7 rounded overflow-hidden bg-background flex-shrink-0">
                                <WeedImage weedId={w.weedId} stage="flower" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] text-foreground">{w.commonName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: weed info + submit area */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card rounded-xl border border-border p-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                <WeedImage weedId={current!.weed.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{current!.weed.commonName}</p>
                <p className="text-[11px] text-muted-foreground italic">{current!.weed.scientificName}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Origin: {current!.weed.origin}</p>
                <p className="text-[11px] text-muted-foreground">Family: {current!.weed.family}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">{current!.weed.habitat}</p>

            {answered && (
              <div className={`rounded-xl border-2 p-3 ${selected === current!.continent ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
                <p className={`font-bold mb-2 ${selected === current!.continent ? 'text-green-500' : 'text-destructive'}`}>
                  {selected === current!.continent ? 'Correct!' : `Originally from: ${CONTINENTS.find(c => c.id === current!.continent)?.label}`}
                </p>
                <button onClick={next} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Origin shapes management — introduced species often lack natural predators here.`} />
</div>
  );
}
