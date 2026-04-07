import { useState, useMemo, useEffect, useRef } from 'react';
import { Droplets, TreePine, Link } from 'lucide-react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

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

export default function EcologyScramble({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const items = useMemo(() => shuffle([...ALL_NEEDS]), []);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showSortAnswers, setShowSortAnswers] = useState(false);

  const [phase, setPhase] = useState<'sort' | 'quickID' | 'done'>('sort');

  // Phase 2: Quick ID — show a need, user picks terrestrial/aquatic/parasitic in 10 seconds
  const quickIDRounds = useMemo(() => {
    const pool = shuffle([...ALL_NEEDS]);
    // Build 9 rounds (3 of each category)
    return pool.map(need => ({
      need,
      correctCategory: need.category,
    }));
  }, [level]);

  const [qIdx, setQIdx] = useState(0);
  const [qAnswer, setQAnswer] = useState<string | null>(null);
  const [qTimer, setQTimer] = useState(TIMER_SECONDS);
  const [sortScore, setSortScore] = useState(0);
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

  const unplaced = items.filter(i => !placements[i.id]);
  const allPlaced = Object.keys(placements).length === items.length;

  const handleCatClick = (catId: string) => {
    if (!selected || checked) return;
    setPlacements(p => ({ ...p, [selected]: catId }));
    setSelected(null);
  };

  const handleRemove = (itemId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[itemId]; return n; });
  };

  const correctCount = checked ? items.filter(i => placements[i.id] === i.category).length : 0;

  const handleCheck = () => {
    setChecked(true);
    setSortScore(items.filter(i => placements[i.id] === i.category).length);
  };

  const goToQuickPhase = () => {
    setPhase('quickID');
    setQIdx(0);
    setQAnswer(null);
    setQuickScore(0);
  };

  const restart = () => {
    setPlacements({}); setSelected(null); setChecked(false); setShowSortAnswers(false);
    setPhase('sort'); setQIdx(0); setQAnswer(null);
    setSortScore(0); setQuickScore(0);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (phase === 'done') {
    const total = items.length + quickIDRounds.length;
    const finalScore = sortScore + quickScore;
    addBadge({ gameId: 'ecology-scramble', gameName: 'Ecology Scramble', level: 'K-5', score: finalScore, total });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <TreePine className="w-10 h-10 text-primary mb-3" />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Ecology Expert!</h2>
        <p className="text-foreground mb-2">Sorting: {sortScore}/{items.length}</p>
        <p className="text-foreground mb-6">Quick ID: {quickScore}/{quickIDRounds.length}</p>
        <LevelComplete level={level} score={finalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  // Phase 2: Quick ID
  if (phase === 'quickID' && qIdx < quickIDRounds.length) {
    const round = quickIDRounds[qIdx];
    const isCorrect = qAnswer !== null && qAnswer === round.correctCategory;
    const isTimeout = qAnswer === 'timeout';
    const answered = qAnswer !== null;

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Quick ID</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{qIdx + 1}/{quickIDRounds.length}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
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
              <p className={`text-lg font-bold mb-3 ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
                {isTimeout ? `Time's up! The answer is ${CATEGORIES.find(c => c.id === round.correctCategory)?.label}.` :
                  isCorrect ? 'Correct!' : `Incorrect -- the answer is ${CATEGORIES.find(c => c.id === round.correctCategory)?.label}.`}
              </p>
              <button onClick={nextQuickRound} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
                {qIdx + 1 < quickIDRounds.length ? 'Next' : 'See Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Phase 1 answer review
  if (showSortAnswers) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Sorting Review</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto">
          <p className={`text-center text-lg font-bold mb-4 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>
            {correctCount}/{items.length} correct!
          </p>
          <div className="space-y-2 mb-4">
            {items.map(i => {
              const userCat = placements[i.id];
              const isCorrect = userCat === i.category;
              return (
                <div key={i.id} className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium ${isCorrect ? 'border-green-500 bg-green-500/20 text-foreground' : 'border-destructive bg-destructive/20 text-foreground'}`}>
                  <span className="font-bold">{i.label}</span>
                  {!isCorrect && <span className="text-xs text-destructive ml-2">(You: {CATEGORIES.find(c => c.id === userCat)?.label})</span>}
                  <span className="text-xs text-green-600 ml-2">→ {CATEGORIES.find(c => c.id === i.category)?.label}</span>
                </div>
              );
            })}
          </div>
          <button onClick={goToQuickPhase} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Next: Quick Category ID →
          </button>
        </div>
      </div>
    );
  }

  // Phase 1: Sort needs into categories
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Ecology Scramble</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Sort each survival need into the correct plant type</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.Icon;
            return (
              <button key={cat.id} onClick={() => handleCatClick(cat.id)}
                className={`rounded-xl border-2 ${cat.borderColor} p-3 text-center transition-all flex flex-col items-center ${selected ? 'hover:bg-secondary cursor-pointer' : ''}`}>
                <CatIcon className="w-5 h-5 text-foreground mb-1" />
                <span className="font-bold text-foreground text-xs">{cat.label}</span>
                <div className="mt-2 space-y-1 min-h-[60px] w-full">
                  {items.filter(i => placements[i.id] === cat.id).map(i => (
                    <div key={i.id} className={`flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                      checked ? (i.category === cat.id ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'
                    }`}>
                      <span className="truncate">{i.label}</span>
                      {!checked && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemove(i.id); }} className="text-muted-foreground hover:text-foreground shrink-0">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        {unplaced.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {unplaced.map(i => (
              <button key={i.id} onClick={() => setSelected(selected === i.id ? null : i.id)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected === i.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                {i.label}
              </button>
            ))}
          </div>
        )}
        {allPlaced && !checked && (
          <button onClick={handleCheck} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
        )}
        {checked && (
          <div className="text-center mt-4">
            <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>
              {correctCount} / {items.length} correct!
            </p>
            <button onClick={() => setShowSortAnswers(true)} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              Review Answers →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
