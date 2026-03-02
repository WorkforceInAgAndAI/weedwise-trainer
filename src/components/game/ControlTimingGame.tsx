import { useState } from 'react';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

const STAGES = [
  { id: 'seedling', label: 'Seedling', desc: 'Just emerged, 1-3 leaves', imageStage: 'seedling' },
  { id: 'vegetative', label: 'Vegetative', desc: 'Active growth, tillering/branching', imageStage: 'vegetative' },
  { id: 'reproductive', label: 'Reproductive', desc: 'Flowering/seed production', imageStage: 'flower' },
];

// Map weed control timing text to the optimal stage
function getOptimalStage(weed: Weed): string {
  const ct = weed.controlTiming.toLowerCase();
  if (ct.includes('rosette') || ct.includes('seedling') || ct.includes('before 3') || ct.includes('before 4') || ct.includes('before') || ct.includes('pre') || ct.includes('small')) return 'seedling';
  if (ct.includes('bud') || ct.includes('flower') || ct.includes('bolt') || ct.includes('fall')) return 'vegetative';
  return 'seedling'; // default to early
}

interface Props {
  weed: Weed;
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function ControlTimingGame({ weed, onComplete, onNext }: Props) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const optimal = getOptimalStage(weed);
  const isCorrect = selectedStage === optimal;

  const handleSubmit = () => {
    if (!selectedStage) return;
    setSubmitted(true);
    onComplete([{ weedId: weed.id, correct: isCorrect }]);
  };

  // Mock population data for graph
  const getPopulationReduction = (stage: string) => {
    if (stage === optimal) return 95;
    if (stage === 'seedling' && optimal === 'vegetative') return 70;
    if (stage === 'vegetative' && optimal === 'seedling') return 60;
    if (stage === 'reproductive') return 20;
    return 50;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">⏱️ Control Timing</h2>
        <p className="text-sm text-muted-foreground">When is the best time to control <span className="text-foreground font-bold">{weed.commonName}</span>? Select the optimal growth stage.</p>
      </div>

      {/* Growth stage timeline */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full" />
        <div className="relative flex justify-between">
          {STAGES.map(stage => (
            <button key={stage.id} onClick={() => !submitted && setSelectedStage(stage.id)}
              disabled={submitted}
              className={`flex flex-col items-center w-[30%] transition-all ${
                submitted
                  ? stage.id === optimal ? 'scale-105' : selectedStage === stage.id ? '' : 'opacity-50'
                  : ''
              }`}>
              <div className={`w-full h-28 rounded-lg overflow-hidden border-2 mb-2 transition-all ${
                submitted
                  ? stage.id === optimal ? 'border-accent ring-2 ring-accent/30' : selectedStage === stage.id && !isCorrect ? 'border-destructive' : 'border-border'
                  : selectedStage === stage.id ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
              }`}>
                <WeedImage weedId={weed.id} stage={stage.imageStage} className="w-full h-full" />
              </div>
              <span className="text-xs font-bold text-foreground">{stage.label}</span>
              <span className="text-[10px] text-muted-foreground text-center">{stage.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {!submitted && selectedStage && (
        <button onClick={handleSubmit} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Apply Treatment at {STAGES.find(s => s.id === selectedStage)?.label} Stage
        </button>
      )}

      {submitted && (
        <div className="space-y-4 animate-scale-in">
          <div className={`rounded-lg p-4 ${isCorrect ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
              <span className={`font-display font-bold ${isCorrect ? 'text-accent' : 'text-destructive'}`}>{isCorrect ? 'Optimal Timing!' : 'Not Ideal'}</span>
            </div>
            <p className="text-sm text-foreground">{weed.controlTiming}</p>
          </div>

          {/* Population impact graph */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Population Control Effectiveness</h3>
            <div className="space-y-3">
              {STAGES.map(stage => {
                const reduction = getPopulationReduction(stage.id);
                const isOptimal = stage.id === optimal;
                const isSelected = stage.id === selectedStage;
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <span className={`text-xs w-24 ${isOptimal ? 'font-bold text-accent' : 'text-muted-foreground'}`}>
                      {stage.label} {isOptimal && '⭐'}
                    </span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isOptimal ? 'bg-accent' : isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                        style={{ width: `${reduction}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${isOptimal ? 'text-accent' : 'text-muted-foreground'}`}>{reduction}%</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">% weed population reduction when treated at each growth stage</p>
          </div>

          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
        </div>
      )}
    </div>
  );
}
