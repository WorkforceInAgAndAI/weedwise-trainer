import { useState } from 'react';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

const STAGES = [
  { id: 'seedling', label: 'Seedling', desc: '1-3 leaves, just emerged', imageStage: 'seedling' },
  { id: 'vegetative', label: 'Vegetative', desc: 'Active growth, branching', imageStage: 'vegetative' },
  { id: 'reproductive', label: 'Reproductive', desc: 'Flowering / seed set', imageStage: 'flower' },
];

const METHODS = [
  { id: 'post', label: 'POST Herbicide', icon: '💊', desc: 'Foliar-applied after emergence' },
  { id: 'pre', label: 'PRE Herbicide', icon: '🧪', desc: 'Soil-applied before emergence' },
  { id: 'mechanical', label: 'Tillage / Mowing', icon: '🔧', desc: 'Physical removal or cutting' },
  { id: 'cultural', label: 'Cultural / Cover Crops', icon: '🌱', desc: 'Rotation, cover crops, competition' },
];

function getOptimalStage(weed: Weed): string {
  const ct = weed.controlTiming.toLowerCase();
  if (ct.includes('rosette') || ct.includes('seedling') || ct.includes('before 3') || ct.includes('before 4') || ct.includes('pre') || ct.includes('small')) return 'seedling';
  if (ct.includes('bud') || ct.includes('flower') || ct.includes('bolt') || ct.includes('fall') || ct.includes('12–18')) return 'vegetative';
  return 'seedling';
}

function getOptimalMethod(weed: Weed): string {
  const m = weed.management.toLowerCase();
  if (m.includes('pre ') || m.includes('pre-')) return 'pre';
  if (m.includes('post') || m.includes('herbicide') || m.includes('glyphosate') || m.includes('dicamba')) return 'post';
  if (m.includes('mow') || m.includes('tillag') || m.includes('cultivat')) return 'mechanical';
  return 'cultural';
}

function getEffectiveness(stage: string, method: string, optStage: string, optMethod: string): number {
  let score = 50;
  if (stage === optStage) score += 30;
  else if (stage === 'reproductive') score -= 25;
  else score += 10;
  if (method === optMethod) score += 20;
  else score += 5;
  return Math.min(99, Math.max(5, score));
}

interface Props {
  weed: Weed;
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function ControlTimingGame({ weed, onComplete, onNext }: Props) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const optStage = getOptimalStage(weed);
  const optMethod = getOptimalMethod(weed);
  const isStageCorrect = selectedStage === optStage;
  const isMethodCorrect = selectedMethod === optMethod;
  const isBothCorrect = isStageCorrect && isMethodCorrect;

  const handleSubmit = () => {
    if (!selectedStage || !selectedMethod) return;
    setSubmitted(true);
    onComplete([{ weedId: weed.id, correct: isBothCorrect }]);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">⏱️ Control Strategy</h2>
        <p className="text-sm text-muted-foreground">
          Choose the best <span className="font-bold text-foreground">growth stage</span> AND{' '}
          <span className="font-bold text-foreground">control method</span> for{' '}
          <span className="text-foreground font-bold">{weed.commonName}</span>.
        </p>
      </div>

      {/* Step 1: Growth stage */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">① Select Growth Stage</h3>
        <div className="flex gap-2">
          {STAGES.map(stage => (
            <button key={stage.id} onClick={() => !submitted && setSelectedStage(stage.id)}
              disabled={submitted}
              className={`flex-1 flex flex-col items-center transition-all ${submitted ? '' : ''}`}>
              <div className={`w-full h-24 rounded-lg overflow-hidden border-2 mb-1.5 transition-all ${
                submitted
                  ? stage.id === optStage ? 'border-accent ring-2 ring-accent/30' : selectedStage === stage.id && !isStageCorrect ? 'border-destructive' : 'border-border opacity-50'
                  : selectedStage === stage.id ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
              }`}>
                <WeedImage weedId={weed.id} stage={stage.imageStage} className="w-full h-full" />
              </div>
              <span className="text-[10px] font-bold text-foreground">{stage.label}</span>
              <span className="text-[8px] text-muted-foreground text-center">{stage.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Control method */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">② Select Control Method</h3>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(method => (
            <button key={method.id} onClick={() => !submitted && setSelectedMethod(method.id)}
              disabled={submitted}
              className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                submitted
                  ? method.id === optMethod ? 'border-accent bg-accent/10' : selectedMethod === method.id && !isMethodCorrect ? 'border-destructive bg-destructive/10' : 'border-border opacity-50'
                  : selectedMethod === method.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{method.icon}</span>
                <div>
                  <span className="text-xs font-bold text-foreground block">{method.label}</span>
                  <span className="text-[9px] text-muted-foreground">{method.desc}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {!submitted && selectedStage && selectedMethod && (
        <button onClick={handleSubmit} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Apply {METHODS.find(m => m.id === selectedMethod)?.label} at {STAGES.find(s => s.id === selectedStage)?.label} Stage
        </button>
      )}

      {submitted && (
        <div className="space-y-4 animate-scale-in">
          {/* Result feedback */}
          <div className={`rounded-lg p-4 ${isBothCorrect ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{isBothCorrect ? '✅' : isStageCorrect || isMethodCorrect ? '⚠️' : '❌'}</span>
              <span className={`font-display font-bold ${isBothCorrect ? 'text-accent' : 'text-destructive'}`}>
                {isBothCorrect ? 'Optimal Strategy!' : isStageCorrect || isMethodCorrect ? 'Partially Correct' : 'Not Ideal'}
              </span>
            </div>
            <p className="text-sm text-foreground mb-1">{weed.controlTiming}</p>
            <p className="text-xs text-muted-foreground">Best approach: <span className="text-foreground font-semibold">{weed.management}</span></p>
          </div>

          {/* Effectiveness matrix */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Effectiveness by Stage × Method</h3>
            <div className="space-y-2">
              {STAGES.map(stage => {
                const eff = getEffectiveness(stage.id, selectedMethod!, optStage, optMethod);
                const optEff = getEffectiveness(stage.id, optMethod, optStage, optMethod);
                const isOpt = stage.id === optStage;
                return (
                  <div key={stage.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] w-20 ${isOpt ? 'font-bold text-accent' : 'text-muted-foreground'}`}>
                        {stage.label} {isOpt && '⭐'}
                      </span>
                      <div className="flex-1 space-y-0.5">
                        {/* Your choice */}
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${isOpt && isMethodCorrect ? 'bg-accent' : 'bg-primary/60'}`}
                              style={{ width: `${eff}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold w-8 text-right text-muted-foreground">{eff}%</span>
                        </div>
                        {/* Optimal for this stage */}
                        {selectedMethod !== optMethod && (
                          <div className="flex items-center gap-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-accent/40 transition-all duration-700" style={{ width: `${optEff}%` }} />
                            </div>
                            <span className="text-[8px] w-8 text-right text-accent/60">{optEff}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2">
              <span className="text-[9px] text-muted-foreground flex items-center gap-1"><span className="w-3 h-2 rounded bg-primary/60 inline-block" /> Your choice</span>
              {selectedMethod !== optMethod && (
                <span className="text-[9px] text-muted-foreground flex items-center gap-1"><span className="w-3 h-2 rounded bg-accent/40 inline-block" /> Optimal method</span>
              )}
            </div>
          </div>

          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
        </div>
      )}
    </div>
  );
}
