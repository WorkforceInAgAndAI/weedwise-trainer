import { highSchoolWeeds } from '@/data/gradeWeeds';
import HabitatHouses from '../shared/HabitatHouses';

/** 9-12 "Pick a House" habitat game. */
export default function HabitatMapping({ onBack }: { onBack: () => void }) {
  return <HabitatHouses weeds={highSchoolWeeds} stage="vegetative" title="Habitat House Call" onBack={onBack} />;
}
