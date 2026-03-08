import { useState } from 'react';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

const STAGES = [
  { id: 'seedling', label: '🌱 Seedling', desc: '1-3 leaves, just emerged', imageStage: 'seedling' },
  { id: 'vegetative', label: '🌿 Vegetative', desc: 'Active growth, branching', imageStage: 'vegetative' },
  { id: 'reproductive', label: '🌸 Reproductive', desc: 'Flowering / seed set', imageStage: 'flower' },
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
  const [step, setStep] = useState<1 | 2>(1);
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
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">⏱️ Control Strategy</h2>
        <p className="text-sm text-muted-foreground">
          Choose the best strategy for <span className="text-foreground font-bold">{weed.commonName}</span>
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          step === 1 && !submitted ? 'bg-primary text-primary-foreground' : selectedStage ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
        }`}>
          {selectedStage ? '✓' : '①'} Growth Stage
        </div>
        <div className="w-6 h-0.5 bg-border" />
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          step === 2 && !submitted ? 'bg-primary text-primary-foreground' : selectedMethod ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
        }`}>
          {selectedMethod ? '✓' : '②'} Control Method
        </div>
      </div>

      {/* Step 1: Growth stage */}
      {(step === 1 || submitted) && (
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {step === 1 && !submitted ? 'When should you act? Tap a growth stage:' : 'Growth Stage'}
          </h3>
          <div className="flex gap-2">
            {STAGES.map(stage => (
              <button key={stage.id} onClick={() => {
                if (submitted) return;
                setSelectedStage(stage.id);
                setStep(2);
              }}
                disabled={submitted}
                className="flex-1 flex flex-col items-center transition-all">
                <div className={`w-full h-24 rounded-lg overflow-hidden border-2 mb-1.5 transition-all ${
                  submitted
                    ? stage.id === optStage ? 'border-accent ring-2 ring-accent/30' : selectedStage === stage.id && !isStageCorrect ? 'border-destructive' : 'border-border opacity-50'
                    : selectedStage === stage.id ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border hover:border-primary/50'
                }`}>
                  <WeedImage weedId={weed.id} stage={stage.imageStage} className="w-full h-full" />
                </div>
                <span className="text-xs font-bold text-foreground">{stage.label}</span>
                <span className="text-[8px] text-muted-foreground text-center">{stage.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Control method */}
      {(step === 2 || submitted) && (
        <div className={step === 2 && !submitted ? 'animate-fade-in' : ''}>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {step === 2 && !submitted ? 'How should you control it? Tap a method:' : 'Control Method'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map(method => (
              <button key={method.id} onClick={() => {
                if (submitted) return;
                setSelectedMethod(method.id);
              }}
                disabled={submitted}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  submitted
                    ? method.id === optMethod ? 'border-accent bg-accent/10' : selectedMethod === method.id && !isMethodCorrect ? 'border-destructive bg-destructive/10' : 'border-border opacity-50'
                    : selectedMethod === method.id ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/50'
                }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{method.label}</span>
                    <span className="text-[9px] text-muted-foreground">{method.desc}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!submitted && selectedMethod && (
            <div className="mt-3 space-y-2">
              <button onClick={() => setStep(1)} className="w-full px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                ← Change Growth Stage
              </button>
              <button onClick={handleSubmit} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Apply {METHODS.find(m => m.id === selectedMethod)?.label} at {STAGES.find(s => s.id === selectedStage)?.label} Stage ✓
              </button>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div className="space-y-4 animate-scale-in">
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

          {/* Effectiveness comparison */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Effectiveness Comparison</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Your Choice</span>
                  <span className="font-bold text-foreground">{getEffectiveness(selectedStage!, selectedMethod!, optStage, optMethod)}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${isBothCorrect ? 'bg-accent' : 'bg-primary/60'}`}
                    style={{ width: `${getEffectiveness(selectedStage!, selectedMethod!, optStage, optMethod)}%` }} />
                </div>
              </div>
              {!isBothCorrect && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-accent">Optimal Strategy</span>
                    <span className="font-bold text-accent">{getEffectiveness(optStage, optMethod, optStage, optMethod)}%</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: `${getEffectiveness(optStage, optMethod, optStage, optMethod)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
        </div>
      )}
    </div>
  );
}
