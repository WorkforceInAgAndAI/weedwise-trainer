import { useState } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useStudent } from "@/contexts/StudentContext";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/game/AppHeader";
import LandingPage from "@/components/game/LandingPage";
import GameScreen from "@/components/game/GameScreen";
import ResultsScreen from "@/components/game/ResultsScreen";
import InstructorPanel from "@/components/game/InstructorPanel";
import InstructorDashboard from "@/components/game/InstructorDashboard";
import Glossary from "@/components/game/Glossary";
import LearningModule from "@/components/game/LearningModule";
import ClassJoinFlow from "@/components/game/ClassJoinFlow";
import StudentLeaderboard from "@/components/game/StudentLeaderboard";
import CompetitionMode from "@/components/game/CompetitionMode";
import FarmMode from "@/components/game/FarmMode";
import PracticeHub from "@/components/game/PracticeHub";
import StatsPanel from "@/components/game/StatsPanel";
import ReferencesPage from "@/components/game/ReferencesPage";
import GameProgressSidebar from "@/components/game/GameProgressSidebar";
import type { GradeLevel } from "@/types/game";
import { useEffect, useRef } from "react";

const Index = () => {
  const game = useGameEngine();
  const { session } = useStudent();
  const auth = useAuth();
  const [showLearning, setShowLearning] = useState(false);
  const [showGlossaryDirect, setShowGlossaryDirect] = useState(false);
  const [showClassJoin, setShowClassJoin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCompetition, setShowCompetition] = useState(false);
  const [showFarmMode, setShowFarmMode] = useState(false);
  const [showPracticeHub, setShowPracticeHub] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [globalGrade, setGlobalGrade] = useState<GradeLevel>("elementary");
  const [practiceInitial, setPracticeInitial] = useState<{ grade?: string; gameId?: string } | null>(null);

  const openPractice = (grade?: string, gameId?: string) => {
    setPracticeInitial({ grade, gameId });
    setShowPracticeHub(true);
  };

  const { checkBadges, loadEarned } = useBadgeChecker(session?.studentId ?? null);
  const { createSession, updateSession } = useSessionPersistence(session?.studentId ?? null);

  useEffect(() => {
    loadEarned();
  }, [loadEarned]);

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
      phaseStats: game.phaseStats,
      grade: game.grade || undefined,
    });
  }, [game.totalCorrect, game.totalWrong, game.xp, game.streak]);

  const handleStartGame = (g: GradeLevel) => {
    game.startGame(g);
    if (session) createSession(g);
  };

  const headerProps = {
    onOpenLearning: () => setShowLearning(true),
    onOpenFarmMode: () => setShowFarmMode(true),
    onOpenPracticeHub: () => setShowPracticeHub(true),
    onOpenGlossary: () => setShowGlossaryDirect(true),
    onOpenReferences: () => setShowReferences(true),
    onOpenInstructor: () => setShowClassJoin(true),
    auth,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader {...headerProps} />
      <GameProgressSidebar />

      {game.screen === "landing" && (
        <LandingPage
          {...game}
          startGame={handleStartGame}
          onOpenLearning={() => setShowLearning(true)}
          onOpenGlossary={() => setShowGlossaryDirect(true)}
          onOpenClassJoin={() => setShowClassJoin(true)}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenCompetition={() => setShowCompetition(true)}
          onOpenFarmMode={() => setShowFarmMode(true)}
          onOpenPracticeHub={() => setShowPracticeHub(true)}
          onOpenStats={() => setShowStats(true)}
          studentSession={session}
          auth={auth}
          grade={globalGrade}
          onGradeChange={setGlobalGrade}
        />
      )}
      {game.screen === "playing" && <GameScreen {...game} />}
      {game.screen === "results" && <ResultsScreen {...game} />}
      {game.showInstructor && <InstructorPanel {...game} />}
      {(game.showGlossary || showGlossaryDirect) && (
        <Glossary
          onClose={() => {
            game.setShowGlossary(false);
            setShowGlossaryDirect(false);
          }}
        />
      )}
      {showLearning && (
        <LearningModule
          onClose={() => setShowLearning(false)}
          onOpenPractice={(grade, gameId) => {
            setShowLearning(false);
            openPractice(grade, gameId);
          }}
        />
      )}
      {showClassJoin && <ClassJoinFlow onClose={() => setShowClassJoin(false)} />}
      {showDashboard && <InstructorDashboard onClose={() => setShowDashboard(false)} />}
      {showLeaderboard && <StudentLeaderboard onClose={() => setShowLeaderboard(false)} />}
      {showCompetition && <CompetitionMode onClose={() => setShowCompetition(false)} />}
      {showFarmMode && <FarmMode onClose={() => setShowFarmMode(false)} />}
      {showPracticeHub && (
        <PracticeHub
          onClose={() => {
            setShowPracticeHub(false);
            setPracticeInitial(null);
          }}
          initialGrade={practiceInitial?.grade}
          initialGameId={practiceInitial?.gameId}
        />
      )}
      {showStats && <StatsPanel onClose={() => setShowStats(false)} auth={auth} />}
      {showReferences && <ReferencesPage onClose={() => setShowReferences(false)} />}
    </div>
  );
};

export default Index;
