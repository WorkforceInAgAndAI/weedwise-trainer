import { Medal, RotateCcw, ChevronRight, ArrowLeft } from 'lucide-react';

interface Props {
  level: number;
  score: number;
  total: number;
  onNextLevel: () => void;
  onStartOver: () => void;
  onBack: () => void;
  title?: string;
}

export default function LevelComplete({ level, score, total, onNextLevel, onStartOver, onBack, title }: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 60;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center shadow-card-hover animate-scale-in">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/10">
          <Medal className={`w-7 h-7 ${passed ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
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
