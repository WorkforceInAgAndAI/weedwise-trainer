import type { GameEngine } from '@/hooks/useGameEngine';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import type { GradeLevel } from '@/types/game';

const gradeCards: { grade: GradeLevel; icon: string; colorClass: string; borderClass: string }[] = [
  { grade: 'elementary', icon: '🌱', colorClass: 'text-grade-elementary', borderClass: 'border-grade-elementary hover:shadow-[0_0_20px_hsl(95_57%_46%/0.3)]' },
  { grade: 'middle', icon: '🔬', colorClass: 'text-grade-middle', borderClass: 'border-grade-middle hover:shadow-[0_0_20px_hsl(210_60%_50%/0.3)]' },
  { grade: 'high', icon: '🧪', colorClass: 'text-grade-high', borderClass: 'border-grade-high hover:shadow-[0_0_20px_hsl(46_72%_45%/0.3)]' },
];

interface Props extends GameEngine {
  onOpenLearning: () => void;
  onOpenGlossary: () => void;
  onOpenClassJoin: () => void;
  onOpenDashboard: () => void;
  onOpenLeaderboard: () => void;
  studentSession: { nickname: string; className: string } | null;
}

export default function LandingPage({ startGame, setShowInstructor, onOpenLearning, onOpenGlossary, onOpenClassJoin, onOpenDashboard, onOpenLeaderboard, studentSession }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-6xl mb-4">🌿</div>
        <h1 className="text-5xl sm:text-6xl font-display font-extrabold text-primary mb-3 tracking-tight">WeedID</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">Midwest Weed Identification Trainer</p>
        <p className="text-sm text-muted-foreground mt-2">Learn to identify 25 key weed species through gamified quizzes</p>
      </div>

      {/* Student session indicator */}
      {studentSession && (
        <div className="mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm flex items-center gap-2">
          <span className="text-primary">👤</span>
          <span className="text-foreground font-medium">{studentSession.nickname}</span>
          <span className="text-muted-foreground">in</span>
          <span className="text-primary font-medium">{studentSession.className}</span>
        </div>
      )}

      {/* Two modes */}
      <div className="flex gap-4 mb-8 max-w-md w-full">
        <button
          onClick={onOpenLearning}
          className="flex-1 bg-card border-2 border-primary/30 rounded-lg p-5 text-center hover:border-primary hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-2">📚</div>
          <div className="font-display font-bold text-foreground">Learn</div>
          <div className="text-xs text-muted-foreground mt-1">Study weeds by topic</div>
        </button>
        <button
          onClick={() => {}}
          className="flex-1 bg-card border-2 border-accent/30 rounded-lg p-5 text-center hover:border-accent hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-2">🎮</div>
          <div className="font-display font-bold text-foreground">Play</div>
          <div className="text-xs text-muted-foreground mt-1">Test your knowledge</div>
        </button>
      </div>

      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Choose Your Level to Play</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        {gradeCards.map(({ grade, icon, colorClass, borderClass }) => (
          <button
            key={grade}
            onClick={() => startGame(grade)}
            className={`bg-card border-2 ${borderClass} rounded-lg p-6 text-left transition-all duration-300 hover:scale-[1.03] animate-slide-up`}
          >
            <div className="text-4xl mb-3">{icon}</div>
            <h2 className={`text-xl font-display font-bold ${colorClass} mb-1`}>{GRADE_NAMES[grade]}</h2>
            <p className="text-sm text-muted-foreground mb-3">Grades {GRADE_RANGES[grade]}</p>
            <p className="text-xs text-muted-foreground">5 phases • 25 species • XP rewards</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onOpenClassJoin}
          className="px-5 py-2.5 rounded-lg border border-primary/50 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          🏫 Join / Create Class
        </button>
        <button
          onClick={onOpenLeaderboard}
          className="px-5 py-2.5 rounded-lg border border-accent/50 bg-accent/10 text-foreground text-sm font-medium hover:bg-accent/20 transition-colors"
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={onOpenDashboard}
          className="px-5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
        >
          📊 Instructor Dashboard
        </button>
        <button
          onClick={() => setShowInstructor(true)}
          className="px-5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
        >
          📈 Session Stats
        </button>
        <button
          onClick={onOpenGlossary}
          className="px-5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
        >
          📖 Glossary
        </button>
      </div>
    </div>
  );
}
