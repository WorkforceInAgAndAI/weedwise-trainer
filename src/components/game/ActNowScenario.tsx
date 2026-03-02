import { useState } from 'react';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

const RESPONSES = [
  { id: 'emergency', label: '🚨 Emergency Action', desc: 'Immediate herbicide application or removal', urgency: true },
  { id: 'schedule', label: '📋 Schedule Treatment', desc: 'Plan treatment within the week', urgency: true },
  { id: 'monitor', label: '👀 Monitor Closely', desc: 'Check again in 1-2 weeks', urgency: false },
  { id: 'noaction', label: '✅ No Action Needed', desc: 'Low threat, leave alone', urgency: false },
];

interface Props {
  weed: Weed;
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function ActNowScenario({ weed, onComplete, onNext }: Props) {
  const [choice, setChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctId = weed.actImmediately ? 'emergency' : 'monitor';
  const isCorrect = choice === correctId || (weed.actImmediately && choice === 'schedule') || (!weed.actImmediately && choice === 'noaction');

  const handleSubmit = () => {
    if (!choice) return;
    setSubmitted(true);
    onComplete([{ weedId: weed.id, correct: isCorrect }]);
  };

  // Threat indicators
  const resistanceRisk = weed.actImmediately ? 'HIGH' : 'LOW';
  const growthSpeed = weed.traits.some(t => /fast|rapid|aggressive|prolific/i.test(t)) ? 'RAPID' : 'MODERATE';
  const seedRisk = weed.traits.some(t => /seed|prolific|dormancy/i.test(t)) ? 'HIGH' : 'MODERATE';

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      {/* Alert Header */}
      <div className={`rounded-lg p-4 border-2 ${weed.actImmediately ? 'border-destructive/60 bg-destructive/10' : 'border-primary/40 bg-primary/5'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{weed.actImmediately ? '🚨' : '📋'}</span>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">FIELD ALERT</h2>
            <p className="text-sm text-muted-foreground">{weed.commonName} detected in the field</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
            <WeedImage weedId={weed.id} stage="vegetative" className="w-full h-full" />
          </div>
          <div className="flex-1 space-y-2">
            {/* Threat meters */}
            <div className="space-y-1.5">
              <ThreatBar label="Resistance Risk" level={resistanceRisk} />
              <ThreatBar label="Growth Speed" level={growthSpeed} />
              <ThreatBar label="Seed Spread Risk" level={seedRisk} />
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">Key traits observed:</p>
          <ul className="text-xs text-foreground space-y-0.5">
            {weed.traits.slice(0, 3).map((t, i) => <li key={i}>• {t}</li>)}
          </ul>
        </div>
      </div>

      {/* Response Options */}
      <div>
        <p className="font-display font-semibold text-foreground mb-3">What is your recommended response?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RESPONSES.map(r => (
            <button key={r.id} onClick={() => !submitted && setChoice(r.id)}
              disabled={submitted}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                submitted
                  ? (r.id === correctId ? 'border-accent bg-accent/15' : choice === r.id && !isCorrect ? 'border-destructive bg-destructive/15' : 'border-border opacity-50')
                  : choice === r.id ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50 hover:border-primary/50'
              }`}>
              <div className="font-semibold text-sm text-foreground">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {!submitted && choice && (
        <button onClick={handleSubmit} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Submit Response
        </button>
      )}

      {submitted && (
        <div className={`rounded-lg p-4 space-y-2 animate-scale-in ${isCorrect ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
            <span className={`font-display font-bold ${isCorrect ? 'text-accent' : 'text-destructive'}`}>{isCorrect ? 'Good Call!' : 'Not Quite'}</span>
          </div>
          <p className="text-sm text-foreground">{weed.actReason}</p>
          <p className="text-sm text-muted-foreground"><span className="text-primary">💡</span> {weed.memoryHook}</p>
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT →</button>
        </div>
      )}
    </div>
  );
}

function ThreatBar({ label, level }: { label: string; level: string }) {
  const isHigh = level === 'HIGH' || level === 'RAPID';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isHigh ? 'bg-destructive w-[85%]' : 'bg-primary w-[40%]'}`} />
      </div>
      <span className={`text-[10px] font-bold ${isHigh ? 'text-destructive' : 'text-primary'}`}>{level}</span>
    </div>
  );
}
