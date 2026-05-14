import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { ArrowUpDown, Snowflake, Sun, RefreshCw, Calendar } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CATEGORIES = [
 { id: 'winter-annual', label: 'Winter Annual', Icon: Snowflake, desc: 'Germinates fall, overwinters, seeds spring' },
 { id: 'summer-annual', label: 'Summer Annual', Icon: Sun, desc: 'Germinates spring, seeds summer/fall' },
 { id: 'perennial', label: 'Perennial', Icon: RefreshCw, desc: 'Lives 3+ years' },
 { id: 'biennial', label: 'Biennial', Icon: Calendar, desc: '2-year life cycle' },
];

const WINTER_ANNUALS = ['wild-oat'];
const SUMMER_ANNUALS = ['waterhemp', 'palmer-amaranth', 'giant-foxtail', 'green-foxtail', 'yellow-foxtail', 'lambsquarters', 'large-crabgrass', 'barnyardgrass', 'morningglory', 'kochia', 'velvetleaf', 'giant-ragweed'];

function getCategory(w: typeof weeds[0]): string {
 if (WINTER_ANNUALS.includes(w.id)) return 'winter-annual';
 if (w.lifeCycle.toLowerCase().includes('annual') || SUMMER_ANNUALS.includes(w.id)) return 'summer-annual';
 if (w.lifeCycle.toLowerCase().includes('biennial')) return 'biennial';
 return 'perennial';
}

const ROUNDS_PER_LEVEL = 2;

function buildRound(level: number, round: number) {
 const pool = shuffle(weeds);
 const offset = ((level - 1) * ROUNDS_PER_LEVEL + round) * 10;
 return pool.slice(offset % pool.length).concat(pool).slice(0, 10).map(w => ({ weed: w, correct: getCategory(w) }));
}

export default function LifeCycleSort({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(0);
 const [totalScore, setTotalScore] = useState(0);
 const { addBadge } = useGameProgress();

 const items = useMemo(() => buildRound(level, round), [level, round]);
 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);
 const [reviewing, setReviewing] = useState(false);
 const [reviewIdx, setReviewIdx] = useState(0);

 const place = (catId: string) => { if (!selected || checked) return; setPlacements(p => ({ ...p, [selected]: catId })); setSelected(null); };
 const remove = (wId: string) => { if (checked) return; setPlacements(p => { const n = { ...p }; delete n[wId]; return n; }); };
 const correctCount = items.filter(it => placements[it.weed.id] === it.correct).length;
 const wrongItems = items.filter(it => placements[it.weed.id] !== it.correct);

 const handleCheck = () => {
  setChecked(true);
  setTotalScore(s => s + items.filter(it => placements[it.weed.id] === it.correct).length);
  if (items.filter(it => placements[it.weed.id] !== it.correct).length > 0) {
   setReviewing(true);
   setReviewIdx(0);
  }
 };

 const resetRound = () => { setPlacements({}); setSelected(null); setChecked(false); setReviewing(false); setReviewIdx(0); };
 const nextRound = () => { setRound(r => r + 1); resetRound(); };
 const isLevelDone = round === ROUNDS_PER_LEVEL - 1 && checked && !reviewing;

 const nextLevel = () => { setLevel(l => l + 1); setRound(0); setTotalScore(0); resetRound(); };
 const startOver = () => { setLevel(1); setRound(0); setTotalScore(0); resetRound(); };

 // Review wrong answers one by one
 if (reviewing && wrongItems.length > 0) {
  const item = wrongItems[reviewIdx];
  const correctCat = CATEGORIES.find(c => c.id === item.correct);
  const yourCat = CATEGORIES.find(c => c.id === placements[item.weed.id]);
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="font-bold text-lg text-foreground mb-4">Review: {reviewIdx + 1}/{wrongItems.length}</h2>
    <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary mb-3">
     <WeedImage weedId={item.weed.id} stage="flower" className="w-full h-full object-cover" />
    </div>
    <p className="font-bold text-foreground text-lg mb-1">{item.weed.commonName}</p>
    <p className="text-xs text-muted-foreground italic mb-2">{item.weed.scientificName}</p>
    <div className="flex gap-2 mb-2">
     <span className="px-3 py-1 rounded bg-destructive/20 text-destructive text-sm font-bold">Your answer: {yourCat?.label}</span>
     <span className="px-3 py-1 rounded bg-green-500/20 text-green-700 text-sm font-bold">Correct: {correctCat?.label}</span>
    </div>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">Life cycle: {item.weed.lifeCycle}</p>
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
  addBadge({ gameId: 'hs-lifecycle', gameName: 'Life Cycle Sort', level: 'HS', score: totalScore, total: items.length * ROUNDS_PER_LEVEL });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Level {level} Complete</h2>
    <p className="text-lg text-foreground mb-6">{totalScore}/{items.length * ROUNDS_PER_LEVEL} correct</p>
    <LevelComplete level={level} score={totalScore} total={items.length * ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
   <div className="max-w-2xl mx-auto p-4">
    <div className="flex items-center gap-3 mb-4">
     <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
     <h1 className="font-display font-bold text-lg text-foreground">Life Cycle Sort</h1>
     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
     <span className="text-sm text-muted-foreground">Round {round + 1}/{ROUNDS_PER_LEVEL}</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
     {CATEGORIES.map(c => {
      const CatIcon = c.Icon;
      return (
       <button key={c.id} onClick={() => place(c.id)}
        className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-primary hover:bg-primary/10' : 'border-border'}`}>
        <CatIcon className="w-6 h-6 mx-auto mb-1 text-foreground" />
        <p className="text-xs font-bold text-foreground">{c.label}</p>
        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
        <div className="mt-1 flex flex-wrap gap-1 justify-center">
         {items.filter(it => placements[it.weed.id] === c.id).map(it => (
          <span key={it.weed.id} onClick={e => { e.stopPropagation(); remove(it.weed.id); }}
           className={`text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer ${checked ? (it.correct === c.id ? 'bg-green-500/20 text-green-700' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'}`}>
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
       className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${selected === it.weed.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
       <div className="w-8 h-8 rounded-lg overflow-hidden"><WeedImage weedId={it.weed.id} stage="flower" className="w-full h-full object-cover" /></div>
       <span className="text-xs font-medium text-foreground">{it.weed.commonName}</span>
      </button>
     ))}
    </div>
    {!checked && Object.keys(placements).length === items.length && (
     <button onClick={handleCheck} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Check Answers</button>
    )}
    {checked && !reviewing && (
     <div className="text-center">
      <p className="text-foreground font-bold mb-3">{correctCount}/{items.length} correct</p>
      {round < ROUNDS_PER_LEVEL - 1 && (
       <button onClick={nextRound} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Round</button>
      )}
     </div>
    )}
   </div>
  </div>
 );
}
