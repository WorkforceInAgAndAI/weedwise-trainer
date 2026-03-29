import { useState } from 'react';
import {
  ArrowLeft, Play, Leaf, Microscope, FlaskConical,
  Tag, Palette, Layers, Eye, Sprout, ArrowUpDown,
  RefreshCw, Globe, Map, Search, Wind, AlertTriangle,
  MapPin, ShieldAlert, Wrench, Target, TrendingUp,
  Droplets, ZoomIn, GraduationCap, Scan, Moon,
  Swords, Grid3X3, ClipboardList, Footprints, Stethoscope,
  Dna, FlaskRound
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
import HerbicideResistor from './practice-games/high/HerbicideResistor';
import LifeStageMaze from './practice-games/high/LifeStageMaze';

interface GameDef {
  id: string;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  category: string;
  description: string;
  howToPlay: string;
  component: React.ComponentType<{ onBack: () => void }>;
}

const k5Games: GameDef[] = [
  { id: 'weed-or-crop', name: 'Weed or Crop', Icon: Sprout, category: 'Identification', description: 'A plant image appears — is it a weed or a crop? Think fast!', howToPlay: 'You have 10 seconds per round to decide if the plant shown is a weed or a crop. Tap your answer before time runs out!', component: WeedOrCrop },
  { id: 'leaf-artist', name: 'Leaf Artist', Icon: Palette, category: 'Leaf Morphology', description: 'Draw leaves with the correct venation pattern.', howToPlay: 'Study the example leaf, then draw your own on the canvas. Focus on getting the venation and leaf shape correct.', component: LeafArtist },
  { id: 'taxonomy-tower', name: 'Taxonomy Tower', Icon: Layers, category: 'Taxonomy', description: 'Climb the Plant Kingdom tower using a dichotomous key.', howToPlay: 'Start at the bottom and make binary choices at each level to find the target weed at the top of the tower.', component: TaxonomyTower },
  { id: 'look-alike', name: 'Look-Alike Challenge', Icon: Eye, category: 'Look-Alikes', description: 'Can you tell similar-looking plants apart?', howToPlay: 'Two similar weeds are shown side by side. Read the clue and pick which one matches the description.', component: K5LookAlike },
  { id: 'name-the-weed', name: 'Name the Weed', Icon: Tag, category: 'Names', description: 'Identify weeds by their image and description.', howToPlay: 'Look at the weed image and read the clue. Choose the correct common name from four options.', component: NameTheWeed },
  { id: 'life-stages', name: 'Life Stages Sequence', Icon: ArrowUpDown, category: 'Life Stages', description: 'Put weed growth stages in the right order.', howToPlay: 'Images of the same weed at different life stages are jumbled. Drag them into correct order.', component: LifeStagesSequence },
  { id: 'life-cycle-match', name: 'Life Cycle Matching', Icon: RefreshCw, category: 'Life Cycles', description: 'Flip cards to match weeds with their life cycle type.', howToPlay: 'Cards are face-down. Flip two at a time to match a weed name with its life cycle.', component: LifeCycleMatching },
  { id: 'ecology-scramble', name: 'Ecology Scramble', Icon: Globe, category: 'Ecology', description: 'Sort the survival needs for different types of plants.', howToPlay: 'Sort icons into the correct category: aquatic, terrestrial, or parasitic.', component: EcologyScramble },
  { id: 'habitat-mapping', name: 'Habitat Mapping', Icon: Map, category: 'Habitats', description: 'Place weeds in the right habitat on the map.', howToPlay: 'A map shows different areas. Drag each weed to the habitat where it grows best.', component: HabitatMapping },
  { id: 'seed-banks', name: 'Weed Seed Banks', Icon: Search, category: 'Seed Banks', description: 'Search the field and count the hidden seeds.', howToPlay: 'Seeds are scattered across the field. Tap each seed to collect it before time runs out.', component: WeedSeedBanks },
  { id: 'weed-travel', name: 'Weed Travel', Icon: Wind, category: 'Seed Dispersal', description: 'Help a seed travel from point A to point B.', howToPlay: 'You are a seed! Choose the right dispersal method to overcome each obstacle.', component: WeedTravel },
  { id: 'invasive-match', name: 'Invasive Match', Icon: AlertTriangle, category: 'Invasive Weeds', description: 'Match invasive weeds to the damage they cause.', howToPlay: 'Connect each invasive weed with the negative effect it has on the environment.', component: InvasiveMatch },
  { id: 'invasive-id', name: 'Invasive ID', Icon: MapPin, category: 'Origin', description: 'Is this plant native or invasive?', howToPlay: 'Given a weed, its origin, and where it was found, decide if it is native or invasive.', component: InvasiveID },
  { id: 'safe-vs-toxic', name: 'Safe vs. Toxic', Icon: ShieldAlert, category: 'Safety', description: 'Spot the toxic weed hiding among look-alikes.', howToPlay: 'Several similar-looking weeds are shown. Find the dangerous one and decide how to remove it.', component: SafeVsToxic },
  { id: 'weed-control', name: 'Weed Control', Icon: Wrench, category: 'Control Methods', description: 'You are the agronomist — manage weeds before time runs out.', howToPlay: 'Weeds appear in a field. Click each, identify it, then choose the right control method.', component: WeedControl },
];

const middleGames: GameDef[] = [
  { id: 'ms-name-weed', name: 'Name the Weed', Icon: Tag, category: 'Names', description: 'Identify weeds from images and descriptions.', howToPlay: 'Look at the weed image and read the clue. Choose the correct name.', component: MSNameTheWeed },
  { id: 'ms-taxonomy', name: 'Taxonomy Tower', Icon: Layers, category: 'Taxonomy', description: 'Climb the Plant Kingdom tower using a dichotomous key.', howToPlay: 'Navigate a dichotomous key tower to identify plant families.', component: MSTaxonomyTower },
  { id: 'field-scout', name: 'Field Scout', Icon: Footprints, category: 'Field Methods', description: 'Choose the best scouting pattern for each field.', howToPlay: 'Analyze each field and select the most efficient walking pattern.', component: FieldScout },
  { id: 'pest-id', name: 'Pest ID', Icon: Microscope, category: 'Ecology', description: 'Classify weeds as aquatic, terrestrial, or parasitic.', howToPlay: 'Look at the weed and its habitat, then classify it correctly.', component: PestID },
  { id: 'ms-habitat', name: 'Habitat Mapping', Icon: Map, category: 'Habitats', description: 'Place weeds in temperate, arid, tropical, or wetland regions.', howToPlay: 'Drag each weed to the region where it grows best.', component: MSHabitatMapping },
  { id: 'weed-origins', name: 'Weed Origins', Icon: Globe, category: 'Origin', description: 'Drag weeds to their continent of origin.', howToPlay: 'A weed appears over a world map. Click the continent where it came from.', component: WeedOrigins },
  { id: 'native-lookalike', name: 'Native vs. Introduced', Icon: Eye, category: 'Look-Alikes', description: 'Tell native plants apart from introduced look-alikes.', howToPlay: 'Two similar plants are shown. Pick the native one.', component: NativeLookAlike },
  { id: 'weed-competitors', name: 'Weed Competitors', Icon: Swords, category: 'Competition', description: 'Compete as a weed for resources against rivals.', howToPlay: 'Make strategic decisions about leaves, roots, and reproduction to out-compete your opponent.', component: WeedCompetitors },
  { id: 'invasive-quiz', name: 'Invasive Quiz', Icon: ClipboardList, category: 'Invasive Weeds', description: 'Test your knowledge of invasive species impacts.', howToPlay: 'Answer quiz questions about invasive species and environmental harm.', component: InvasiveQuiz },
  { id: 'ms-safe-toxic', name: 'Safe vs. Toxic', Icon: ShieldAlert, category: 'Safety', description: 'Spot the toxic weed hiding among look-alikes.', howToPlay: 'Find the dangerous weed among similar-looking plants.', component: MSSafeVsToxic },
  { id: 'life-stage-control', name: 'Life Stage Control', Icon: Target, category: 'Life Stages', description: 'Choose the best management for each growth stage.', howToPlay: 'A weed appears at a specific life stage. Pick the best control method.', component: LifeStageControl },
  { id: 'ms-lifecycle', name: 'Life Cycle Matching', Icon: RefreshCw, category: 'Life Cycles', description: 'Flip cards to match weeds with their life cycle type.', howToPlay: 'Match weed names with Annual, Biennial, or Perennial across 3 rounds.', component: MSLifeCycleMatching },
  { id: 'economic-threshold', name: 'Economic Threshold', Icon: TrendingUp, category: 'Thresholds', description: 'Decide which weeds are most critical to control.', howToPlay: 'You have 20 weeds but can only control 10. Select the highest priority ones.', component: EconomicThreshold },
  { id: 'ms-weed-control', name: 'Weed Control', Icon: Wrench, category: 'Control Methods', description: 'Manage weeds in the field using equipment and techniques.', howToPlay: 'Click weeds in the field, identify them, then choose the right control method.', component: MSWeedControl },
  { id: 'control-matching', name: 'Control Method Matching', Icon: FlaskConical, category: 'Chemical Control', description: 'Match herbicide groups to the weeds they target.', howToPlay: 'Identify grass vs broadleaf, then pick the correct herbicide group.', component: ControlMethodMatching },
  { id: 'herbicide-applicator', name: 'Herbicide Applicator', Icon: Droplets, category: 'Herbicide Resistance', description: 'Choose the right herbicide type for each weed.', howToPlay: 'Click weeds in a field and select the appropriate herbicide type.', component: HerbicideApplicator },
  { id: 'ligule-lens', name: 'Ligule Lens', Icon: ZoomIn, category: 'Grass ID', description: 'Zoom in on ligules to identify grass species.', howToPlay: 'Study the zoomed-in ligule image and pick the correct grass species.', component: LiguleLens },
];

const highGames: GameDef[] = [
  { id: 'hs-name-weed', name: 'Name the Weed', Icon: GraduationCap, category: 'Scientific Names', description: 'Identify weeds by their scientific name.', howToPlay: 'Look at the image and traits, then choose the correct scientific name.', component: HSNameTheWeed },
  { id: 'hs-taxonomy', name: 'Taxonomy Tower', Icon: Layers, category: 'Taxonomy', description: 'Navigate genus and species using a dichotomous key.', howToPlay: 'Climb the tower from Kingdom to Species.', component: HSTaxonomyTower },
  { id: 'spot-differences', name: 'Spot the Differences', Icon: Search, category: 'Intra-species', description: 'Find differences between male and female plants.', howToPlay: 'Compare male and female plants and tap each difference.', component: SpotTheDifferences },
  { id: 'hs-habitat', name: 'Habitat Mapping', Icon: Map, category: 'Habitats', description: 'Map weeds to habitat regions with country-level detail.', howToPlay: 'Place weeds into the correct habitat zones.', component: HSHabitatMapping },
  { id: 'invasive-habitat', name: 'Invasive Habitat Map', Icon: AlertTriangle, category: 'Invasive Habitats', description: 'Map invasive species to the habitats they have invaded.', howToPlay: 'Place each invasive weed into its colonized habitat zone.', component: InvasiveHabitatMapping },
  { id: 'hs-field-scout', name: 'Field Scout Tools', Icon: Scan, category: 'Scouting Tools', description: 'Choose the right scouting tool for each field.', howToPlay: 'Evaluate field conditions and select from drones, rovers, manual scouting, or satellite imagery.', component: FieldScoutTools },
  { id: 'hs-lifecycle', name: 'Life Cycle Sort', Icon: ArrowUpDown, category: 'Life Cycles', description: 'Sort winter annuals, summer annuals, and more.', howToPlay: 'Classify weeds into winter annual, summer annual, perennial, or biennial.', component: LifeCycleSort },
  { id: 'sleepy-seeds', name: 'Sleepy Seeds', Icon: Moon, category: 'Seed Dormancy', description: 'Choose the right dormancy mechanism to survive.', howToPlay: 'You are a seed facing environmental challenges. Pick the best dormancy strategy.', component: SleepySeeds },
  { id: 'allelopathy', name: 'Allelopathy Attack', Icon: Swords, category: 'Allelopathy', description: 'Use chemical warfare to suppress competing weeds.', howToPlay: 'Choose an allelopathy strategy to outcompete an enemy weed.', component: AllelopathyAttack },
  { id: 'form-farm', name: 'Form Your Farm', Icon: Leaf, category: 'Economic Thresholds', description: 'Design a farm and defend it against weeds.', howToPlay: 'Choose your crop, season, and threshold, then decide which weeds to treat or wait on.', component: FormYourFarm },
  { id: 'hs-weed-control', name: 'Weed Control', Icon: Wrench, category: 'Control Methods', description: 'Manage weeds in the field as an agronomist.', howToPlay: 'Click weeds in the field, identify them, choose the right control method.', component: HSWeedControl },
  { id: 'hs-control-match', name: 'Mode of Action Match', Icon: FlaskRound, category: 'Modes of Action', description: 'Match herbicides to their modes and sites of action.', howToPlay: 'For each weed, select the correct herbicide mode of action.', component: HSControlMethodMatching },
  { id: 'crop-doctor', name: 'Crop Doctor', Icon: Stethoscope, category: 'Injury Symptoms', description: 'Diagnose herbicide injury symptoms on crops.', howToPlay: 'Read the crop symptom description and identify the herbicide group that caused it.', component: CropDoctor },
  { id: 'herbicide-resistor', name: 'Herbicide Resistor', Icon: Dna, category: 'Resistance', description: 'Build a 3-year plan to prevent herbicide resistance.', howToPlay: 'Choose crop-herbicide combos across 3 years to maximize diversity.', component: HerbicideResistor },
  { id: 'life-stage-maze', name: 'Life Stage Maze', Icon: Grid3X3, category: 'Life Stages', description: 'Connect life stages to the best control methods.', howToPlay: 'Match each weed life stage to the best control method on a grid.', component: LifeStageMaze },
];

type Screen = 'grades' | 'games' | 'info' | 'playing';

export default function PracticeHub({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<GameDef | null>(null);

  const selectGrade = (g: string) => { setSelectedGrade(g); setScreen('games'); };
  const selectGame = (g: GameDef) => { setSelectedGame(g); setScreen('info'); };
  const backToGames = () => { setSelectedGame(null); setScreen('games'); };
  const backToGrades = () => { setSelectedGrade(''); setScreen('grades'); };

  if (screen === 'playing' && selectedGame) {
    const GameComp = selectedGame.component;
    return <GameComp onBack={backToGames} />;
  }

  const games = selectedGrade === 'k5' ? k5Games : selectedGrade === '68' ? middleGames : selectedGrade === '912' ? highGames : [];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
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
        </div>

        {/* Grade Selection */}
        {screen === 'grades' && (
          <div className="grid gap-4 max-w-lg mx-auto mt-8">
            <h2 className="text-center text-muted-foreground mb-4 text-sm font-medium uppercase tracking-wider">Choose Your Level</h2>
            {[
              { id: 'k5', label: 'Grades K-5', sub: 'Explorer', Icon: Leaf, count: 15, accent: 'grade-elementary' },
              { id: '68', label: 'Grades 6-8', sub: 'Investigator', Icon: Microscope, count: 17, accent: 'grade-middle' },
              { id: '912', label: 'Grades 9-12', sub: 'Specialist', Icon: FlaskConical, count: 15, accent: 'grade-high' },
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
            {games.map(g => (
              <button
                key={g.id}
                onClick={() => selectGame(g)}
                className="group flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                  <g.Icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight block">{g.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{g.category}</span>
                </div>
              </button>
            ))}
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
