import { useState, useMemo } from 'react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { Search } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import { hasImage } from '@/lib/imageMap';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const DIOECIOUS_CANDIDATES = [
 // Descriptions never use giveaway words (pollen, pistil, anther, male, female).
 { id: 'waterhemp', name: 'Waterhemp', maleDesc: 'Seed head is loose, soft, and feathery — tassels open up in the wind and dry quickly after shedding.', femaleDesc: 'Seed head is short, dense, and compact — packed tightly along the stem and heavy at maturity.' },
 { id: 'palmer-amaranth', name: 'Palmer Amaranth', maleDesc: 'Seed head is soft and drooping, with smooth flowers and no sharp bracts.', femaleDesc: 'Seed head is long, stiff, and bristly — covered in sharp bracts that feel prickly to touch.' },
 { id: 'Marijuana', name: 'Marijuana', maleDesc: 'Seed head is loose with hanging clusters of small greenish flowers on thin stalks.', femaleDesc: 'Seed head is dense and resinous, with tight bracts and small white threads at the stem nodes.' },
 { id: 'Shattercane_Sorghums', name: 'Shattercane', maleDesc: 'Seed head is open and loose with feathery, wispy tips that dry and drop quickly at maturity.', femaleDesc: 'Seed head is compact with tightly clustered, plump seeds that ripen reddish-brown before shattering off the stalk.' },
];

// Monoecious species — both flower types occur on the SAME plant.
// Collegiate section. Images (male.jpg / female.jpg) are pending upload;
// each species appears automatically once both files exist.
const MONOECIOUS_CANDIDATES = [
  { id: 'common-ragweed', name: 'Common Ragweed', maleDesc: 'Upright terminal spikes of small nodding green cups held above the foliage, shedding fine dust on dry days.', femaleDesc: 'Inconspicuous clusters tucked in the leaf axils below, each forming a small woody bur at maturity.' },
  { id: 'giant-ragweed', name: 'Giant Ragweed', maleDesc: 'Long, wand-like terminal racemes of tiny nodding cups at the top of the stem.', femaleDesc: 'Small clusters hidden at the leaf bases beneath the spikes, developing large ribbed, crowned burs.' },
  { id: 'common_Cocklebur', name: 'Common Cocklebur', maleDesc: 'Rounded clusters of tiny flowers at the tips of the branches that wither and drop soon after shedding.', femaleDesc: 'Clusters lower in the leaf axils that swell into hooked, spiny burs holding two seeds.' },
  { id: 'Burcucumber', name: 'Burcucumber', maleDesc: 'Long-stalked branched clusters of small greenish-white flowers held out from the vine.', femaleDesc: 'Short-stalked tight heads of a few flowers that develop into clustered spiny, bristly pods.' },
  { id: 'Redroot_pigweed', name: 'Redroot Pigweed', maleDesc: 'Upper portion of the dense terminal spike, softer to the touch and dusty when shaken.', femaleDesc: 'Lower portion of the same spike, stiff and bristly with small papery bracts covering the seeds.' },
  { id: 'Spotted_spurge', name: 'Spotted Spurge', maleDesc: 'Several tiny stalked flowers with a single stamen each, ringed inside a small cup at the leaf axil.', femaleDesc: 'One stalked flower per cup that swells and bends outward into a three-lobed capsule.' },
  { id: 'Toothed_spurge', name: 'Toothed Spurge', maleDesc: 'Clustered tiny stalked flowers inside the cup-like structure, each with one stamen and no ovary.', femaleDesc: 'A single flower per cup that hangs out on a stalk and forms a smooth three-parted capsule.' },
];

type Section = 'dioecious' | 'monoecious';

interface Round {
  id: string;
  name: string;
  maleDesc: string;
  femaleDesc: string;
  descriptionIsForMale: boolean;
}

export default function SpotTheDifferences({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [section, setSection] = useState<Section | null>(null);
  const { addBadge } = useGameProgress();

  const withImages = (list: typeof DIOECIOUS_CANDIDATES) =>
    list.filter(sp => hasImage(sp.id, 'male.jpg') && hasImage(sp.id, 'female.jpg'));

  const dioeciousAvailable = useMemo(() => withImages(DIOECIOUS_CANDIDATES), []);
  const monoeciousAvailable = useMemo(() => withImages(MONOECIOUS_CANDIDATES), []);

  const availableSpecies = section === 'monoecious' ? monoeciousAvailable : dioeciousAvailable;

  const rounds = useMemo(() => {
    if (availableSpecies.length === 0) return [];
    const pool = [...availableSpecies];
    // Show every species each level, but flip which sex is described based
    // on the level so students see genuinely new questions each time.
    const startOffset = (level - 1) % pool.length;
    const rotated = [...pool.slice(startOffset), ...pool.slice(0, startOffset)];
    return rotated.map((sp, i) => ({
      ...sp,
      descriptionIsForMale: ((level + i) % 2) === 0,
    }));
  }, [level, availableSpecies]);

  const [rIdx, setRIdx] = useState(0);
  const [answer, setAnswer] = useState<'male' | 'female' | null>(null);
  const [score, setScore] = useState(0);
  const done = rIdx >= rounds.length;

  const current = !done ? rounds[rIdx] : null;

  const handleAnswer = (choice: 'male' | 'female') => {
    if (answer !== null) return;
    setAnswer(choice);
    const correctAnswer = current!.descriptionIsForMale ? 'male' : 'female';
    if (choice === correctAnswer) setScore(s => s + 1);
  };

  const isCorrect = answer !== null && answer === (current?.descriptionIsForMale ? 'male' : 'female');
  const description = current ? (current.descriptionIsForMale ? current.maleDesc : current.femaleDesc) : '';

  const next = () => { setRIdx(r => r + 1); setAnswer(null); };
  const restart = () => { setRIdx(0); setAnswer(null); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (section === null) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
            <h1 className="font-display font-bold text-lg text-foreground">Flower Sex Detective</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Weeds carry their male and female flowers in different ways. Choose a section to practice.
          </p>

          <button
            onClick={() => setSection('dioecious')}
            disabled={dioeciousAvailable.length === 0}
            className="w-full text-left rounded-xl border border-border bg-card p-4 mb-3 disabled:opacity-50"
          >
            <p className="font-bold text-foreground">Dioecious Species</p>
            <p className="text-xs text-muted-foreground">Male and female flowers on <span className="font-semibold">separate plants</span>. {dioeciousAvailable.length} species available.</p>
          </button>

          <button
            onClick={() => setSection('monoecious')}
            disabled={monoeciousAvailable.length === 0}
            className="w-full text-left rounded-xl border border-border bg-card p-4 disabled:opacity-50"
          >
            <p className="font-bold text-foreground">Monoecious Species</p>
            <p className="text-xs text-muted-foreground">Male and female flowers on the <span className="font-semibold">same plant</span>. {monoeciousAvailable.length > 0 ? `${monoeciousAvailable.length} species available.` : 'Images coming soon.'}</p>
          </button>
        </div>
      </div>
    );
  }

  if (availableSpecies.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <Search className="w-10 h-10 text-muted-foreground mb-3" />
        <h2 className="font-display font-bold text-xl text-foreground mb-2">No Images Available Yet</h2>
        <p className="text-muted-foreground mb-4">Male and female images (male.jpg, female.jpg) need to be uploaded to weed image folders.</p>
        <button onClick={() => setSection(null)} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-bold">Go Back</button>
      </div>
    );
  }

  if (done) {
    addBadge({ gameId: 'spot-differences', gameName: 'Flower Sex Detective', level: 'HS', score, total: rounds.length });
    return <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setSection(null); startOver(); }} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">{section === 'monoecious' ? 'Monoecious' : 'Dioecious'}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{rIdx + 1}/{rounds.length}</span>
        </div>

        <p className="text-center font-bold text-foreground text-lg mb-1">{current!.name}</p>
        <p className="text-center text-xs text-muted-foreground mb-2 max-w-md mx-auto">
          {section === 'monoecious'
            ? <>Some weed species are <span className="font-semibold text-foreground">monoecious</span> — both flower types occur on the same individual plant, usually in different positions (one near the stem tips, the other lower or in the leaf axils). Learning where each type sits is key to scouting seed production.</>
            : <>Some weed species are <span className="font-semibold text-foreground">dioecious</span> — meaning male and female flowers grow on separate plants. Because each sex is built for a different reproductive job (males release pollen, females catch pollen and develop seeds), the two plants can look noticeably different even though they're the same species.</>}
        </p>
        <p className="text-center text-sm text-foreground font-medium mb-4">Read the trait clue below — does it describe the male or the female {section === 'monoecious' ? 'flowers' : 'plant'}?</p>

        {/* Description card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm font-medium text-foreground">"{description}"</p>
        </div>

        {/* Two plant images side by side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className={`w-full aspect-square rounded-xl overflow-hidden border-3 bg-secondary mb-2 cursor-pointer transition-all ${
              answer === null ? 'border-border hover:border-primary' :
              answer === 'male' ? (isCorrect ? 'border-green-500' : 'border-destructive') :
              (current!.descriptionIsForMale ? 'border-green-500' : 'border-border')
            }`}
              onClick={() => handleAnswer('male')}>
              <WeedImage weedId={current!.id} stage="male" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{section === 'monoecious' ? 'A (Male flowers)' : 'Plant A (Male)'}</span>
          </div>
          <div className="text-center">
            <div className={`w-full aspect-square rounded-xl overflow-hidden border-3 bg-secondary mb-2 cursor-pointer transition-all ${
              answer === null ? 'border-border hover:border-primary' :
              answer === 'female' ? (isCorrect ? 'border-green-500' : 'border-destructive') :
              (!current!.descriptionIsForMale ? 'border-green-500' : 'border-border')
            }`}
              onClick={() => handleAnswer('female')}>
              <WeedImage weedId={current!.id} stage="female" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{section === 'monoecious' ? 'B (Female flowers)' : 'Plant B (Female)'}</span>
          </div>
        </div>

        {/* Feedback */}
        {answer !== null && (
          <div className="text-center mb-4">
            <p className={`text-lg font-bold mb-2 ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {isCorrect ? 'Correct!' : `Incorrect — that description matches the ${current!.descriptionIsForMale ? 'male' : 'female'} ${section === 'monoecious' ? 'flowers' : 'plant'}.`}
            </p>
            <div className="bg-secondary rounded-lg p-3 text-left text-sm space-y-1 mb-3">
              <p className="text-foreground"><span className="font-bold">Male:</span> {current!.maleDesc}</p>
              <p className="text-foreground"><span className="font-bold">Female:</span> {current!.femaleDesc}</p>
            </div>
            <button onClick={next} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
              {rIdx + 1 < rounds.length ? 'Next Species' : 'See Results'}
            </button>
          </div>
        )}

        {answer === null && (
          <p className="text-center text-sm text-muted-foreground">Click the plant that matches the description above</p>
        )}
      </div>
    </div>
  );
}
