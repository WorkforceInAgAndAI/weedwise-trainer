import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg1 from '@/assets/images/field-background.jpg';
import fieldBg2 from '@/assets/images/field-background-2.jpg';
import cornBg from '@/assets/images/corn_field_1.jpg';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const FIELDS_PER_LEVEL = 3;
const FIELD_BGS = [fieldBg1, fieldBg2, cornBg];

const METHODS = [
 { id: 'cultivate', label: 'Cultivation' },
 { id: 'pull', label: 'Hand Pull' },
 { id: 'pre', label: 'Pre-emergent Herbicide' },
 { id: 'post', label: 'Post-emergent Herbicide' },
];

function getBestMethod(w: typeof weeds[0]): string {
 const m = w.management.toLowerCase();
 if (m.includes('pre')) return 'pre';
 if (m.includes('post')) return 'post';
 if (m.includes('pull') || m.includes('roguing')) return 'pull';
 return 'cultivate';
}

interface FieldData {
 weeds: { weed: typeof weeds[0]; x: number; y: number }[];
 threshold: number;
 bg: string;
}

function buildField(level: number, fieldNum: number): FieldData {
 const count = 8 + Math.floor(Math.random() * 8);
 const pool = shuffle(weeds);
 const offset = ((level - 1) * FIELDS_PER_LEVEL + fieldNum) * 10;
 const fieldWeeds = pool.slice(offset % pool.length, (offset % pool.length) + count)
  .concat(count > pool.length ? pool.slice(0, count - pool.length) : [])
  .slice(0, count);
 return {
  weeds: fieldWeeds.map(w => ({
   weed: w,
   x: 10 + Math.random() * 80,
   y: 10 + Math.random() * 80,
  })),
  threshold: Math.floor(Math.random() * 5) + 6,
  bg: FIELD_BGS[fieldNum % FIELD_BGS.length],
 };
}

export default function EconomicThreshold({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const [fieldNum, setFieldNum] = useState(0);
 const [score, setScore] = useState(0);

 const field = useMemo(() => buildField(level, fieldNum), [level, fieldNum]);

 const [phase, setPhase] = useState<'count' | 'identify' | 'graph' | 'manage' | 'result'>('count');
 const [counted, setCounted] = useState<Set<string>>(new Set());
 const [identifyIdx, setIdentifyIdx] = useState(0);
 const [idAnswers, setIdAnswers] = useState<Record<string, boolean>>({});
 const [decision, setDecision] = useState<'above' | 'below' | null>(null);
 const [methodPick, setMethodPick] = useState<string | null>(null);

 const totalWeeds = field.weeds.length;
 const isAbove = totalWeeds > field.threshold;

 const countedWeeds = field.weeds.filter(fw => counted.has(fw.weed.id));

 // ID options for current weed
 const idOptions = useMemo(() => {
  if (identifyIdx >= countedWeeds.length) return [];
  const target = countedWeeds[identifyIdx];
  const wrong = shuffle(weeds.filter(w => w.id !== target.weed.id)).slice(0, 3).map(w => w.commonName);
  return shuffle([target.weed.commonName, ...wrong]);
 }, [identifyIdx, countedWeeds]);

 const toggleCount = (id: string) => {
  if (phase !== 'count') return;
  setCounted(prev => {
   const n = new Set(prev);
   if (n.has(id)) n.delete(id); else n.add(id);
   return n;
  });
 };

 const submitCount = () => {
  if (counted.size === 0) return;
  setIdentifyIdx(0);
  setPhase('identify');
 };

 const identifyWeed = (name: string) => {
  const target = countedWeeds[identifyIdx];
  const correct = name === target.weed.commonName;
  setIdAnswers(prev => ({ ...prev, [target.weed.id]: correct }));
  if (correct) setScore(s => s + 1);
  setTimeout(() => {
   if (identifyIdx + 1 < countedWeeds.length) {
    setIdentifyIdx(i => i + 1);
   } else {
    setPhase('graph');
   }
  }, 800);
 };

 const submitDecision = (d: 'above' | 'below') => {
  setDecision(d);
  const correct = d === (isAbove ? 'above' : 'below');
  if (correct) setScore(s => s + 1);
  if (isAbove) {
   setPhase('manage');
  } else {
   setPhase('result');
  }
 };

 const submitManage = (mId: string) => {
  setMethodPick(mId);
  setPhase('result');
 };

 const resetField = () => {
  setCounted(new Set());
  setPhase('count');
  setDecision(null);
  setMethodPick(null);
  setIdentifyIdx(0);
  setIdAnswers({});
 };

 const nextField = () => {
  if (fieldNum + 1 < FIELDS_PER_LEVEL) {
   setFieldNum(f => f + 1);
   resetField();
  }
 };

 const isLevelDone = fieldNum === FIELDS_PER_LEVEL - 1 && phase === 'result';

 const nextLevel = () => { setLevel(l => l + 1); setFieldNum(0); setScore(0); resetField(); };
 const startOver = () => { setLevel(1); setFieldNum(0); setScore(0); resetField(); };

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-bold text-foreground text-lg flex-1">Economic Threshold</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">Field {fieldNum + 1}/{FIELDS_PER_LEVEL}</span>
    {phase === 'count' && <span className="text-sm text-primary font-bold">{counted.size} counted</span>}
   </div>

   {phase === 'count' && (
    <div className="flex-1 flex flex-col">
     <p className="text-sm text-muted-foreground p-3 text-center">Scout the field! Tap each weed you find to count them.</p>
     <div className="flex-1 relative mx-4 mb-2 rounded-xl overflow-hidden border-2 border-border">
      <img src={field.bg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/10" />
      {field.weeds.map(fw => (
       <button key={fw.weed.id} onClick={() => toggleCount(fw.weed.id)}
        className={`absolute transition-all ${counted.has(fw.weed.id) ? 'scale-110' : ''}`}
        style={{ left: `${fw.x}%`, top: `${fw.y}%`, transform: 'translate(-50%, -50%)' }}>
        <div className={`w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-lg ${
         counted.has(fw.weed.id) ? 'border-green-500 ring-2 ring-green-500/50' : 'border-white/80'
        }`}>
         <WeedImage weedId={fw.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
       </button>
      ))}
     </div>
     <div className="p-4">
      <button onClick={submitCount} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
       Done Counting ({counted.size} weeds found)
      </button>
     </div>
    </div>
   )}

   {phase === 'identify' && identifyIdx < countedWeeds.length && (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
     <p className="text-sm text-muted-foreground">Identify weed {identifyIdx + 1} of {countedWeeds.length}</p>
     <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary">
      <WeedImage weedId={countedWeeds[identifyIdx].weed.id} stage="vegetative" className="w-full h-full object-cover" />
     </div>
     {idAnswers[countedWeeds[identifyIdx].weed.id] !== undefined ? (
      <p className={`font-bold ${idAnswers[countedWeeds[identifyIdx].weed.id] ? 'text-green-500' : 'text-destructive'}`}>
       {idAnswers[countedWeeds[identifyIdx].weed.id] ? 'Correct!' : `It was ${countedWeeds[identifyIdx].weed.commonName}`}
      </p>
     ) : (
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
       {idOptions.map(name => (
        <button key={name} onClick={() => identifyWeed(name)}
         className="p-3 rounded-lg border-2 border-border bg-card text-sm font-bold text-foreground hover:border-primary transition-all">
         {name}
        </button>
       ))}
      </div>
     )}
    </div>
   )}

   {phase === 'graph' && (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
     <h2 className="text-xl font-bold text-foreground">Field Survey Results</h2>
     <p className="text-sm text-muted-foreground text-center">You counted {counted.size} weeds. The economic threshold for this field is {field.threshold} weeds.</p>
     <div className="w-full max-w-sm flex items-end gap-8 justify-center h-48">
      {[
       { label: 'Your Count', value: counted.size, color: 'bg-primary' },
       { label: 'Threshold', value: field.threshold, color: 'bg-amber-500' },
      ].map(bar => (
       <div key={bar.label} className="flex flex-col items-center gap-2">
        <span className="text-sm font-bold text-foreground">{bar.value}</span>
        <div className={`w-20 rounded-t-lg ${bar.color} transition-all`} style={{ height: `${(bar.value / Math.max(counted.size, field.threshold, 1)) * 160}px` }} />
        <span className="text-xs text-muted-foreground font-medium text-center">{bar.label}</span>
       </div>
      ))}
     </div>
     <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4">
      <p className="text-sm text-foreground font-bold mb-2">Is the weed population above or below the economic threshold?</p>
      <div className="flex gap-3">
       <button onClick={() => submitDecision('above')} className="flex-1 py-3 rounded-lg bg-destructive/20 text-destructive font-bold border-2 border-destructive/30 hover:bg-destructive/30">
        Above
       </button>
       <button onClick={() => submitDecision('below')} className="flex-1 py-3 rounded-lg bg-green-500/20 text-green-700 font-bold border-2 border-green-500/30 hover:bg-green-500/30">
        Below
       </button>
      </div>
     </div>
    </div>
   )}

   {phase === 'manage' && (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
     <h2 className="text-xl font-bold text-foreground">Above Threshold!</h2>
     <p className="text-sm text-muted-foreground text-center">The weed population exceeds the economic threshold. How should you manage these weeds?</p>
     <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
      {METHODS.map(m => (
       <button key={m.id} onClick={() => submitManage(m.id)}
        className="p-4 rounded-lg border-2 border-border bg-card text-sm font-bold text-foreground hover:border-primary transition-all">
        {m.label}
       </button>
      ))}
     </div>
    </div>
   )}

   {phase === 'result' && (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
     <div className={`text-lg font-bold ${decision === (isAbove ? 'above' : 'below') ? 'text-green-500' : 'text-destructive'}`}>
      {decision === (isAbove ? 'above' : 'below') ? 'Correct!' : 'Not quite!'}
     </div>
     <div className="bg-card border border-border rounded-xl p-4 max-w-md text-center">
      <p className="text-foreground mb-2">
       You counted <strong>{counted.size}</strong> weeds. The threshold was <strong>{field.threshold}</strong>.
      </p>
      <p className="text-foreground mb-2">
       The population is <strong>{isAbove ? 'above' : 'below'}</strong> the economic threshold.
      </p>
      <p className="text-sm text-muted-foreground">
       {isAbove
        ? 'When the weed population exceeds the economic threshold, the cost of damage is greater than the cost of control — action is recommended.'
        : 'When the weed population is below the threshold, the cost of control may exceed the damage — monitoring is sufficient.'}
      </p>
     </div>
     {!isLevelDone ? (
      <button onClick={nextField} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
       Next Field
      </button>
     ) : (
      <LevelComplete level={level} score={score} total={countedWeeds.length * FIELDS_PER_LEVEL + FIELDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
     )}
    </div>
   )}
  </div>
 );
}
