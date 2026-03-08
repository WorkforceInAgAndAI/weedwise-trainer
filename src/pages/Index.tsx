import { useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useStudent } from '@/contexts/StudentContext';
import { useBadgeChecker } from '@/hooks/useBadgeChecker';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/components/game/LandingPage';
import GameScreen from '@/components/game/GameScreen';
import ResultsScreen from '@/components/game/ResultsScreen';
import InstructorPanel from '@/components/game/InstructorPanel';
import InstructorDashboard from '@/components/game/InstructorDashboard';
import Glossary from '@/components/game/Glossary';
import LearningModule from '@/components/game/LearningModule';
import ClassJoinFlow from '@/components/game/ClassJoinFlow';
import StudentLeaderboard from '@/components/game/StudentLeaderboard';
import AuthModal from '@/components/game/AuthModal';
import type { GradeLevel } from '@/types/game';
import { useEffect, useRef } from 'react';

const Index = () => {
  const game = useGameEngine();
  const { session } = useStudent();
  const auth = useAuth();
  const [showLearning, setShowLearning] = useState(false);
  const [showGlossaryDirect, setShowGlossaryDirect] = useState(false);
  const [showClassJoin, setShowClassJoin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { checkBadges, loadEarned } = useBadgeChecker(session?.studentId ?? null);
  const { createSession, updateSession } = useSessionPersistence(session?.studentId ?? null);

  // Load earned badges on mount
  useEffect(() => { loadEarned(); }, [loadEarned]);

  // Persist session data periodically and check badges after each answer
  const prevCorrectRef = useRef(0);
  useEffect(() => {
    const total = game.totalCorrect + game.totalWrong;
    if (total === 0 || total === prevCorrectRef.current) return;
    prevCorrectRef.current = total;

    checkBadges({
      weedStats: game.weedStats,
      streak: game.streak,
      totalCorrect: game.totalCorrect,
      totalWrong: game.totalWrong,
      grade: game.grade,
      xp: game.xp,
    });

    updateSession({
      xp: game.xp,
      totalCorrect: game.totalCorrect,
      totalWrong: game.totalWrong,
      masteredCount: game.masteredCount,
      streak: game.streak,
      phasesCompleted: game.unlockedPhases.length,
      weedStats: game.weedStats,
    });
  }, [game.totalCorrect, game.totalWrong, game.xp, game.streak]);

  // Create session when game starts
  const handleStartGame = (g: GradeLevel) => {
    game.startGame(g);
    if (session) createSession(g);
  };

  const handleAuthComplete = (role: 'instructor' | 'student') => {
    setShowAuthModal(false);
    if (role === 'instructor') {
      setShowDashboard(true);
    }
    // Students just stay on landing page
  };

  return (
    <>
      {game.screen === 'landing' && (
        <LandingPage
          {...game}
          startGame={handleStartGame}
          onOpenLearning={() => setShowLearning(true)}
          onOpenGlossary={() => setShowGlossaryDirect(true)}
          onOpenClassJoin={() => setShowClassJoin(true)}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          studentSession={session}
          auth={auth}
        />
      )}
      {game.screen === 'playing' && <GameScreen {...game} />}
      {game.screen === 'results' && <ResultsScreen {...game} />}
      {game.showInstructor && <InstructorPanel {...game} />}
      {(game.showGlossary || showGlossaryDirect) && (
        <Glossary onClose={() => { game.setShowGlossary(false); setShowGlossaryDirect(false); }} />
      )}
      {showLearning && <LearningModule onClose={() => setShowLearning(false)} />}
      {showClassJoin && <ClassJoinFlow onClose={() => setShowClassJoin(false)} />}
      {showDashboard && <InstructorDashboard onClose={() => setShowDashboard(false)} />}
      {showLeaderboard && <StudentLeaderboard onClose={() => setShowLeaderboard(false)} />}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onAuthenticated={handleAuthComplete} />
      )}
    </>
  );
};

export default Index;
