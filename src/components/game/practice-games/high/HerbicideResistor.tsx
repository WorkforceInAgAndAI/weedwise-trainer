import { useState, useMemo } from 'react';
import { Dna } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import soyBg from '@/assets/images/soybean_field_1.jpg';
import cornBg from '@/assets/images/soybean_field_2.JPG';
import wheatBg from '@/assets/images/soybean_field_3.JPG';
import { HERBICIDE_MOA, type HerbicideMOA } from '@/data/herbicides';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

/** Herbicide choices for 9-12: full MOA-based options with brand examples */
const HERBICIDES: { id: string; moa: HerbicideMOA; risk: string }[] = [
  { id: 'epsps', moa: HERBICIDE_MOA.find(h => h.id === 'epsps')!, risk: 'very-high' },
  { id: 'als', moa: HERBICIDE_MOA.find(h => h.id === 'als-post')!, risk: 'very-high' },
  { id: 'ppo', moa: HERBICIDE_MOA.find(h => h.id === 'ppo-post')!, risk: 'high' },
  { id: 'auxin', moa: HERBICIDE_MOA.find(h => h.id === 'auxin')!, risk: 'moderate' },
  { id: 'multi', moa: HERBICIDE_MOA.find(h => h.id === 'gs')!, risk: 'low' },
];

function herbLabel(h: typeof HERBICIDES[0], isMulti: boolean): string {
  if (isMulti) return `Tank Mix (Multiple MOA)`;
  return `${h.moa.moa} (Group ${h.moa.group}) — e.g. ${h.moa.brands[0]}`;
}

const CROP_LEVELS = [
  { id: 'rr-soy', name: 'Roundup Ready Soybean', compatible: ['epsps', 'ppo', 'multi'], rotationValue: 0.4, bg: soyBg },
  { id: 'conv-corn', name: 'Conventional Corn', compatible: ['als', 'ppo', 'auxin', 'multi'], rotationValue: 0.7, bg: cornBg },
  { id: 'wheat', name: 'Winter Wheat', compatible: ['als', 'auxin', 'ppo', 'multi'], rotationValue: 0.8, bg: wheatBg },
];

const SEASONS_DATA = [
  { year: 1, pressure: 'Low weed pressure. Seedlings appearing in the field.' },
  { year: 2, pressure: 'Moderate pressure. Some surviving weeds from Year 1.' },
  { year: 3, pressure: 'High pressure! Resistant biotypes detected.' },
];

function getYearExplanation(crop: string, herbId: string, yearIdx: number, allChoices: { crop: string; herb: string }[]): string {
  const cropDef = CROP_LEVELS.find(c => c.id === crop);
  const herbDef = HERBICIDES.find(h => h.id === herbId);
  const compatible = cropDef?.compatible.includes(herbId);
  const label = herbDef ? herbLabel(herbDef, herbId === 'multi') : herbId;
  const parts: string[] = [];
  if (!compatible) parts.push(`${label} is not compatible with ${cropDef?.name}. This would damage your crop.`);
  else parts.push(`${label} is compatible with ${cropDef?.name}.`);
  if (herbDef && (herbDef.risk === 'very-high' || herbDef.risk === 'high')) {
    const prevSameHerb = allChoices.slice(0, yearIdx).filter(c => c.herb === herbId).length;
    if (prevSameHerb > 0) parts.push(`You used this ${herbDef.moa.resistanceLevel}-risk MOA ${prevSameHerb + 1} times now. Repeated use greatly increases resistance. ${herbDef.moa.resistanceNotes}`);
    else parts.push(`This MOA has ${herbDef.moa.resistanceLevel} resistance risk. ${herbDef.moa.resistanceNotes}`);
  } else if (herbId === 'multi') {
    parts.push(`Great choice! Tank-mixing multiple MOAs reduces selection pressure and is the most effective resistance management strategy.`);
  } else {
    parts.push(`${herbDef?.moa.moa} has ${herbDef?.moa.resistanceLevel} resistance risk.`);
  }
  return parts.join(' ');
}

export default function HerbicideResistor({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();

  const currentCrop = CROP_LEVELS[(level - 1) % CROP_LEVELS.length];

  const fieldWeeds = useMemo(() => {
    const pool = shuffle(weeds);
    const offset = ((level - 1) * 6) % pool.length;
    return pool.slice(offset).concat(pool).slice(0, 6);
  }, [level]);

  const [year, setYear] = useState(0);
  const [choices, setChoices] = useState<{ crop: string; herb: string }[]>([]);
  const [herb, setHerb] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!herb) return;
    const newChoices = [...choices, { crop: currentCrop.id, herb }];
    setChoices(newChoices);
    setShowReview(true);
  };

  const continueAfterReview = () => {
    setShowReview(false);
    setHerb(null);
    if (year + 1 >= SEASONS_DATA.length) setDone(true);
    else setYear(y => y + 1);
  };

  const score = useMemo(() => {
    let pts = 0;
    const usedHerbs = choices.map(c => c.herb);
    const uniqueHerbs = new Set(usedHerbs).size;
    pts += uniqueHerbs * 2;
    const highRiskRepeats = usedHerbs.filter(h => h === 'epsps' || h === 'als').length;
    pts -= highRiskRepeats > 1 ? (highRiskRepeats - 1) * 3 : 0;
    pts += usedHerbs.filter(h => h === 'multi').length * 2;
    choices.forEach(c => {
      const cropDef = CROP_LEVELS.find(cr => cr.id === c.crop);
      if (cropDef?.compatible.includes(c.herb)) pts += 1;
    });
    return Math.max(0, pts);
  }, [choices]);

  const restart = () => { setYear(0); setChoices([]); setHerb(null); setDone(false); setShowReview(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'herbicide-resistor', gameName: 'Herbicide Resistor', level: 'HS', score, total: 15 });
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4 flex flex-col items-center justify-center min-h-full text-center">
          <Dna className="w-10 h-10 text-primary mb-3" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">3-Year Plan Complete!</h2>
          <p className="text-foreground mb-1">Crop: {currentCrop.name}</p>
          <p className="text-foreground mb-2">Resistance Prevention Score: {score}</p>
          <div className="text-left bg-secondary/50 rounded-xl p-4 mb-4 max-w-sm w-full space-y-3">
            {choices.map((c, i) => {
              const hDef = HERBICIDES.find(h => h.id === c.herb);
              return (
                <div key={i} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-bold text-foreground">
                    Year {i + 1}: {hDef ? herbLabel(hDef, c.herb === 'multi') : c.herb}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{getYearExplanation(c.crop, c.herb, i, choices)}</p>
                </div>
              );
            })}
          </div>
          <LevelComplete level={level} score={score} total={10} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
        </div>
      </div>
    );
  }

  if (showReview) {
    const lastChoice = choices[choices.length - 1];
    const explanation = getYearExplanation(lastChoice.crop, lastChoice.herb, choices.length - 1, choices);
    const hDef = HERBICIDES.find(h => h.id === lastChoice.herb);
    const compatible = currentCrop.compatible.includes(lastChoice.herb);
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-lg text-foreground mb-2">Year {choices.length} Review</h2>
          <p className="text-sm text-foreground mb-1">{currentCrop.name} + {hDef ? herbLabel(hDef, lastChoice.herb === 'multi') : lastChoice.herb}</p>
          <div className="flex gap-2 my-3 justify-center">
            {fieldWeeds.slice(0, 3).map((w, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${compatible ? 'border-green-500 opacity-40' : 'border-destructive'}`}>
                  <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5">{compatible ? 'Suppressed' : 'Thriving'}</span>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-lg mb-3 ${compatible ? 'bg-green-500/10 border border-green-500/30' : 'bg-destructive/10 border border-destructive/30'}`}>
            <p className="text-sm text-foreground">{explanation}</p>
          </div>
          <button onClick={continueAfterReview} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            {year + 1 >= SEASONS_DATA.length ? 'See Final Results' : `Continue to Year ${year + 2}`}
          </button>
        </div>
      </div>
    );
  }

  const s = SEASONS_DATA[year];
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-lg text-foreground">Herbicide Resistor</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Year {year + 1}/3</span>
      </div>
      <div className="relative h-48 overflow-hidden">
        <img src={currentCrop.bg} alt={currentCrop.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-2 left-2 bg-card/90 rounded-lg px-3 py-1">
          <p className="text-xs font-bold text-foreground">{currentCrop.name}</p>
        </div>
        {fieldWeeds.slice(0, 4).map((w, i) => (
          <div key={i} className="absolute" style={{ left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 25}%` }}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/70 shadow-lg">
              <WeedImage weedId={w.id} stage="seedling" className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-foreground">{s.pressure}</p>
        </div>
        <p className="text-sm font-bold text-foreground mb-2">Choose your herbicide for {currentCrop.name}:</p>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {HERBICIDES.map(h => (
            <button key={h.id} onClick={() => setHerb(h.id)}
              className={`p-3 rounded-xl border-2 text-left text-xs ${herb === h.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
              <p className="font-bold text-foreground">{herbLabel(h, h.id === 'multi')}</p>
              <p className={`text-[10px] mt-0.5 ${h.risk === 'very-high' ? 'text-destructive' : h.risk === 'high' ? 'text-destructive/80' : h.risk === 'moderate' ? 'text-amber-500' : 'text-green-600'}`}>
                Resistance risk: {h.moa.resistanceLevel}
              </p>
            </button>
          ))}
        </div>
        {herb && <button onClick={submit} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Spray!</button>}
      </div>
    </div>
  );
}
