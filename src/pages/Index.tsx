import { useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import LandingPage from '@/components/game/LandingPage';
import GameScreen from '@/components/game/GameScreen';
import ResultsScreen from '@/components/game/ResultsScreen';
import InstructorPanel from '@/components/game/InstructorPanel';
import Glossary from '@/components/game/Glossary';
import LearningModule from '@/components/game/LearningModule';

const Index = () => {
  const game = useGameEngine();
  const [showLearning, setShowLearning] = useState(false);
  const [showGlossaryDirect, setShowGlossaryDirect] = useState(false);

  return (
    <>
      {game.screen === 'landing' && <LandingPage {...game} onOpenLearning={() => setShowLearning(true)} onOpenGlossary={() => setShowGlossaryDirect(true)} />}
      {game.screen === 'playing' && <GameScreen {...game} />}
      {game.screen === 'results' && <ResultsScreen {...game} />}
      {game.showInstructor && <InstructorPanel {...game} />}
      {(game.showGlossary || showGlossaryDirect) && (
        <Glossary onClose={() => { game.setShowGlossary(false); setShowGlossaryDirect(false); }} />
      )}
      {showLearning && <LearningModule onClose={() => setShowLearning(false)} />}
    </>
  );
};

export default Index;
