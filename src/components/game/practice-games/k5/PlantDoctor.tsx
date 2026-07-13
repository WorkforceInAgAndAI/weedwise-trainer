import { useState } from 'react';
import { Stethoscope, Sun, Droplets, Sprout, Wind, Mountain, Ruler, ArrowLeft, MapPin, Check, X, Leaf } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

// The six things plants need — mapped to friendly kid-doctor "prescriptions".
type Resource = 'sunlight' | 'water' | 'nutrients' | 'air' | 'soil' | 'space';

interface Prescription {
  resource: Resource;
  label: string;
}

interface Case {
  patient: string;         // Which plant walked into the clinic
  sickPart: string;        // The part of the plant that looks sick
  symptom: string;         // What the doctor sees
  clue: string;            // Story clue about where the plant has been living
  best: Resource;          // The correct prescription
  choices: [Prescription, Prescription];
  successText: string;     // Why the correct fix works
  failText: string;        // Why the wrong fix does not help
}

// Eight patient cases. Each case highlights one of the six things plants need
// from the K-5 "What Plants Need" learning module. Two prescriptions are
// offered per case, and one is clearly the right fix for the sick part.
const CASES: Case[] = [
  {
    patient: 'Sunny the Sunflower',
    sickPart: 'Leaves',
    symptom: 'Her leaves are pale yellow and floppy, and she is leaning way over to one side.',
    clue: 'She has been living in a dark closet all week — no window in sight!',
    best: 'sunlight',
    choices: [
      { resource: 'sunlight', label: 'Move her to a bright, sunny windowsill' },
      { resource: 'water',    label: 'Pour her a big glass of water' },
    ],
    successText: 'Leaves are the plant\u2019s food factory! With sunlight they can make food (sugar) again and turn bright green.',
    failText: 'She already has plenty of water — without light, her leaves cannot make food no matter how much you water her.',
  },
  {
    patient: 'Buddy the Bean Sprout',
    sickPart: 'Stem',
    symptom: 'His stem is drooping and bendy, like a wet noodle.',
    clue: 'The soil in his pot is bone dry and cracked on top.',
    best: 'water',
    choices: [
      { resource: 'water',   label: 'Give him a nice long drink of water' },
      { resource: 'sunlight', label: 'Put him under a hot lamp all day' },
    ],
    successText: 'Water fills the stem like air in a balloon and helps it stand tall again. Nice diagnosis, doctor!',
    failText: 'More heat with no water would dry him out even faster. Thirsty plants need water first!',
  },
  {
    patient: 'Rosie the Rosebush',
    sickPart: 'Leaves',
    symptom: 'Her older leaves are turning yellow with tiny brown spots, but she gets plenty of sun and water.',
    clue: 'She has been in the same tiny pot with the same old dirt for two whole years.',
    best: 'nutrients',
    choices: [
      { resource: 'nutrients', label: 'Feed her some plant food (fertilizer)' },
      { resource: 'water',     label: 'Water her three more times a day' },
    ],
    successText: 'Old soil runs out of nutrients. A little plant food gives her leaves the vitamins they need!',
    failText: 'Too much water will drown her roots — the real problem is that her soil is out of food.',
  },
  {
    patient: 'Ollie the Oak Seedling',
    sickPart: 'Roots',
    symptom: 'His roots are brown and mushy, and he smells a little funky.',
    clue: 'He is planted in a cup with NO holes, and there is a puddle of water on top.',
    best: 'air',
    choices: [
      { resource: 'air',   label: 'Poke drainage holes so roots can breathe' },
      { resource: 'water', label: 'Add even more water to the cup' },
    ],
    successText: 'Roots need air too! Holes let extra water drain so roots can breathe and stay healthy.',
    failText: 'His roots are already drowning. More water would make it worse — they need air!',
  },
  {
    patient: 'Terry the Tomato',
    sickPart: 'Roots',
    symptom: 'She keeps tipping over and her roots are stuck in a hard, gray, gravelly patch.',
    clue: 'A construction truck packed the ground into concrete-hard dirt where she was planted.',
    best: 'soil',
    choices: [
      { resource: 'soil',     label: 'Move her to loose, fluffy soil she can grow into' },
      { resource: 'sunlight', label: 'Aim a giant mirror at her to add more sun' },
    ],
    successText: 'Roots need soft soil to spread out, hold on tight, and grab water. Fresh soil = happy roots!',
    failText: 'Extra sunlight will not help — her roots still cannot push through rock-hard ground.',
  },
  {
    patient: 'Corny the Corn Stalk',
    sickPart: 'Whole plant',
    symptom: 'He is shorter and skinnier than all of his neighbors and his leaves are being crowded out.',
    clue: 'Someone planted 20 corn seeds in one tiny flower pot — they are all squished together!',
    best: 'space',
    choices: [
      { resource: 'space',    label: 'Replant them further apart so each has room' },
      { resource: 'nutrients', label: 'Dump a whole bag of fertilizer on top' },
    ],
    successText: 'Plants need space so their roots and leaves do not fight for sun, water, and food. Room to grow!',
    failText: 'Extra fertilizer cannot fix a crowd — they will still block each other\u2019s sunlight and steal each other\u2019s water.',
  },
  {
    patient: 'Ferny the Fern',
    sickPart: 'Leaves',
    symptom: 'Her leaf tips are crispy brown and crunchy, like old potato chips.',
    clue: 'She lives right next to a heater that blows hot dry air on her all day.',
    best: 'water',
    choices: [
      { resource: 'water',    label: 'Mist her leaves and water her soil' },
      { resource: 'nutrients', label: 'Sprinkle plant food on the crispy tips' },
    ],
    successText: 'Ferns love moisture. A drink and a mist will soften those leaves right up!',
    failText: 'Fertilizer on dry, crispy leaves will not bring them back — she is thirsty!',
  },
  {
    patient: 'Petey the Pea Plant',
    sickPart: 'Leaves',
    symptom: 'His leaves are turning purple and growing very, very slowly.',
    clue: 'He was planted in plain white sand with no compost or plant food ever added.',
    best: 'nutrients',
    choices: [
      { resource: 'nutrients', label: 'Mix in compost and plant food' },
      { resource: 'air',       label: 'Blow a big fan on him all afternoon' },
    ],
    successText: 'Purple leaves can mean a plant is missing food from the soil. Compost gives him the nutrients he needs to grow!',
    failText: 'Wind will not fix an empty soil pantry — he needs food in the ground!',
  },
];

const RESOURCE_META: Record<Resource, { Icon: React.ComponentType<{ className?: string }>; name: string; color: string }> = {
  sunlight:  { Icon: Sun,      name: 'Sunlight',  color: 'text-yellow-600' },
  water:     { Icon: Droplets, name: 'Water',     color: 'text-blue-600' },
  nutrients: { Icon: Sprout,   name: 'Nutrients', color: 'text-emerald-600' },
  air:       { Icon: Wind,     name: 'Air',       color: 'text-sky-600' },
  soil:      { Icon: Mountain, name: 'Soil',      color: 'text-amber-700' },
  space:     { Icon: Ruler,    name: 'Space',     color: 'text-primary' },
};

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function PlantDoctor({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const caseData = CASES[step];
  const answered = picked !== null;
  const isCorrect = answered && caseData.choices[picked!].resource === caseData.best;

  const choose = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    if (caseData.choices[idx].resource === caseData.best) setScore(s => s + 1);
  };

  const next = () => {
    if (step + 1 >= CASES.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setStep(0); setScore(0); setPicked(null); setDone(false);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    restart();
  };

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={CASES.length}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={score === CASES.length ? 'Chief Plant Doctor! Every patient healed!' : 'Nice work, Doctor — every patient thanks you!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Stethoscope className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">Plant Doctor</h1>
            <p className="text-xs text-muted-foreground">Diagnose the sick plant and prescribe what it needs!</p>
          </div>
          <div className="text-sm font-semibold text-foreground bg-muted px-3 py-1 rounded-full">
            Patient {step + 1} / {CASES.length}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-4">
          {CASES.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Chart card */}
        <div className="bg-card border-2 border-border rounded-lg p-5 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Leaf className="w-5 h-5" />
              <span>{caseData.patient}</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-1 rounded">
              Sick part: {caseData.sickPart}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Symptom</div>
            <p className="text-foreground text-base leading-relaxed">{caseData.symptom}</p>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-3">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">Case notes</div>
              <p className="text-sm text-amber-900">{caseData.clue}</p>
            </div>
          </div>

          {/* Prescription choices */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Write a prescription</div>
            <div className="grid gap-3">
              {caseData.choices.map((c, i) => {
                const meta = RESOURCE_META[c.resource];
                const isPick = picked === i;
                const isBest = c.resource === caseData.best;
                const state = !answered
                  ? 'border-border bg-secondary/40 hover:border-primary/60 hover:bg-secondary'
                  : isBest
                    ? 'border-emerald-500 bg-emerald-50'
                    : isPick
                      ? 'border-red-500 bg-red-50'
                      : 'border-border bg-secondary/40 opacity-60';
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={answered}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${state}`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-background border-2 border-current flex items-center justify-center ${meta.color}`}>
                      <meta.Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{meta.name}</div>
                      <div className="text-foreground font-medium">{c.label}</div>
                    </div>
                    {answered && isBest && <Check className="w-6 h-6 text-emerald-600" />}
                    {answered && isPick && !isBest && <X className="w-6 h-6 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`rounded-lg p-4 border-2 animate-scale-in ${isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
              <div className="font-bold mb-1 text-foreground">
                {isCorrect ? 'Great diagnosis, Doctor!' : 'Hmm, that is not the fix.'}
              </div>
              <p className="text-sm text-foreground">
                {isCorrect ? caseData.successText : caseData.failText}
              </p>
              {!isCorrect && (
                <p className="text-xs text-muted-foreground mt-2">
                  What this patient really needed was <strong>{RESOURCE_META[caseData.best].name}</strong>.
                </p>
              )}
              <button
                onClick={next}
                className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90"
              >
                {step + 1 >= CASES.length ? 'Finish Shift' : 'Next Patient →'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Patients healed: <span className="font-bold text-foreground">{score}</span> / {step + (answered ? 1 : 0)}
        </div>
      </div>

      <FarmerGuide message="Every plant needs 6 things: sunlight, water, nutrients, air, soil, and space. Look at the sick part and pick the missing one!" gradeLabel={gradeLabel} />
    </div>
  );
}