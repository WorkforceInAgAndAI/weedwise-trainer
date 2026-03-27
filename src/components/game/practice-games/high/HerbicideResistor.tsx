import { useState, useMemo } from 'react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const HERBICIDES = [
  { id: 'gly', name: 'Glyphosate (Group 9)', risk: 'high' },
  { id: 'als', name: 'ALS Inhibitor (Group 2)', risk: 'high' },
  { id: 'ppo', name: 'PPO Inhibitor (Group 14)', risk: 'low' },
  { id: 'multi', name: 'Multi-MOA Mix', risk: 'very-low' },
];
const CROPS_LIST = [
  { id: 'rr-soy', name: 'Roundup Ready Soybean', compatible: ['gly', 'ppo', 'multi'], rotationValue: 0.4 },
  { id: 'conv-corn', name: 'Conventional Corn', compatible: ['als', 'ppo', 'multi'], rotationValue: 0.7 },
  { id: 'wheat', name: 'Winter Wheat', compatible: ['als', 'ppo', 'multi'], rotationValue: 0.8 },
];

const SEASONS_DATA = [
  { year: 1, pressure: 'Low weed pressure. Waterhemp seedlings appearing.' },
  { year: 2, pressure: 'Moderate pressure. Some surviving weeds from Year 1.' },
  { year: 3, pressure: 'High pressure! Resistant biotypes detected.' },
];

export default function HerbicideResistor({ onBack }: { onBack: () => void }) {
  const [year, setYear] = useState(0);
  const [choices, setChoices] = useState<{ crop: string; herb: string }[]>([]);
  const [crop, setCrop] = useState<string | null>(null);
  const [herb, setHerb] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!crop || !herb) return;
    const newChoices = [...choices, { crop, herb }];
    setChoices(newChoices);
    setCrop(null); setHerb(null);
    if (year + 1 >= SEASONS_DATA.length) setDone(true);
    else setYear(y => y + 1);
  };

  const score = useMemo(() => {
    let pts = 0;
    const usedHerbs = choices.map(c => c.herb);
    const usedCrops = choices.map(c => c.crop);
    // Reward diversity
    const uniqueHerbs = new Set(usedHerbs).size;
    const uniqueCrops = new Set(usedCrops).size;
    pts += uniqueHerbs * 2;
    pts += uniqueCrops * 2;
    // Penalize repeated high-risk
    const highRiskRepeats = usedHerbs.filter(h => h === 'gly' || h === 'als').length;
    pts -= highRiskRepeats > 1 ? (highRiskRepeats - 1) * 3 : 0;
    // Reward multi-MOA
    pts += usedHerbs.filter(h => h === 'multi').length * 2;
    // Reward compatible combos
    choices.forEach(c => {
      const cropDef = CROPS_LIST.find(cr => cr.id === c.crop);
      if (cropDef?.compatible.includes(c.herb)) pts += 1;
    });
    return Math.max(0, pts);
  }, [choices]);

  const restart = () => { setYear(0); setChoices([]); setCrop(null); setHerb(null); setDone(false); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">🧬</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">3-Year Plan Complete!</h2>
      <p className="text-foreground mb-2">Resistance Prevention Score: {score}</p>
      <div className="text-left bg-secondary/50 rounded-xl p-4 mb-4 max-w-sm">
        {choices.map((c, i) => (
          <p key={i} className="text-sm text-foreground">Year {i + 1}: {CROPS_LIST.find(cr => cr.id === c.crop)?.name} + {HERBICIDES.find(h => h.id === c.herb)?.name}</p>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const s = SEASONS_DATA[year];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Herbicide Resistor</h1>
          <span className="ml-auto text-sm text-muted-foreground">Year {year + 1}/3</span>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-foreground">{s.pressure}</p>
        </div>
        <p className="text-sm font-bold text-foreground mb-2">Choose your crop:</p>
        <div className="flex gap-2 mb-4">
          {CROPS_LIST.map(c => (
            <button key={c.id} onClick={() => setCrop(c.id)}
              className={`flex-1 p-3 rounded-xl border-2 text-center text-xs font-medium ${crop === c.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
              {c.name}
            </button>
          ))}
        </div>
        <p className="text-sm font-bold text-foreground mb-2">Choose your herbicide:</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {HERBICIDES.map(h => (
            <button key={h.id} onClick={() => setHerb(h.id)}
              className={`p-3 rounded-xl border-2 text-center text-xs font-medium ${herb === h.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
              <p>{h.name}</p>
              <p className={`text-[10px] ${h.risk === 'high' ? 'text-destructive' : h.risk === 'low' ? 'text-amber-500' : 'text-green-600'}`}>
                Resistance risk: {h.risk}
              </p>
            </button>
          ))}
        </div>
        {crop && herb && <button onClick={submit} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Plant & Spray!</button>}
      </div>
    </div>
  );
}
