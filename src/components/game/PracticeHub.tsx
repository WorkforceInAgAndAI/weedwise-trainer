import { useEffect, useState } from 'react';
import HomeButton from './HomeButton';
import { useGameProgress } from '@/contexts/GameProgressContext';
import FarmerGuide from './FarmerGuide';
import { Medal, Trophy, Award, Star } from 'lucide-react';
import {
 ArrowLeft, Play, Leaf, Microscope, FlaskConical,
 Tag, Palette, Layers, Eye, Sprout, ArrowUpDown,
 RefreshCw, Globe, Map, Search, Wind, AlertTriangle,
 MapPin, ShieldAlert, Wrench, Target, TrendingUp,
 Droplets, ZoomIn, GraduationCap, Scan, Moon,
 Swords, ClipboardList, Footprints, Stethoscope,
 FlaskRound
} from 'lucide-react';

import WeedOrCrop from './practice-games/k5/WeedOrCrop';
import LeafArtist from './practice-games/k5/LeafArtist';
import TaxonomyTower from './practice-games/k5/TaxonomyTower';
import K5LookAlike from './practice-games/k5/K5LookAlike';
import NameTheWeed from './practice-games/k5/NameTheWeed';
import LifeStagesSequence from './practice-games/k5/LifeStagesSequence';
import LifeCycleMatching from './practice-games/k5/LifeCycleMatching';
import EcologyScramble from './practice-games/k5/EcologyScramble';
import HabitatMapping from './practice-games/k5/HabitatMapping';
import WeedSeedBanks from './practice-games/k5/WeedSeedBanks';
import WeedTravel from './practice-games/k5/WeedTravel';
import InvasiveMatch from './practice-games/k5/InvasiveMatch';
import InvasiveID from './practice-games/k5/InvasiveID';
import SafeVsToxic from './practice-games/k5/SafeVsToxic';
import WeedControl from './practice-games/k5/WeedControl';

import MSNameTheWeed from './practice-games/middle/NameTheWeed';
import MSTaxonomyTower from './practice-games/middle/TaxonomyTower';
import FieldScout from './practice-games/middle/FieldScout';
import PestID from './practice-games/middle/PestID';
import MSHabitatMapping from './practice-games/middle/HabitatMapping';
import WeedOrigins from './practice-games/middle/WeedOrigins';
import NativeLookAlike from './practice-games/middle/NativeLookAlike';
import WeedCompetitors from './practice-games/middle/WeedCompetitors';
import InvasiveQuiz from './practice-games/middle/InvasiveQuiz';
import MSSafeVsToxic from './practice-games/middle/SafeVsToxic';
import LifeStageControl from './practice-games/middle/LifeStageControl';
import MSLifeCycleMatching from './practice-games/middle/LifeCycleMatching';
import EconomicThreshold from './practice-games/middle/EconomicThreshold';
import MSWeedControl from './practice-games/middle/WeedControl';
import ControlMethodMatching from './practice-games/middle/ControlMethodMatching';
import HerbicideApplicator from './practice-games/middle/HerbicideApplicator';
import LiguleLens from './practice-games/middle/LiguleLens';

import HSNameTheWeed from './practice-games/high/NameTheWeed';
import HSTaxonomyTower from './practice-games/high/TaxonomyTower';
import SpotTheDifferences from './practice-games/high/SpotTheDifferences';
import HSHabitatMapping from './practice-games/high/HabitatMapping';
import InvasiveHabitatMapping from './practice-games/high/InvasiveHabitatMapping';
import FieldScoutTools from './practice-games/high/FieldScoutTools';
import LifeCycleSort from './practice-games/high/LifeCycleSort';
import SleepySeeds from './practice-games/high/SleepySeeds';
import AllelopathyAttack from './practice-games/high/AllelopathyAttack';
import FormYourFarm from './practice-games/high/FormYourFarm';
import HSWeedControl from './practice-games/high/WeedControl';
import HSControlMethodMatching from './practice-games/high/ControlMethodMatching';
import CropDoctor from './practice-games/high/CropDoctor';

import LifeStageMaze from './practice-games/high/LifeStageMaze';

interface GameDef {
 id: string;
 name: string;
 Icon: React.ComponentType<{ className?: string }>;
 category: string;
 description: string;
 howToPlay: string;
 component: React.ComponentType<{ onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }>;
}

// Maps a Practice game id to the related Learning Module topic id.
const GAME_TO_TOPIC: Record<string, string> = {
  // K-5
  'weed-or-crop': 'names', 'name-the-weed': 'names', 'leaf-artist': 'monocot-dicot',
  'taxonomy-tower': 'monocot-dicot', 'look-alike': 'look-alikes', 'life-stages': 'life-stages',
  'life-cycle-match': 'life-cycles', 'ecology-scramble': 'ecology', 'habitat-mapping': 'habitats',
  'seed-banks': 'seeds', 'weed-travel': 'seeds', 'invasive-match': 'native-introduced',
  'invasive-id': 'native-introduced', 'safe-vs-toxic': 'safety', 'weed-control': 'control-methods',
  // 6-8
  'ms-name-weed': 'names', 'ms-taxonomy': 'taxonomy', 'field-scout': 'field-scouting',
  'pest-id': 'ecology', 'ms-habitat': 'habitats', 'weed-origins': 'native-introduced',
  'native-lookalike': 'look-alikes', 'weed-competitors': 'weed-competitors',
  'invasive-quiz': 'native-introduced', 'ms-safe-toxic': 'safety',
  'life-stage-control': 'life-stages', 'ms-lifecycle': 'life-cycles',
  'economic-threshold': 'economic-threshold', 'ms-weed-control': 'control-methods',
  'control-matching': 'herbicide-moa', 'herbicide-applicator': 'herbicide-moa',
  'ligule-lens': 'monocot-dicot',
  // 9-12
  'hs-name-weed': 'names', 'hs-taxonomy': 'taxonomy', 'spot-differences': 'dioecious',
  'hs-habitat': 'habitats', 'invasive-habitat': 'native-introduced',
  'hs-field-scout': 'field-scouting', 'hs-lifecycle': 'life-cycles',
  'sleepy-seeds': 'seed-dormancy', 'allelopathy': 'allelopathy',
  'form-farm': 'economic-threshold', 'hs-weed-control': 'control-methods',
  'hs-control-match': 'herbicide-moa', 'crop-doctor': 'crop-injury',
  'life-stage-maze': 'life-stage-control',
};

const k5Games: GameDef[] = [
 { id: 'weed-or-crop', name: 'Weed or Crop', Icon: Sprout, category: 'Identification', description: 'A plant image appears — is it a weed or a crop? Think fast!', howToPlay: 'You have 10 seconds per round to decide if the plant shown is a weed or a crop. Tap your answer before time runs out!', component: WeedOrCrop },
 { id: 'leaf-artist', name: 'Leaf Detective', Icon: Palette, category: 'Leaf Morphology', description: 'Identify leaf venation: parallel or netted?', howToPlay: 'Look closely at each leaf. Decide if its veins are parallel (running side by side, like grass) or netted (branching like a net). Track your finds in the side panel.', component: LeafArtist },
 { id: 'taxonomy-tower', name: 'Monocot or Dicot?', Icon: Layers, category: 'Taxonomy', description: 'Look at two weeds and identify which is a monocot and which is a dicot.', howToPlay: 'Two weeds are shown side by side. Identify which is the monocot and which is the dicot, then answer a follow-up question about monocot and dicot traits.', component: TaxonomyTower },
 { id: 'look-alike', name: 'Look-Alike Challenge', Icon: Eye, category: 'Look-Alikes', description: 'Can you tell similar-looking plants apart?', howToPlay: 'Two similar weeds are shown side by side. Read the clue and pick which one matches the description.', component: K5LookAlike },
 { id: 'name-the-weed', name: 'Name the Weed', Icon: Tag, category: 'Names', description: 'Identify weeds by their image and description.', howToPlay: 'Look at the weed image and read the clue. Choose the correct common name from four options.', component: NameTheWeed },
 { id: 'life-stages', name: 'Life Stages Sequence', Icon: ArrowUpDown, category: 'Life Stages', description: 'Put weed growth stages in the right order.', howToPlay: 'Images of the same weed at different life stages are jumbled. Drag them into correct order.', component: LifeStagesSequence },
 { id: 'life-cycle-match', name: 'Life Cycle Matching', Icon: RefreshCw, category: 'Life Cycles', description: 'Sort weeds into their correct life cycle category.', howToPlay: 'Drag each weed into the Annual, Biennial, or Perennial bin. Review any mistakes after each round.', component: LifeCycleMatching },
 { id: 'ecology-scramble', name: 'Ecology Scramble', Icon: Globe, category: 'Ecology', description: 'Sort survival needs and quickly categorize them as aquatic, terrestrial, or parasitic.', howToPlay: 'First, sort survival needs into the correct plant type. Then, needs appear one at a time — you have 10 seconds to classify each as terrestrial, aquatic, or parasitic.', component: EcologyScramble },
 { id: 'habitat-mapping', name: 'Habitat Mapping', Icon: Map, category: 'Habitats', description: 'Sort weeds into the correct habitat area.', howToPlay: 'Select a weed and place it into the correct habitat — cropland, roadside, wetland, or pasture. Review any mistakes after each round.', component: HabitatMapping },
 { id: 'seed-banks', name: 'Weed Seed Banks', Icon: Search, category: 'Seed Banks', description: 'Sort seeds and predict how many are hiding in the field.', howToPlay: 'Sort seed images into columns by species, then predict the count for each type. Click a seed for a hint!', component: WeedSeedBanks },
 { id: 'weed-travel', name: 'Weed Travel', Icon: Wind, category: 'Seed Dispersal', description: 'Help a seed travel to a new location.', howToPlay: 'You are a seed! Choose the right dispersal method to overcome each obstacle on your journey.', component: WeedTravel },
 { id: 'invasive-match', name: 'Invasive Match', Icon: AlertTriangle, category: 'Invasive Weeds', description: 'Match invasive weeds to the damage they cause.', howToPlay: 'Connect each invasive weed with the negative effect it has on the environment.', component: InvasiveMatch },
 { id: 'invasive-id', name: 'Invasive ID', Icon: MapPin, category: 'Origin', description: 'Is this plant native or invasive?', howToPlay: 'Given a weed, its origin, and where it was found, decide if it is native or invasive.', component: InvasiveID },
 { id: 'safe-vs-toxic', name: 'Safe or Toxic?', Icon: ShieldAlert, category: 'Safety', description: 'Can you tell which weeds are toxic?', howToPlay: 'A group of weeds appears — identify which one is toxic, learn why it is dangerous, then decide how to safely manage it.', component: SafeVsToxic },
 { id: 'weed-control', name: 'Weed Control', Icon: Wrench, category: 'Control Methods', description: 'You are the agronomist — manage weeds in the field.', howToPlay: 'Weeds appear in a field. Click each, identify it, then choose the right control method.', component: WeedControl },
];

const middleGames: GameDef[] = [
 { id: 'ms-name-weed', name: 'Name the Weed', Icon: Tag, category: 'Names', description: 'Identify weeds from images and descriptions.', howToPlay: 'Look at the weed image and read the clue. Choose the correct name.', component: MSNameTheWeed },
 { id: 'ms-taxonomy', name: 'Taxonomy Tower', Icon: Layers, category: 'Taxonomy', description: 'Climb the Plant Kingdom tower using a dichotomous key.', howToPlay: 'Navigate a dichotomous key tower to identify plant families.', component: MSTaxonomyTower },
 { id: 'field-scout', name: 'Field Scout', Icon: Footprints, category: 'Field Methods', description: 'You are a hired scout — find and count weeds for pay.', howToPlay: 'Walk through fields, identify weeds, and earn money. Correct IDs earn $50, wrong ones earn $10. Complete 10 rounds!', component: FieldScout },
 { id: 'pest-id', name: 'Pest ID', Icon: Microscope, category: 'Ecology', description: 'Classify weeds as aquatic, terrestrial, or parasitic.', howToPlay: 'Look at the weed and its habitat, classify it, then select its survival needs from a word bank.', component: PestID },
 { id: 'ms-habitat', name: 'Habitat Mapping', Icon: Map, category: 'Habitats', description: 'Place weeds in temperate, arid, tropical, or wetland regions.', howToPlay: 'Sort weeds into the correct habitat region. Review any incorrect placements after each round.', component: MSHabitatMapping },
 { id: 'weed-origins', name: 'Weed Origins', Icon: Globe, category: 'Origin', description: 'Identify weed continent of origin.', howToPlay: 'A weed appears over a world map. Click the continent where it came from.', component: WeedOrigins },
 { id: 'native-lookalike', name: 'Native or Introduced?', Icon: Eye, category: 'Look-Alikes', description: 'Sort look-alike pairs into Native or Introduced.', howToPlay: 'Two similar plants are shown. Drag each to the Native or Introduced box.', component: NativeLookAlike },
 { id: 'weed-competitors', name: 'Weed Competitors', Icon: Swords, category: 'Competition', description: 'Compete as a weed for resources against rivals.', howToPlay: 'Read the competitor intel, then make strategic decisions about leaves, roots, and reproduction to out-compete your opponent.', component: WeedCompetitors },
 { id: 'invasive-quiz', name: 'Invasive Travelers', Icon: ClipboardList, category: 'Invasive Weeds', description: 'Discover how invasive weeds traveled to North America.', howToPlay: 'An invasive weed is shown. Learn its arrival story and identify how it was introduced.', component: InvasiveQuiz },
 { id: 'ms-safe-toxic', name: 'Safe or Toxic?', Icon: ShieldAlert, category: 'Safety', description: 'Can you tell which weeds are toxic?', howToPlay: 'A group of weeds appears — identify which one is toxic, learn why it is dangerous, then decide how to safely manage it.', component: MSSafeVsToxic },
 { id: 'life-stage-control', name: 'Life Stage Control', Icon: Target, category: 'Life Stages', description: 'Identify the growth stage, the weed, and choose the best management.', howToPlay: 'A weed appears at a specific life stage. First identify the stage, then the weed, then pick the best control method.', component: LifeStageControl },
 { id: 'ms-lifecycle', name: 'Life Cycle Sort', Icon: RefreshCw, category: 'Life Cycles', description: 'Sort weeds into Annual, Biennial, or Perennial categories.', howToPlay: 'Sort weed images into the correct life cycle column. Review any mistakes after each round.', component: MSLifeCycleMatching },
 { id: 'economic-threshold', name: 'Economic Threshold', Icon: TrendingUp, category: 'Thresholds', description: 'Scout fields, identify weeds, and decide if they exceed the economic threshold.', howToPlay: 'Count weeds in the field, identify them by name, check if the count exceeds the threshold, and choose management if needed. Complete 3 fields per level.', component: EconomicThreshold },
 { id: 'ms-weed-control', name: 'Weed Control', Icon: Wrench, category: 'Control Methods', description: 'Manage weeds in the field using the right techniques.', howToPlay: 'Click weeds in the field, identify them, then choose the right control method. Review your answers after each round.', component: MSWeedControl },
 { id: 'control-matching', name: 'Control Method Matching', Icon: FlaskConical, category: 'Chemical Control', description: 'Match herbicide groups to the weeds they target.', howToPlay: 'Identify grass vs broadleaf, then pick the correct herbicide group.', component: ControlMethodMatching },
 { id: 'herbicide-applicator', name: 'Herbicide Applicator', Icon: Droplets, category: 'Herbicide Resistance', description: 'Choose the right herbicide and rate for each weed.', howToPlay: 'Select a weed in the corn field, then use the sidebar to choose the herbicide type and application rate. Watch for resistance buildup!', component: HerbicideApplicator },
 { id: 'ligule-lens', name: 'Ligule Lens', Icon: ZoomIn, category: 'Grass ID', description: 'Zoom in on ligules to identify grass species.', howToPlay: 'Study the zoomed-in ligule image and pick the correct grass species.', component: LiguleLens },
];

const highGames: GameDef[] = [
 { id: 'hs-name-weed', name: 'Name the Weed', Icon: GraduationCap, category: 'Scientific Names', description: 'Identify weeds by their scientific name.', howToPlay: 'Look at the image and traits, then choose the correct scientific name.', component: HSNameTheWeed },
 { id: 'hs-taxonomy', name: 'Taxonomy Tower', Icon: Layers, category: 'Taxonomy', description: 'Navigate genus and species using a dichotomous key.', howToPlay: 'Climb the tower from Kingdom to Species.', component: HSTaxonomyTower },
 { id: 'spot-differences', name: 'Spot the Differences', Icon: Search, category: 'Intra-species', description: 'Find differences between male and female plants.', howToPlay: 'Compare male and female plants and tap each difference.', component: SpotTheDifferences },
 { id: 'hs-habitat', name: 'Habitat Mapping', Icon: Map, category: 'Habitats', description: 'Sort weeds into the correct habitat region.', howToPlay: 'Select a weed and place it into the correct habitat zone — temperate, arid, tropical, or wetland. Review any mistakes after each round.', component: HSHabitatMapping },
 { id: 'invasive-habitat', name: 'Invasive ID', Icon: AlertTriangle, category: 'Invasive Species', description: 'Identify invasive weeds, their origin, and how they arrived.', howToPlay: 'First identify the weed, then select its continent of origin on the world map, then choose how it was introduced.', component: InvasiveHabitatMapping },
 { id: 'hs-field-scout', name: 'Field Scout Tools', Icon: Scan, category: 'Scouting Tools', description: 'Choose the right scouting tool for each field.', howToPlay: 'Evaluate field conditions and select from drones, rovers, manual scouting, or satellite imagery.', component: FieldScoutTools },
 { id: 'hs-lifecycle', name: 'Life Cycle Sort', Icon: ArrowUpDown, category: 'Life Cycles', description: 'Sort winter annuals, summer annuals, and more.', howToPlay: 'Classify weeds into winter annual, summer annual, perennial, or biennial. Review any mistakes after each round.', component: LifeCycleSort },
 { id: 'sleepy-seeds', name: 'Sleepy Seeds', Icon: Moon, category: 'Seed Dormancy', description: 'Identify seeds and choose the right dormancy strategy to survive.', howToPlay: 'First identify the seed, then face an environmental challenge and pick the best dormancy mechanism to survive.', component: SleepySeeds },
 { id: 'allelopathy', name: 'Allelopathy Attack', Icon: Swords, category: 'Allelopathy', description: 'Pick your weed and use chemical warfare to suppress competitors.', howToPlay: 'Choose a weed to play as, learn its characteristics, then select the best allelopathy strategy for each enemy encounter.', component: AllelopathyAttack },
 { id: 'form-farm', name: 'Form Your Farm', Icon: Leaf, category: 'Economic Thresholds', description: 'Design a farm and defend it against weeds.', howToPlay: 'Choose your crop, season, and threshold. Decide which weeds to treat, select management methods for each, then review your season results.', component: FormYourFarm },
 { id: 'hs-weed-control', name: 'Weed Control', Icon: Wrench, category: 'Control Methods', description: 'Manage weeds in the field as an agronomist.', howToPlay: 'Click weeds in the field, identify them, choose the right control method. Review your answers after each round.', component: HSWeedControl },
 { id: 'hs-control-match', name: 'Mode of Action Match', Icon: FlaskRound, category: 'Modes of Action', description: 'Match herbicides to their modes and sites of action.', howToPlay: 'For each weed, select the correct herbicide mode of action. Review your answers at the end of each round.', component: HSControlMethodMatching },
 { id: 'crop-doctor', name: 'Crop Doctor', Icon: Stethoscope, category: 'Injury Symptoms', description: 'Diagnose herbicide injury symptoms on crops.', howToPlay: 'Read the crop symptom description and identify the herbicide group that caused it. Review your diagnoses at the end.', component: CropDoctor },
 
 { id: 'life-stage-maze', name: 'Life Stage Control', Icon: Target, category: 'Life Stages', description: 'Identify weed life stages and choose the best control method.', howToPlay: 'First identify the life stage shown, then name the weed, then choose the best control method for that stage.', component: LifeStageMaze },
];

type Screen = 'grades' | 'games' | 'info' | 'playing';

export default function PracticeHub({
  onClose,
  initialGrade,
  initialGameId,
  onOpenLearning,
}: {
  onClose: () => void;
  initialGrade?: string;
  initialGameId?: string;
  onOpenLearning?: (topicId: string) => void;
}) {
 const [screen, setScreen] = useState<Screen>('grades');
 const [selectedGrade, setSelectedGrade] = useState<string>('');
 const [selectedGame, setSelectedGame] = useState<GameDef | null>(null);
 const { badges, totalBadges } = useGameProgress();

  useEffect(() => {
    if (!initialGrade) return;
    setSelectedGrade(initialGrade);
    if (initialGameId) {
      const list =
        initialGrade === 'k5' ? k5Games : initialGrade === '68' ? middleGames : initialGrade === '912' ? highGames : [];
      const found = list.find((g) => g.id === initialGameId);
      if (found) {
        setSelectedGame(found);
        setScreen('info');
        return;
      }
    }
    setScreen('games');
  }, [initialGrade, initialGameId]);

 const selectGrade = (g: string) => { setSelectedGrade(g); setScreen('games'); };
 const selectGame = (g: GameDef) => { setSelectedGame(g); setScreen('info'); };
 const backToGames = () => { setSelectedGame(null); setScreen('games'); };
 const backToGrades = () => { setSelectedGrade(''); setScreen('grades'); };

 if (screen === 'playing' && selectedGame) {
 const GameComp = selectedGame.component;
 const gradeLabel = selectedGrade === 'k5' ? 'K-5' : selectedGrade === '68' ? '6-8' : '9-12';
 return <GameComp onBack={backToGames} gameId={selectedGame.id} gameName={selectedGame.name} gradeLabel={gradeLabel} />;
 }

 const games = selectedGrade === 'k5' ? k5Games : selectedGrade === '68' ? middleGames : selectedGrade === '912' ? highGames : [];

 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-8">
  <HomeButton onClose={onClose} />
  <span className="text-border mx-1">|</span>
  <button
  onClick={screen === 'grades' ? onClose : screen === 'games' ? backToGrades : backToGames}
  className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
  >
  <ArrowLeft className="w-4 h-4" />
  </button>
  <div>
 <h1 className="font-display font-bold text-xl text-foreground">Practice Games</h1>
 {screen !== 'grades' && (
 <p className="text-sm text-muted-foreground">
 {selectedGrade === 'k5' ? 'Grades K-5 · Explorer' : selectedGrade === '68' ? 'Grades 6-8 · Investigator' : 'Grades 9-12 · Specialist'}
 </p>
 )}
 </div>
 <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
   <Trophy className="w-4 h-4 text-primary" />
   <span className="text-sm font-bold text-foreground">{totalBadges}</span>
   <span className="text-xs text-muted-foreground">badges</span>
 </div>
 </div>

 {/* Earned badges showcase */}
 {screen !== 'grades' && totalBadges > 0 && (
   <div className="mb-6 p-4 rounded-lg border border-border bg-card">
     <div className="flex items-center gap-2 mb-3">
       <Medal className="w-4 h-4 text-primary" />
       <h2 className="text-sm font-bold text-foreground">Your Badges</h2>
     </div>
     <div className="flex gap-2 flex-wrap">
       {badges.slice(-12).reverse().map((b, i) => {
         const pct = b.total > 0 ? b.score / b.total : 0;
         const TierIcon = pct >= 0.85 ? Trophy : pct >= 0.7 ? Award : Star;
         const cls = pct >= 0.85 ? 'text-yellow-600 bg-yellow-100 border-yellow-300'
           : pct >= 0.7 ? 'text-slate-600 bg-slate-100 border-slate-300'
           : 'text-amber-700 bg-amber-100 border-amber-300';
         return (
           <div key={i} title={`${b.gameName} — ${b.score}/${b.total}`}
             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>
             <TierIcon className="w-3 h-3" />
             <span className="max-w-[140px] truncate">{b.gameName}</span>
           </div>
         );
       })}
     </div>
   </div>
 )}

 {/* Grade Selection */}
 {screen === 'grades' && (
 <div className="grid gap-4 max-w-lg mx-auto mt-8">
 <h2 className="text-center text-muted-foreground mb-4 text-sm font-medium uppercase tracking-wider">Choose Your Level</h2>
 {[
 { id: 'k5', label: 'Grades K-5', sub: 'Explorer', Icon: Leaf, count: 15, accent: 'grade-elementary' },
 { id: '68', label: 'Grades 6-8', sub: 'Investigator', Icon: Microscope, count: 17, accent: 'grade-middle' },
 { id: '912', label: 'Grades 9-12', sub: 'Specialist', Icon: FlaskConical, count: 14, accent: 'grade-high' },
 ].map(g => (
 <button
 key={g.id}
 onClick={() => selectGrade(g.id)}
 className="flex items-center gap-4 p-5 rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 text-left"
 >
 <div className={`w-12 h-12 rounded-lg bg-${g.accent}/15 flex items-center justify-center`}>
 <g.Icon className={`w-6 h-6 text-${g.accent}`} />
 </div>
 <div className="flex-1">
 <h3 className="font-display font-bold text-foreground">{g.label}</h3>
 <p className="text-sm text-muted-foreground">{g.sub}</p>
 </div>
 <span className="text-sm text-muted-foreground">{g.count} games</span>
 </button>
 ))}
 </div>
 )}

 {/* Game Grid */}
 {screen === 'games' && (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
 {games.map(g => {
 const earned = badges.filter(b => b.gameId.startsWith(`${g.id}-lv`));
 const best = earned.reduce((acc, b) => Math.max(acc, b.total > 0 ? b.score / b.total : 0), 0);
 const TierIcon = best >= 0.85 ? Trophy : best >= 0.7 ? Award : best > 0 ? Star : null;
 const tierCls = best >= 0.85 ? 'text-yellow-600' : best >= 0.7 ? 'text-slate-500' : 'text-amber-700';
 return (
 <button
 key={g.id}
 onClick={() => selectGame(g)}
 className="group relative flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
 >
 {TierIcon && (
   <div className={`absolute top-2 right-2 flex items-center gap-1 ${tierCls}`}>
     <TierIcon className="w-3.5 h-3.5" />
     <span className="text-[10px] font-bold">{earned.length}</span>
   </div>
 )}
 <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
 <g.Icon className="w-7 h-7 text-primary" />
 </div>
 <div className="text-center">
 <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight block">{g.name}</span>
 <span className="text-[10px] text-muted-foreground mt-0.5 block">{g.category}</span>
 </div>
 </button>
 );})}
 </div>
 )}

 {/* Game Info / Launcher */}
 {screen === 'info' && selectedGame && (
 <div className="max-w-md mx-auto mt-8 text-center animate-fade-in">
 <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
 <selectedGame.Icon className="w-10 h-10 text-primary" />
 </div>
 <h2 className="font-display font-bold text-2xl text-foreground mb-1">{selectedGame.name}</h2>
 <span className="inline-block px-3 py-1 rounded-md bg-secondary text-xs text-muted-foreground font-medium mb-4">{selectedGame.category}</span>
 <p className="text-foreground mb-5 leading-relaxed">{selectedGame.description}</p>
 <div className="bg-card border border-border rounded-lg p-5 mb-6 text-left shadow-subtle">
 <h3 className="font-semibold text-sm text-foreground mb-2">How to Play</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">{selectedGame.howToPlay}</p>
 </div>
  {selectedGrade !== '912' && (
    <div className="mb-6 text-left">
      <FarmerGuide
        gradeLabel={selectedGrade === 'k5' ? 'K-5' : '6-8'}
        tone="intro"
        message={
          selectedGrade === 'k5'
            ? `Howdy partner! I'm Farmer Joe and I'll be your buddy through ${selectedGame.name}. Don't worry — I'll cheer you on and help if you get stuck. Ready? Let's go grow some smart weed scientists!`
            : `Welcome, scout. I'm Farmer Joe. I'll set the scene for ${selectedGame.name}, but you'll do the thinking. If you ever feel stuck, ask for a hint — otherwise, trust your training.`
        }
      />
    </div>
  )}
 <button
 onClick={() => setScreen('playing')}
 className="inline-flex items-center gap-2 px-10 py-3.5 rounded-md bg-success text-success-foreground font-bold text-base hover:opacity-90 transition-opacity shadow-card"
 >
 <Play className="w-5 h-5" /> Play
 </button>
 </div>
 )}
 </div>
 </div>
 );
}
