import { useEffect } from 'react';
import { Medal, RotateCcw, ChevronRight, ArrowLeft, Trophy, Award, Star } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';

interface Props {
  level: number;
  score: number;
  total: number;
  onNextLevel: () => void;
  onStartOver: () => void;
  onBack: () => void;
  title?: string;
  gameId?: string;
  gameName?: string;
  gradeLabel?: string;
}

export default function LevelComplete({ level, score, total, onNextLevel, onStartOver, onBack, title, gameId, gameName, gradeLabel }: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 60;
  const tier = pct >= 85 ? 'gold' : pct >= 70 ? 'silver' : pct >= 50 ? 'bronze' : null;
  const { addBadge } = useGameProgress();

  useEffect(() => {
    if (gameId && gameName && tier) {
      addBadge({
        gameId: `${gameId}-lv${level}`,
        gameName: `${gameName} · Lv ${level}`,
        level: gradeLabel || 'Practice',
        score,
        total,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TierIcon = tier === 'gold' ? Trophy : tier === 'silver' ? Award : Star;
  const tierColor =
    tier === 'gold' ? 'text-yellow-600 bg-yellow-100 border-yellow-300' :
    tier === 'silver' ? 'text-slate-600 bg-slate-100 border-slate-300' :
    tier === 'bronze' ? 'text-amber-700 bg-amber-100 border-amber-300' :
    'text-muted-foreground bg-muted border-border';

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center shadow-card-hover animate-scale-in">
        <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center border-2 ${tierColor}`}>
          <TierIcon className="w-10 h-10" />
        </div>
        {tier && (
          <p className="text-xs uppercase tracking-widest font-bold mb-2 text-foreground">
            {tier} Badge Earned!
          </p>
        )}
        {title && <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>}
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          Level {level} {passed ? 'Complete!' : 'Finished'}
        </h2>
        <p className="text-lg text-foreground mb-1">{score} / {total} correct</p>
        <p className="text-sm text-muted-foreground mb-6">{pct}% accuracy</p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Next Level <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={onStartOver}
              className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Start Over
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-lg border border-border bg-card text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
