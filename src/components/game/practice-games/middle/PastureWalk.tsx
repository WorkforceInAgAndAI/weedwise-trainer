import { useEffect, useMemo, useState } from 'react';
import { Zap, Clock, Droplets, Check, X } from 'lucide-react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import aerialPasture from '@/assets/images/aerial_pasture_field.jpg';

/**
 * Pasture Walk — the student walks across a pasture with a limited energy
 * pool and herbicide charges. Each weed shows a life stage. They decide
 * whether to spray now (kills only at the right stage), skip and mark to
 * spray later, or move on. Moving between plants costs energy proportional
 * to distance. Score rewards good spray decisions and penalises wasted
 * herbicide and overrun energy.
 */

type Stage = 'seedling' | 'vegetative' | 'reproductive';
const STAGE_LABEL: Record<Stage, string> = { seedling: 'Seedling', vegetative: 'Vegetative', reproductive: 'Reproductive / seed set' };

// Life-stage decision rules — annuals best sprayed at seedling / early
// vegetative; perennials best at reproductive when translocation is highest.
function bestChoice(lifeCycle: string, stage: Stage): 'spray' | 'spray-later' | 'skip' {
 const isPerennial = /perennial/i.test(lifeCycle);
 if (isPerennial) {
  if (stage === 'reproductive') return 'spray';
  if (stage === 'vegetative') return 'spray-later';
  return 'skip';
 }
 // Annual / biennial
 if (stage === 'seedling') return 'spray';
 if (stage === 'vegetative') return 'spray';
 return 'spray-later'; // reproductive annual — spraying now wastes herbicide, seeds already forming
}

const STAGE_POOL: Stage[] = ['seedling', 'vegetative', 'reproductive'];
const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Plant { id: number; x: number; y: number; weedId: string; lifeCycle: string; stage: Stage; }

const ENERGY_MAX = 100;
const HERBICIDE_MAX = 6;
const PLANTS_PER_ROUND = 12;
const ROUNDS = 3;

function buildPlants(seed: number): Plant[] {
 const pool = shuffle(weeds).slice(0, PLANTS_PER_ROUND);
 return pool.map((w, i) => ({
  id: i,
  x: 6 + ((i * 83 + seed * 7) % 88) + Math.random() * 4,
  y: 6 + ((i * 137 + seed * 11) % 82) + Math.random() * 4,
  weedId: w.id,
  lifeCycle: w.lifeCycle,
  stage: STAGE_POOL[(i + seed) % STAGE_POOL.length],
 }));
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function PastureWalk({ onBack, gameId, gameName, gradeLabel }: Props) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(0);
 const [totalScore, setTotalScore] = useState(0);

 const seed = level * 13 + round * 41;
 const plants = useMemo(() => buildPlants(seed), [seed]);

 // Scout position (%)
 const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 95 });
 const [energy, setEnergy] = useState(ENERGY_MAX);
 const [herbicide, setHerbicide] = useState(HERBICIDE_MAX);
 const [decisions, setDecisions] = useState<Record<number, { choice: 'spray' | 'spray-later' | 'skip'; correct: boolean }>>({});
 const [selected, setSelected] = useState<Plant | null>(null);
 const [roundDone, setRoundDone] = useState(false);

 // Reset on round change
 useEffect(() => {
  setPos({ x: 50, y: 95 });
  setEnergy(ENERGY_MAX);
  setHerbicide(HERBICIDE_MAX);
  setDecisions({});
  setSelected(null);
  setRoundDone(false);
 }, [seed]);

 const walkTo = (pl: Plant) => {
  if (roundDone) return;
  if (decisions[pl.id]) return;
  const d = Math.hypot(pl.x - pos.x, pl.y - pos.y);
  const cost = Math.max(2, Math.round(d * 0.25));
  if (energy - cost < 0) return;
  setEnergy(e => e - cost);
  setPos({ x: pl.x, y: pl.y });
  setSelected(pl);
 };

 const decide = (choice: 'spray' | 'spray-later' | 'skip') => {
  if (!selected) return;
  if (choice === 'spray' && herbicide <= 0) return;
  const best = bestChoice(selected.lifeCycle, selected.stage);
  const correct = choice === best;
  setDecisions(prev => ({ ...prev, [selected.id]: { choice, correct } }));
  if (choice === 'spray') setHerbicide(h => h - 1);
  setSelected(null);
 };

 const decisionCount = Object.keys(decisions).length;
 const remaining = plants.filter(p => !decisions[p.id]).length;
 const cannotContinue = energy < 3 || remaining === 0;

 // Score: +1 correct, -0.5 wrong spray (wasted herbicide), 0 wrong skip
 const roundScore = useMemo(() => {
  let s = 0;
  Object.entries(decisions).forEach(([, d]) => {
   if (d.correct) s += 1;
   else if (d.choice === 'spray') s -= 0.5;
  });
  return Math.max(0, Math.round(s * 10));
 }, [decisions]);

 const endRound = () => {
  setRoundDone(true);
 };

 const nextRound = () => {
  setTotalScore(t => t + roundScore);
  setRound(r => r + 1);
 };

 if (round >= ROUNDS) {
  const maxScore = ROUNDS * PLANTS_PER_ROUND * 10;
  return <LevelComplete
   level={level} score={totalScore} total={maxScore}
   onNextLevel={() => { setLevel(l => l + 1); setRound(0); setTotalScore(0); }}
   onStartOver={() => { setLevel(1); setRound(0); setTotalScore(0); }}
   onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel}
  />;
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-display font-bold text-foreground text-lg flex-1">Pasture Walk</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">Round {round + 1}/{ROUNDS}</span>
   </div>

   {/* Resource bars */}
   <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-3 flex-wrap">
    <div className="flex-1 min-w-[140px]">
     <div className="flex justify-between text-xs mb-1">
      <span className="flex items-center gap-1 text-foreground"><Zap className="w-3 h-3" /> Energy</span>
      <span className="font-bold">{energy}/{ENERGY_MAX}</span>
     </div>
     <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div className={`h-full ${energy < 25 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${(energy / ENERGY_MAX) * 100}%` }} />
     </div>
    </div>
    <div className="flex-1 min-w-[140px]">
     <div className="flex justify-between text-xs mb-1">
      <span className="flex items-center gap-1 text-foreground"><Droplets className="w-3 h-3" /> Herbicide charges</span>
      <span className="font-bold">{herbicide}/{HERBICIDE_MAX}</span>
     </div>
     <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div className="h-full bg-amber-500" style={{ width: `${(herbicide / HERBICIDE_MAX) * 100}%` }} />
     </div>
    </div>
    <div className="text-xs text-muted-foreground flex items-center gap-1">
     <Clock className="w-3 h-3" /> {decisionCount}/{plants.length} decided
    </div>
   </div>

   <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 p-3 overflow-hidden">
    {/* Pasture view */}
    <div className="relative rounded-xl border-2 border-border overflow-hidden bg-muted">
     <img src={aerialPasture} alt="Pasture" className="absolute inset-0 w-full h-full object-cover" />
     <div className="absolute inset-0 bg-black/10" />

     {/* Scout position (person) */}
     <div className="absolute w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10 transition-all duration-300"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
      aria-label="Your position"
     />

     {/* Plants */}
     {plants.map(pl => {
      const d = decisions[pl.id];
      const isSelected = selected?.id === pl.id;
      const cost = Math.max(2, Math.round(Math.hypot(pl.x - pos.x, pl.y - pos.y) * 0.25));
      const affordable = energy >= cost && !d;
      return (
       <button key={pl.id}
        onClick={() => walkTo(pl)}
        disabled={!affordable && !d}
        className={`absolute w-7 h-7 rounded-full border-2 shadow-md overflow-hidden transition-all ${
         d ? (d.correct ? 'border-emerald-500 opacity-60' : 'border-destructive opacity-60') :
         isSelected ? 'border-primary ring-2 ring-primary scale-110' :
         affordable ? 'border-white/80 hover:scale-110' : 'border-white/40 opacity-50'
        }`}
        style={{ left: `${pl.x}%`, top: `${pl.y}%`, transform: 'translate(-50%,-50%)' }}
        title={d ? '' : `Walk here (-${cost} energy)`}
       >
        <WeedImage weedId={pl.weedId} stage={pl.stage === 'reproductive' ? 'flower' : pl.stage} className="w-full h-full object-cover pointer-events-none" />
        {d && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          {d.correct ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
         </div>
        )}
       </button>
      );
     })}
    </div>

    {/* Side panel */}
    <div className="overflow-y-auto space-y-3">
     {selected ? (
      <div className="rounded-xl border-2 border-primary bg-card p-3 space-y-2">
       <div className="flex gap-2 items-center">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
         <WeedImage weedId={selected.weedId} stage={selected.stage === 'reproductive' ? 'flower' : selected.stage} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-[10px] uppercase text-muted-foreground">Life cycle: {selected.lifeCycle}</p>
         <p className="font-bold text-foreground truncate">{weeds.find(w => w.id === selected.weedId)?.commonName}</p>
         <p className="text-xs text-muted-foreground">Stage: <span className="font-semibold text-foreground">{STAGE_LABEL[selected.stage]}</span></p>
        </div>
       </div>
       <p className="text-xs text-muted-foreground">Decide — herbicide is limited, and timing matters more than volume.</p>
       <div className="grid grid-cols-1 gap-2">
        <button
         onClick={() => decide('spray')}
         disabled={herbicide <= 0}
         className="py-2 rounded-lg bg-amber-500 text-white font-bold disabled:opacity-40 text-sm"
        >Spray now (uses 1 charge)</button>
        <button
         onClick={() => decide('spray-later')}
         className="py-2 rounded-lg bg-secondary text-foreground font-bold text-sm"
        >Mark to spray later</button>
        <button
         onClick={() => decide('skip')}
         className="py-2 rounded-lg bg-secondary text-foreground font-bold text-sm"
        >Skip — not worth the trip</button>
       </div>
      </div>
     ) : (
      <div className="rounded-xl border-2 border-border bg-card p-3">
       <p className="text-sm text-foreground font-semibold mb-1">Tap a weed to walk to it.</p>
       <p className="text-xs text-muted-foreground">Farther weeds cost more energy. Match your spray decision to the plant's life cycle AND stage:</p>
       <ul className="text-[11px] text-muted-foreground mt-2 space-y-1 list-disc pl-4">
        <li><b>Annuals</b>: spray at seedling/vegetative. Skip once seed is set.</li>
        <li><b>Perennials</b>: spray at reproductive when they translocate herbicide to roots.</li>
       </ul>
      </div>
     )}

     <div className="rounded-xl border-2 border-border bg-card p-3">
      <div className="flex justify-between items-baseline">
       <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Round score</p>
       <p className="font-display font-bold text-2xl text-primary">{roundScore}</p>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
       +10 per correct call · −5 per wasted spray · skipping a bad target is free.
      </p>
     </div>

     {roundDone ? (
      <button onClick={nextRound} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Pasture →</button>
     ) : (
      <button onClick={endRound}
       disabled={!cannotContinue && decisionCount === 0}
       className="w-full py-3 rounded-lg bg-secondary text-foreground font-bold disabled:opacity-40"
      >{cannotContinue ? 'End Round' : 'End Round Early'}</button>
     )}
    </div>
   </div>
  </div>
 );
}