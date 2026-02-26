import { useGameEngine } from '@/hooks/useGameEngine';
import LandingPage from '@/components/game/LandingPage';
import GameScreen from '@/components/game/GameScreen';
import ResultsScreen from '@/components/game/ResultsScreen';
import InstructorPanel from '@/components/game/InstructorPanel';
import Glossary from '@/components/game/Glossary';

const Index = () => {
  const game = useGameEngine();

  return (
    <>
      {game.screen === 'landing' && <LandingPage {...game} />}
      {game.screen === 'playing' && <GameScreen {...game} />}
      {game.screen === 'results' && <ResultsScreen {...game} />}
      {game.showInstructor && <InstructorPanel {...game} />}
      {game.showGlossary && <Glossary {...game} />}
    </>
  );
};

export default Index;
