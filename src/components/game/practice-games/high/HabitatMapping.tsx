import { collegiateWeeds } from '@/data/gradeWeeds';
import HabitatHouses from '../shared/HabitatHouses';

/** Collegiate "Pick a House" habitat game — seedling photos, condensed clues. */
export default function HabitatMapping({ onBack }: { onBack: () => void }) {
  return <HabitatHouses weeds={collegiateWeeds} stage="seedling" short title="Habitat Selection Lab" onBack={onBack} />;
}
