import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STAGES = ['seedling', 'vegetative', 'reproductive'] as const;
type Stage = typeof STAGES[number];
const STAGE_LABELS: Record<Stage, string> = { seedling: 'Seedling', vegetative: 'Vegetative', reproductive: 'Reproductive' };
const STAGE_IMAGE_MAP: Record<Stage, string> = { seedling: 'seedling', vegetative: 'vegetative', reproductive: 'flower' };

const CONTROLS = [
  { id: 'pre-herb', label: 'Pre-emergence Herbicide', stages: ['seedling'] },
  { id: 'post-herb', label: 'Post-emergence Herbicide', stages: ['seedling', 'vegetative'] },
  { id: 'mow', label: 'Mow / Cut', stages: ['vegetative', 'reproductive'] },
  { id: 'hand-pull', label: 'Hand Pull', stages: ['seedling'] },
  { id: 'cultivate', label: 'Cultivation / Tillage', stages: ['seedling', 'vegetative'] },
  { id: 'cover-crop', label: 'Cover Crops / Competition', stages: ['seedling'] },
  { id: 'spot-spray', label: 'Spot Spray Treatment', stages: ['vegetative', 'reproductive'] },
  { id: 'biocontrol', label: 'Biological Control', stages: ['vegetative', 'reproductive'] },
];

const QUESTIONS_PER_ROUND = 10;

function buildRounds(level: number) {
  const offset = ((level - 1) * QUESTIONS_PER_ROUND) % weeds.length;
  const rotated = [...weeds.slice(offset), ...weeds.slice(0, offset)];
  const pool = shuffle(rotated).slice(0, QUESTIONS_PER_ROUND * 2);

  const items: { weed: typeof weeds[0]; stage: Stage }[] = [];
  let lastStage: Stage | null = null;

  for (let i = 0; i < QUESTIONS_PER_ROUND && pool.length > 0; i++) {
    // Pick a stage different from the last one
    const availableStages = STAGES.filter(s => s !== lastStage);
    const stage = shuffle([...availableStages])[0];
    lastStage = stage;
    items.push({ weed: pool.shift()!, stage });
  }
  return items;
}

export default function LifeStageControl({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const items = useMemo(() => buildRounds(level), [level]);

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<'stage' | 'weed' | 'control' | 'feedback'>('stage');
  const [stageAnswer, setStageAnswer] = useState<Stage | null>(null);
  const [weedAnswer, setWeedAnswer] = useState<string | null>(null);
  const [controlAnswer, setControlAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  // Generate distractors for weed identification
  const weedOptions = useMemo(() => {
    if (!current) return [];
    const others = shuffle(weeds.filter(w => w.id !== current.weed.id)).slice(0, 3);
    return shuffle([current.weed, ...others]);
  }, [idx, current?.weed.id]);

  // Pick 4-5 control options shuffled, including valid ones for current stage
  const controlOptions = useMemo(() => {
    if (!current) return [];
    const valid = CONTROLS.filter(c => c.stages.includes(current.stage));
    const invalid = CONTROLS.filter(c => !c.stages.includes(current.stage));
    const picked = [...valid, ...shuffle(invalid).slice(0, Math.max(0, 5 - valid.length))];
    return shuffle(picked);
  }, [idx, current?.stage]);

  const validControlIds = current ? CONTROLS.filter(c => c.stages.includes(current.stage)).map(c => c.id) : [];

  const handleStage = (s: Stage) => {
    setStageAnswer(s);
    if (s === current!.stage) setScore(sc => sc + 1);
    setStep('weed');
  };

  const handleWeed = (id: string) => {
    setWeedAnswer(id);
    if (id === current!.weed.id) setScore(sc => sc + 1);
    setStep('control');
  };

  const handleControl = (cId: string) => {
    setControlAnswer(cId);
    if (validControlIds.includes(cId)) setScore(sc => sc + 1);
    setStep('feedback');
  };

  const next = () => {
    setIdx(i => i + 1);
    setStep('stage');
    setStageAnswer(null);
    setWeedAnswer(null);
    setControlAnswer(null);
  };

  const restart = () => {
    setIdx(0); setScore(0); setStep('stage');
    setStageAnswer(null); setWeedAnswer(null); setControlAnswer(null);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const maxScore = items.length * 3;
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{maxScore} points</p>
        <LevelComplete level={level} score={score} total={maxScore} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  const stageCorrect = stageAnswer === current!.stage;
  const weedCorrect = weedAnswer === current!.weed.id;
  const controlCorrect = controlAnswer ? validControlIds.includes(controlAnswer) : false;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Stage Control</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Weed image */}
        <div className="w-48 h-48 rounded-xl overflow-hidden bg-secondary mb-3">
          <WeedImage weedId={current!.weed.id} stage={STAGE_IMAGE_MAP[current!.stage]} className="w-full h-full object-cover" />
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-4">
          {['Stage', 'Weed', 'Control'].map((label, i) => {
            const stepNames = ['stage', 'weed', 'control', 'feedback'] as const;
            const currentIdx = stepNames.indexOf(step);
            const isComplete = currentIdx > i;
            const isCurrent = currentIdx === i;
            return (
              <span key={label} className={`px-3 py-1 rounded-full text-xs font-bold ${
                isComplete ? 'bg-green-500/20 text-green-500' :
                isCurrent ? 'bg-primary text-primary-foreground' :
                'bg-secondary text-muted-foreground'
              }`}>{i + 1}. {label}</span>
            );
          })}
        </div>

        {/* Step 1: Identify life stage */}
        {step === 'stage' && (
          <>
            <p className="font-bold text-foreground mb-3 text-center">What life stage is shown in the image?</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {STAGES.map(s => (
                <button key={s} onClick={() => handleStage(s)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all">
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Identify the weed */}
        {step === 'weed' && (
          <>
            <p className={`text-sm font-bold mb-1 ${stageCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {stageCorrect ? 'Correct stage!' : `Not quite -- it's the ${STAGE_LABELS[current!.stage]} stage.`}
            </p>
            <p className="font-bold text-foreground mb-3 text-center">Which weed is shown in the image?</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {weedOptions.map(w => (
                <button key={w.id} onClick={() => handleWeed(w.id)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all">
                  {w.commonName}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Choose control method */}
        {step === 'control' && (
          <>
            <p className={`text-sm font-bold mb-1 ${weedCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {weedCorrect ? 'Correct weed!' : `That's ${current!.weed.commonName}.`}
            </p>
            <p className="font-bold text-foreground mb-3 text-center">
              How should you manage {current!.weed.commonName} at the {STAGE_LABELS[current!.stage].toLowerCase()} stage?
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {controlOptions.map(c => (
                <button key={c.id} onClick={() => handleControl(c.id)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all">
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Feedback */}
        {step === 'feedback' && (
          <div className="w-full max-w-sm">
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
              <p className="font-bold text-foreground mb-2">{current!.weed.commonName}</p>
              <p className="text-xs text-muted-foreground italic mb-2">{current!.weed.scientificName}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${stageCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {stageCorrect ? 'Stage: Correct' : `Stage: ${STAGE_LABELS[current!.stage]}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${weedCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {weedCorrect ? 'Weed ID: Correct' : `Weed: ${current!.weed.commonName}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${controlCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {controlCorrect ? 'Control: Correct' : `Best: ${CONTROLS.filter(c => c.stages.includes(current!.stage)).map(c => c.label).join(', ')}`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">{current!.weed.management}</p>
              <p className="text-xs text-muted-foreground mt-1">Timing: {current!.weed.controlTiming}</p>
            </div>
            <button onClick={next} className="w-full px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
