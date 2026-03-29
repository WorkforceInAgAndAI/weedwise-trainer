import { useState } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import { Switch } from '@/components/ui/switch';
import type { useAuth } from '@/hooks/useAuth';
import { Leaf, BookOpen, Target, Sprout, Users, BookMarked, BarChart3, LayoutDashboard } from 'lucide-react';

interface Props extends GameEngine {
  onOpenLearning: () => void;
  onOpenGlossary: () => void;
  onOpenClassJoin: () => void;
  onOpenDashboard: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenCompetition: () => void;
  onOpenFarmMode: () => void;
  onOpenPracticeHub: () => void;
  studentSession: { nickname: string; className: string } | null;
  auth: ReturnType<typeof useAuth>;
}

export default function LandingPage({ setShowInstructor, onOpenLearning, onOpenGlossary, onOpenClassJoin, onOpenDashboard, onOpenAuth, onOpenFarmMode, onOpenPracticeHub, studentSession, auth }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <span className="font-display font-bold text-lg text-foreground tracking-tight">WeedID</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs">Light</span>
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              <span className="text-xs">Dark</span>
            </div>

            <div className="w-px h-5 bg-border" />

            {auth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground font-medium">
                  {auth.role === 'instructor' ? auth.instructor?.display_name : auth.user?.email?.split('@')[0]}
                </span>
                <button onClick={auth.logout}
                  className="px-3 py-1.5 rounded-md border border-border text-muted-foreground text-xs font-medium hover:bg-secondary transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={onOpenAuth}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Log In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-12 sm:py-20">
        <div className="text-center mb-12 animate-fade-in max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4 tracking-tight leading-tight">
            Midwest Weed<br />Identification Trainer
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Learn to identify 88 weed species through interactive quizzes, practice games, and farm simulation.
          </p>
        </div>

        {/* Student session indicator */}
        {studentSession && (
          <div className="mb-8 px-5 py-2.5 rounded-md bg-secondary border border-border text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{studentSession.nickname}</span>
            <span className="text-muted-foreground">in</span>
            <span className="text-primary font-medium">{studentSession.className}</span>
          </div>
        )}

        {/* Three main mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12 max-w-2xl w-full">
          <button
            onClick={onOpenLearning}
            className="group bg-card border border-border rounded-lg p-6 text-left shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-1">Learn</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Study weeds by topic with detailed guides and images</p>
          </button>
          <button
            onClick={onOpenPracticeHub}
            className="group bg-card border border-border rounded-lg p-6 text-left shadow-card hover:shadow-card-hover hover:border-accent/40 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-1">Practice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Mini-games organized by grade level, K–12</p>
          </button>
          <button
            onClick={onOpenFarmMode}
            className="group bg-card border border-border rounded-lg p-6 text-left shadow-card hover:shadow-card-hover hover:border-terracotta/40 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center mb-4 group-hover:bg-terracotta/15 transition-colors">
              <Sprout className="w-5 h-5 text-terracotta" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-1">Play</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Land Steward farm management simulation</p>
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={onOpenClassJoin}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary hover:shadow-subtle transition-all duration-200">
            <Users className="w-4 h-4 text-muted-foreground" /> Class
          </button>
          <button onClick={onOpenGlossary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary hover:shadow-subtle transition-all duration-200">
            <BookMarked className="w-4 h-4 text-muted-foreground" /> Glossary
          </button>
          <button onClick={() => setShowInstructor(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary hover:shadow-subtle transition-all duration-200">
            <BarChart3 className="w-4 h-4 text-muted-foreground" /> Stats
          </button>
          <button onClick={onOpenDashboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary hover:shadow-subtle transition-all duration-200">
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">WeedID — An educational tool for weed science</p>
      </footer>
    </div>
  );
}
