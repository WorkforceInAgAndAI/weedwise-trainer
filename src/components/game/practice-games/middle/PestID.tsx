import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CATEGORIES = ['Terrestrial', 'Aquatic', 'Parasitic'] as const;

const AQUATIC_IDS = ['yellow-nutsedge'];
const PARASITIC_KEYWORDS = ['parasit'];

function getCategory(w: typeof weeds[0]): string {
  if (PARASITIC_KEYWORDS.some(k => `${w.habitat} ${w.primaryHabitat}`.toLowerCase().includes(k))) return 'Parasitic';
  if (AQUATIC_IDS.includes(w.id)) return 'Aquatic';
  const t = `${w.habitat} ${w.primaryHabitat}`.toLowerCase();
  if (t.match(/aquatic|water|flood|wetland|pond|river|moist|marsh|ditch|riparian|bottom/)) return 'Aquatic';
  return 'Terrestrial';
}

function getExplanation(w: typeof weeds[0], correct: string): string {
  switch (correct) {
    case 'Aquatic':
      return `${w.commonName} is categorized as Aquatic because it is commonly found in ${w.habitat.toLowerCase()}. Aquatic weeds grow in or near water and can thrive in saturated soils.`;
    case 'Parasitic':
      return `${w.commonName} is a parasitic weed that derives some or all of its nutrition from other plants, often attaching to host roots or stems.`;
    default:
      return `${w.commonName} is a terrestrial weed found in ${w.habitat.toLowerCase()}. It grows in typical upland soils and does not require aquatic conditions.`;
  }
}

/* ── Word bank items for the follow-up needs question ── */
interface NeedItem { id: string; label: string }

const AQUATIC_NEEDS: NeedItem[] = [
  { id: 'standing-water', label: 'Standing or slow-moving water' },
  { id: 'dissolved-nutrients', label: 'Dissolved nutrients in water' },
  { id: 'underwater-light', label: 'Sunlight reaching underwater' },
  { id: 'saturated-soil', label: 'Saturated or waterlogged soil' },
];
const TERRESTRIAL_NEEDS: NeedItem[] = [
  { id: 'soil-rooting', label: 'Soil to root in' },
  { id: 'rainfall', label: 'Rainfall or irrigation' },
  { id: 'air-space', label: 'Open air space for growth' },
  { id: 'sunlight-above', label: 'Direct sunlight above ground' },
];
const PARASITIC_NEEDS: NeedItem[] = [
  { id: 'host-plant', label: 'Host plant to attach to' },
  { id: 'steal-nutrients', label: 'Steal nutrients from host' },
  { id: 'special-roots', label: 'Special attachment roots (haustoria)' },
  { id: 'host-proximity', label: 'Close proximity to a host' },
];
const DISTRACTOR_NEEDS: NeedItem[] = [
  { id: 'saltwater', label: 'Saltwater environment' },
  { id: 'freezing', label: 'Freezing temperatures' },
  { id: 'concrete', label: 'Concrete surface to grow on' },
  { id: 'darkness', label: 'Complete darkness' },
];

function getNeedsForCategory(cat: string): { correct: NeedItem[]; prompt: string } {
  switch (cat) {
    case 'Aquatic': return { correct: AQUATIC_NEEDS, prompt: 'What unique needs do aquatic plants have?' };
    case 'Parasitic': return { correct: PARASITIC_NEEDS, prompt: 'What unique needs do parasitic plants have?' };
    default: return { correct: TERRESTRIAL_NEEDS, prompt: 'What unique needs do terrestrial plants have?' };
  }
}

function buildWordBank(correctItems: NeedItem[]): NeedItem[] {
  const distractors = shuffle([...DISTRACTOR_NEEDS]).slice(0, 2);
  return shuffle([...correctItems, ...distractors]);
}

export default function PestID({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const rounds = useMemo(() => {
    const byCategory: Record<string, typeof weeds[0][]> = { Terrestrial: [], Aquatic: [], Parasitic: [] };
    weeds.forEach(w => byCategory[getCategory(w)].push(w));

    const picks: { weed: typeof weeds[0]; answer: string; explanation: string }[] = [];
    for (const cat of CATEGORIES) {
      const pool = shuffle(byCategory[cat]);
      const take = Math.min(pool.length, cat === 'Parasitic' ? 2 : 4);
      pool.slice(0, take).forEach(w => picks.push({ weed: w, answer: cat, explanation: getExplanation(w, cat) }));
    }
    const usedIds = new Set(picks.map(p => p.weed.id));
    const remaining = shuffle(weeds.filter(w => !usedIds.has(w.id)));
    while (picks.length < 10 && remaining.length) {
      const w = remaining.shift()!;
      const cat = getCategory(w);
      picks.push({ weed: w, answer: cat, explanation: getExplanation(w, cat) });
    }
    return shuffle(picks).slice(0, 10);
  }, []);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Follow-up needs phase
  const [phase, setPhase] = useState<'classify' | 'needs'>('classify');
  const [needsBank, setNeedsBank] = useState<NeedItem[]>([]);
  const [needsCorrectIds, setNeedsCorrectIds] = useState<Set<string>>(new Set());
  const [needsPrompt, setNeedsPrompt] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set());
  const [needsChecked, setNeedsChecked] = useState(false);
  const [needsScore, setNeedsScore] = useState(0);

  const done = round >= rounds.length;
  const current = !done ? rounds[round] : null;

  const submit = (cat: string) => {
    if (answered || phase !== 'classify') return;
    setSelected(cat);
    setAnswered(true);
    if (cat === current!.answer) setScore(s => s + 1);
  };

  const goToNeeds = () => {
    const cat = current!.answer;
    const { correct, prompt } = getNeedsForCategory(cat);
    setNeedsCorrectIds(new Set(correct.map(n => n.id)));
    setNeedsBank(buildWordBank(correct));
    setNeedsPrompt(prompt);
    setSelectedNeeds(new Set());
    setNeedsChecked(false);
    setPhase('needs');
  };

  const toggleNeed = (id: string) => {
    if (needsChecked) return;
    setSelectedNeeds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const checkNeeds = () => {
    const correctSelected = [...selectedNeeds].filter(id => needsCorrectIds.has(id)).length;
    const wrongSelected = [...selectedNeeds].filter(id => !needsCorrectIds.has(id)).length;
    const earned = Math.max(0, correctSelected - wrongSelected);
    setNeedsScore(s => s + earned);
    setNeedsChecked(true);
  };

  const next = () => { setRound(r => r + 1); setSelected(''); setAnswered(false); setPhase('classify'); };
  const restart = () => { setRound(0); setScore(0); setNeedsScore(0); setSelected(''); setAnswered(false); setPhase('classify'); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'pest-id', gameName: 'Pest ID', level: 'MS', score, total: rounds.length });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-lg text-foreground mb-2">{score}/{rounds.length} classifications correct</p>
        <p className="text-sm text-muted-foreground mb-6">{needsScore} bonus points from needs questions</p>
        <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Pest ID</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-44 h-44 rounded-xl overflow-hidden bg-secondary mb-3">
          <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-sm">{current!.weed.habitat}</p>

        {/* Phase 1: Classification */}
        {phase === 'classify' && (
          <>
            <div className="flex gap-3">
              {CATEGORIES.map(cat => {
                const isCorrect = cat === current!.answer;
                const bg = !answered ? 'border-border bg-card hover:border-primary' :
                  cat === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
                  isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
                return (
                  <button key={cat} onClick={() => submit(cat)}
                    className={`px-5 py-3 rounded-lg border-2 font-bold text-sm text-foreground transition-all ${bg}`}>
                    {cat}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-4 bg-card border border-border rounded-xl p-4 max-w-md w-full">
                <p className={`font-bold mb-2 ${selected === current!.answer ? 'text-green-500' : 'text-destructive'}`}>
                  {selected === current!.answer ? 'Correct!' : 'Not quite!'}
                </p>
                <p className="text-sm text-muted-foreground">{current!.explanation}</p>
                <button onClick={goToNeeds} className="mt-3 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next: Plant Needs</button>
              </div>
            )}
          </>
        )}

        {/* Phase 2: Needs word bank */}
        {phase === 'needs' && (
          <div className="mt-2 bg-card border border-border rounded-xl p-4 max-w-md w-full">
            <p className="font-bold text-foreground mb-3">{needsPrompt}</p>
            <p className="text-xs text-muted-foreground mb-3">Select all that apply from the word bank below.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {needsBank.map(item => {
                const isSelected = selectedNeeds.has(item.id);
                const isCorrect = needsCorrectIds.has(item.id);
                let style = isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-foreground hover:border-primary/50';
                if (needsChecked) {
                  if (isSelected && isCorrect) style = 'border-green-500 bg-green-500/20 text-green-700';
                  else if (isSelected && !isCorrect) style = 'border-destructive bg-destructive/20 text-destructive';
                  else if (!isSelected && isCorrect) style = 'border-green-500/50 bg-green-500/10 text-green-600';
                  else style = 'border-border bg-card text-muted-foreground';
                }
                return (
                  <button key={item.id} onClick={() => toggleNeed(item.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${style}`}>
                    {item.label}
                  </button>
                );
              })}
            </div>
            {!needsChecked && selectedNeeds.size > 0 && (
              <button onClick={checkNeeds} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
            )}
            {needsChecked && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  {[...selectedNeeds].filter(id => needsCorrectIds.has(id)).length === needsCorrectIds.size && [...selectedNeeds].every(id => needsCorrectIds.has(id))
                    ? 'Perfect! You identified all the correct needs.'
                    : 'The correct needs are highlighted in green.'}
                </p>
                <button onClick={next} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Weed</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
