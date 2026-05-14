import { useState, useMemo, useEffect, useRef } from 'react';
import { Droplets, TreePine, Link } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface NeedItem { id: string; label: string; category: string; }

const ALL_NEEDS: NeedItem[] = [
  { id: 'standing-water', label: 'Standing water', category: 'aquatic' },
  { id: 'dissolved-nutrients', label: 'Dissolved nutrients', category: 'aquatic' },
  { id: 'underwater-light', label: 'Underwater sunlight', category: 'aquatic' },
  { id: 'soil', label: 'Soil to root in', category: 'terrestrial' },
  { id: 'rain', label: 'Rainfall', category: 'terrestrial' },
  { id: 'air-space', label: 'Open air space', category: 'terrestrial' },
  { id: 'host-plant', label: 'Host plant to attach to', category: 'parasitic' },
  { id: 'steal-nutrients', label: 'Steal nutrients from host', category: 'parasitic' },
  { id: 'special-roots', label: 'Special attachment roots', category: 'parasitic' },
];

const CATEGORIES = [
  { id: 'aquatic', label: 'Aquatic Plants', Icon: Droplets, borderColor: 'border-info/50' },
  { id: 'terrestrial', label: 'Terrestrial Plants', Icon: TreePine, borderColor: 'border-success/50' },
  { id: 'parasitic', label: 'Parasitic Plants', Icon: Link, borderColor: 'border-accent/50' },
];

// All weeds are terrestrial except water smartweed which is aquatic
function getWeedCategory(w: typeof weeds[0]): string {
  if (w.id === 'water-smartweed' || w.commonName.toLowerCase() === 'water smartweed') return 'aquatic';
  return 'terrestrial';
}

const TIMER_SECONDS = 10;

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function EcologyScramble({ onBack, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [phase, setPhase] = useState<'quickID' | 'done'>('quickID');

  // Quick ID — show a need, user picks terrestrial/aquatic/parasitic in 10 seconds
  const quickIDRounds = useMemo(() => {
    const pool = shuffle([...ALL_NEEDS]);
    return pool.map(need => ({ need, correctCategory: need.category }));
  }, [level]);

  const [qIdx, setQIdx] = useState(0);
  const [qAnswer, setQAnswer] = useState<string | null>(null);
  const [qTimer, setQTimer] = useState(TIMER_SECONDS);
  const [quickScore, setQuickScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic for quick ID phase
  useEffect(() => {
    if (phase !== 'quickID' || qAnswer !== null || qIdx >= quickIDRounds.length) return;
    setQTimer(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setQTimer(prev => {
        if (prev <= 1) {
          // Time's up — mark as wrong (no answer)
          setQAnswer('timeout');
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, qIdx, qAnswer, quickIDRounds.length]);

  const handleQuickAnswer = (catId: string) => {
    if (qAnswer !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setQAnswer(catId);
    if (catId === quickIDRounds[qIdx].correctCategory) {
      setQuickScore(s => s + 1);
    }
  };

  const nextQuickRound = () => {
    if (qIdx + 1 >= quickIDRounds.length) {
      setPhase('done');
    } else {
      setQIdx(i => i + 1);
      setQAnswer(null);
    }
  };

  const restart = () => {
    setPhase('quickID'); setQIdx(0); setQAnswer(null); setQuickScore(0);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (phase === 'done') {
    const total = quickIDRounds.length;
    addBadge({ gameId: 'ecology-scramble', gameName: 'Ecology Scramble', level: 'K-5', score: quickScore, total });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <TreePine className="w-10 h-10 text-primary mb-3" />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Ecology Expert!</h2>
        <p className="text-foreground mb-6">Quick ID: {quickScore}/{quickIDRounds.length}</p>
        <LevelComplete level={level} score={quickScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  // Quick ID
  if (qIdx < quickIDRounds.length) {
    const round = quickIDRounds[qIdx];
    const isCorrect = qAnswer !== null && qAnswer === round.correctCategory;
    const isTimeout = qAnswer === 'timeout';
    const answered = qAnswer !== null;
    const correctLabel = CATEGORIES.find(c => c.id === round.correctCategory)?.label;

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Quick ID</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{qIdx + 1}/{quickIDRounds.length}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
          <FarmerGuide
            gradeLabel={gradeLabel}
            tone={answered ? (isCorrect ? 'correct' : 'wrong') : 'hint'}
            className="mb-4 w-full"
            message={
              answered
                ? isCorrect
                  ? `Bullseye! "${round.need.label}" lives with ${correctLabel?.toLowerCase()}.`
                  : `Not quite — "${round.need.label}" belongs with ${correctLabel}. ${round.correctCategory === 'aquatic' ? 'Think water plants like duckweed.' : round.correctCategory === 'parasitic' ? 'Parasitic plants steal from a host.' : 'Most weeds in your fields live on land.'}`
                : `Read the survival need, then tap the plant type that needs it. You've got 10 seconds — go!`
            }
          />
          {/* Timer bar */}
          <div className="w-full h-3 bg-secondary rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${qTimer <= 3 ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${(qTimer / TIMER_SECONDS) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{qTimer}s remaining</p>

          {/* Need card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6 text-center w-full">
            <p className="text-lg font-bold text-foreground">{round.need.label}</p>
            <p className="text-sm text-muted-foreground mt-1">Is this need aquatic, terrestrial, or parasitic?</p>
          </div>

          {/* Category buttons */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {CATEGORIES.map(cat => {
              const CatIcon = cat.Icon;
              let cls = 'border-border bg-card';
              if (answered && cat.id === round.correctCategory) cls = 'border-green-500 bg-green-500/20';
              else if (answered && qAnswer === cat.id && cat.id !== round.correctCategory) cls = 'border-destructive bg-destructive/20';
              return (
                <button key={cat.id} onClick={() => handleQuickAnswer(cat.id)}
                  disabled={answered}
                  className={`rounded-xl border-2 p-4 text-center transition-all flex flex-col items-center ${cls} ${!answered ? 'hover:border-primary cursor-pointer' : ''}`}>
                  <CatIcon className="w-6 h-6 text-foreground mb-1" />
                  <span className="font-bold text-foreground text-xs">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className="text-center w-full">
              {isTimeout && (
                <p className="text-sm text-destructive font-bold mb-3">Time's up!</p>
              )}
              <button onClick={nextQuickRound} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
                {qIdx + 1 < quickIDRounds.length ? 'Next' : 'See Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
