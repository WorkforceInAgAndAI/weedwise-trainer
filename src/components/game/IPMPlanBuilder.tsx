import { useState } from 'react';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

const CULTURAL_OPTIONS = ['Crop Rotation', 'Cover Crops', 'Tillage/Cultivation', 'Dense Planting', 'None'];
const CHEMICAL_OPTIONS = ['PRE Herbicide', 'POST Herbicide', 'Multiple MOA Strategy', 'Spot Spray Only', 'None'];
const MECHANICAL_OPTIONS = ['Mowing/Cutting', 'Hand Pulling/Roguing', 'Cultivation', 'Burning', 'None'];

function scoreMatch(weed: Weed, cultural: string, chemical: string, mechanical: string): { score: number; feedback: string[] } {
  const mgmt = weed.management.toLowerCase();
  const feedback: string[] = [];
  let score = 0;

  // Cultural scoring
  if (cultural === 'Crop Rotation' && mgmt.includes('rotation')) { score += 25; feedback.push('✅ Crop rotation is recommended'); }
  else if (cultural === 'Cover Crops' && mgmt.includes('cover')) { score += 25; feedback.push('✅ Cover crops help suppress this weed'); }
  else if (cultural === 'Tillage/Cultivation' && (mgmt.includes('tillage') || mgmt.includes('cultivation'))) { score += 25; feedback.push('✅ Tillage is part of the recommended approach'); }
  else if (cultural !== 'None') { score += 10; feedback.push('⚠️ Cultural method partially helpful'); }
  else { feedback.push('❌ A cultural practice would improve the plan'); }

  // Chemical scoring
  if (chemical === 'PRE Herbicide' && mgmt.includes('pre')) { score += 30; feedback.push('✅ PRE herbicide is recommended'); }
  else if (chemical === 'POST Herbicide' && mgmt.includes('post')) { score += 30; feedback.push('✅ POST herbicide is part of the strategy'); }
  else if (chemical === 'Multiple MOA Strategy' && (mgmt.includes('multiple') || mgmt.includes('moa'))) { score += 35; feedback.push('✅ Multiple MOA is the gold standard'); }
  else if (chemical === 'Spot Spray Only' && mgmt.includes('spot')) { score += 25; feedback.push('✅ Spot spraying is appropriate here'); }
  else if (chemical !== 'None') { score += 10; feedback.push('⚠️ Chemical choice could be more targeted'); }
  else { feedback.push('❌ Some chemical control is usually needed'); }

  // Mechanical scoring
  if (mechanical === 'Mowing/Cutting' && (mgmt.includes('mowing') || mgmt.includes('mow'))) { score += 25; feedback.push('✅ Mowing is recommended'); }
  else if (mechanical === 'Hand Pulling/Roguing' && (mgmt.includes('hand') || mgmt.includes('rogu'))) { score += 25; feedback.push('✅ Hand roguing helps prevent seed spread'); }
  else if (mechanical === 'Cultivation' && (mgmt.includes('cultivation') || mgmt.includes('tillage'))) { score += 25; feedback.push('✅ Cultivation aids control'); }
  else if (mechanical !== 'None') { score += 10; feedback.push('⚠️ Mechanical method somewhat useful'); }
  else { score += 5; feedback.push('ℹ️ Consider adding mechanical control'); }

  return { score: Math.min(score, 100), feedback };
}

interface Props {
  weed: Weed;
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function IPMPlanBuilder({ weed, onComplete, onNext }: Props) {
  const [cultural, setCultural] = useState('');
  const [chemical, setChemical] = useState('');
  const [mechanical, setMechanical] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = cultural && chemical && mechanical;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    const { score } = scoreMatch(weed, cultural, chemical, mechanical);
    onComplete([{ weedId: weed.id, correct: score >= 50 }]);
  };

  const result = submitted ? scoreMatch(weed, cultural, chemical, mechanical) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🧪 IPM Plan Builder</h2>
        <p className="text-sm text-muted-foreground">Build an integrated pest management plan for <span className="text-foreground font-bold">{weed.commonName}</span>.</p>
      </div>

      {/* Weed info */}
      <div className="flex gap-3 items-start bg-muted/30 rounded-lg p-3 border border-border">
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <WeedImage weedId={weed.id} stage="vegetative" className="w-full h-full" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-semibold text-foreground">{weed.commonName}</p>
          <p className="text-muted-foreground">{weed.lifeCycle} • {weed.plantType} • {weed.family}</p>
          <ul className="text-muted-foreground space-y-0.5">
            {weed.traits.slice(0, 2).map((t, i) => <li key={i}>• {t}</li>)}
          </ul>
        </div>
      </div>

      {/* Plan selections */}
      <div className="space-y-3">
        <SelectCategory label="🌾 Cultural Practice" options={CULTURAL_OPTIONS} value={cultural} onChange={setCultural} disabled={submitted} />
        <SelectCategory label="🧪 Chemical Control" options={CHEMICAL_OPTIONS} value={chemical} onChange={setChemical} disabled={submitted} />
        <SelectCategory label="⚙️ Mechanical Control" options={MECHANICAL_OPTIONS} value={mechanical} onChange={setMechanical} disabled={submitted} />
      </div>

      {!submitted && canSubmit && (
        <button onClick={handleSubmit} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          📋 Evaluate My Plan
        </button>
      )}

      {result && (
        <div className="space-y-3 animate-scale-in">
          {/* Effectiveness gauge */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-foreground">Plan Effectiveness</span>
              <span className={`text-lg font-bold ${result.score >= 70 ? 'text-accent' : result.score >= 40 ? 'text-primary' : 'text-destructive'}`}>{result.score}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${result.score >= 70 ? 'bg-accent' : result.score >= 40 ? 'bg-primary' : 'bg-destructive'}`}
                style={{ width: `${result.score}%` }} />
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-1.5">
            {result.feedback.map((f, i) => <p key={i} className="text-sm text-foreground">{f}</p>)}
          </div>

          {/* Recommended approach */}
          <div className="bg-primary/5 border border-primary/30 rounded-lg p-3">
            <p className="text-xs font-bold text-primary mb-1">Recommended Approach:</p>
            <p className="text-sm text-foreground">{weed.management}</p>
            <p className="text-xs text-muted-foreground mt-1"><span className="text-primary">⏱️</span> {weed.controlTiming}</p>
          </div>

          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
        </div>
      )}
    </div>
  );
}

function SelectCategory({ label, options, value, onChange, disabled }: { label: string; options: string[]; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} onClick={() => !disabled && onChange(opt)} disabled={disabled}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              value === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-primary/50'
            } ${disabled ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
