import { middleSchoolWeeds } from '@/data/gradeWeeds';
import HabitatHouses from '../shared/HabitatHouses';

/** 6-8 "Pick a House" habitat game. */
export default function HabitatMapping({ onBack }: { onBack: () => void }) {
  return <HabitatHouses weeds={middleSchoolWeeds} stage="vegetative" title="Pick Your House" onBack={onBack} />;
}
