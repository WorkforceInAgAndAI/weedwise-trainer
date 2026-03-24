import { useState } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import type { GradeLevel } from '@/types/game';
import { Switch } from '@/components/ui/switch';
import type { useAuth } from '@/hooks/useAuth';

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
  onOpenAuth: () => void;
  onOpenCompetition: () => void;
  onOpenFarmMode: () => void;
  studentSession: { nickname: string; className: string } | null;
  auth: ReturnType<typeof useAuth>;
}

export default function LandingPage({ startGame, setShowInstructor, onOpenLearning, onOpenGlossary, onOpenClassJoin, onOpenDashboard, onOpenLeaderboard, onOpenAuth, onOpenCompetition, onOpenFarmMode, studentSession, auth }: Props) {
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    if (!document.documentElement.classList.contains('light') && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('light');
      return true;
    }
    return document.documentElement.classList.contains('light');
  });

  const toggleTheme = (checked: boolean) => {
    setIsLightMode(checked);
    if (checked) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      {/* Top bar: theme toggle + auth */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">🌙</span>
        <Switch checked={isLightMode} onCheckedChange={toggleTheme} />
        <span className="text-sm text-muted-foreground">☀️</span>

        <div className="w-px h-6 bg-border mx-1" />

        {auth.isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground font-medium">
              {auth.role === 'instructor' ? `📊 ${auth.instructor?.display_name}` : `👤 ${auth.user?.email?.split('@')[0]}`}
            </span>
            <button onClick={auth.logout}
              className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Log In
          </button>
        )}
      </div>

      <div className="text-center mb-8 animate-fade-in">
        <div className="text-6xl mb-4">🌿</div>
        <h1 className="text-5xl sm:text-6xl font-display font-extrabold text-primary mb-3 tracking-tight">WeedID</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">Midwest Weed Identification Trainer</p>
        <p className="text-sm text-muted-foreground mt-2">Learn to identify 88 weed species through gamified quizzes & farm simulation</p>
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

      {/* Three main mode cards */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl w-full">
        <button
          onClick={onOpenLearning}
          className="bg-card border-2 border-primary/30 rounded-xl p-5 text-center hover:border-primary hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl sm:text-4xl mb-2">📚</div>
          <div className="font-display font-bold text-sm sm:text-base text-foreground">Learn</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Study weeds by topic</div>
        </button>
        <button
          onClick={() => setShowGradePicker(true)}
          className="bg-card border-2 border-accent/30 rounded-xl p-5 text-center hover:border-accent hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl sm:text-4xl mb-2">🎯</div>
          <div className="font-display font-bold text-sm sm:text-base text-foreground">Practice</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Quiz & mini-games</div>
        </button>
        <button
          onClick={onOpenFarmMode}
          className="bg-card border-2 border-grade-high/30 rounded-xl p-5 text-center hover:border-grade-high hover:scale-[1.02] transition-all relative overflow-hidden"
        >
          <div className="text-3xl sm:text-4xl mb-2">🌾</div>
          <div className="font-display font-bold text-sm sm:text-base text-foreground">Play</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Manage your farm</div>
        </button>
      </div>

      {/* Grade picker modal */}
      {showGradePicker && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGradePicker(false)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-foreground">Choose Your Level</h2>
              <button onClick={() => setShowGradePicker(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="grid gap-4">
              {gradeCards.map(({ grade, icon, colorClass, borderClass }) => (
                <button
                  key={grade}
                  onClick={() => { setShowGradePicker(false); startGame(grade); }}
                  className={`bg-secondary/50 border-2 ${borderClass} rounded-lg p-5 text-left transition-all duration-300 hover:scale-[1.02] flex items-center gap-4`}
                >
                  <div className="text-4xl">{icon}</div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-display font-bold ${colorClass}`}>{GRADE_NAMES[grade]}</h3>
                    <p className="text-sm text-muted-foreground">Grades {GRADE_RANGES[grade]}</p>
                    <p className="text-xs text-muted-foreground mt-1">5 phases • 88 species • XP rewards</p>
                  </div>
                  <span className="text-muted-foreground text-lg">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organized secondary actions */}
      <div className="max-w-xl w-full space-y-3">
        {/* Community row */}
        <div className="flex gap-2 justify-center">
          <button onClick={onOpenClassJoin}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <span>🏫</span> <span>Class</span>
          </button>
          <button onClick={onOpenCompetition}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <span>⚔️</span> <span>Compete</span>
          </button>
          <button onClick={onOpenLeaderboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <span>🏆</span> <span>Leaderboard</span>
          </button>
        </div>
        {/* Tools row */}
        <div className="flex gap-2 justify-center">
          <button onClick={onOpenGlossary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <span>📖</span> <span>Glossary</span>
          </button>
          <button onClick={() => setShowInstructor(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <span>📈</span> <span>Stats</span>
          </button>
          <button onClick={onOpenDashboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors">
            <span>📊</span> <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
