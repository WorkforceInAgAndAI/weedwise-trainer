import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Trees, Sun, Droplets, Wind } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const ZONES = [
 { id: 'temperate', label: 'Temperate Forest', Icon: Trees, color: 'bg-green-600', countries: 'USA, Canada, Europe', keywords: ['temperate', 'cool', 'corn', 'soybean', 'field', 'crop'] },
 { id: 'arid', label: 'Arid / Semi-Arid', Icon: Sun, color: 'bg-amber-600', countries: 'SW USA, Australia, Middle East', keywords: ['dry', 'arid', 'desert', 'sand', 'hot'] },
 { id: 'tropical', label: 'Tropical', Icon: Wind, color: 'bg-emerald-600', countries: 'Brazil, SE Asia, Central America', keywords: ['tropic', 'warm', 'humid', 'wet season', 'cotton'] },
 { id: 'wetland', label: 'Wetland / Riparian', Icon: Droplets, color: 'bg-blue-600', countries: 'River basins worldwide', keywords: ['water', 'flood', 'aquatic', 'moist', 'river', 'ditch', 'marsh'] },
];

function getZone(w: typeof weeds[0]) {
 const h = (w.habitat + ' ' + w.primaryHabitat).toLowerCase();
 for (const z of ZONES) { if (z.keywords.some(k => h.includes(k))) return z.id; }
 return 'temperate';
}

const ROUNDS_PER_LEVEL = 2;
const WEEDS_PER_ROUND = 4;

function buildRound(level: number, round: number) {
 const pool = shuffle(weeds);
 const offset = ((level - 1) * ROUNDS_PER_LEVEL + round) * WEEDS_PER_ROUND;
 return pool.slice(offset % pool.length).concat(pool).slice(0, WEEDS_PER_ROUND).map(w => ({ weed: w, correct: getZone(w) }));
}

export default function HabitatMapping({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(0);
 const [totalScore, setTotalScore] = useState(0);
 const [reviewing, setReviewing] = useState(false);
 const [reviewIdx, setReviewIdx] = useState(0);

 const items = useMemo(() => buildRound(level, round), [level, round]);
 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);

 const place = (zoneId: string) => {
  if (!selected || checked) return;
  setPlacements(p => ({ ...p, [selected]: zoneId }));
  setSelected(null);
 };
 const remove = (wId: string) => { if (checked) return; setPlacements(p => { const n = { ...p }; delete n[wId]; return n; }); };
 const check = () => {
  setChecked(true);
  const cc = items.filter(it => placements[it.weed.id] === it.correct).length;
  setTotalScore(s => s + cc);
  const wrongItems = items.filter(it => placements[it.weed.id] !== it.correct);
  if (wrongItems.length > 0) {
   setReviewing(true);
   setReviewIdx(0);
  }
 };
 const correctCount = items.filter(it => placements[it.weed.id] === it.correct).length;
 const wrongItems = items.filter(it => placements[it.weed.id] !== it.correct);

 const resetRound = () => { setPlacements({}); setSelected(null); setChecked(false); setReviewing(false); setReviewIdx(0); };
 const nextRound = () => { setRound(r => r + 1); resetRound(); };
 const isLevelDone = round === ROUNDS_PER_LEVEL - 1 && checked && !reviewing;

 const nextLevel = () => { setLevel(l => l + 1); setRound(0); setTotalScore(0); resetRound(); };
 const startOver = () => { setLevel(1); setRound(0); setTotalScore(0); resetRound(); };

 // Review wrong answers one by one
 if (reviewing && wrongItems.length > 0) {
  const item = wrongItems[reviewIdx];
  const correctZone = ZONES.find(z => z.id === item.correct);
  const yourZone = ZONES.find(z => z.id === placements[item.weed.id]);
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="font-bold text-lg text-foreground mb-4">Review: {reviewIdx + 1}/{wrongItems.length}</h2>
    <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary mb-3">
     <WeedImage weedId={item.weed.id} stage="flower" className="w-full h-full object-cover" />
    </div>
    <p className="font-bold text-foreground text-lg mb-1">{item.weed.commonName}</p>
    <p className="text-xs text-muted-foreground italic mb-3">{item.weed.scientificName}</p>
    <div className="flex gap-2 mb-3">
     <span className="px-3 py-1 rounded bg-destructive/20 text-destructive text-sm font-bold">Your answer: {yourZone?.label}</span>
     <span className="px-3 py-1 rounded bg-green-500/20 text-green-700 text-sm font-bold">Correct: {correctZone?.label}</span>
    </div>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">Habitat: {item.weed.habitat}</p>
    <button onClick={() => {
     if (reviewIdx + 1 < wrongItems.length) setReviewIdx(i => i + 1);
     else setReviewing(false);
    }} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
     {reviewIdx + 1 < wrongItems.length ? 'Next' : 'Continue'}
    </button>
   </div>
  );
 }

 if (isLevelDone) {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Level {level} Complete</h2>
    <p className="text-lg text-foreground mb-6">{totalScore}/{WEEDS_PER_ROUND * ROUNDS_PER_LEVEL} correct</p>
    <LevelComplete level={level} score={totalScore} total={WEEDS_PER_ROUND * ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
   <div className="max-w-2xl mx-auto p-4">
    <div className="flex items-center gap-3 mb-4">
     <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
     <h1 className="font-bold text-lg text-foreground">Habitat Mapping</h1>
     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
     <span className="text-sm text-muted-foreground">Round {round + 1}/{ROUNDS_PER_LEVEL}</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
     {ZONES.map(z => {
      const ZoneIcon = z.Icon;
      return (
       <button key={z.id} onClick={() => place(z.id)}
        className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-primary hover:bg-primary/10 cursor-pointer' : 'border-border cursor-default'}`}>
        <ZoneIcon className="w-6 h-6 mx-auto text-foreground mb-1" />
        <p className="text-xs font-bold text-foreground">{z.label}</p>
        <p className="text-[10px] text-muted-foreground">{z.countries}</p>
        <div className="mt-1 flex flex-wrap gap-1 justify-center">
         {items.filter(it => placements[it.weed.id] === z.id).map(it => (
          <span key={it.weed.id} onClick={e => { e.stopPropagation(); remove(it.weed.id); }}
           className={`text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer ${checked ? (it.correct === z.id ? 'bg-green-500/20 text-green-700' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'}`}>
           {it.weed.commonName} x
          </span>
         ))}
        </div>
       </button>
      );
     })}
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
     {items.filter(it => !placements[it.weed.id]).map(it => (
      <button key={it.weed.id} onClick={() => setSelected(selected === it.weed.id ? null : it.weed.id)}
       className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${selected === it.weed.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary'}`}>
       <div className="w-8 h-8 rounded-lg overflow-hidden"><WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" /></div>
       <span className="text-xs font-medium text-foreground">{it.weed.commonName}</span>
      </button>
     ))}
    </div>
    {!checked && Object.keys(placements).length === items.length && (
     <button onClick={check} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Check Answers</button>
    )}
    {checked && !reviewing && (
     <div className="text-center">
      <p className="text-foreground font-bold mb-3">{correctCount}/{items.length} correct</p>
      {round < ROUNDS_PER_LEVEL - 1 ? (
       <button onClick={nextRound} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Round</button>
      ) : null}
     </div>
    )}
   </div>
  </div>
 );
}
