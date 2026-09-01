import { highSchoolWeeds } from '@/data/gradeWeeds';
import WeedControl from './WeedControl';

/**
 * 9-12 "Control Method Matching" game — plays exactly like the 6-8 "Weed
 * Control" game (src/components/game/practice-games/middle/WeedControl.tsx)
 * but draws from the 9-12 species pool.
 */
export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
  return <WeedControl onBack={onBack} weedPool={highSchoolWeeds} title="Control Method Matching" />;
}
