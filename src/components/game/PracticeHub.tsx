import { useState } from 'react';
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

// 6-8 Middle School games
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

// 9-12 High School games
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
  icon: string;
  gradient: string;
  category: string;
  description: string;
  howToPlay: string;
  component: React.ComponentType<{ onBack: () => void }>;
}

const k5Games: GameDef[] = [
  { id: 'weed-or-crop', name: 'Weed or Crop', icon: '🌱', gradient: 'from-green-500 to-emerald-600', category: 'Identification', description: 'A plant image appears — is it a weed or a crop? Think fast!', howToPlay: 'You have 10 seconds per round to decide if the plant shown is a weed or a crop. Tap your answer before time runs out!', component: WeedOrCrop },
  { id: 'leaf-artist', name: 'Leaf Artist', icon: '🎨', gradient: 'from-purple-500 to-pink-500', category: 'Leaf Morphology', description: 'Draw leaves with the correct venation pattern!', howToPlay: 'Study the example leaf, then draw your own on the canvas. Focus on getting the venation (vein pattern) and leaf shape correct.', component: LeafArtist },
  { id: 'taxonomy-tower', name: 'Taxonomy Tower', icon: '🏗️', gradient: 'from-amber-500 to-orange-500', category: 'Taxonomy', description: 'Climb the Plant Kingdom tower using a dichotomous key!', howToPlay: 'Start at the bottom and make binary choices at each level to find the target weed at the top of the tower.', component: TaxonomyTower },
  { id: 'look-alike', name: 'Look-Alike Challenge', icon: '👀', gradient: 'from-red-500 to-rose-500', category: 'Look-Alikes', description: 'Can you tell similar-looking plants apart?', howToPlay: 'Two similar weeds are shown side by side. Read the clue and pick which one matches the description.', component: K5LookAlike },
  { id: 'name-the-weed', name: 'Name the Weed', icon: '🏷️', gradient: 'from-blue-500 to-cyan-500', category: 'Names', description: 'Identify weeds by their image and description!', howToPlay: 'Look at the weed image and read the clue. Choose the correct common name from four options.', component: NameTheWeed },
  { id: 'life-stages', name: 'Life Stages Sequence', icon: '🔄', gradient: 'from-teal-500 to-green-500', category: 'Life Stages', description: 'Put weed growth stages in the right order!', howToPlay: 'Images of the same weed at different life stages are jumbled up. Drag them into the correct order: seedling → vegetative → reproductive → mature.', component: LifeStagesSequence },
  { id: 'life-cycle-match', name: 'Life Cycle Matching', icon: '🃏', gradient: 'from-indigo-500 to-blue-500', category: 'Life Cycles', description: 'Flip cards to match weeds with their life cycle type!', howToPlay: 'Cards are face-down. Flip two at a time to match a weed name with its life cycle (Annual, Perennial, or Biennial). Matched cards stay face-up.', component: LifeCycleMatching },
  { id: 'ecology-scramble', name: 'Ecology Scramble', icon: '🌍', gradient: 'from-lime-500 to-green-600', category: 'Ecology', description: 'Sort the survival needs for different types of plants!', howToPlay: 'Icons represent things plants need to survive. Sort them into the correct category: aquatic, terrestrial, or parasitic plants.', component: EcologyScramble },
  { id: 'habitat-mapping', name: 'Habitat Mapping', icon: '🗺️', gradient: 'from-sky-500 to-blue-600', category: 'Habitats', description: 'Place weeds in the right habitat on the map!', howToPlay: 'A map shows hot, cold, wet, and dry areas. Drag each weed to the habitat where it grows best, then check your answers.', component: HabitatMapping },
  { id: 'seed-banks', name: 'Weed Seed Banks', icon: '🔍', gradient: 'from-yellow-500 to-amber-600', category: 'Seed Banks', description: 'Search the field and count the hidden seeds!', howToPlay: 'Seeds are scattered across the field. Tap each seed you find to collect it. Try to find them all before time runs out!', component: WeedSeedBanks },
  { id: 'weed-travel', name: 'Weed Travel', icon: '🌬️', gradient: 'from-cyan-500 to-teal-500', category: 'Seed Dispersal', description: 'Help a seed travel from point A to point B!', howToPlay: 'You are a seed! Choose the right dispersal method (wind, water, or animals) to overcome each obstacle on your journey.', component: WeedTravel },
  { id: 'invasive-match', name: 'Invasive Match', icon: '⚠️', gradient: 'from-red-600 to-orange-500', category: 'Invasive Weeds', description: 'Match invasive weeds to the damage they cause!', howToPlay: 'Draw lines to connect each invasive weed with the negative effect it has on the environment, animals, or people.', component: InvasiveMatch },
  { id: 'invasive-id', name: 'Invasive ID', icon: '🌐', gradient: 'from-emerald-500 to-teal-600', category: 'Origin', description: 'Is this plant native or invasive?', howToPlay: 'You are given a weed, its origin, and where it was found. Decide whether the plant is native or invasive in its current location.', component: InvasiveID },
  { id: 'safe-vs-toxic', name: 'Safe vs. Toxic', icon: '☠️', gradient: 'from-violet-600 to-purple-600', category: 'Safety', description: 'Spot the toxic weed hiding among look-alikes!', howToPlay: 'Several similar-looking weeds are shown. One is toxic! Find the dangerous one and decide how to safely remove it.', component: SafeVsToxic },
  { id: 'weed-control', name: 'Weed Control', icon: '🧑‍🌾', gradient: 'from-orange-500 to-red-500', category: 'Control Methods', description: 'You are the agronomist — manage weeds before time runs out!', howToPlay: 'Weeds appear in a field. Click each weed, identify it, then choose the right control method. You only have a few minutes!', component: WeedControl },
];

const middleGames: GameDef[] = [
  { id: 'ms-name-weed', name: 'Name the Weed', icon: '🏷️', gradient: 'from-blue-500 to-cyan-500', category: 'Names', description: 'Identify weeds from images and descriptions!', howToPlay: 'Look at the weed image and read the clue. Choose the correct common name from four options.', component: MSNameTheWeed },
  { id: 'ms-taxonomy', name: 'Taxonomy Tower', icon: '🏗️', gradient: 'from-amber-500 to-orange-500', category: 'Taxonomy', description: 'Climb the Plant Kingdom tower using a dichotomous key!', howToPlay: 'Navigate a dichotomous key tower to identify plant families and species.', component: MSTaxonomyTower },
  { id: 'field-scout', name: 'Field Scout', icon: '🥾', gradient: 'from-green-600 to-emerald-700', category: 'Field Methods', description: 'Choose the best scouting pattern for each field!', howToPlay: 'Analyze each field and select the most efficient walking pattern for counting weeds.', component: FieldScout },
  { id: 'pest-id', name: 'Pest ID', icon: '🔬', gradient: 'from-teal-500 to-cyan-600', category: 'Ecology', description: 'Classify weeds as aquatic, terrestrial, or parasitic!', howToPlay: 'Look at the weed and its habitat, then classify it into the correct ecological category.', component: PestID },
  { id: 'ms-habitat', name: 'Habitat Mapping', icon: '🗺️', gradient: 'from-sky-500 to-blue-600', category: 'Habitats', description: 'Place weeds in temperate, arid, tropical, or wetland regions!', howToPlay: 'Drag each weed to the region where it grows best, then check your answers.', component: MSHabitatMapping },
  { id: 'weed-origins', name: 'Weed Origins', icon: '🌍', gradient: 'from-indigo-500 to-purple-600', category: 'Origin', description: 'Drag weeds to their continent of origin!', howToPlay: 'A weed appears over a world map. Click the continent where it originally came from.', component: WeedOrigins },
  { id: 'native-lookalike', name: 'Native vs. Introduced', icon: '👀', gradient: 'from-red-500 to-rose-500', category: 'Look-Alikes', description: 'Tell native plants apart from introduced look-alikes!', howToPlay: 'Two similar plants are shown. Pick the one that is native.', component: NativeLookAlike },
  { id: 'weed-competitors', name: 'Weed Competitors', icon: '⚔️', gradient: 'from-orange-500 to-red-600', category: 'Competition', description: 'Compete as a weed for resources against rivals!', howToPlay: 'You are a weed! Make strategic decisions about leaves, roots, and reproduction to out-compete your opponent.', component: WeedCompetitors },
  { id: 'invasive-quiz', name: 'Invasive Quiz', icon: '📋', gradient: 'from-red-600 to-orange-500', category: 'Invasive Weeds', description: 'Test your knowledge of invasive species impacts!', howToPlay: 'Answer quiz questions about invasive species, environmental harm, and population disturbances.', component: InvasiveQuiz },
  { id: 'ms-safe-toxic', name: 'Safe vs. Toxic', icon: '☠️', gradient: 'from-violet-600 to-purple-600', category: 'Safety', description: 'Spot the toxic weed hiding among look-alikes!', howToPlay: 'Find the dangerous weed among similar-looking plants, then decide how to safely remove it.', component: MSSafeVsToxic },
  { id: 'life-stage-control', name: 'Life Stage Control', icon: '🎯', gradient: 'from-emerald-500 to-green-600', category: 'Life Stages', description: 'Choose the best management for each growth stage!', howToPlay: 'A weed appears at a specific life stage. Pick the best control method for that stage.', component: LifeStageControl },
  { id: 'ms-lifecycle', name: 'Life Cycle Matching', icon: '🃏', gradient: 'from-indigo-500 to-blue-500', category: 'Life Cycles', description: 'Flip cards to match weeds with their life cycle type!', howToPlay: 'Match weed names with Annual, Biennial, or Perennial across 3 rounds.', component: MSLifeCycleMatching },
  { id: 'economic-threshold', name: 'Economic Threshold', icon: '💰', gradient: 'from-yellow-500 to-amber-600', category: 'Thresholds', description: 'Decide which weeds are most critical to control!', howToPlay: 'You have 20 weeds but can only control 10. Select the highest priority ones based on their traits.', component: EconomicThreshold },
  { id: 'ms-weed-control', name: 'Weed Control', icon: '🧑‍🌾', gradient: 'from-orange-500 to-red-500', category: 'Control Methods', description: 'Manage weeds in the field using equipment and techniques!', howToPlay: 'Click weeds in the field, identify them, and choose the right control method before time runs out!', component: MSWeedControl },
  { id: 'control-matching', name: 'Control Method Matching', icon: '🧪', gradient: 'from-cyan-500 to-teal-500', category: 'Chemical Control', description: 'Match herbicide groups to the weeds they target!', howToPlay: 'Identify whether the weed is a grass or broadleaf, then pick the correct herbicide group.', component: ControlMethodMatching },
  { id: 'herbicide-applicator', name: 'Herbicide Applicator', icon: '💊', gradient: 'from-lime-500 to-green-600', category: 'Herbicide Resistance', description: 'Choose the right herbicide type for each weed!', howToPlay: 'Click weeds in a field and select the appropriate herbicide type (pre-emergent, post-emergent, etc.).', component: HerbicideApplicator },
  { id: 'ligule-lens', name: 'Ligule Lens', icon: '🔍', gradient: 'from-green-500 to-emerald-600', category: 'Grass ID', description: 'Zoom in on ligules to identify grass species!', howToPlay: 'Study the zoomed-in ligule image and pick the correct grass species from four options.', component: LiguleLens },
];

const highGames: GameDef[] = [
  { id: 'hs-name-weed', name: 'Name the Weed', icon: '🎓', gradient: 'from-blue-600 to-indigo-600', category: 'Scientific Names', description: 'Identify weeds by their scientific name!', howToPlay: 'Look at the image and traits, then choose the correct scientific name from four options.', component: HSNameTheWeed },
  { id: 'hs-taxonomy', name: 'Taxonomy Tower', icon: '🏗️', gradient: 'from-amber-600 to-orange-600', category: 'Taxonomy', description: 'Navigate genus and species using a dichotomous key!', howToPlay: 'Climb the tower from Kingdom to Species, making binary decisions at each level.', component: HSTaxonomyTower },
  { id: 'spot-differences', name: 'Spot the Differences', icon: '🔍', gradient: 'from-pink-500 to-rose-500', category: 'Intra-species', description: 'Find differences between male and female plants!', howToPlay: 'Compare male and female plants of the same species and tap each difference you can spot.', component: SpotTheDifferences },
  { id: 'hs-habitat', name: 'Habitat Mapping', icon: '🗺️', gradient: 'from-sky-500 to-blue-600', category: 'Habitats', description: 'Map weeds to habitat regions with country-level detail!', howToPlay: 'Place weeds into temperate, arid, tropical, or wetland zones and check your answers.', component: HSHabitatMapping },
  { id: 'invasive-habitat', name: 'Invasive Habitat Map', icon: '⚠️', gradient: 'from-red-500 to-orange-500', category: 'Invasive Habitats', description: 'Map invasive species to the habitats they have invaded!', howToPlay: 'Place each invasive weed into the habitat zone it has colonized.', component: InvasiveHabitatMapping },
  { id: 'hs-field-scout', name: 'Field Scout Tools', icon: '🛸', gradient: 'from-green-600 to-emerald-700', category: 'Scouting Tools', description: 'Choose the right scouting tool for each field!', howToPlay: 'Evaluate field conditions and select from drones, rovers, manual scouting, or satellite imagery.', component: FieldScoutTools },
  { id: 'hs-lifecycle', name: 'Life Cycle Sort', icon: '❄️', gradient: 'from-cyan-500 to-blue-500', category: 'Life Cycles', description: 'Sort winter annuals, summer annuals, and more!', howToPlay: 'Classify weeds into winter annual, summer annual, perennial, or biennial categories.', component: LifeCycleSort },
  { id: 'sleepy-seeds', name: 'Sleepy Seeds', icon: '😴', gradient: 'from-purple-500 to-indigo-500', category: 'Seed Dormancy', description: 'Choose the right dormancy mechanism to survive!', howToPlay: 'You are a seed facing environmental challenges. Pick the best dormancy strategy to survive.', component: SleepySeeds },
  { id: 'allelopathy', name: 'Allelopathy Attack', icon: '⚔️', gradient: 'from-emerald-500 to-teal-600', category: 'Allelopathy', description: 'Use chemical warfare to suppress competing weeds!', howToPlay: 'Choose an allelopathy strategy (root exudates, leaf leachate, etc.) to outcompete an enemy weed.', component: AllelopathyAttack },
  { id: 'form-farm', name: 'Form Your Farm', icon: '🌾', gradient: 'from-yellow-500 to-amber-600', category: 'Economic Thresholds', description: 'Design a farm and defend it against weeds!', howToPlay: 'Choose your crop, season, and threshold, then decide which weeds to treat or wait on.', component: FormYourFarm },
  { id: 'hs-weed-control', name: 'Weed Control', icon: '🧑‍🌾', gradient: 'from-orange-500 to-red-500', category: 'Control Methods', description: 'Manage weeds in the field as an agronomist!', howToPlay: 'Click weeds in the field, identify them, and choose the right control method before time runs out.', component: HSWeedControl },
  { id: 'hs-control-match', name: 'Mode of Action Match', icon: '🧪', gradient: 'from-teal-500 to-cyan-600', category: 'Modes of Action', description: 'Match herbicides to their modes and sites of action!', howToPlay: 'For each weed, select the correct herbicide mode of action (ALS, ACCase, PSII, etc.).', component: HSControlMethodMatching },
  { id: 'crop-doctor', name: 'Crop Doctor', icon: '💊', gradient: 'from-red-600 to-rose-600', category: 'Injury Symptoms', description: 'Diagnose herbicide injury symptoms on crops!', howToPlay: 'Read the crop symptom description and identify the herbicide group that caused it. Earn money for correct diagnoses.', component: CropDoctor },
  { id: 'herbicide-resistor', name: 'Herbicide Resistor', icon: '🧬', gradient: 'from-violet-500 to-purple-600', category: 'Resistance', description: 'Build a 3-year plan to prevent herbicide resistance!', howToPlay: 'Choose crop-herbicide combos across 3 years to maximize diversity and minimize resistance risk.', component: HerbicideResistor },
  { id: 'life-stage-maze', name: 'Life Stage Maze', icon: '🧩', gradient: 'from-lime-500 to-green-600', category: 'Life Stages', description: 'Connect life stages to the best control methods!', howToPlay: 'Match each weed life stage (seedling, vegetative, reproductive, mature) to the best control method.', component: LifeStageMaze },
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
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={screen === 'grades' ? onClose : screen === 'games' ? backToGrades : backToGames}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors text-lg"
          >←</button>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Practice Games</h1>
            {screen !== 'grades' && (
              <p className="text-sm text-muted-foreground">
                {selectedGrade === 'k5' ? 'Grades K–5' : selectedGrade === '68' ? 'Grades 6–8' : 'Grades 9–12'}
              </p>
            )}
          </div>
        </div>

        {/* Grade Selection */}
        {screen === 'grades' && (
          <div className="grid gap-4 max-w-lg mx-auto mt-8">
            <h2 className="text-center text-lg text-muted-foreground mb-2">Choose Your Level</h2>
            {[
              { id: 'k5', label: 'Grades K–5', sub: 'Explorer', icon: '🌱', gradient: 'from-green-500 to-emerald-600', count: 15 },
              { id: '68', label: 'Grades 6–8', sub: 'Investigator', icon: '🔬', gradient: 'from-blue-500 to-indigo-600', count: 17 },
              { id: '912', label: 'Grades 9–12', sub: 'Specialist', icon: '🧪', gradient: 'from-amber-500 to-orange-600', count: 15 },
            ].map(g => (
              <button
                key={g.id}
                onClick={() => g.count > 0 ? selectGrade(g.id) : undefined}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                  g.count > 0
                    ? 'border-border bg-card hover:scale-[1.02] hover:border-primary cursor-pointer'
                    : 'border-border/50 bg-card/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-2xl shadow-md`}>
                  {g.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-display font-bold text-foreground">{g.label}</h3>
                  <p className="text-sm text-muted-foreground">{g.sub}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {g.count > 0 ? `${g.count} games` : 'Coming Soon'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Game Grid */}
        {screen === 'games' && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {games.map(g => (
              <button
                key={g.id}
                onClick={() => selectGame(g)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg hover:scale-105 transition-transform`}>
                  {g.icon}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight">{g.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Game Info / Launcher */}
        {screen === 'info' && selectedGame && (
          <div className="max-w-md mx-auto mt-8 text-center">
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${selectedGame.gradient} flex items-center justify-center text-5xl shadow-xl mx-auto mb-6`}>
              {selectedGame.icon}
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-1">{selectedGame.name}</h2>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium mb-4">{selectedGame.category}</span>
            <p className="text-foreground mb-4">{selectedGame.description}</p>
            <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-sm text-foreground mb-2">How to Play</h3>
              <p className="text-sm text-muted-foreground">{selectedGame.howToPlay}</p>
            </div>
            <button
              onClick={() => setScreen('playing')}
              className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Play
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
