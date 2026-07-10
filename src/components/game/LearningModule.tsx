import { useState, useMemo } from "react";
import { weeds } from "@/data/weeds";
import type { GradeLevel, Weed } from "@/types/game";
import WeedImage from "./WeedImage";
import WeedDetailPopup from "./WeedDetailPopup";
import HomeButton from "./HomeButton";
import { FAMILY_DESCRIPTIONS, HABITAT_DESCRIPTIONS, LIFECYCLE_DESCRIPTIONS } from "@/data/familyDescriptions";
import { LOOKALIKE_TRIPLES } from "@/data/lookAlikeGroups";
import { TRAIT_DEFS, COMPETITION_TRAITS, type CompetitionTrait } from "@/data/competitionTraits";
import { ArrowLeft, X, Play, ThumbsUp, RotateCcw } from "lucide-react";
import { hasImage, resolveCropImageUrl, resolveInjuryImage } from "@/lib/imageMap";
import { HERBICIDE_MOA, SYMPTOM_TYPES, getMiddleSchoolMOAs } from "@/data/herbicides";
import dandelionHelicopterImg from "@/assets/learning/dandelion_helicopter.jpg";
import surfSeedImg from "@/assets/learning/surf_seed.jpg";
import seedHitchhikerImg from "@/assets/learning/seed_hitchhiker.jpg";
import annualVsPerennialImg from "@/assets/learning/annual_vs_perennial.jpg";
import cropsVsWeedsImg from "@/assets/learning/crops_vs_weeds.jpg";
import partsOfWeedsImg from "@/assets/learning/parts_of_weeds.jpg";
import rootTunnelsImg from "@/assets/learning/root_tunnels.jpg";
import weedInvestigatorImg from "@/assets/learning/weed_investigator.jpg";
import weedInvestigator2Img from "@/assets/learning/weed_investigator_2.jpg";
import fieldMarathonImg from "@/assets/learning/field_marathon.jpg";
import plantPicnicImg from "@/assets/learning/plant_picnic.jpg";
import fiveEssentialsImg from "@/assets/learning/5_essentials.jpg";
import weedSuperheroesImg from "@/assets/learning/weed_fighting_superheroes.jpg";
import invasivePlantImg from "@/assets/learning/invasive_plant.jpg";
import goodWeedsImg from "@/assets/learning/good_weeds.jpg";
import weedBulliesImg from "@/assets/learning/weed_bullies.jpg";
import largeCrabgrassPhoto from "@/assets/learning/large_crabgrass_photo.jpg";
import commonMilkweedPhoto from "@/assets/learning/common_milkweed_photo.jpg";
import plantLifeCycleImg from "@/assets/learning/plant_life_cycle.jpg";
import weedControlToolsImg from "@/assets/learning/weed_control_tools.jpg";
import plantDetectiveImg from "@/assets/learning/plant_detective.jpg";

type TopicId =
  | "names"
  | "seeds"
  | "monocot-dicot"
  | "native-introduced"
  | "families"
  | "habitats"
  | "life-cycles"
  | "life-stages"
  | "look-alikes"
  | "safety"
  | "control-methods"
  | "taxonomy"
  | "dioecious"
  | "ecology"
  | "plant-needs"
  | "intro-control-methods"
  | "plant-parts"
  | "crop-vs-weed"
  | "seasonal-life-cycle"
  | "seed-travel"
  | "weed-problem-picnic"
  | "weed-superheroes"
  | "safe-vs-toxic-explorer"
  | "invasive-playground"
  | "root-tunnels"
  | "distinctive-weeds"
  | "resource-race"
  | "weed-helpers"
  | "field-scouting"
  | "weed-competitors"
  | "economic-threshold"
  | "seed-dormancy"
  | "allelopathy"
  | "herbicide-moa"
  | "crop-injury"
  | "life-stage-control";

type CategoryId = "identification" | "lifecycle" | "control";

// Friendly, K-5 seed descriptions inferred from species traits.
function getElementarySeedDescription(w: Weed): string {
  const name = w.commonName.toLowerCase();
  if (name.includes("dandelion")) return "Fluffy white parachute that floats on the wind.";
  if (name.includes("waterhemp")) return "Tiny, shiny, dark seeds — thousands per plant.";
  if (name.includes("palmer")) return "Very small dark round seeds with a smooth shell.";
  if (name.includes("foxtail")) return "Oval seeds with bristly hairs to catch on fur and clothes.";
  if (name.includes("crabgrass")) return "Small flat seeds that scatter near the parent plant.";
  if (name.includes("velvetleaf")) return "Wedge-shaped seeds with a tough, fuzzy coat.";
  if (name.includes("cocklebur")) return "Bur covered in hooks that grab onto animal fur.";
  if (name.includes("morning glory") || name.includes("bindweed")) return "Hard, dark seeds shaped like little wedges.";
  if (name.includes("thistle")) return "Light seeds with a feathery tuft for flying on the wind.";
  if (name.includes("ragweed")) return "Small crown-shaped seeds with tiny spines.";
  if (name.includes("lambsquarter")) return "Tiny round black seeds — millions can hide in one field.";
  if (name.includes("pigweed")) return "Tiny shiny black seeds that survive a long time in the soil.";
  if (name.includes("nightshade")) return "Round seeds tucked inside a berry that animals eat.";
  if (name.includes("kochia")) return "Small flat seeds — the whole plant tumbles to spread them.";
  if (name.includes("nutsedge")) return "Hard nutlets in the soil that can sprout new plants.";
  if (name.includes("johnson")) return "Plump seeds that look a bit like little grains.";
  if (name.includes("milkweed")) return "Flat brown seeds with a silky white parachute.";
  if (name.includes("burdock")) return "Burs with hooks — the inspiration for Velcro!";
  if (name.includes("plantain")) return "Tiny seeds that get sticky when wet and hitch a ride on shoes.";
  if (name.includes("clover")) return "Tiny round seeds with a hard shell.";
  // Fallback
  return `Small ${w.plantType === "Monocot" ? "grass" : "broadleaf"} seed that helps new ${w.commonName} plants grow.`;
}

// Simple cross-section diagram showing seeds at different soil depths.
function SeedBankDiagram() {
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-background">
      <svg viewBox="0 0 400 220" className="w-full h-auto" role="img" aria-label="Seed bank cross-section diagram">
        {/* Sky */}
        <rect x="0" y="0" width="400" height="40" fill="hsl(var(--muted))" />
        {/* Leaf litter */}
        <rect x="0" y="40" width="400" height="20" fill="#8b6f3a" />
        {/* Topsoil */}
        <rect x="0" y="60" width="400" height="60" fill="#6b4a2b" />
        {/* Deep soil */}
        <rect x="0" y="120" width="400" height="100" fill="#3f2a17" />
        {/* Labels */}
        <text x="8" y="55" fontSize="11" fill="#fff">Leaf litter</text>
        <text x="8" y="78" fontSize="11" fill="#fff">Topsoil — seeds sprout here</text>
        <text x="8" y="140" fontSize="11" fill="#fff">Deep soil — seeds wait for years</text>
        {/* Seeds */}
        {[[40,52],[120,55],[210,50],[320,54],[70,80],[160,90],[250,85],[340,95],[60,150],[140,170],[230,200],[300,160],[360,190]].map(([x,y],i)=> (
          <circle key={i} cx={x} cy={y} r={3.5} fill="#f5d678" stroke="#7a5a1f" strokeWidth="0.8" />
        ))}
        {/* Sprout from topsoil */}
        <path d="M180 60 C 180 45, 175 35, 170 28" stroke="#558B2F" strokeWidth="2" fill="none" />
        <path d="M170 28 q -8 -2 -10 -10" stroke="#558B2F" strokeWidth="2" fill="none" />
        <path d="M170 28 q 8 -2 10 -10" stroke="#558B2F" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

interface CategoryStyle {
  id: CategoryId;
  label: string;
  cardClass: string;
  activeClass: string;
  dotClass: string;
  headerClass: string;
}

const CATEGORIES: Record<CategoryId, CategoryStyle> = {
  identification: {
    id: "identification",
    label: "Identification & Morphology",
    cardClass: "bg-info/5 border-info/40 hover:bg-info/10 hover:border-info/60",
    activeClass: "bg-info text-info-foreground border-info",
    dotClass: "bg-info",
    headerClass: "text-info",
  },
  lifecycle: {
    id: "lifecycle",
    label: "Life Stages, Cycles, Seeds & Habitat",
    cardClass: "bg-success/5 border-success/40 hover:bg-success/10 hover:border-success/60",
    activeClass: "bg-success text-success-foreground border-success",
    dotClass: "bg-success",
    headerClass: "text-success",
  },
  control: {
    id: "control",
    label: "Control, Safety & Field Management",
    cardClass: "bg-terracotta/5 border-terracotta/40 hover:bg-terracotta/10 hover:border-terracotta/60",
    activeClass: "bg-terracotta text-primary-foreground border-terracotta",
    dotClass: "bg-terracotta",
    headerClass: "text-terracotta",
  },
};

interface Topic {
  id: TopicId;
  name: string;
  icon: string;
  description: string;
  grades: GradeLevel[];
  category: CategoryId;
  /** When true, this topic is shown in the Plant Explorer (K-5) tab. */
  plantExplorer?: boolean;
}

const TOPICS: Topic[] = [
  // Identification & Morphology
  {
    id: "names",
    name: "Weed Names & ID",
    icon: "names",
    description: "Recall common and scientific names while analyzing the key traits used to identify each species in the field.",
    grades: ["elementary", "middle", "high"],
    category: "identification",
  },
  {
    id: "monocot-dicot",
    name: "Monocot vs Dicot",
    icon: "monocot",
    description: "Distinguish monocots from dicots by comparing leaf venation, seed structure, and overall growth habit.",
    grades: ["elementary", "middle"],
    category: "identification",
  },
  {
    id: "look-alikes",
    name: "Look-Alike Species",
    icon: "lookalike",
    description: "Compare easily confused weed pairs and evaluate the subtle features that separate one species from another.",
    grades: ["elementary", "middle", "high"],
    category: "identification",
  },
  {
    id: "native-introduced",
    name: "Native vs Introduced",
    icon: "origin",
    description: "Differentiate native species from introduced ones and assess their ecological impact on Midwest cropland.",
    grades: ["elementary", "middle", "high"],
    category: "identification",
  },
  {
    id: "taxonomy",
    name: "Taxonomy",
    icon: "taxonomy",
    description: "Understand the scientific hierarchy used to classify and name every living organism from kingdom to species.",
    grades: ["middle", "high"],
    category: "identification",
  },
  {
    id: "families",
    name: "Plant Families",
    icon: "families",
    description: "Classify weeds into botanical families and explain the shared traits that group them together.",
    grades: ["high"],
    category: "identification",
  },
  {
    id: "dioecious",
    name: "Dioecious Weeds",
    icon: "dioecious",
    description: "Examine weeds that produce separate male and female plants and explain how this affects reproduction and control.",
    grades: ["high"],
    category: "identification",
  },

  // Life Stages, Cycles, Seeds & Habitat
  {
    id: "life-stages",
    name: "Life Stages",
    icon: "stages",
    description: "Identify weeds across seed, seedling, vegetative, and reproductive stages to support timely management decisions.",
    grades: ["elementary", "middle", "high"],
    category: "lifecycle",
  },
  {
    id: "life-cycles",
    name: "Life Cycles",
    icon: "cycles",
    description: "Compare annual, biennial, and perennial growth patterns and predict how each cycle influences control timing.",
    grades: ["elementary", "middle", "high"],
    category: "lifecycle",
  },
  {
    id: "seeds",
    name: "Seeds & Seed Banks",
    icon: "seeds",
    description: "Describe how weed seeds look, spread, and persist in the soil seed bank from one season to the next.",
    grades: ["elementary", "middle", "high"],
    category: "lifecycle",
  },
  {
    id: "seed-dormancy",
    name: "Seed Dormancy",
    icon: "dormancy",
    description: "Analyze how physical, physiological, chemical, and morphological dormancy allow seeds to survive harsh conditions.",
    grades: ["high"],
    category: "lifecycle",
  },
  {
    id: "habitats",
    name: "Habitats & Climate",
    icon: "habitats",
    description: "Predict where each weed thrives across warm, cool, wet, and dry habitats based on its biology.",
    grades: ["elementary", "middle", "high"],
    category: "lifecycle",
  },
  {
    id: "ecology",
    name: "Ecology & Growth Types",
    icon: "ecology",
    description: "Investigate terrestrial, aquatic, and parasitic weeds and explain the unique resources each growth type requires.",
    grades: ["elementary"],
    category: "lifecycle",
  },
  {
    id: "plant-needs",
    name: "What Plants Need",
    icon: "sun",
    description: "Discover the five things every plant needs to grow — sunlight, water, air, nutrients, and space — and learn how weeds steal them from crops.",
    grades: [],
    plantExplorer: true,
    category: "lifecycle",
  },
  {
    id: "intro-control-methods",
    name: "Ways to Control Weeds",
    icon: "control",
    description: "Meet the five main kinds of weed control — physical, cultural, chemical, biological, and preventative — and see when each one is the right tool for the job.",
    grades: [],
    plantExplorer: true,
    category: "control",
  },
  {
    id: "weed-superheroes",
    name: "The 5 Weed-Fighting Superheroes",
    icon: "control",
    description: "Meet the 5 weed-fighting superpowers farmers team up to protect their crops — Pull It, Block It, Outsmart It, Eat It, and Stop It!",
    grades: [],
    plantExplorer: true,
    category: "control",
  },
  {
    id: "plant-parts",
    name: "Parts of a Plant",
    icon: "leaf",
    description: "Take a ground-up tour of a weed — from roots to stem to leaves to flowers to seeds — and learn what each part does for the plant.",
    grades: [],
    plantExplorer: true,
    category: "identification",
  },
  {
    id: "crop-vs-weed",
    name: "Crop or Weed?",
    icon: "leaf",
    description: "Learn the difference between a crop and a weed — it's less about the plant and more about where it's growing.",
    grades: [],
    plantExplorer: true,
    category: "identification",
  },
  {
    id: "seasonal-life-cycle",
    name: "A Plant's Life Cycle",
    icon: "sun",
    description: "Follow a plant's journey through the seasons — from tiny seed to sprout to flower to new seeds — and meet annuals and perennials.",
    grades: [],
    plantExplorer: true,
    category: "lifecycle",
  },
  {
    id: "seed-travel",
    name: "How Do Weed Seeds Travel?",
    icon: "seed",
    description: "Meet three clever seed travelers — parachute jumpers, water surfers, and animal hitchhikers — and see how weeds spread to new places.",
    grades: [],
    plantExplorer: true,
    category: "lifecycle",
  },
  {
    id: "weed-problem-picnic",
    name: "Why Are Weeds a Problem?",
    icon: "control",
    description: "Join the field picnic to see how uninvited weeds gobble up the sunlight, water, nutrients, and space that crops need to grow.",
    grades: [],
    plantExplorer: true,
    category: "control",
  },
  {
    id: "safe-vs-toxic-explorer",
    name: "Safe vs. Toxic Weeds",
    icon: "safety",
    description: "Become a Plant Detective! Learn why some weeds are safe and others are toxic — and how to stay safe when you spot a plant you don't know.",
    grades: [],
    plantExplorer: true,
    category: "control",
  },
  {
    id: "invasive-playground",
    name: "Invasive Plants: The Playground Bullies",
    icon: "leaf",
    description: "Ever played tag with someone way too fast? Meet invasive plants — the players who take over the playground and crowd out the natives.",
    grades: [],
    plantExplorer: true,
    category: "identification",
  },
  {
    id: "root-tunnels",
    name: "The Secret Tunnels of Roots",
    icon: "leaf",
    description: "Some weeds are secret underground explorers! Discover how creeping roots build hidden tunnels and pop up as brand-new plants.",
    grades: [],
    plantExplorer: true,
    category: "lifecycle",
  },
  {
    id: "distinctive-weeds",
    name: "10 Weeds You Can Spot!",
    icon: "leaf",
    description: "Get to know 10 famous weeds by sight — the yellow dandelion, sticky cocklebur, fuzzy foxtails, and more.",
    grades: [],
    plantExplorer: true,
    category: "identification",
  },
  {
    id: "resource-race",
    name: "The Great Garden Race",
    icon: "competition",
    description: "On your mark, get set, grow! Cheer on the crop and farmer as they race the weed for sunlight, water, and nutrients.",
    grades: [],
    plantExplorer: true,
    category: "control",
  },
  {
    id: "weed-helpers",
    name: "Weeds Can Be Helpers Too!",
    icon: "leaf",
    description: "Not every weed is a bad guy! Discover three superpowers that make weeds helpful — feeding bees, holding soil, and loosening the earth.",
    grades: [],
    plantExplorer: true,
    category: "identification",
  },

  // Control, Safety & Field Management
  {
    id: "safety",
    name: "Safety & Control",
    icon: "safety",
    description: "Recognize dangerous and toxic species and apply basic safety practices when handling them in the field.",
    grades: ["elementary", "middle", "high"],
    category: "control",
  },
  {
    id: "control-methods",
    name: "Control Methods",
    icon: "control",
    description: "Compare cultural, mechanical, biological, and chemical control methods and choose the right tool for each situation.",
    grades: ["elementary", "middle", "high"],
    category: "control",
  },
  {
    id: "field-scouting",
    name: "Field Scouting",
    icon: "scouting",
    description: "Apply systematic walking patterns to scout fields and accurately estimate weed pressure across the season.",
    grades: ["middle", "high"],
    category: "control",
  },
  {
    id: "weed-competitors",
    name: "Weed Competition",
    icon: "competition",
    description: "Analyze how weeds compete with crops and one another for light, water, and soil nutrients.",
    grades: ["middle", "high"],
    category: "control",
  },
  {
    id: "economic-threshold",
    name: "Economic Threshold",
    icon: "threshold",
    description: "Evaluate when treatment is justified by weighing control costs against the expected yield loss.",
    grades: ["middle", "high"],
    category: "control",
  },
  {
    id: "allelopathy",
    name: "Allelopathy",
    icon: "allelopathy",
    description: "Explain how certain weeds release chemicals that suppress the growth of neighboring plants.",
    grades: ["high"],
    category: "control",
  },
  {
    id: "herbicide-moa",
    name: "Herbicide MOA",
    icon: "herbicide",
    description: "Classify herbicides by WSSA group and explain how each mode of action disrupts plant function.",
    grades: ["high"],
    category: "control",
  },
  {
    id: "crop-injury",
    name: "Crop Injury Symptoms",
    icon: "injury",
    description: "Diagnose herbicide injury patterns on crops and trace symptoms back to the responsible MOA group.",
    grades: ["high"],
    category: "control",
  },
  {
    id: "life-stage-control",
    name: "Life Stage Control",
    icon: "stagecontrol",
    description: "Choose the most vulnerable growth stage to target weeds for the most effective control outcome.",
    grades: ["high"],
    category: "control",
  },
];

function getTopicWeeds(topicId: TopicId): Weed[] {
  switch (topicId) {
    case "look-alikes":
      return weeds.filter((w) => weeds.some((x) => x.id === w.lookAlike.id));
    case "safety":
      return weeds.filter((w) => w.safetyNote);
    default:
      return weeds;
  }
}

/** Clickable weed name that opens the detail popup */
function ClickableWeedName({
  weed,
  onSelect,
  className = "",
}: {
  weed: Weed;
  onSelect: (w: Weed) => void;
  className?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect(weed);
      }}
      className={`font-semibold text-foreground hover:text-primary hover:underline transition-colors cursor-pointer text-left ${className}`}
    >
      {weed.commonName}
    </button>
  );
}

/** Box view toggle button */
function ViewToggle({ view, onChange }: { view: "list" | "box"; onChange: (v: "list" | "box") => void }) {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        List View
      </button>
      <button
        onClick={() => onChange("box")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "box" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Grid View
      </button>
    </div>
  );
}

/** Box view subheading tile */
function SubheadingBox({
  icon,
  label,
  count,
  description,
  weeds: groupWeeds,
  grade,
  onSelectWeed,
}: {
  icon: string;
  label: string;
  count: number;
  description: string;
  weeds: Weed[];
  grade: GradeLevel;
  onSelectWeed: (w: Weed) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary/30 hover:shadow-card-hover transition-all"
      >
        <div className="font-display font-bold text-foreground text-lg">{label}</div>
        <div className="text-sm text-muted-foreground mt-1">{count} species</div>
        <div className="text-xs text-primary mt-2 font-medium">Explore →</div>
      </button>
    );
  }

  return (
    <div className="bg-card border border-primary/30 rounded-lg p-5 col-span-full space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">{label}</h3>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="px-3 py-1 rounded-md border border-border hover:bg-secondary text-sm font-medium"
        >
          Close
        </button>
      </div>
      <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">{description}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {groupWeeds.map((w) => (
          <div key={w.id} className="bg-secondary/30 border border-border rounded-lg p-3 flex gap-3">
            <div className="w-12 h-12 rounded overflow-hidden shrink-0">
              <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
            </div>
            <div>
              <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
              {grade === "high" && <div className="text-xs text-primary italic">{w.scientificName}</div>}
              <div className="text-xs text-muted-foreground">
                {w.plantType} • {w.lifeCycle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
  onOpenPractice?: (gradeHub: string, gameId?: string) => void;
  initialTopicId?: string;
  onBackToPractice?: () => void;
}

/**
 * Elementary "Weed Names & ID" flashcard deck.
 * One weed per card with large image, sorted into "Confident" and "Review" buckets.
 */
/**
 * Reusable horizontally-scrolling weed gallery with larger thumbnails.
 * Used by topics that need to show every weed without forcing the user to scroll vertically.
 */
function HorizontalWeedRow({
  weeds: list,
  onSelectWeed,
  stage = "flower",
  showScientific = false,
  tileWidth = "9rem",
}: {
  weeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  stage?: "whole" | "flower" | "vegetative" | "seed" | "seedling";
  showScientific?: boolean;
  tileWidth?: string;
}) {
  if (list.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No species in this group.</p>;
  }
  return (
    <div>
      <div className="overflow-x-auto pb-3 -mx-1">
        <div className="flex gap-3 px-1" style={{ minWidth: `${list.length * (parseFloat(tileWidth) + 0.75)}rem` }}>
          {list.map((w) => (
            <div key={w.id} className="text-center shrink-0" style={{ width: tileWidth }}>
              <button
                onClick={() => onSelectWeed(w)}
                className="block w-full rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-colors"
                style={{ aspectRatio: "1 / 1" }}
              >
                <WeedImage weedId={w.id} stage={stage} className="w-full h-full" />
              </button>
              <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs mt-1.5 block" />
              {showScientific && (
                <p className="text-[10px] text-primary italic leading-tight">{w.scientificName}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">← Scroll to see all {list.length} species →</p>
    </div>
  );
}

/**
 * Curated K-5 look-alike groups. Each group has 2–4 weeds that are genuinely confused
 * in the field (same genus or very similar morphology), along with a kid-friendly
 * "How to tell them apart" guide. Family-only matches that aren't truly look-alikes
 * (e.g. Woolly Cupgrass vs Shattercane) are intentionally excluded.
 */
const ELEM_LOOKALIKE_GROUPS: { title: string; weedIds: string[]; difference: string }[] = [
  {
    title: "Pigweed Family (Amaranths)",
    weedIds: ["waterhemp", "palmer-amaranth", "Redroot_pigweed"],
    difference:
      "All three have small green flowers and grow tall. Palmer Amaranth has the longest seedhead (often longer than your hand) and a leaf stem (petiole) longer than the leaf itself. Waterhemp has smooth, hairless stems and skinnier leaves. Redroot Pigweed has hairy stems and a reddish root.",
  },
  {
    title: "Foxtail Grasses",
    weedIds: ["giant-foxtail", "green-foxtail", "yellow-foxtail"],
    difference:
      "All three have fuzzy seedheads that look like a fox's tail. Giant Foxtail is the tallest with a droopy, nodding head and hairs on top of the leaves. Green Foxtail has a small, upright green head and no hairs. Yellow Foxtail has a stiff yellowish head and long hairs near the base of the leaf.",
  },
  {
    title: "Bindweeds (Climbing Vines)",
    weedIds: ["Field_bindweed", "Hedge_bindweed"],
    difference:
      "Both have white or pink trumpet-shaped flowers and twist around other plants. Field Bindweed has small flowers (about an inch) and arrowhead-shaped leaves. Hedge Bindweed has large flowers (2–3 inches) and bigger leaves with squared-off bottoms.",
  },
  {
    title: "Ragweeds",
    weedIds: ["common-ragweed", "giant-ragweed"],
    difference:
      "Both make lots of pollen that causes allergies. Common Ragweed is short (1–3 feet) with fern-like, lacy leaves. Giant Ragweed grows huge (up to 10 feet!) with big leaves that have 3 to 5 large lobes — like a giant hand.",
  },
  {
    title: "Thistles (Spiny Weeds)",
    weedIds: ["canada-thistle", "Musk_thistle", "Russian_thistle"],
    difference:
      "All three have spines and prickly leaves. Canada Thistle has small purple flowers and spreads underground in big patches. Musk Thistle has a single huge purple flower that nods over to one side. Russian Thistle (tumbleweed) is bushy and rolls across the ground when it dries out.",
  },
  {
    title: "Smartweeds",
    weedIds: ["pennsylvania-smartweed", "Water_smartweed"],
    difference:
      "Both have pink flower spikes and a papery sheath around the stem joints. Pennsylvania Smartweed grows in fields and along roads with upright stems. Water Smartweed grows in wet places like ponds with leaves that often float on the water.",
  },
  {
    title: "Mustards (Yellow-Flowered)",
    weedIds: ["Wild_mustard", "yellow_Rocket", "Shepherds_Purse"],
    difference:
      "All three are in the mustard family with four-petal flowers. Wild Mustard has bright yellow flowers and big lobed leaves. Yellow Rocket has yellow flowers too but smaller, shinier leaves that stay green all winter. Shepherd's Purse has tiny white flowers and little heart-shaped seed pods that look like purses.",
  },
  {
    title: "Chickweeds & Small Spring Weeds",
    weedIds: ["CommonChickweed", "Mouseear_chickweed", "Henbit_deadnettle"],
    difference:
      "All three are short weeds you see in early spring. Common Chickweed has tiny white star-shaped flowers and a single line of hairs down one side of the stem. Mouse-ear Chickweed is covered in soft fuzzy hairs all over (like a mouse's ear!). Henbit has pink-purple flowers and square stems because it's in the mint family.",
  },
  {
    title: "Nightshades (Berry-Makers — Don't Eat!)",
    weedIds: ["Eastern_black_nightshade", "Horsenettle", "Buffalobur"],
    difference:
      "All three make round berries that are POISONOUS. Eastern Black Nightshade has smooth leaves and black berries when ripe. Horsenettle has spines on its leaves and yellow berries. Buffalobur is covered in sharp yellow spines everywhere — even on the fruit!",
  },
  {
    title: "Wild Carrot Look-Alikes (Be Careful!)",
    weedIds: ["Wild_Carrot", "poison-hemlock", "golden-alexanders"],
    difference:
      "All three have lacy leaves and flat clusters of small flowers. Wild Carrot (Queen Anne's Lace) has white flowers and a hairy stem that smells like carrot. Poison Hemlock has white flowers too but a SMOOTH stem with purple spots — it is very dangerous and should never be touched. Golden Alexanders has bright yellow flowers instead of white.",
  },
  {
    title: "Crabgrass & Look-Alike Grasses",
    weedIds: ["large-crabgrass", "Witchgrass", "barnyardgrass"],
    difference:
      "All three are summer grasses that sprawl across the ground. Large Crabgrass has wide leaves with hairs and finger-like seed branches. Witchgrass has very hairy leaves and a huge airy seedhead that breaks off and tumbles. Barnyardgrass has thick reddish stems at the base and bumpy seedheads with no hairs.",
  },
  {
    title: "Lambsquarters Look-Alikes",
    weedIds: ["lambsquarters", "Redroot_pigweed", "Russian_thistle"],
    difference:
      "All three are tall summer weeds with small green flowers. Lambsquarters has dusty white powder on the back of its diamond-shaped leaves. Redroot Pigweed has hairy stems and a bright reddish-pink root. Russian Thistle has skinny spiny leaves and turns into a tumbleweed when it dries up.",
  },
  {
    title: "Morningglory Vines",
    weedIds: ["Tall_morningglory", "Field_bindweed", "Wild_buckwheat"],
    difference:
      "All three are twining vines that climb on other plants. Tall Morningglory has big purple or blue trumpet flowers and heart-shaped leaves. Field Bindweed has smaller white or pink trumpet flowers and arrowhead leaves. Wild Buckwheat looks similar but has tiny greenish flowers in clusters — no trumpets — and a papery sheath where the leaf meets the stem.",
  },
];

function ElementaryLookAlikeGroups({ onSelectWeed }: { onSelectWeed: (w: Weed) => void }) {
  return (
    <div className="space-y-4">
      {ELEM_LOOKALIKE_GROUPS.map((g) => {
        const members = g.weedIds
          .map((id) => weeds.find((w) => w.id === id))
          .filter((w): w is Weed => Boolean(w));
        if (members.length < 2) return null;
        return (
          <div key={g.title} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="font-display font-bold text-foreground text-base">
              {g.title} <span className="text-xs text-muted-foreground font-normal">({members.length} look-alikes)</span>
            </p>
            <div className={`grid gap-3 ${members.length === 2 ? "grid-cols-2" : members.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
              {members.map((w) => (
                <div key={w.id} className="text-center">
                  <button
                    onClick={() => onSelectWeed(w)}
                    className="block w-full rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-colors"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                  </button>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs mt-1.5 block" />
                </div>
              ))}
            </div>
            <div className="bg-muted/30 rounded p-3 text-xs text-foreground">
              <p className="font-semibold text-primary mb-1">How to tell them apart:</p>
              <p>{g.difference}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Reusable flip flashcard deck.
 * - Image is shown on the front; click the card to flip and reveal the name.
 * - User sorts each card into "I'm confident" or "Want to review more".
 * - After all cards are sorted, a recap is shown with the option to review only the review pile.
 */
function WeedFlashcardDeck({
  weeds: fullDeck,
  onSelectWeed,
  stage = "flower",
  emphasizeScientific = false,
  hideImage = false,
}: {
  weeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  stage?: "whole" | "flower" | "vegetative" | "seed" | "seedling";
  emphasizeScientific?: boolean;
  hideImage?: boolean;
}) {
  const [activeDeck, setActiveDeck] = useState<Weed[]>(fullDeck);
  const [index, setIndex] = useState(0);
  const [confident, setConfident] = useState<string[]>([]);
  const [review, setReview] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);

  const total = activeDeck.length;
  const done = index >= total;
  const current = !done ? activeDeck[index] : null;

  const reset = (deck: Weed[]) => {
    setActiveDeck(deck);
    setIndex(0);
    setConfident([]);
    setReview([]);
    setFlipped(false);
  };

  const sortCard = (bucket: "confident" | "review") => {
    if (!current) return;
    if (bucket === "confident") setConfident((p) => [...p, current.id]);
    else setReview((p) => [...p, current.id]);
    setIndex((i) => i + 1);
    setFlipped(false);
  };

  const reviewOnly = () => {
    const reviewDeck = fullDeck.filter((w) => review.includes(w.id));
    if (reviewDeck.length > 0) reset(reviewDeck);
  };

  if (!done && current) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Card {index + 1} of {total}</span>
          <span>
            <span className="text-success font-semibold">Confident: {confident.length}</span>{" · "}
            <span className="text-terracotta font-semibold">Review: {review.length}</span>
          </span>
        </div>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="block w-full rounded-xl overflow-hidden bg-muted border-2 border-border hover:border-primary transition-colors text-left"
          style={{ perspective: "1000px" }}
        >
          <div className="relative w-full aspect-[4/3] max-h-[26rem]">
            {!flipped ? (
              <div className="absolute inset-0 flex flex-col">
                {hideImage ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center bg-card">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-muted-foreground">
                      Identify from these traits
                    </p>
                    {current.traits && current.traits.length > 0 ? (
                      <ul className="text-sm text-foreground text-left list-disc list-inside space-y-1 max-w-md">
                        {current.traits.slice(0, 5).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-foreground">{current.memoryHook}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground italic mt-1">
                      {current.plantType} • {current.lifeCycle}
                    </p>
                    <p className="text-[11px] text-muted-foreground py-1.5 mt-2 border-t border-border w-full">
                      Tap card to reveal the name
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <WeedImage weedId={current.id} stage={stage} className="w-full h-full" />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center py-1.5 bg-card border-t border-border">
                      Tap card to reveal the name
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-card flex flex-col items-center justify-center gap-2 p-5 text-center">
                {emphasizeScientific ? (
                  <>
                    <p className="font-display font-bold text-primary italic text-2xl sm:text-3xl">
                      {current.scientificName}
                    </p>
                    <p className="text-sm text-foreground">
                      Common name: <strong>{current.commonName}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Family: {current.family} • {current.plantType}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display font-bold text-foreground text-2xl sm:text-3xl">
                      {current.commonName}
                    </p>
                    <p className="text-sm italic text-primary">{current.scientificName}</p>
                    <p className="text-xs text-muted-foreground">
                      {current.plantType} • {current.lifeCycle}
                    </p>
                  </>
                )}
                {current.memoryHook && (
                  <p className="text-xs text-primary bg-primary/10 rounded-md px-3 py-1.5 mt-1">
                    <span className="font-bold">Memory trick:</span> {current.memoryHook}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">Tap card to flip back</p>
              </div>
            )}
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => sortCard("review")}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-terracotta/40 bg-terracotta/5 text-terracotta font-semibold hover:bg-terracotta/15 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Want to review more
          </button>
          <button
            onClick={() => sortCard("confident")}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-success/40 bg-success/10 text-success font-semibold hover:bg-success/20 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            I'm confident
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-6 space-y-5">
      <div className="text-center">
        <h3 className="font-display font-bold text-foreground text-xl">Great work!</h3>
        <p className="text-sm text-muted-foreground">You sorted all {total} cards.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-success/40 bg-success/5 p-4">
          <p className="font-display font-bold text-success text-sm mb-2">Confident ({confident.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {confident.map((id) => {
              const w = activeDeck.find((d) => d.id === id);
              if (!w) return null;
              return (
                <div key={id} className="text-center">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    <WeedImage weedId={w.id} stage={stage} className="w-full h-full" />
                  </div>
                  <p className="text-[10px] mt-1 text-foreground truncate">{w.commonName}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-terracotta/40 bg-terracotta/5 p-4">
          <p className="font-display font-bold text-terracotta text-sm mb-2">Want to review more ({review.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {review.map((id) => {
              const w = activeDeck.find((d) => d.id === id);
              if (!w) return null;
              return (
                <div key={id} className="text-center">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    <WeedImage weedId={w.id} stage={stage} className="w-full h-full" />
                  </div>
                  <p className="text-[10px] mt-1 text-foreground truncate">{w.commonName}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {review.length > 0 && (
          <button
            onClick={reviewOnly}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-terracotta text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            Review only my {review.length} review card{review.length === 1 ? "" : "s"}
          </button>
        )}
        <button
          onClick={() => reset(fullDeck)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="w-4 h-4" />
          Start over with all {fullDeck.length}
        </button>
      </div>
    </div>
  );
}

/** Maps a topic + grade to a Practice Hub game id. */
const PRACTICE_GAME_MAP: Partial<Record<TopicId, Partial<Record<GradeLevel, string>>>> = {
  names: { elementary: "name-the-weed", middle: "ms-name-weed", high: "hs-name-weed" },
  "monocot-dicot": { elementary: "taxonomy-tower", middle: "ms-taxonomy" },
  "look-alikes": { elementary: "look-alike", middle: "native-lookalike", high: "spot-differences" },
  "native-introduced": { elementary: "invasive-id", middle: "weed-origins", high: "invasive-habitat" },
  taxonomy: { middle: "ms-taxonomy", high: "hs-taxonomy" },
  dioecious: { high: "spot-differences" },
  "life-stages": { elementary: "life-stages", middle: "life-stage-control", high: "life-stage-maze" },
  "life-cycles": { elementary: "life-cycle-match", middle: "ms-lifecycle", high: "hs-lifecycle" },
  seeds: { elementary: "seed-banks", middle: "seed-banks", high: "sleepy-seeds" },
  "seed-dormancy": { high: "sleepy-seeds" },
  habitats: { elementary: "habitat-mapping", middle: "ms-habitat", high: "hs-habitat" },
  ecology: { elementary: "ecology-scramble", middle: "pest-id" },
  safety: { elementary: "safe-vs-toxic", middle: "ms-safe-toxic" },
  "control-methods": { elementary: "weed-control", middle: "ms-weed-control", high: "hs-weed-control" },
  "field-scouting": { middle: "field-scout", high: "hs-field-scout" },
  "weed-competitors": { middle: "weed-competitors" },
  "economic-threshold": { middle: "economic-threshold", high: "form-farm" },
  allelopathy: { high: "allelopathy" },
  "herbicide-moa": { middle: "control-matching", high: "hs-control-match" },
  "crop-injury": { high: "crop-doctor" },
  "life-stage-control": { high: "life-stage-maze" },
};

const GRADE_TO_HUB: Record<GradeLevel, string> = { elementary: "k5", middle: "68", high: "912" };

function PracticeButton({
  topicId,
  grade,
  onOpenPractice,
}: {
  topicId: TopicId;
  grade: GradeLevel;
  onOpenPractice?: (gradeHub: string, gameId?: string) => void;
}) {
  if (!onOpenPractice) return null;
  const gameId = PRACTICE_GAME_MAP[topicId]?.[grade];
  if (!gameId) return null;
  return (
    <button
      onClick={() => onOpenPractice(GRADE_TO_HUB[grade], gameId)}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-success text-success-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
    >
      <Play className="w-4 h-4" />
      Try this in a Practice Game
    </button>
  );
}

export default function LearningModule({ onClose, onOpenPractice, initialTopicId, onBackToPractice }: Props) {
  // Learning modules have been shifted up one level. The UI tab the user picks
  // ("displayGrade") is mapped to the original data grade ("sourceGrade") so all
  // existing topic content, weed lists, and practice mappings keep working:
  //   Plant Explorer (K-5)        -> coming soon (placeholder)
  //   Field Scout (6-8)           <- old K-5 (elementary) content
  //   IPM Specialist (9-12)       <- old 6-8 (middle) content
  //   Collegiate                  <- old 9-12 (high) content
  type LearningGradeLevel = GradeLevel | "collegiate";
  const displayToSource: Record<LearningGradeLevel, GradeLevel | null> = {
    elementary: "elementary",
    middle: "elementary",
    high: "middle",
    collegiate: "high",
  };
  const sourceToDisplay: Record<GradeLevel, LearningGradeLevel> = {
    elementary: "middle",
    middle: "high",
    high: "collegiate",
  };
  // Infer display grade from the initial topic so the topic actually appears in the tab.
  const initialGrade: LearningGradeLevel = (() => {
    if (!initialTopicId) return "elementary";
    const t = TOPICS.find((x) => x.id === (initialTopicId as TopicId));
    if (!t) return "elementary";
    if (t.plantExplorer) return "elementary";
    // Prefer the lowest source grade the topic supports, then shift up.
    if (t.grades.includes("elementary")) return sourceToDisplay.elementary;
    if (t.grades.includes("middle")) return sourceToDisplay.middle;
    if (t.grades.includes("high")) return sourceToDisplay.high;
    return "middle";
  })();
  const [selectedGrade, setSelectedGrade] = useState<LearningGradeLevel>(initialGrade);
  const sourceGrade: GradeLevel = displayToSource[selectedGrade] ?? "elementary";
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(
    (initialTopicId as TopicId) ?? null,
  );
  const [selectedWeed, setSelectedWeed] = useState<Weed | null>(null);
  const viewMode: "list" | "box" = "list";

  const availableTopics = useMemo(() => {
    if (selectedGrade === "elementary") {
      return TOPICS.filter((t) => t.plantExplorer);
    }
    const src = displayToSource[selectedGrade];
    if (!src) return [];
    return TOPICS.filter((t) => !t.plantExplorer && t.grades.includes(src));
  }, [selectedGrade]);

  const topicsByCategory = useMemo(() => {
    const order: CategoryId[] = ["identification", "lifecycle", "control"];
    return order
      .map((cat) => ({ category: CATEGORIES[cat], topics: availableTopics.filter((t) => t.category === cat) }))
      .filter((g) => g.topics.length > 0);
  }, [availableTopics]);

  const gradeCards: { grade: LearningGradeLevel; label: string; color: string }[] = [
    { grade: "elementary", label: "Plant Explorer (K-5)", color: "border-grade-elementary" },
    { grade: "middle", label: "Field Scout (6-8)", color: "border-grade-middle" },
    { grade: "high", label: "IPM Specialist (9-12)", color: "border-grade-high" },
    { grade: "collegiate", label: "Collegiate", color: "border-primary" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HomeButton onClose={onClose} />
            <span className="text-border mx-1">|</span>
            {selectedTopic && (
              <button
                onClick={() => {
                  setSelectedTopic(null);
                }}
                className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl font-display font-bold text-foreground">Learning Module</h1>
          </div>
          <div className="flex items-center gap-2">
            {onBackToPractice && (
              <button
                onClick={onBackToPractice}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-success/40 bg-success/10 text-success text-sm font-semibold hover:bg-success/20 transition-colors"
              >
                <Play className="w-4 h-4" /> Back to Practice
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {gradeCards.map(({ grade, label, color }) => (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrade(grade);
                setSelectedTopic(null);
              }}
              className={`flex-1 py-2.5 rounded-md border text-center text-sm font-medium transition-all duration-200 ${
                selectedGrade === grade
                  ? `${color} bg-card shadow-subtle`
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!selectedTopic ? (
          <div className="space-y-6">
            {topicsByCategory.map(({ category, topics }) => (
              <section key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${category.dotClass}`} />
                  <h2 className={`text-sm font-display font-bold uppercase tracking-wide ${category.headerClass}`}>
                    {category.label}
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`rounded-lg p-4 text-left border shadow-sm transition-all duration-200 ${category.cardClass}`}
                    >
                      <div className="font-display font-bold text-foreground text-sm mb-1.5 leading-snug">
                        {topic.name}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{topic.description}</div>
                      <div className="text-[11px] text-foreground/70 mt-2 font-medium">
                        {getTopicWeeds(topic.id).length} species →
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            {/* Left sidebar: topic list grouped by category */}
            <aside className="space-y-5 lg:sticky lg:top-6 self-start">
              {topicsByCategory.map(({ category, topics }) => (
                <div key={category.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${category.dotClass}`} />
                    <h3 className={`text-[11px] font-display font-bold uppercase tracking-wide ${category.headerClass}`}>
                      {category.label}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    {topics.map((topic) => {
                      const isActive = selectedTopic === topic.id;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => setSelectedTopic(topic.id)}
                          className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-all duration-200 border ${
                            isActive
                              ? category.activeClass
                              : `${category.cardClass} text-foreground/80`
                          }`}
                        >
                          {topic.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </aside>
            {/* Topic content */}
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <h2 className="text-lg font-display font-bold text-foreground">
                  {TOPICS.find((t) => t.id === selectedTopic)?.name}
                </h2>
                <PracticeButton
                  topicId={selectedTopic}
                  grade={sourceGrade}
                  onOpenPractice={onOpenPractice}
                />
              </div>
              <TopicContent
                topicId={selectedTopic}
                grade={sourceGrade}
                topicWeeds={getTopicWeeds(selectedTopic)}
                onSelectWeed={setSelectedWeed}
                viewMode={viewMode}
                onOpenPractice={onOpenPractice}
              />
              {(() => {
                // Match the display order (grouped by category) so Previous/Next
                // walks the modules in the same order the user sees them.
                const orderedTopics = topicsByCategory.flatMap((g) => g.topics);
                const idx = orderedTopics.findIndex((t) => t.id === selectedTopic);
                const prev = idx > 0 ? orderedTopics[idx - 1] : null;
                const next = idx >= 0 && idx < orderedTopics.length - 1 ? orderedTopics[idx + 1] : null;
                return (
                  <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row gap-3 sm:justify-between">
                    <button
                      onClick={() => prev && setSelectedTopic(prev.id)}
                      disabled={!prev}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span className="flex flex-col items-start leading-tight">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Previous module</span>
                        <span>{prev ? prev.name : "No previous module"}</span>
                      </span>
                    </button>
                    <button
                      onClick={() => next && setSelectedTopic(next.id)}
                      disabled={!next}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-right sm:flex-row-reverse"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0 rotate-180" />
                      <span className="flex flex-col items-end leading-tight">
                        <span className="text-[10px] uppercase tracking-wide opacity-80">Next module</span>
                        <span>{next ? next.name : "No next module"}</span>
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {selectedWeed && <WeedDetailPopup weed={selectedWeed} onClose={() => setSelectedWeed(null)} />}
    </div>
  );
}

/** All topic content rendering */
function TopicContent({
  topicId,
  grade,
  topicWeeds,
  onSelectWeed,
  viewMode,
  onOpenPractice,
}: {
  topicId: TopicId;
  grade: GradeLevel;
  topicWeeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  viewMode: "list" | "box";
  onOpenPractice?: (gradeHub: string, gameId?: string) => void;
}) {
  switch (topicId) {
    /* ═══════════════════════════════════════════════════════════
       NAMES
    ═══════════════════════════════════════════════════════════ */
    case "names":
      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">What Makes a Plant a Weed?</p>
              <p>
                A <strong>weed</strong> is a plant growing where someone does not want it. The same plant can be a weed in
                a corn field but a wildflower along a road. Weeds usually grow fast, spread easily, and can crowd out the
                plants we want to keep, like crops in a farmer's field.
              </p>
              <p>
                Each weed has a <strong>common name</strong> we use every day. Look at the picture, guess the name,
                then tap the card to check yourself.
              </p>
            </div>
            <WeedFlashcardDeck weeds={topicWeeds} onSelectWeed={onSelectWeed} stage="flower" />
          </div>
        );
      }

      if (grade === "middle") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Common Names</p>
              <p>
                A weed is any plant growing where it is not wanted, often spreading quickly and competing with crops or
                other plants for <strong>sunlight, water, and nutrients</strong>. Plants are usually grouped as either
                <strong> pest plants</strong> (those that cause harm, reduce yields, or crowd out the plants we want)
                or <strong>beneficial plants</strong> (those that provide food, habitat, or improve the soil). A weed is
                a pest plant in the place it is currently growing, even if the same species could be useful somewhere
                else.
              </p>
              <p>
                Weeds are frequently known by <strong>multiple common names</strong> that vary by region, state, and
                country, which can create significant confusion in identification and communication among farmers,
                scientists, and land managers.
              </p>
              <p>
                A single plant species may carry entirely different names depending on geographic location, local
                tradition, or historical usage. This inconsistency in naming makes accurate communication about weed
                identification and management more difficult across different regions and disciplines.
              </p>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground space-y-3">
              <p className="font-bold text-accent">Why use scientific names?</p>
              <p>
                Common names serve as a practical and accessible starting point for learning weed identification, but
                they have clear <strong>limitations when precision is required</strong>. This is why common names are
                always best used alongside <strong>scientific naming systems</strong> that provide a consistent,
                universally recognized identity for every plant species.
              </p>
            </div>

            <WeedFlashcardDeck weeds={topicWeeds} onSelectWeed={onSelectWeed} stage="flower" />
          </div>
        );
      }

      // 9-12 (high) - Scientific Names / Binomial Nomenclature
      {
        const waterhemp = topicWeeds.find(w => w.commonName === "Waterhemp") || topicWeeds[0];
        const foxtails = topicWeeds.filter(w => w.scientificName.startsWith("Setaria"));
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Scientific Names</p>
              <p>
                Weeds are plants growing in undesirable locations. Weeds impact <strong>crop yields, input costs</strong>,
                and overall farm success. According to the Weed Science Society of America, without weed control in corn,
                soybean, and sugar beet fields across North America, farmers would lose roughly{" "}
                <strong>50% of corn</strong>, <strong>52% of soybean</strong>, and <strong>72% of sugar beet</strong>{" "}
                yields each year (
                <a
                  href="https://wssa.net/resources/weed-impacts-on-crop-yields/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  WSSA: Weed Impacts on Crop Yields
                </a>
                ).
              </p>
              <p>
                At a national and global level, scientists need more precise terms to ensure they are discussing the same
                plant. Scientific names are written in the form of <strong>binomial nomenclature</strong>.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">What is Binomial Nomenclature?</p>
              <p>
                Binomial nomenclature is the formal, two-term scientific system for naming plants, which uses terms
                in Latin to state the <strong>genus</strong> and <strong>species</strong>. It was developed by
                <strong> Carl Linnaeus</strong> in the 18th century to provide a standardized, universal name for species
                worldwide.
              </p>
            </div>

            {/* Waterhemp example */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Example: {waterhemp.commonName}</p>
              <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-4 items-start">
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted border border-border">
                  <WeedImage weedId={waterhemp.id} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-3">
                  <p className="text-lg italic text-primary font-bold">{waterhemp.scientificName}</p>
                  <p className="text-sm text-foreground">
                  Also known as <strong>{waterhemp.commonName}</strong>. A weed often found near rivers and wet field
                  edges, known for its smooth hairless stems and distinct leaf shape.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  <div className="bg-primary/10 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">GENUS</p>
                    <p className="font-bold text-foreground italic">{waterhemp.scientificName.split(' ')[0]}</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">SPECIES</p>
                    <p className="font-bold text-foreground italic">{waterhemp.scientificName.split(' ')[1]}</p>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Foxtail genus comparison */}
            {foxtails.length >= 2 && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-5 space-y-3">
                <p className="font-display font-bold text-foreground text-base">Genus Relationships: Foxtails</p>
                <p className="text-sm text-foreground">
                  Plants with scientific names closer in form can be more closely related. These foxtails all share
                  the genus <strong className="italic">Setaria</strong>, showing their common lineage and characteristics.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {foxtails.slice(0, 3).map(w => (
                    <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className="aspect-square w-full rounded-md overflow-hidden bg-muted border border-border mb-2">
                        <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs font-bold" />
                      <p className="text-xs text-primary italic mt-1">{w.scientificName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual ID reference */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <p className="font-display font-bold text-foreground text-base">Visual ID Reference</p>
              <p className="text-sm text-muted-foreground">
                Each card pairs a reproductive-stage photo with the diagnostic features you would use in the field.
                Use the image plus the trait list to narrow your ID, then confirm with the scientific name and family.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicWeeds.map((w) => (
                  <div
                    key={`idref-${w.id}`}
                    className="bg-background border border-border rounded-lg p-3 grid grid-cols-[7rem_1fr] gap-3"
                  >
                    <div className="aspect-square w-full rounded-md overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <ClickableWeedName
                        weed={w}
                        onSelect={onSelectWeed}
                        className="font-display font-bold text-sm text-foreground block"
                      />
                      <p className="text-xs italic text-primary">{w.scientificName}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Family: <span className="text-foreground normal-case">{w.family}</span> • {w.plantType} • {w.lifeCycle}
                      </p>
                      {w.traits && w.traits.length > 0 && (
                        <ul className="text-xs text-foreground list-disc list-inside space-y-0.5">
                          {w.traits.slice(0, 4).map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      )}
                      {w.memoryHook && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          <span className="font-semibold text-foreground not-italic">Tip:</span> {w.memoryHook}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

    /* ═══════════════════════════════════════════════════════════
       SEEDS
    ═══════════════════════════════════════════════════════════ */
    case "seeds":
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">About Weed Seeds</p>
            {grade === "elementary" && (
              <>
                <p>
                  Every weed starts as a tiny <strong>seed</strong>. Some seeds are round, some are flat, and some have
                  tiny hooks or wings to help them travel. Seeds can hide in the soil for a long time in something
                  called a <strong>seed bank</strong>. Even if you remove all the weeds you see, seeds underground can
                  sprout later.
                </p>
                <p>
                  Seeds look different based on what weed they come from, and their characteristics can help them
                  travel by <strong>wind, water, or by sticking to animals</strong>. Seeds can also have hard shells
                  called a <strong>seed coat</strong> that protect them from damage and help them survive in the soil
                  during cold winters.
                </p>
                <p>
                  Seeds in seed banks can help us predict how many weeds will be in the field the next year. If you
                  find lots of seeds of waterhemp in a seed bank, it is likely you will find many waterhemp plants in
                  the area during the next growing season.
                </p>
              </>
            )}
            {grade === "middle" && (
              <>
                <p>If competing for light and nutrients is a weed's day job, then seed strategy is its long game.</p>
                <p>
                  A single weed plant can produce anywhere from a few hundred to hundreds of thousands of seeds in one
                  growing season. But raw numbers are only part of the story — what makes weeds truly hard to beat is
                  how those seeds are built to survive.
                </p>
                <p>
                  <strong>Dormancy</strong> is one of the most powerful tricks in a seed's playbook. Rather than
                  sprouting the moment they hit the ground, many weed seeds can pause their development and wait —
                  sometimes for decades — until conditions are just right. Common lambsquarters seeds have been found
                  viable in soil after 40 years. This means that even if you eliminate every weed in a field, a hidden
                  seed bank underground can reinfest it for years to come.
                </p>
                <p>
                  <strong>Seed dispersal</strong> is how weeds spread their bets across the landscape. Different
                  species have evolved remarkably creative ways to move their seeds far from the parent plant. Some,
                  like dandelion and common ragweed, produce lightweight seeds with feathery attachments that float on
                  the wind. Others, like common burdock and cocklebur, grow hooked burs that hitchhike on animal fur or
                  clothing — nature's version of velcro. Pokeweed and eastern black nightshade produce fleshy berries
                  that birds eat and then deposit far away, seeds and all, in a ready-made package of fertilizer.
                </p>
                <p>
                  <strong>Seed quantity vs. seed quality</strong> is another strategic split. Some weeds go all-in on
                  volume — waterhemp can produce up to 250,000 seeds per plant, betting that sheer numbers guarantee a
                  few survivors. Others invest more energy into fewer, hardier seeds with thick protective coats that
                  resist digestion, drought, and even some herbicide applications.
                </p>
                <p>
                  <strong>Timing germination</strong> is the final piece of the puzzle. Many weed seeds don't all
                  sprout at once — they stagger their germination across weeks or even months. This is called
                  <strong> germination staggering</strong>, and it's a brilliant survival hedge. If a late frost, a
                  herbicide application, or a drought wipes out the first wave of seedlings, the next wave is already
                  queued up and ready to go. It's the same reason you can spray a field and think you've won, only to
                  see a fresh flush of weeds emerge two weeks later.
                </p>
                <div className="bg-card border border-border rounded-lg p-3 mt-2">
                  <p className="font-bold text-foreground text-sm mb-2">Key definitions</p>
                  <dl className="text-xs space-y-1.5">
                    {[
                      ["Seed bank", "The reservoir of dormant seeds living in the soil, sometimes for many years."],
                      ["Dormancy", "A seed's ability to pause development and wait until growing conditions are favorable."],
                      ["Seed dispersal", "The ways seeds travel away from the parent plant — wind, animals, water, or hitchhiking."],
                      ["Germination staggering", "When seeds in the same population sprout at different times, spreading the risk of total wipeout."],
                      ["Seed coat", "The tough outer layer of a seed that protects it from physical damage, digestion, and harsh conditions."],
                      ["Viable", "A seed that is still alive and capable of germinating when conditions are right."],
                    ].map(([term, def]) => (
                      <div key={term} className="grid grid-cols-[10rem_1fr] gap-2">
                        <dt className="font-semibold text-primary">{term}</dt>
                        <dd className="text-foreground">{def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}
            {grade === "high" && (
              <>
                <p>
                  Seed biology drives nearly every weed management decision a grower makes. Each year a mature weed
                  releases new seeds into the field, called <strong>seed rain</strong>. Those seeds join the
                  <strong> soil seed bank</strong>, the underground reservoir of viable seeds that can germinate now
                  or wait dormant for years. A single field can hold millions of weed seeds per acre.
                </p>
                <p>
                  The seed bank shifts over time through <strong>seed bank dynamics</strong>: new inputs from seed
                  rain, losses from germination, predation by insects and rodents, microbial decay, and burial too
                  deep for emergence. Seeds also use <strong>dormancy mechanisms</strong> (physical, physiological,
                  or chemical) to delay germination until soil temperature, moisture, and light are right, which is
                  why one wet spring can pull years of buried seeds out of the bank at once.
                </p>
                <p>
                  Weed seeds spread through four main <strong>dispersal vectors</strong>. <strong>Wind
                  (anemochory)</strong> carries lightweight seeds with wings or tufts, like dandelion and horseweed.
                  <strong> Water (hydrochory)</strong> floats seeds along ditches, streams, and irrigation lines.
                  <strong> Animals (zoochory)</strong> move seeds by eating fruit and depositing them, or by
                  carrying burrs and barbs on fur and feathers. <strong>Humans and machinery (anthropochory)</strong>
                  spread seeds farther and faster than any other vector through combines, tillage equipment,
                  vehicles, manure, and contaminated crop seed.
                </p>
                <p>
                  The <strong>economic threshold</strong> for weed management is often linked to preventing seed bank
                  replenishment. Allowing even a few plants to set seed can negate years of control efforts.
                </p>
              </>
            )}
          </div>

          {grade === "elementary" && (
            <>
              {/* Seed Bank diagram */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <p className="font-display font-bold text-foreground text-base">What is a Seed Bank?</p>
                <p className="text-sm text-foreground">
                  A <strong>seed bank</strong> is all the weed seeds hiding in the soil, waiting to grow. Some
                  seeds sit right on top in the leaves, others are tucked into the topsoil where they sprout fastest,
                  and some get buried deep where they can wait for years until a plow or storm brings them back up.
                </p>
                <SeedBankDiagram />
              </div>

              {/* Seed image grid */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <p className="font-display font-bold text-foreground text-base">Meet the Seeds</p>
                <p className="text-sm text-muted-foreground">
                  Each weed makes its own kind of seed. Look closely — shapes, colors, and bumps are all clues.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {topicWeeds.map((w) => (
                    <div key={`seed-${w.id}`} className="bg-background border border-border rounded-lg p-3 space-y-2">
                      <div className="aspect-square w-full rounded-md overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="seed" className="w-full h-full object-cover" />
                      </div>
                      <p className="font-display font-bold text-sm text-foreground text-center">{w.commonName} seed</p>
                      <p className="text-xs text-muted-foreground text-center">{getElementarySeedDescription(w)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {grade !== "elementary" && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Seed Flashcards</p>
              <p className="text-sm text-muted-foreground">
                Identify the seed by its shape, size, and surface, then flip the card to see the species.
              </p>
              <WeedFlashcardDeck
                weeds={topicWeeds}
                onSelectWeed={onSelectWeed}
                stage="seed"
                emphasizeScientific={grade === "high"}
              />
            </div>
          )}
        </div>
      );

    /* ═══════════════════════════════════════════════════════════
       LIFE STAGES
    ═══════════════════════════════════════════════════════════ */
    case "life-stages": {
      const LIFE_STAGE_INFO_ELEM = [
        {
          stage: "seed",
          label: "Seed",
          desc: "A tiny package that holds a baby plant and the food it needs to start growing.",
        },
        {
          stage: "seedling",
          label: "Seedling",
          desc: "A baby weed that has just sprouted out of the seed with its first little leaves.",
        },
        {
          stage: "vegetative",
          label: "Vegetative",
          desc: "A growing weed, getting taller and adding more leaves. No flowers yet.",
        },
        {
          stage: "flower",
          label: "Reproductive",
          desc: "A grown-up weed making flowers and brand new seeds.",
        },
      ];

      const LIFE_STAGE_INFO_UPPER = [
        {
          stage: "seed",
          label: "Seed",
          desc: "The dormant stage before germination. Seeds can persist in the soil seed bank for years. Identifying seeds helps predict future weed problems.",
        },
        {
          stage: "seedling",
          label: "Seedling",
          desc: "The earliest growth stage after germination. Cotyledons (seed leaves) are visible, and the first true leaves are emerging.",
        },
        {
          stage: "vegetative",
          label: "Vegetative",
          desc: "Active growth phase with expanding leaves and branching. Key ID features like leaf shape are most visible.",
        },
        {
          stage: "flower",
          label: "Reproductive",
          desc: "The plant is flowering and/or setting seed. Flower structure is a critical ID feature.",
        },
      ];

      const LIFE_STAGE_INFO = grade === "elementary" ? LIFE_STAGE_INFO_ELEM : LIFE_STAGE_INFO_UPPER;

      return (
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            {grade === "elementary" ? (
              <>
                <p className="font-semibold text-primary">Life Stages</p>
                <p>
                  Just like people, weeds grow up. They go through five stages:
                  <strong> seed, seedling, vegetative, reproductive, and mature</strong>. Knowing what a
                  weed looks like at each stage helps us spot it and stop it.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-primary">Why Life Stages Matter</p>
                <p>
                  Weeds look very different at each growth stage. Learning to recognize them{" "}
                  <strong>early (seedling)</strong> is critical because that's when they're easiest to control.
                </p>
                <p>
                  In IPM, <strong>scouting timing</strong> is everything. Knowing what a weed looks like at each stage
                  lets you catch it early and choose the right control method.
                </p>
              </>
            )}
          </div>

          {/* Visual cycle diagram (Elementary + High School) */}
          {(grade === "elementary" || grade === "high") && (
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="font-display font-bold text-foreground text-sm text-center mb-4">
                The Weed Life Cycle
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { label: "Seed", color: "bg-amber-100 text-amber-900 border-amber-300" },
                  { label: "Seedling", color: "bg-lime-100 text-lime-900 border-lime-300" },
                  { label: "Vegetative", color: "bg-success/15 text-success border-success/40" },
                  { label: "Reproductive", color: "bg-pink-100 text-pink-900 border-pink-300" },
                  { label: "Mature", color: "bg-primary/10 text-primary border-primary/40" },
                ].map((s, i, arr) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div
                      className={`w-20 h-20 rounded-full border-2 ${s.color} flex items-center justify-center text-center text-xs font-bold leading-tight px-1`}
                    >
                      {s.label}
                    </div>
                    <span className="text-muted-foreground text-2xl font-bold">→</span>
                    {i === arr.length - 1 && (
                      <div className="text-xs text-muted-foreground italic ml-1">
                        and back to <strong>seeds</strong>!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage description cards */}
          {grade === "elementary" ? (
            <div className="space-y-3">
              {LIFE_STAGE_INFO.map((s) => (
                <div key={s.stage} className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <div className="font-bold text-foreground text-sm">{s.label}</div>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="font-bold text-foreground text-sm">Maturity</div>
                <p className="text-xs text-muted-foreground">
                  A grown-up weed that has spread its seeds. At the end of the season it may die, but its seeds
                  start the cycle all over again.
                </p>
              </div>
            </div>
          ) : grade === "middle" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LIFE_STAGE_INFO.map((s) => (
                <div key={s.stage} className="bg-card border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-foreground">{s.label}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.desc.split(".")[0]}.</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Weeds: HS groups by control timing; others list straight */}
          {(() => {
            const renderCard = (w: Weed) => {
              const isGrass = w.plantType === "Monocot";
              return (
                <div key={w.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-display font-bold" />
                    {grade !== "elementary" && <span className="text-xs text-primary italic">{w.scientificName}</span>}
                    {grade === "middle" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {w.family}
                      </span>
                    )}
                  </div>
                  <div className={`grid ${isGrass ? "grid-cols-5" : "grid-cols-4"} gap-3`}>
                    {LIFE_STAGE_INFO.map((s) => (
                      <div key={s.stage} className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">{s.label}</div>
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <WeedImage weedId={w.id} stage={s.stage} className="w-full h-full" />
                        </div>
                      </div>
                    ))}
                    {isGrass && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">Ligule</div>
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <WeedImage weedId={w.id} stage="ligule" className="w-full h-full" />
                        </div>
                      </div>
                    )}
                  </div>
                  {grade === "middle" && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Best control timing:</span> {w.controlTiming}
                    </div>
                  )}
                  <p className="text-xs text-primary">{w.memoryHook}</p>
                </div>
              );
            };
            if (grade === "high") {
              // Group by life stage: one section per stage showing every weed at that stage
              return LIFE_STAGE_INFO.map((s) => (
                <div key={`stage-${s.stage}`} className="space-y-3">
                  <h3 className="font-display font-bold text-foreground text-base mt-4 border-l-4 border-primary pl-3">
                    {s.label} Stage
                  </h3>
                  <p className="text-xs text-muted-foreground pl-3">{s.desc}</p>
                  <div className="overflow-x-auto -mx-3 px-3 pb-3 scrollbar-thin">
                    <div className="flex gap-3 w-max">
                      {topicWeeds.map((w) => (
                        <div
                          key={`${s.stage}-${w.id}`}
                          className="bg-card border border-border rounded-lg p-2 space-y-2 w-40 shrink-0"
                        >
                          <div className="aspect-square rounded-md overflow-hidden bg-muted">
                            <WeedImage weedId={w.id} stage={s.stage} className="w-full h-full" />
                          </div>
                          <ClickableWeedName
                            weed={w}
                            onSelect={onSelectWeed}
                            className="text-xs font-bold block text-center"
                          />
                          <p className="text-[10px] text-primary italic text-center">
                            {w.scientificName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ));
            }
            return topicWeeds.map(renderCard);
          })()}
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       MONOCOT-DICOT
    ═══════════════════════════════════════════════════════════ */
    case "monocot-dicot": {
      const monocots = topicWeeds.filter((w) => w.plantType === "Monocot");
      const dicots = topicWeeds.filter((w) => w.plantType === "Dicot");

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            {/* Intro */}
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Monocots vs. Dicots</p>
              <p>
                These two groups of weeds are called <strong>monocots</strong> (thin, straight leaves) and{" "}
                <strong>dicots</strong> (broad, wide leaves). Even though all plants might look similar at first, monocots
                and dicots are different in a few important ways: their <strong>roots</strong>, their{" "}
                <strong>leaves</strong>, how they <strong>move water and nutrients through their stems</strong>, the way
                their <strong>flowers are organized</strong>, and their <strong>seed structure</strong>.
              </p>
            </div>

            {/* Side-by-side example images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <p className="font-display font-bold text-foreground text-sm text-center">Dicots (Broadleaves)</p>
                <div className="grid grid-cols-2 gap-2">
                  {dicots.slice(0, 4).map((w) => (
                    <div key={w.id} className="text-center">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <p className="font-display font-bold text-foreground text-sm text-center">Monocots (Grasses)</p>
                <div className="grid grid-cols-2 gap-2">
                  {monocots.slice(0, 4).map((w) => (
                    <div key={w.id} className="text-center">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What the words mean */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">What do these words mean?</p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-card border border-border rounded-lg p-4 text-center space-y-1">
                  <p className="font-bold text-foreground text-lg">"Mono" = One</p>
                  <p className="text-xs text-muted-foreground">"Cot" = Cotyledon</p>
                  <p className="text-xs font-bold text-foreground mt-2">Monocot = ONE cotyledon</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center space-y-1">
                  <p className="font-bold text-foreground text-lg">"Di" = Two</p>
                  <p className="text-xs text-muted-foreground">"Cot" = Cotyledon</p>
                  <p className="text-xs font-bold text-foreground mt-2">Dicot = TWO cotyledons</p>
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-3 mt-3">
                <p className="text-xs text-foreground">
                  A <strong>cotyledon</strong> is a place where a seed stores its food to give it energy to grow.
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-foreground">
                  As plants grow from seeds to seedlings to mature plants, the number of cotyledons impacts what the
                  plant looks like.
                </p>
              </div>
            </div>

            {/* Detailed monocot section with scrollbar */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">
                Monocots (Grasses) — All {monocots.length} Species
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                <li><strong>One seed leaf</strong> (cotyledon)</li>
                <li><strong>Parallel</strong> leaf veins</li>
                <li><strong>Fibrous</strong> root system</li>
              </ul>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3" style={{ minWidth: `${monocots.length * 7}rem` }}>
                  {monocots.map((w) => (
                    <div key={w.id} className="text-center shrink-0 w-24">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">← Scroll to see all monocots →</p>
            </div>

            {/* Detailed dicot section with scrollbar */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">
                Dicots (Broadleaves) — All {dicots.length} Species
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                <li><strong>Two seed leaves</strong> (cotyledons)</li>
                <li><strong>Branching (net)</strong> leaf veins</li>
                <li><strong>Taproot</strong> system</li>
              </ul>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3" style={{ minWidth: `${dicots.length * 7}rem` }}>
                  {dicots.map((w) => (
                    <div key={w.id} className="text-center shrink-0 w-24">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">← Scroll to see all dicots →</p>
            </div>
          </div>
        );
      }

      // 6-8 and 9-12: existing content
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">Monocots vs Dicots</p>
            <p className="text-xs text-foreground">
              Plants can be grouped by similar characteristics and physical patterns. Plants are grouped into
              monocots and dicots based on how many <strong>cotyledons</strong> they have as seeds. Cotyledons are
              structures in seeds and seedlings that store nutrients to act as an energy source during germination.
              Cotyledons also become the first leaves of a plant. Differentiating monocots and dicots allow us to
              identify plants and better manage weeds.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-bold text-foreground">Monocots</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>- One seed leaf (cotyledon)</li>
                  <li>- Parallel leaf veins</li>
                  <li>- Fibrous root system</li>
                  <li>- Flower parts in multiples of 3</li>
                </ul>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-bold text-foreground">Dicots</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>- Two seed leaves (cotyledons)</li>
                  <li>- Branching (net) leaf veins</li>
                  <li>- Taproot system</li>
                  <li>- Flower parts in multiples of 4 or 5</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h3 className="font-display font-bold text-foreground text-base">Monocots ({monocots.length} species)</h3>
            <HorizontalWeedRow weeds={monocots} onSelectWeed={onSelectWeed} stage="vegetative" showScientific={grade === "high"} />
          </div>
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h3 className="font-display font-bold text-foreground text-base">Dicots ({dicots.length} species)</h3>
            <HorizontalWeedRow weeds={dicots} onSelectWeed={onSelectWeed} stage="vegetative" showScientific={grade === "high"} />
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       LIFE CYCLES
    ═══════════════════════════════════════════════════════════ */
    case "life-cycles": {
      const annuals = topicWeeds.filter(
        (w) =>
          w.lifeCycle.includes("Annual") && !w.lifeCycle.includes("Perennial") && !w.lifeCycle.includes("Biennial"),
      );
      const summerAnnuals = annuals.filter((w) => w.lifeCycle.toLowerCase().includes("summer"));
      const winterAnnuals = annuals.filter((w) => w.lifeCycle.toLowerCase().includes("winter"));
      const otherAnnuals = annuals.filter(
        (w) => !w.lifeCycle.toLowerCase().includes("summer") && !w.lifeCycle.toLowerCase().includes("winter"),
      );
      const biennials = topicWeeds.filter((w) => w.lifeCycle.includes("Biennial"));
      const perennials = topicWeeds.filter((w) => w.lifeCycle.includes("Perennial"));
      const dualLifecycle = topicWeeds.filter(
        (w) =>
          (w.lifeCycle.includes("Annual") && w.lifeCycle.includes("Perennial")) ||
          (w.lifeCycle.includes("Biennial") && w.lifeCycle.includes("Perennial")),
      );

      const lcGroups = [
        { key: "Annual", icon: "", desc: "Completes its life cycle in one growing season." },
        { key: "Biennial", icon: "", desc: "Takes two years — rosette in year 1, flowers and seeds in year 2." },
        { key: "Perennial", icon: "", desc: "Lives for multiple years, regrowing from roots, rhizomes, or tubers." },
      ];

      if (viewMode === "box") {
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold text-primary mb-2">Life Cycles</p>
              <p>Click a life cycle tile to learn about the growth pattern and see its species.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lcGroups.map((g) => {
                const grouped = topicWeeds.filter((w) => w.lifeCycle.includes(g.key));
                return (
                  <SubheadingBox
                    key={g.key}
                    icon={g.icon}
                    label={g.key}
                    count={grouped.length}
                    description={LIFECYCLE_DESCRIPTIONS[g.key] || g.desc}
                    weeds={grouped}
                    grade={grade}
                    onSelectWeed={onSelectWeed}
                  />
                );
              })}
            </div>
          </div>
        );
      }

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Life Cycles</p>
              <p>
                The life cycle of a weed is how long the weed takes to go through all of its life stages (<strong>seed,
                seedling, vegetative, reproductive, and mature</strong>). Weeds have different life cycles that last for
                different lengths of time. Knowing the life cycle of a weed can help us manage them.
              </p>
            </div>

            {/* Life cycle flow */}
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="font-display font-bold text-foreground text-sm text-center mb-3">Life Cycle Flow</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["Seed", "Seedling", "Vegetative", "Reproductive", "Mature"].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-2">
                    <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs font-bold text-primary">
                      {stage}
                    </div>
                    {i < 4 && <span className="text-muted-foreground font-bold">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Annual */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Annual Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Annuals</strong> are weeds that complete their life cycle in <strong>one year</strong>. Annual
                weeds grow quickly in the spring and reach maturity by fall. Before these weeds die in the winter, they
                spread lots of seeds far and wide to help grow new plants in the spring. The seeds must be strong and
                resilient to survive all winter.
              </p>
              <HorizontalWeedRow weeds={annuals} onSelectWeed={onSelectWeed} stage="flower" />
            </div>

            {/* Biennial */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Biennial Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Biennial</strong> weeds complete their life cycle in <strong>two years</strong>. During the
                first year, weeds grow vegetatively and develop deep root systems to help gather nutrients. Biennial
                weeds form a <strong>rosette</strong> during their first year — a flat circle of leaves close to the
                ground. During their second year of life, they grow a stalk, flowers, and seeds. After spreading its
                seeds, the weed dies.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-foreground">
                <p className="font-bold">What is a rosette?</p>
                <p className="text-muted-foreground mt-1">
                  A rosette is a flat, circular arrangement of leaves close to the ground. It helps the plant store
                  energy in its roots during the first year.
                </p>
              </div>
              <HorizontalWeedRow weeds={biennials} onSelectWeed={onSelectWeed} stage="flower" />
            </div>

            {/* Perennial */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Perennial Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Perennials</strong> are weeds with multi-year life cycles. They regrow from strong roots or
                bulbs each year. Perennials spread by seeds or through <strong>underground stems and roots</strong> that
                form new plants. Perennials can be difficult to manage because of their deep root systems.
              </p>
              <HorizontalWeedRow weeds={perennials} onSelectWeed={onSelectWeed} stage="flower" />
            </div>
          </div>
        );
      }

      if (grade === "high") {
        // 9-12: Detailed life cycles with summer/winter annuals
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Life Cycles</p>
              <p>
                Plants have unique systems to best enable them to reproduce and survive in varying conditions. One such
                system is how quickly or slowly plants complete a <strong>life cycle</strong>. A complete life cycle
                moves through five stages:{" "}
                <strong>seed, seedling, vegetative, reproductive, and mature</strong>. The
                <strong> reproductive</strong> stage groups flowering, pollination, and fertilization together, since
                they all happen as the plant prepares to set seed. Refer to the Life Stages topic for the visual cycle
                diagram.
              </p>
            </div>

            <p className="text-sm text-foreground">Common weeds have three general life cycle lengths.</p>

            {/* Annual section */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Annual Weeds</p>
              <p className="text-sm text-foreground">
                Annual weeds complete their entire life cycle — from seed germination to seed production and death —
                within a <strong>single growing season</strong>. They rely entirely on prolific seed production for
                survival.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                  <p className="font-bold text-foreground text-sm">Summer Annuals</p>
                  <p className="text-xs text-muted-foreground">Germinate in spring and die after frost.</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(summerAnnuals.length > 0 ? summerAnnuals : otherAnnuals).map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded overflow-hidden bg-muted">
                          <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[9px]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2">
                  <p className="font-bold text-foreground text-sm">Winter Annuals</p>
                  <p className="text-xs text-muted-foreground">
                    Germinate in fall, overwinter, and produce seed in spring.
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {winterAnnuals.map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded overflow-hidden bg-muted">
                          <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[9px]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Examples: Asiatic dayflower, redroot pigweed, and barnyard grass.
              </p>
            </div>

            {/* Biennial section */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Biennial Weeds</p>
              <p className="text-sm text-foreground">
                Biennial weeds take <strong>two full years</strong> to complete their life cycle. In the first year,
                they grow as a low rosette of leaves, storing energy in a taproot. This is considered{" "}
                <strong>vegetative growth</strong>. In the second year, they bolt, flower, produce seeds, and die.
                Control is most effective during the <strong>rosette stage</strong>.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {biennials.map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                    </div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Examples: Common burdock, garlic mustard, and wild parsnip.
              </p>
            </div>

            {/* Perennial section */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Perennial Weeds</p>
              <p className="text-sm text-foreground">
                Perennial weeds live for <strong>more than two years</strong> and can reproduce both by seed and
                vegetatively through <strong>rhizomes, stolons, tubers, or root fragments</strong>. They are often the
                most difficult weeds to manage because they can regrow from underground structures even after top growth
                is removed.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {perennials.map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                    </div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Examples: Dandelion, curly dock, and Canada thistle.</p>
            </div>

            {/* Dual lifecycle */}
            {dualLifecycle.length > 0 && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
                <p className="font-display font-bold text-accent text-sm">Dual Life Cycles</p>
                <p className="text-sm text-foreground">
                  Some weeds function as <strong>both perennials and annuals</strong>! Their life cycle depends on
                  multiple environmental factors, such as <strong>climate, location, and management</strong>.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dualLifecycle.map((w) => (
                    <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-2">
                      <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                        <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                      </div>
                      <div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                        <div className="text-[10px] text-muted-foreground">{w.lifeCycle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 6-8: detailed content with summer/winter annuals
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Life Cycles</p>
            <p>
              Just like people go through different stages of life, every weed has a life cycle that describes how it
              is born, grows, reproduces, and eventually dies. This process has a direct and significant influence on
              how certain weeds should be managed.
            </p>
          </div>

          {/* Life cycle flow */}
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="font-display font-bold text-foreground text-sm text-center mb-3">Life Cycle Stages</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["Seed", "Seedling", "Vegetative", "Reproductive / Flowering"].map((stage, i, arr) => (
                <div key={stage} className="flex items-center gap-2">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs font-bold text-primary">
                    {stage}
                  </div>
                  {i < arr.length - 1 && <span className="text-muted-foreground font-bold">→</span>}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 italic">
              The reproductive (or flowering) stage groups flowering, pollination, and fertilization together, ending with the mature plant releasing seeds.
            </p>
          </div>

          {/* Annual */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">Annual Weeds</p>
            <p className="text-sm text-foreground">
              Annual weeds complete their entire life cycle, from seed germination through seed production, within a
              single growing season. Annuals are divided into <strong>summer annuals</strong>, which germinate in spring
              and die with frost, and <strong>winter annuals</strong>, which germinate in fall and complete their cycle
              the following spring.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                <p className="font-bold text-foreground text-sm">Summer Annuals</p>
                <p className="text-xs text-muted-foreground">Germinate in spring, die after frost.</p>
                <div className="grid grid-cols-3 gap-1">
                  {(summerAnnuals.length > 0 ? summerAnnuals : otherAnnuals).slice(0, 6).map((w) => (
                    <div key={w.id} className="text-center">
                      <div className="aspect-square rounded overflow-hidden bg-muted">
                        <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[9px]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2">
                <p className="font-bold text-foreground text-sm">Winter Annuals</p>
                <p className="text-xs text-muted-foreground">Germinate in fall, complete cycle in spring.</p>
                <div className="grid grid-cols-3 gap-1">
                  {winterAnnuals.slice(0, 6).map((w) => (
                    <div key={w.id} className="text-center">
                      <div className="aspect-square rounded overflow-hidden bg-muted">
                        <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[9px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Biennial */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">Biennial Weeds</p>
            <p className="text-sm text-foreground">
              Biennial weeds require <strong>two full growing seasons</strong> to complete their life cycle, typically
              producing only vegetative growth in the first year and then flowering, setting seed, and dying in the
              second.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {biennials.slice(0, 8).map((w) => (
                <div key={w.id} className="text-center">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                    <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                  </div>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Perennial */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">Perennial Weeds</p>
            <p className="text-sm text-foreground">
              Perennial weeds are the most persistent and difficult to manage, as they survive for multiple years and
              often regenerate from underground structures such as <strong>taproots, rhizomes, stolons, or
              tubers</strong> even after the aboveground portions of the plant have been removed or destroyed.
            </p>
            <p className="text-xs text-muted-foreground">
              Matching control strategies to the specific life cycle of a target weed species is fundamental to
              achieving durable suppression rather than temporary or cosmetic results.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {perennials.slice(0, 8).map((w) => (
                <div key={w.id} className="text-center">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                    <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                  </div>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       NATIVE-INTRODUCED
    ═══════════════════════════════════════════════════════════ */
    case "native-introduced": {
      const natives = topicWeeds.filter((w) => w.origin === "Native");
      const introduced = topicWeeds.filter((w) => w.origin === "Introduced");
      const invasives = introduced.filter((w) => w.actImmediately);

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Native and Introduced Weeds</p>
              <p>
                Weeds can grow in diverse habitats across different countries and states. Just like people have homes,
                weeds have locations that they call home. A plant that naturally grows in a region is called{" "}
                <strong>native</strong>.
              </p>
              <p>
                Just as people travel, weeds can also travel. Weeds that grow in areas where they are not originally
                found are called <strong>introduced</strong> weeds.
              </p>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-foreground space-y-3">
              <p className="font-bold text-destructive">Invasive Weeds</p>
              <p>
                Some introduced weeds can be harmful to their surroundings. These weeds are called{" "}
                <strong>invasive</strong>. Invasive weeds hurt native plants and animals.
              </p>
            </div>

            {invasives.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <p className="font-display font-bold text-foreground text-sm">
                  Invasive Weeds in the Midwest ({invasives.length})
                </p>
                <p className="text-xs text-muted-foreground">
                  These weeds were introduced from other places and now hurt our farms and native plants. Scroll
                  across to see them all, and tap any weed to learn more.
                </p>
                <HorizontalWeedRow weeds={invasives} onSelectWeed={onSelectWeed} stage="flower" tileWidth="13rem" />
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-display font-bold text-foreground text-base">Native Species ({natives.length})</h3>
              <HorizontalWeedRow weeds={natives} onSelectWeed={onSelectWeed} stage="flower" />
            </div>
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-display font-bold text-foreground text-base">Introduced Species ({introduced.length})</h3>
              <HorizontalWeedRow weeds={introduced} onSelectWeed={onSelectWeed} stage="flower" />
            </div>
          </div>
        );
      }

      if (grade === "middle") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Weed Origins by Continent</p>
              <p>
                Many of the most troublesome weeds we deal with in the United States didn't actually start here. They
                were brought over from other parts of the world, sometimes accidentally and sometimes on purpose.
              </p>
              <p>
                Tracing the continental origins of major weed species provides important context for understanding why
                they are often so difficult to manage in their introduced range. Plants introduced to a new region
                frequently leave behind the natural biological controls, including insects, pathogens, and competing
                plant species, that limited their populations in their native environment.
              </p>
              <p>
                Without these checks, introduced species can establish rapidly, spread aggressively, and outcompete
                both native vegetation and cultivated crops.
              </p>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground space-y-3">
              <p className="font-bold text-accent">How Invasive Weeds Travel</p>
              <p>
                Invasive weeds are like uninvited guests that show up, take over, and refuse to leave — and they
                usually arrive because of human activity, even when it's completely accidental. Seeds can hitchhike
                on the muddy tires of a tractor, hide inside a bag of crop seed, cling to an animal's fur, or float
                down a river to a new location.
              </p>
              <p>
                In some historical cases, plants were deliberately introduced to new regions for agricultural,
                horticultural, or erosion control purposes, only to escape cultivation and spread beyond intended
                boundaries.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-display font-bold text-foreground text-base">Native Species ({natives.length})</h3>
              <HorizontalWeedRow weeds={natives} onSelectWeed={onSelectWeed} stage="flower" showScientific />
            </div>
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-display font-bold text-foreground text-base">Introduced Species ({introduced.length})</h3>
              <HorizontalWeedRow weeds={introduced} onSelectWeed={onSelectWeed} stage="flower" showScientific />
            </div>
          </div>
        );
      }

      // 9-12 - Detailed invasive species content
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Invasive Species</p>
            <p>
              Invasive weeds are non-native plants that spread prolifically and cause significant ecological or economic
              harm to their new environment, often by <strong>crowding out native species, altering ecosystems</strong>,
              or damaging agricultural interests.
            </p>
            <p>
              They usually arrive because of human activity, even when it's completely accidental. Weed seeds hitchhike
              on muddy tractor tires, hide in contaminated crop seed bags, cling to animal fur, or float downstream to
              new areas. Sometimes people intentionally bring them in for farming, landscaping, or erosion control, only
              for these plants to escape and spread wildly.
            </p>
            <p>
              Once established, invasive weeds are incredibly hard and expensive to eradicate, which is why{" "}
              <strong>preventative efforts</strong> like cleaning equipment and inspecting seed sources is the smartest
              defense. Some invasive weeds may adapt to better suit their new environments, making it challenging to
              find control solutions.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h3 className="font-display font-bold text-foreground text-base">Native Species ({natives.length})</h3>
            <HorizontalWeedRow weeds={natives} onSelectWeed={onSelectWeed} stage="flower" showScientific tileWidth="13.5rem" />
          </div>
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h3 className="font-display font-bold text-foreground text-base">Introduced Species ({introduced.length})</h3>
            <HorizontalWeedRow weeds={introduced} onSelectWeed={onSelectWeed} stage="flower" showScientific tileWidth="13.5rem" />
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       HABITATS
    ═══════════════════════════════════════════════════════════ */
    case "habitats": {
      const habGroups = [
        { key: "Warm-Season / Full Sun", icon: "", label: "Warm-Season / Full Sun" },
        { key: "Cool-Season / Early Spring", icon: "", label: "Cool-Season / Early Spring" },
        { key: "Wet / Poorly Drained", icon: "", label: "Wet / Poorly Drained" },
        { key: "Dry / Disturbed", icon: "", label: "Dry / Disturbed" },
      ];

      if (viewMode === "box") {
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold text-primary mb-2">Habitats & Climate</p>
              <p>Click a habitat tile below to explore the species that thrive in that environment.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habGroups.map((g) => {
                const grouped = topicWeeds.filter((w) => w.primaryHabitat === g.key);
                return (
                  <SubheadingBox
                    key={g.key}
                    icon={g.icon}
                    label={g.label}
                    count={grouped.length}
                    description={HABITAT_DESCRIPTIONS[g.key] || ""}
                    weeds={grouped}
                    grade={grade}
                    onSelectWeed={onSelectWeed}
                  />
                );
              })}
            </div>
          </div>
        );
      }

      if (grade === "elementary") {
        const elemHabitats = [
          {
            key: "Warm-Season / Full Sun",
            label: "Warm-Season Weeds",
            desc: "These weeds love hot, sunny weather. They wake up in late spring and grow the most when summer is hottest, like in corn and soybean fields.",
            color: "bg-amber-500/70",
            region: "Southern & central US (warm summers)",
          },
          {
            key: "Cool-Season / Early Spring",
            label: "Cool-Season Weeds",
            desc: "These weeds like cool weather. They sprout in fall or early spring, before it gets too hot.",
            color: "bg-sky-500/70",
            region: "Northern US (cool springs and falls)",
          },
          {
            key: "Wet / Poorly Drained",
            label: "Wet-Habitat Weeds",
            desc: "These weeds love soggy, wet soil. You'll find them near ponds, ditches, and wet field edges.",
            color: "bg-blue-700/70",
            region: "Wet areas, river valleys, the Great Lakes region",
          },
          {
            key: "Dry / Disturbed",
            label: "Dry-Habitat Weeds",
            desc: "These weeds can live with very little water. They pop up on roadsides, sandy spots, and dry, dug-up land.",
            color: "bg-orange-600/70",
            region: "Western & southwestern US (dry plains)",
          },
        ];

        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Habitats</p>
              <p>
                A <strong>habitat</strong> is the kind of place where a plant likes to live. Some weeds love hot
                sunny spots, others like cool or wet places. Knowing where a weed likes to grow helps us guess where
                we will find it.
              </p>
            </div>

            {/* Climate map */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-sm text-center">
                Where These Habitats Live in the U.S.
              </p>
              <div className="relative w-full max-w-2xl mx-auto overflow-x-auto">
                <svg viewBox="0 0 300 180" className="w-full h-auto min-w-[420px]">
                  {/* Simplified continental US outline */}
                  <path
                    d="M30,60 L60,40 L120,30 L180,30 L230,40 L270,55 L275,90 L260,130 L220,150 L160,155 L100,150 L60,140 L35,110 Z"
                    fill="hsl(var(--muted))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1.5"
                  />
                  {/* Cool-Season: Northern US */}
                  <path d="M60,40 L120,30 L180,30 L230,40 L235,70 L180,75 L120,72 L65,72 Z" fill="rgb(56 189 248 / 0.65)" />
                  {/* Warm-Season: Southern central US */}
                  <path d="M65,72 L235,70 L240,110 L200,130 L120,128 L65,115 Z" fill="rgb(245 158 11 / 0.6)" />
                  {/* Dry: Southwest */}
                  <path d="M30,60 L65,72 L65,115 L60,140 L35,110 Z" fill="rgb(234 88 12 / 0.6)" />
                  {/* Wet: Southeast & Great Lakes */}
                  <path d="M200,130 L240,110 L260,130 L220,150 L160,155 L120,128 Z" fill="rgb(29 78 216 / 0.55)" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {elemHabitats.map((h) => (
                  <div key={h.key} className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded ${h.color}`} />
                    <span className="text-foreground">
                      <strong>{h.label}</strong>
                      <span className="text-muted-foreground"> — {h.region}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {elemHabitats.map((h) => {
              const grouped = topicWeeds.filter((w) => w.primaryHabitat === h.key);
              return (
                <div key={h.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded ${h.color}`} />
                    <p className="font-display font-bold text-foreground text-base">
                      {h.label} <span className="text-xs text-muted-foreground font-normal">({grouped.length} species)</span>
                    </p>
                  </div>
                  <p className="text-sm text-foreground">{h.desc}</p>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-3" style={{ minWidth: `${Math.max(grouped.length, 1) * 7}rem` }}>
                      {grouped.map((w) => (
                        <div key={w.id} className="text-center shrink-0 w-24">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                            <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                          </div>
                          <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">← Scroll to see all {grouped.length} →</p>
                </div>
              );
            })}
          </div>
        );
      }

      if (grade === "middle") {
        const normName = (s: string) =>
          s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");

        const COOL_SEASON = [
          "Annual ryegrass","Downy brome","Field horsetail","Foxtail barley","Quackgrass",
          "Scouringrush","Wild oat","Catchweed bedstraw","Common chickweed","Corn speedwell",
          "Curly dock","Dandelion","Field pennycress","Garlic mustard","Ground ivy",
          "Henbit deadnettle","Mouseear chickweed","Poison hemlock","Shepherd's purse",
          "Star of Bethlehem","Wild carrot","Wild mustard","Yellow rocket","Canada thistle",
          "Caraway","Common teasel","False London rocket","Golden alexanders","Musk thistle",
          "Pinnate tansymustard","Prickly lettuce","Russian thistle","White campion","Wild parsnip",
        ].map(normName);

        const WARM_SEASON = [
          "Barnyardgrass","Goosegrass","Johnsongrass","Large crabgrass","Nimblewill",
          "Yellow nutsedge","Asiatic dayflower","Common pokeweed","Eastern black nightshade",
          "Ladysthumb","Pennsylvania smartweed","Water smartweed","Waterhemp","Burcucumber",
          "Honey vine climbing milkweed","Giant foxtail","Green foxtail","Longspine sandbur",
          "Shattercane Sorghums","Smooth witchgrass","Witchgrass","Woolly cupgrass","Yellow foxtail",
          "Asian copperleaf","Buffalobur","Common burdock","Common cocklebur","Common mallow",
          "Common milkweed","Common ragweed","Giant ragweed","Hemp dogbane","Horsenettle",
          "Horseweed","Jimsonweed","Kochia","Marijuana","Palmer amaranth","Prickly sida",
          "Redroot pigweed","Russian thistle","Smooth groundcherry","Spotted spurge",
          "Toothed spurge","Velvetleaf","Venice mallow","Volunteer sunflower","Wild buckwheat",
          "Wild four o'clock","Wild parsnip","Field bindweed","Hedge bindweed","Morningglory",
          "Tall morningglory",
        ].map(normName);

        const WET_COMPACT = [
          "Annual ryegrass","Downy brome","Field horsetail","Foxtail barley","Quackgrass",
          "Scouringrush","Wild oat","Catchweed bedstraw","Common chickweed","Corn speedwell",
          "Curly dock","Dandelion","Field pennycress","Garlic mustard","Ground ivy",
          "Henbit deadnettle","Mouseear chickweed","Poison hemlock","Shepherd's purse",
          "Star of Bethlehem","Wild carrot","Wild mustard","Yellow rocket","Barnyardgrass",
          "Goosegrass","Johnsongrass","Large crabgrass","Nimblewill","Yellow nutsedge",
          "Asiatic dayflower","Common pokeweed","Eastern black nightshade","Ladysthumb",
          "Pennsylvania smartweed","Water smartweed","Waterhemp","Burcucumber",
          "Honey vine climbing milkweed",
        ].map(normName);

        const DRY_DISTURBED = [
          "Downy brome","Foxtail barley","Wild oat","Canada thistle","Caraway","Common teasel",
          "False London rocket","Golden alexanders","Musk thistle","Pinnate tansymustard",
          "Prickly lettuce","Russian thistle","White campion","Wild parsnip","Giant foxtail",
          "Green foxtail","Johnsongrass","Longspine sandbur","Shattercane Sorghums",
          "Smooth witchgrass","Witchgrass","Woolly cupgrass","Yellow foxtail","Asian copperleaf",
          "Buffalobur","Common burdock","Common cocklebur","Common mallow","Common milkweed",
          "Common ragweed","Giant ragweed","Hemp dogbane","Horsenettle","Horseweed","Jimsonweed",
          "Kochia","Marijuana","Palmer amaranth","Prickly sida","Redroot pigweed",
          "Smooth groundcherry","Spotted spurge","Toothed spurge","Velvetleaf","Venice mallow",
          "Volunteer sunflower","Wild buckwheat","Wild four o'clock","Field bindweed",
          "Hedge bindweed","Morningglory","Tall morningglory",
        ].map(normName);

        const matchAny = (w: Weed, list: string[]) => {
          const n = normName(w.commonName);
          return list.some((x) => x === n || n.includes(x) || x.includes(n));
        };

        const seasonGroups = [
          {
            key: "cool",
            label: "Cool-Season Weeds",
            desc: "Germinate in fall or early spring when soils are cool. They grow rapidly before warm-season crops are planted and can compete early in the growing season.",
            color: "bg-sky-500/70",
            weeds: topicWeeds.filter((w) => matchAny(w, COOL_SEASON)),
          },
          {
            key: "warm",
            label: "Warm-Season Weeds",
            desc: "Germinate as soils warm in late spring and grow most vigorously through the hottest summer months. Common in corn and soybean fields.",
            color: "bg-amber-500/70",
            weeds: topicWeeds.filter((w) => matchAny(w, WARM_SEASON)),
          },
        ];

        const soilGroups = [
          {
            key: "wet",
            label: "Wet / Compact Soil Habitats",
            desc: "Wet, poorly drained or compacted soils — field edges, low spots, waterways, and high-traffic ground. These weeds tolerate saturated or dense soils.",
            color: "bg-blue-700/70",
            weeds: topicWeeds.filter((w) => matchAny(w, WET_COMPACT)),
          },
          {
            key: "dry",
            label: "Dry / Disturbed Soil Habitats",
            desc: "Dry, well-drained, or recently disturbed ground — roadsides, field margins, construction sites, and tilled areas. These weeds tolerate drought and rapid colonization of bare soil.",
            color: "bg-orange-600/70",
            weeds: topicWeeds.filter((w) => matchAny(w, DRY_DISTURBED)),
          },
        ];

        const renderGroup = (g: { key: string; label: string; desc: string; color: string; weeds: Weed[] }) => (
          <div key={g.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded ${g.color}`} />
              <h3 className="font-display font-bold text-foreground text-base">
                {g.label} <span className="text-xs text-muted-foreground font-normal">({g.weeds.length})</span>
              </h3>
            </div>
            <p className="text-sm text-foreground">{g.desc}</p>
            <HorizontalWeedRow weeds={g.weeds} onSelectWeed={onSelectWeed} stage="flower" />
          </div>
        );

        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Habitats</p>
              <p>
                A habitat is the natural home where a plant or animal lives and thrives, and weeds, just like people,
                have preferences about where they like to hang out.
              </p>
              <p>
                Factors such as <strong>soil texture, moisture availability, light levels, temperature ranges,
                pH</strong>, and the degree of soil disturbance all influence which weed species are likely to establish
                and become dominant in a given location.
              </p>
              <p>
                Below, weeds are organized two ways: by the <strong>season</strong> they grow in
                (cool-season vs. warm-season) and by the <strong>soil-type habitat</strong> they prefer
                (wet / compact vs. dry / disturbed). The same weed may appear in more than one soil-type
                group when it tolerates both conditions.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-display font-bold text-primary text-sm uppercase tracking-wide">Season</p>
              {seasonGroups.map(renderGroup)}
            </div>

            <div className="space-y-2">
              <p className="font-display font-bold text-primary text-sm uppercase tracking-wide">Habitat Soil Type</p>
              {soilGroups.map(renderGroup)}
            </div>
          </div>
        );
      }

      // 9-12 - Detailed habitats with phenotypic plasticity
      {
        const HIGH_HABITATS = [
          {
            key: "Warm-Season / Full Sun",
            label: "Warm-Season Weeds",
            desc: "Warm-season weeds wait until late spring, when soil temperatures climb above roughly 60 °F, to germinate. They use the C4 photosynthesis pathway, which is more efficient at high temperatures and during droughty, high-light conditions — that's why species like Palmer Amaranth, Waterhemp, and the foxtails explode in mid-summer corn and soybean fields and can grow more than an inch per day in July heat.",
          },
          {
            key: "Cool-Season / Early Spring",
            label: "Cool-Season Weeds",
            desc: "Cool-season weeds germinate in fall or very early spring, when soils are between roughly 40–60 °F. They use the C3 photosynthesis pathway, which works best in cool, moist conditions. Many overwinter as low rosettes (like Henbit, Shepherd's Purse, and Field Pennycress) — a body shape that survives frost and lets the plant start photosynthesizing weeks before spring planting.",
          },
          {
            key: "Wet / Poorly Drained",
            label: "Wet-Habitat Weeds",
            desc: "Wet-habitat species tolerate saturated, low-oxygen soils that would kill most crops. Many have hollow stems or special air channels (aerenchyma) that move oxygen down to flooded roots. Yellow Nutsedge, Barnyardgrass, and the smartweeds are classic indicators of poor drainage — when you see them dominating a patch, it usually points to a compaction or tile-drainage problem, not just a herbicide issue.",
          },
          {
            key: "Dry / Disturbed",
            label: "Dry-Habitat Weeds",
            desc: "Dry-habitat weeds survive on sandy, low-organic, well-drained soils where water is scarce. Adaptations include deep taproots that mine subsoil moisture (Kochia, Russian Thistle), narrow or waxy leaves that lose less water, and CAM/C4 metabolism that allows photosynthesis with the stomata partly closed. These species dominate roadsides, terraces, and the sandy headlands of irrigated fields.",
          },
        ];
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Climate &amp; Habitat Adaptation</p>
              <p>
                Climate is the single biggest factor that decides which weed species you'll actually see in a field.
                Temperature controls when a seed germinates, day length tells the plant when to flower, and rainfall
                decides how much it can grow. Two fields a few hundred miles apart can have completely different weed
                problems because their growing-season temperatures, frost-free days, and rainfall patterns aren't the
                same.
              </p>
              <p>
                Different species are adapted to different climates because of differences in <strong>photosynthesis
                type (C3 vs. C4)</strong>, <strong>root depth and structure</strong>, <strong>leaf shape and waxy
                coatings</strong>, and the <strong>temperature range their seeds need to break dormancy</strong>. A
                cool-season C3 species like Henbit shuts down in July heat, while a C4 species like Palmer Amaranth
                barely starts growing until the soil is warm enough to fry an egg on.
              </p>
              <p>
                The four groups below show how Midwest weeds sort themselves by the climate conditions they're built
                for. Scroll through each group to see the species that fit — paying attention to leaf size, root depth,
                and growth habit will show you the adaptations in action.
              </p>
            </div>

            {HIGH_HABITATS.map((h) => {
              const grouped = topicWeeds.filter((w) => w.primaryHabitat === h.key);
              return (
                <div key={h.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <p className="font-display font-bold text-foreground text-base">{h.label}</p>
                  <p className="text-sm text-foreground">{h.desc}</p>
                  {grouped.length > 0 && (
                    <>
                      <div className="overflow-x-auto pb-2 -mx-1">
                        <div className="flex gap-3 px-1" style={{ minWidth: `${grouped.length * 7.5}rem` }}>
                          {grouped.map((w) => (
                            <div key={w.id} className="text-center shrink-0 w-28">
                              <button
                                onClick={() => onSelectWeed(w)}
                                className="block w-28 h-28 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary"
                              >
                                <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                              </button>
                              <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[11px] mt-1 block" />
                              <div className="text-[10px] text-primary italic leading-tight">{w.scientificName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">← Scroll to see all {grouped.length} →</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
    }

    /* ═══════════════════════════════════════════════════════════
       ECOLOGY (Terrestrial, Parasitic, Aquatic)
    ═══════════════════════════════════════════════════════════ */
    case "ecology": {
      const aquatic = topicWeeds.filter((w) => w.id === "Water_Smartweed" || w.commonName.toLowerCase().includes("water"));
      const terrestrial = topicWeeds.filter((w) => !aquatic.find((a) => a.id === w.id));

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Terrestrial, Parasitic, and Aquatic</p>
              <p>
                Different weeds need different things to live. We sort weeds into three groups based on how and
                where they get what they need: <strong>terrestrial</strong> (on land), <strong>aquatic</strong>
                (in water), and <strong>parasitic</strong> (taking food from other plants).
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">
                Terrestrial Weeds <span className="text-xs text-muted-foreground font-normal">({terrestrial.length})</span>
              </p>
              <p className="text-sm text-foreground">
                <strong>Terrestrial weeds</strong> grow on land. They need <strong>soil, rain, and air</strong> to
                live, just like the plants in your yard.
              </p>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3" style={{ minWidth: `${Math.max(terrestrial.length, 1) * 7}rem` }}>
                  {terrestrial.map((w) => (
                    <div key={w.id} className="text-center shrink-0 w-24">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">← Scroll to see all {terrestrial.length} →</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">
                Aquatic Weeds <span className="text-xs text-muted-foreground font-normal">({aquatic.length})</span>
              </p>
              <p className="text-sm text-foreground">
                <strong>Aquatic weeds</strong> live in or right next to water. They need <strong>water, sunlight,
                and nutrients in the water</strong> to grow.
              </p>
              {aquatic.length > 0 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3" style={{ minWidth: `${Math.max(aquatic.length, 1) * 7}rem` }}>
                    {aquatic.map((w) => (
                      <div key={w.id} className="text-center shrink-0 w-24">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                          <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Parasitic Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Parasitic weeds</strong> can't make their own food. They use special roots to grab food
                and water from another plant, called the <strong>host</strong>.
              </p>
            </div>
          </div>
        );
      }

      // 6-8
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Terrestrial, Parasitic, and Aquatic</p>
            <p>
              Not all weeds grow the same way or in the same places — some grow on land, some grow in water, and some
              actually steal nutrients from other plants!
            </p>
            <p>
              Weeds can be broadly categorized into three growth types based on where and how they obtain resources:
              <strong> terrestrial, parasitic, and aquatic</strong>.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">
              Terrestrial Weeds <span className="text-xs text-muted-foreground font-normal">({terrestrial.length})</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Grow in soil on land and compete directly with crops for light, water, and nutrients in agricultural and
              natural settings.
            </p>
            <HorizontalWeedRow weeds={terrestrial} onSelectWeed={onSelectWeed} stage="flower" showScientific />
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">
              Aquatic Weeds <span className="text-xs text-muted-foreground font-normal">({aquatic.length})</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Establish in or around bodies of water such as ponds, lakes, irrigation canals, and wetlands, where they
              can disrupt water flow and reduce water quality.
            </p>
            <HorizontalWeedRow weeds={aquatic} onSelectWeed={onSelectWeed} stage="flower" showScientific />
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">Parasitic Weeds</p>
            <p className="text-sm text-muted-foreground">
              Among the most damaging — they attach directly to the root or stem tissue of a host plant through
              specialized structures and extract water and nutrients at the host's expense. Parasitic weeds are not
              represented in this Midwest dataset, but well-known examples include dodder (<em>Cuscuta</em> spp.) and
              broomrape (<em>Orobanche</em> spp.).
            </p>
          </div>

          <p className="text-sm text-foreground">
            Each growth type presents distinct identification challenges and requires fundamentally different
            management strategies, making it important to correctly classify a weed's growth type before selecting a
            control approach.
          </p>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       PLANT NEEDS (K-5) — resources plants need & weed competition
    ═══════════════════════════════════════════════════════════ */
    case "plant-needs": {
      const NEEDS = [
        {
          key: "sun",
          title: "Sunlight",
          emoji: "Sun",
          plantUses: "Plants use sunlight to make their own food in their leaves. This is called photosynthesis.",
          weedSteals: "Tall weeds like giant ragweed can grow up over corn and soybean plants and shade them out — the crop leaves get less light and can't make as much food.",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          dot: "bg-yellow-500",
        },
        {
          key: "water",
          title: "Water",
          emoji: "Drop",
          plantUses: "Plants drink water through their roots. Water carries food all around the plant and keeps the leaves strong.",
          weedSteals: "Weeds have thirsty roots too. When a weed grows next to a soybean plant, it sips up water the crop needed — especially on hot, dry summer days.",
          bg: "bg-info/10 border-info/40",
          dot: "bg-info",
        },
        {
          key: "air",
          title: "Air",
          emoji: "Wind",
          plantUses: "Plants breathe in a gas from the air called carbon dioxide (CO₂) and use it to make food. Their roots also need air pockets in the soil.",
          weedSteals: "When lots of weeds crowd a field, they fill the air around crops with their own leaves and roots — leaving less fresh air moving around the crop.",
          bg: "bg-secondary/40 border-border",
          dot: "bg-muted-foreground",
        },
        {
          key: "nutrients",
          title: "Nutrients",
          emoji: "Seedling",
          plantUses: "Nutrients are like plant vitamins in the soil. They help plants grow big, green, and strong.",
          weedSteals: "Weeds like waterhemp are greedy eaters. They gobble up nutrients from the soil that the farmer wanted the corn or soybeans to have.",
          bg: "bg-success/10 border-success/40",
          dot: "bg-success",
        },
        {
          key: "space",
          title: "Space",
          emoji: "Expand",
          plantUses: "Plants need room for their leaves to spread out and their roots to grow deep. Crowded plants can't grow their best.",
          weedSteals: "Weeds squeeze in between rows and push against crops. The crops end up short, skinny, and unhappy because they don't have room to stretch.",
          bg: "bg-accent/10 border-accent/40",
          dot: "bg-accent",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">The Five Things Every Plant Needs</p>
            <p>
              Every plant — whether it's a tiny sprout in your backyard or a huge corn plant on a farm — needs
              <strong> five special things</strong> to live and grow: <strong>sunlight, water, air, nutrients,</strong>
              and <strong>space</strong>.
            </p>
            <p>
              When a plant gets all five, it grows tall, green, and healthy. When something is missing, the plant
              gets weak. That's why farmers work hard to make sure their crops get every single one!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NEEDS.map((n) => (
              <div key={n.key} className={`rounded-lg border-2 p-4 space-y-2 ${n.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${n.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{n.title}</p>
                </div>
                <p className="text-sm text-foreground">
                  <strong>What plants use it for:</strong> {n.plantUses}
                </p>
                <p className="text-sm text-foreground">
                  <strong>How weeds steal it:</strong> {n.weedSteals}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={fiveEssentialsImg}
              alt="Plant comparison — a thriving sunflower with sunlight, water, air, nutrients, and space, next to a struggling plant with weed competition"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              With all five essentials, plants thrive. Take one away — or add weed competition — and they struggle.
            </p>
          </div>

          <div className="bg-terracotta/10 border-2 border-terracotta/40 rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-terracotta text-base">Weeds vs. Crops: A Race for Resources</p>
            <p className="text-sm text-foreground">
              A cornfield or soybean field is like a big lunch table. The farmer set the table for the crops so
              they can eat sunlight, drink water, breathe in air, munch on nutrients, and spread out in their own
              chairs.
            </p>
            <p className="text-sm text-foreground">
              But <strong>weeds are uninvited guests</strong>. They sneak in and grab food, drinks, and seats meant
              for the crops. The more weeds there are, the less there is left for the corn or soybeans.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-base">Why This Hurts the Crop</p>
            <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
              <li>Crops that don't get enough sunlight grow short and floppy.</li>
              <li>Crops that don't get enough water wilt and their leaves droop.</li>
              <li>Crops that don't get enough nutrients turn yellow instead of bright green.</li>
              <li>Crops that don't have enough space grow skinny stems that snap in the wind.</li>
            </ul>
            <p className="text-sm text-foreground">
              When crops are weak, they make less food for us to eat. Farmers call the amount of food a field
              produces the <strong>yield</strong>. Weeds lower the yield — sometimes by a lot!
            </p>
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-success text-base">The Farmer's Goal</p>
            <p className="text-sm text-foreground">
              A farmer's job is to keep crops <strong>healthy and happy</strong> so they grow lots of food. That
              means making sure crops always win the race for sunlight, water, air, nutrients, and space.
            </p>
            <p className="text-sm text-foreground">
              Farmers pull weeds, use tools, and plant crops close together so weeds can't sneak in. When crops
              stay healthy, farmers get a <strong>big yield</strong> — and that means more corn, more soybeans,
              and more food for everyone!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>
              Sunlight, water, air, nutrients, space. Five things every plant needs — and five things weeds try
              to steal!
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       INTRO CONTROL METHODS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "plant-parts": {
      const PARTS = [
        {
          key: "roots",
          title: "1. Roots",
          where: "Underground — the very bottom of the plant.",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          job: "Roots anchor the plant so wind and rain can't knock it over. They also soak up water and nutrients from the soil, like a straw drinking from the dirt.",
          weedFact: "Some weeds, like Canada Thistle and Field Bindweed, have long creeping roots that spread underground and pop up as brand-new plants far away!",
        },
        {
          key: "stem",
          title: "2. Stem",
          where: "Just above the roots — the trunk or stalk of the plant.",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          job: "The stem holds the plant up tall so leaves can reach the sunlight. It's also a highway — carrying water up from the roots and food down from the leaves.",
          weedFact: "Weeds like Giant Ragweed grow super tall, thick stems so they can shade out crops below them.",
        },
        {
          key: "leaves",
          title: "3. Leaves",
          where: "Along the stem — spreading out to catch sunshine.",
          dot: "bg-primary",
          bg: "bg-primary/10 border-primary/40",
          job: "Leaves are the plant's kitchen. They use sunlight, air, and water to make food in a process called photosynthesis.",
          weedFact: "Big, flat weed leaves — like on Velvetleaf — grab lots of sunlight and block it from reaching crop leaves underneath.",
        },
        {
          key: "flower",
          title: "4. Flowers",
          where: "Near the top of the plant, usually after leaves have grown.",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          job: "Flowers are how plants make new plants. Bees, wind, and other pollinators move pollen between flowers so seeds can start to form.",
          weedFact: "A Dandelion's yellow flower turns into a fluffy white puffball packed with tiny parachute seeds ready to fly away.",
        },
        {
          key: "seeds",
          title: "5. Seeds",
          where: "Inside the flower once it's done blooming — the very top of the plant's life cycle.",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          job: "Seeds are baby plants in tiny packages. They travel by wind, water, animals, or people and grow into new plants next season.",
          weedFact: "One Waterhemp plant can make over a MILLION seeds — that's why one weed today can turn into a whole field of weeds next year!",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Parts of a Plant — From the Ground Up</p>
            <p>
              Every weed, crop, flower, and tree is built from the same basic parts. Let's take a tour starting
              deep underground and climbing all the way to the tippy-top of the plant.
            </p>
            <p>
              Each part has its own special job — and when you know the parts, you can spot exactly how a weed
              grows and where to stop it!
            </p>
          </div>

          <div className="space-y-4">
            {PARTS.map((p) => (
              <div key={p.key} className={`rounded-lg border-2 p-4 space-y-2 ${p.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${p.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{p.title}</p>
                </div>
                <p className="text-sm text-foreground">
                  <strong>Where you'll find it:</strong> {p.where}
                </p>
                <p className="text-sm text-foreground">
                  <strong>What it does:</strong> {p.job}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Weed fact:</strong> {p.weedFact}
                </p>
                {p.key === "seeds" && (
                  <img
                    src={partsOfWeedsImg}
                    alt="Detailed illustration labeling the parts of a weed: roots, stem, leaves, flowers, and seeds"
                    className="w-full rounded-lg bg-background/60 object-contain mt-2"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-success text-base">The Whole Plant Working Together</p>
            <p className="text-sm text-foreground">
              Roots drink, stems carry, leaves cook, flowers bloom, and seeds start the whole thing over again.
              Every part depends on the others — take one away and the plant can't survive.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember (from the ground up):</p>
            <p>Roots → Stem → Leaves → Flowers → Seeds.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       CROP OR WEED? (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "crop-vs-weed": {
      const CROP_EXAMPLES = [
        { name: "Corn", why: "Grown for food we eat and to feed animals." },
        { name: "Wheat", why: "Ground into flour for bread, pasta, and cereal." },
        { name: "Carrots", why: "A crunchy root vegetable planted on purpose." },
        { name: "Soybeans", why: "Used in food, animal feed, and lots of everyday products." },
      ];

      const WEED_TRAITS = [
        { label: "Not planted on purpose", detail: "Nobody chose to grow them there — they just showed up." },
        { label: "Growing in the wrong place", detail: "A sunflower is pretty in a garden, but a weed if it pops up in a cornfield." },
        { label: "Competing with crops", detail: "They take sunlight, water, nutrients, and space away from the plants farmers want." },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Crop or Weed? It's All About Where It Grows</p>
            <p>
              At first glance, crops and weeds can look a lot alike — they're both plants! The biggest
              difference isn't <em>what</em> the plant is, it's <em>where</em> it's growing.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border-2 border-success/40 bg-success/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success" />
                <p className="font-display font-bold text-success text-base">Crops</p>
              </div>
              <p className="text-sm text-foreground">
                Crops are plants that farmers grow <strong>on purpose</strong>. They give us food, feed animals,
                or make useful products like fabric and fuel.
              </p>
              <div className="space-y-2">
                {CROP_EXAMPLES.map((c) => (
                  <div key={c.name} className="bg-background/60 rounded-md p-2">
                    <p className="font-semibold text-foreground text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.why}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-destructive" />
                <p className="font-display font-bold text-destructive text-base">Weeds</p>
              </div>
              <p className="text-sm text-foreground">
                Weeds are plants growing <strong>where they aren't wanted</strong>. Nobody planted them, and
                they compete with crops for the things every plant needs.
              </p>
              <div className="space-y-2">
                {WEED_TRAITS.map((w) => (
                  <div key={w.label} className="bg-background/60 rounded-md p-2">
                    <p className="font-semibold text-foreground text-sm">{w.label}</p>
                    <p className="text-xs text-muted-foreground">{w.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <img
            src={cropsVsWeedsImg}
            alt="Illustration comparing crops (plants we want) and weeds (unwanted plants) side by side"
            className="w-full rounded-lg bg-background/60 object-contain"
          />

          <div className="bg-info/10 border-2 border-info/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-info text-base">Think About It Like This…</p>
            <p className="text-sm text-foreground">
              Imagine your classroom. Every student has an assigned desk. Now imagine someone from another
              class walks in and sits down at <em>your</em> desk. They aren't a "bad" student — they're just
              in the wrong place! They take up your space and make it harder for you to do your work.
            </p>
            <p className="text-sm text-foreground">
              Weeds are like that student in the wrong seat. They aren't bad plants, but when they grow in a
              crop field, they take the sunlight, water, nutrients, and space that the crops need.
            </p>
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">Why Farmers Remove Weeds</p>
            <p className="text-sm text-foreground">
              Farmers pull, mow, or manage weeds so their crops can stay healthy and grow strong. Healthy
              crops give us more food — like the corn, bread, and vegetables we eat every day.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>A weed isn't a "bad" plant — it's just a plant growing in the wrong place.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       SEASONAL LIFE CYCLE (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "seasonal-life-cycle": {
      const STEPS = [
        {
          key: "wake",
          title: "Step 1: Wake Up!",
          season: "Early Spring",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          body: "Everything starts with a tiny seed hiding in the soil. When the seed gets water, warmth, and sunlight, it wakes up and begins to sprout.",
        },
        {
          key: "grow",
          title: "Step 2: Grow Big and Strong!",
          season: "Spring into Summer",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          body: "The little sprout grows into a healthy plant. It drinks water, breathes air, catches sunlight, and pulls nutrients from the soil to grow bigger every day.",
        },
        {
          key: "flower",
          title: "Step 3: Make Flowers and Seeds!",
          season: "Summer",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          body: "When the plant is fully grown, it makes flowers or seed heads. Those flowers turn into brand new seeds — like tiny baby plants waiting for their turn.",
        },
        {
          key: "spread",
          title: "Step 4: Spread the Seeds!",
          season: "Late Summer & Fall",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          body: "New seeds travel by floating like parachutes in the wind, surfing on water, or hitchhiking on animals and shoes. When they land in a good spot, the cycle starts all over again!",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">A Plant's Life Cycle: From Tiny Seed to New Seeds</p>
            <p>
              Plants have a life cycle, just like butterflies and frogs! You can think of it as a plant's
              journey through the seasons — waking up, growing tall, making seeds, and starting over again.
            </p>
          </div>

          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.key} className={`rounded-lg border-2 p-4 space-y-2 ${s.bg}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                    <p className="font-display font-bold text-foreground text-base">{s.title}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background/70 text-muted-foreground">
                    {s.season}
                  </span>
                </div>
                <p className="text-sm text-foreground">{s.body}</p>
                {s.key === "spread" && (
                  <img
                    src={plantLifeCycleImg}
                    alt="Illustrated map of a plant's full life cycle — from seed to sprout, flowers, and seed spreading"
                    className="w-full rounded-lg bg-background/60 object-contain mt-2"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-2">
            <p className="font-display font-bold text-primary text-base">Not All Plants Grow the Same Way</p>
            <p>Just like people have different schedules, plants do too!</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border-2 border-success/40 bg-success/10 p-4 space-y-2">
              <p className="font-display font-bold text-success text-base">Annuals — One-Season Plants</p>
              <p className="text-sm text-foreground">
                Annuals finish their whole life cycle in <strong>one growing season</strong>. They sprout, grow,
                make new seeds, and then die before the next season begins.
              </p>
              <p className="text-xs text-muted-foreground">
                Weedy examples: Waterhemp, Foxtail, and Common Lambsquarters.
              </p>
            </div>
            <div className="rounded-lg border-2 border-info/40 bg-info/10 p-4 space-y-2">
              <p className="font-display font-bold text-info text-base">Perennials — Year-After-Year Plants</p>
              <p className="text-sm text-foreground">
                Perennials come back <strong>year after year</strong>. Even when their leaves disappear in
                winter, their roots stay alive underground, ready to grow again when spring arrives.
              </p>
              <p className="text-xs text-muted-foreground">
                Weedy examples: Dandelion, Canada Thistle, and Field Bindweed.
              </p>
            </div>
          </div>

          <img
            src={annualVsPerennialImg}
            alt="Side-by-side diagram comparing an annual plant's one-year life cycle to a perennial plant that regrows for multiple years"
            className="w-full rounded-lg bg-background/60 object-contain"
          />

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">Why This Matters for Farmers</p>
            <p className="text-sm text-foreground">
              If a farmer knows a weed is an annual, they can stop it before it makes new seeds. If it's a
              perennial, they know its roots will try to come back next year — so they plan ahead!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember (the plant's journey):</p>
            <p>Seed → Sprout → Grown Plant → Flowers → New Seeds → Spread → Start Again!</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       HOW DO WEED SEEDS TRAVEL? (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "seed-travel": {
      const TRAVELERS = [
        {
          key: "wind",
          title: "Wind Riders",
          nickname: "The Parachute Jumpers",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          how: "Some seeds have fluffy tops that work just like tiny parachutes. When the wind blows, they float through the air to find a new place to grow.",
          example: "Dandelion seeds are famous parachute jumpers — one puff of breath and they're off!",
          extras: "Other wind riders: Milkweed, Canada Thistle, and Horseweed.",
          image: dandelionHelicopterImg,
          imageAlt: "Cartoon dandelion seed floating with a fluffy parachute",
        },
        {
          key: "water",
          title: "Water Surfers",
          nickname: "Catch the Wave!",
          dot: "bg-primary",
          bg: "bg-primary/10 border-primary/40",
          how: "Some seeds love to surf on water! Rain puddles, streams, and rivers can carry them far away, just like a surfer riding a wave. When the water slows down, the seed lands and can start growing.",
          example: "Curly Dock seeds float on water and travel down streams to brand-new spots.",
          extras: "Other water surfers: Smartweed and many wetland weeds.",
          image: surfSeedImg,
          imageAlt: "Cartoon seed with a surfboard heading to the beach",
        },
        {
          key: "animal",
          title: "Animal Hitchhikers",
          nickname: "Can I Catch a Ride?",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          how: "Some seeds have tiny hooks, spikes, or sticky parts that cling to an animal's fur — or even your socks! They're like hitchhikers asking for a free ride. When the seed falls off later, it might grow in a brand-new place.",
          example: "Common Burdock and Cocklebur have prickly seed pods that stick to almost anything.",
          extras: "Other hitchhikers: Beggarticks and Foxtail bristles.",
          image: seedHitchhikerImg,
          imageAlt: "Cartoon corn seed hitchhiking on the back of a skunk",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">How Do Weed Seeds Travel?</p>
            <p>
              Have you ever wondered how tiny seeds move from one place to another? Seeds can't walk, so
              they've come up with some really clever ways to travel! Let's meet three amazing seed travelers.
            </p>
          </div>

          <div className="space-y-4">
            {TRAVELERS.map((t) => (
              <div key={t.key} className={`rounded-lg border-2 p-4 space-y-2 ${t.bg}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-3 h-3 rounded-full ${t.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{t.title}</p>
                  <span className="text-xs italic text-muted-foreground">— "{t.nickname}"</span>
                </div>
                <img
                  src={t.image}
                  alt={t.imageAlt}
                  className="w-full max-w-sm mx-auto rounded-lg bg-background/60 object-contain"
                />
                <p className="text-sm text-foreground">
                  <strong>How it works:</strong> {t.how}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Weed example:</strong> {t.example}
                </p>
                <p className="text-xs text-muted-foreground">{t.extras}</p>
              </div>
            ))}
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-success text-base">Seeds Are Great Travelers!</p>
            <p className="text-sm text-foreground">
              Whether they're parachuting through the sky, surfing on the water, or hitchhiking on an animal,
              seeds have amazing ways to explore the world and find new places to grow.
            </p>
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">Why Farmers Care</p>
            <p className="text-sm text-foreground">
              Because seeds are such good travelers, weeds can show up in fields where nobody planted them.
              Farmers even wash off boots, tools, and tractors so they don't accidentally give weed seeds a
              free ride into a new field!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember (three ways seeds travel):</p>
            <p>Wind (parachute) • Water (surfing) • Animals (hitchhiking).</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       WHY ARE WEEDS A PROBLEM? — PICNIC THEME (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "weed-problem-picnic": {
      const PICNIC_ITEMS = [
        {
          key: "sun",
          resource: "Sunlight",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          crop: "Crops soak up sunlight to make their food (like a warm plate at the picnic).",
          weed: "Tall weeds shoot up above the crops and steal the sunlight before it can reach them.",
        },
        {
          key: "water",
          resource: "Water",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          crop: "Crops need sips of water from the soil to stay strong (like drinks at the picnic).",
          weed: "Thirsty weeds gulp up water first, leaving less for the crops.",
        },
        {
          key: "nutrients",
          resource: "Nutrients",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          crop: "Nutrients in the soil are the crop's healthy snacks (the picnic food!).",
          weed: "Weeds grab those snacks with their roots before crops can get their share.",
        },
        {
          key: "space",
          resource: "Space",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          crop: "Crops need room to spread their leaves and roots (like a big picnic blanket).",
          weed: "Weeds squeeze onto the blanket and push crops out of the way.",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Welcome to the Field Picnic!</p>
            <p>
              Imagine all the plants in the field are having a picnic. There is just enough sunlight, water,
              nutrients, and space for all the crop plants to grow big and healthy.
            </p>
            <p>
              Now imagine some <strong>weeds</strong> show up… uninvited. They start using the sunlight,
              drinking the water, taking the nutrients, and filling up the space. Suddenly, there isn't
              enough for everyone!
            </p>
          </div>

          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={plantPicnicImg}
              alt="Two picnic panels — overcrowded and cramped versus spacious and plentiful"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              When weeds crash the picnic, there's no room to breathe. With space to grow, the picnic is a feast!
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {PICNIC_ITEMS.map((p) => (
              <div key={p.key} className={`rounded-lg border-2 p-4 space-y-2 ${p.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${p.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{p.resource}</p>
                </div>
                <p className="text-sm text-foreground">
                  <strong>At the picnic:</strong> {p.crop}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Uninvited weeds:</strong> {p.weed}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-destructive text-base">What Happens to the Crops?</p>
            <p className="text-sm text-foreground">
              When weeds take these important things, crop plants can't grow as big or as healthy. They end
              up short, thirsty, and hungry — no fun at the picnic!
            </p>
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">Why That Matters for Our Food</p>
            <p className="text-sm text-foreground">
              Farmers grow crops to produce the grains, fruits, and vegetables we eat. When weeds crash the
              picnic, farmers harvest fewer crops — this is called a <strong>lower yield</strong> — so there
              is less food for everyone.
            </p>
            <p className="text-sm text-foreground">
              That's why farmers work hard to keep weeds out of their fields — so the crops can enjoy the
              whole picnic and grow into the food on your plate!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>Weeds steal sunlight, water, nutrients, and space — so crops grow smaller and farmers harvest less food.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       THE 5 WEED-FIGHTING SUPERHEROES (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "weed-superheroes": {
      const HEROES = [
        {
          key: "pull",
          hero: "Pull It!",
          power: "Super Strength",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          how: "Remove weeds by hand or with tools like hoes and shovels — before they grow big or drop seeds.",
          bestFor: "Small gardens and fields with just a few weeds to fight.",
          reallife: "This is called physical control.",
        },
        {
          key: "block",
          hero: "Block It!",
          power: "Force Field",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          how: "Cover the soil with mulch, straw, or fabric so weed seeds don't get the sunlight they need to sprout.",
          bestFor: "Around trees, flower beds, and vegetable rows.",
          reallife: "This is a kind of cultural control.",
        },
        {
          key: "outsmart",
          hero: "Outsmart It!",
          power: "Brain Power",
          dot: "bg-primary",
          bg: "bg-primary/10 border-primary/40",
          how: "Plant strong, healthy crops close together so they grow fast and leave no room for weeds to sneak in.",
          bestFor: "Big fields, where healthy crops out-race weeds for sunlight and space.",
          reallife: "This is another kind of cultural control — and it's also preventative!",
        },
        {
          key: "eat",
          hero: "Eat It!",
          power: "Animal Allies",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          how: "Bring in helpers like goats, sheep, or bugs that love to munch on certain weeds.",
          bestFor: "Hillsides, pastures, and places where machines or sprays are hard to use.",
          reallife: "This is called biological control.",
        },
        {
          key: "stop",
          hero: "Stop It!",
          power: "Precision Blast",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          how: "Farmers carefully use special weed-control products called herbicides to stop weeds in large fields.",
          bestFor: "Huge crop fields where pulling every weed by hand would be impossible.",
          reallife: "This is called chemical control — used safely and only when needed.",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">The Five Weed-Fighting Superpowers!</p>
            <p>
              Weeds may be tough, but farmers and gardeners have <strong>five weed-fighting superpowers</strong>
              to help protect their crops! Since weeds steal sunlight, water, nutrients, and space, farmers
              use different strategies to keep their plants healthy and growing strong.
            </p>
            <p>
              Each superpower works best in a different situation, so farmers often use more than one at a
              time. Teaming them up is called an <strong>integrated approach</strong> — the ultimate
              weed-fighting team!
            </p>
          </div>

          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={weedSuperheroesImg}
              alt="The Weed Control Squad — five weed-fighting heroes: Outsmart It, Pull It, Eat It, Block It, and Stop It"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              Meet the Weed Control Squad — five heroes teaming up to keep crops healthy.
            </p>
          </div>

          <div className="space-y-4">
            {HEROES.map((h) => (
              <div key={h.key} className={`rounded-lg border-2 p-4 space-y-2 ${h.bg}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-3 h-3 rounded-full ${h.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{h.hero}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background/70 text-muted-foreground">
                    Power: {h.power}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  <strong>How the power works:</strong> {h.how}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Best for:</strong> {h.bestFor}
                </p>
                <p className="text-xs text-muted-foreground italic">{h.reallife}</p>
              </div>
            ))}
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-success text-base">Assemble the Team!</p>
            <p className="text-sm text-foreground">
              Just like superheroes work together to save the day, farmers combine these five superpowers to
              protect their crops and grow the delicious food we eat every day. One hero alone can't defeat
              every weed — but together, they're unstoppable!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember the 5 Superpowers:</p>
            <p>Pull It • Block It • Outsmart It • Eat It • Stop It.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       SAFE VS TOXIC WEEDS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "safe-vs-toxic-explorer": {
      const DETECTIVE_RULES = [
        {
          key: "eyes",
          rule: "Use Your Eyes, Not Your Hands",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          detail: "Look at the plant from a safe distance. Don't touch, pick, or taste any weed you don't already know.",
        },
        {
          key: "observe",
          rule: "Observe the Clues",
          dot: "bg-primary",
          bg: "bg-primary/10 border-primary/40",
          detail: "Notice the leaves, flowers, colors, and seeds. Those clues help a grown-up identify the plant.",
        },
        {
          key: "ask",
          rule: "Ask a Trusted Adult",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          detail: "Show a parent, teacher, or another trusted adult. They can help figure out if it's safe.",
        },
        {
          key: "wash",
          rule: "Wash Up After Playing Outside",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          detail: "Even if you didn't touch a plant on purpose, washing your hands helps keep you safe.",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Not All Weeds Are the Same!</p>
            <p>
              Did you know that not all weeds are alike? Some are totally harmless, but others can be
              <strong> toxic</strong> — meaning they can make people or animals sick if they're touched or
              eaten.
            </p>
          </div>

          <div className="bg-info/10 border-2 border-info/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-info text-base">The Mystery Surprise Box</p>
            <p className="text-sm text-foreground">
              Think of weeds like mystery surprise boxes. Some boxes have fun surprises inside — but others
              might have something you really shouldn't play with. Since you can't tell what's inside just by
              looking, the safest thing to do is <strong>not open the box</strong>.
            </p>
            <p className="text-sm text-foreground">
              Plants work the same way! You can't always tell if a weed is safe or toxic just by looking at
              it.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border-2 border-success/40 bg-success/10 p-4 space-y-2">
              <p className="font-display font-bold text-success text-base">Many Weeds Are Safe to Look At</p>
              <p className="text-sm text-foreground">
                Lots of weeds are perfectly fine to observe from a distance. Watching how they grow is a
                great way to learn about nature!
              </p>
            </div>
            <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 space-y-2">
              <p className="font-display font-bold text-destructive text-base">Some Weeds Can Cause Trouble</p>
              <p className="text-sm text-foreground">
                A few weeds can cause itchy skin, rashes, stomach aches, or other health problems if you
                touch or taste them. That's why we stay careful!
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-primary text-base">Be a Plant Detective!</p>
            <p className="text-sm text-foreground">
              If you spot a plant you don't recognize, put on your Plant Detective hat and follow these
              rules:
            </p>
            <div className="space-y-3">
              {DETECTIVE_RULES.map((r) => (
                <div key={r.key} className={`rounded-lg border-2 p-3 ${r.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${r.dot}`} />
                    <p className="font-display font-bold text-foreground text-sm">{r.rule}</p>
                  </div>
                  <p className="text-sm text-foreground">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-destructive text-base">The Golden Safety Rule</p>
            <p className="text-sm text-foreground">
              Look with your <strong>eyes</strong> — not with your <strong>hands</strong> and never with
              your <strong>mouth</strong>!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>When in doubt — don't touch it, don't taste it, and ask a grown-up you trust.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <img
              src={weedInvestigatorImg}
              alt="Cartoon weed detective with a magnifying glass investigating clues underground"
              className="w-full rounded-lg bg-background/60 object-contain"
            />
            <img
              src={weedInvestigator2Img}
              alt="Cartoon weed detective following clues toward an evidence lock-box"
              className="w-full rounded-lg bg-background/60 object-contain"
            />
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       INVASIVE PLANTS — PLAYGROUND THEME (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "invasive-playground": {
      const SUPERPOWERS = [
        {
          key: "fast",
          name: "Super Speed",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          detail: "Invasive plants grow really fast — sometimes faster than any of the native plants around them.",
        },
        {
          key: "no-rivals",
          name: "No Rivals",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          detail: "They came from far away, so the bugs and diseases that usually slow them down aren't around here.",
        },
        {
          key: "seeds",
          name: "Tons of Seeds",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          detail: "Many invasive plants make loads and loads of seeds, so new plants pop up everywhere.",
        },
        {
          key: "space",
          name: "Space Grabbers",
          dot: "bg-destructive",
          bg: "bg-destructive/10 border-destructive/40",
          detail: "They gobble up sunlight, water, nutrients, and space — leaving barely any for native plants.",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Recess Tag… Gone Wild!</p>
            <p>
              Imagine you're playing a game of tag on the playground. Everyone is following the rules and
              taking turns. Then one player runs <em>way</em> faster than everyone else, tags everyone, and
              takes over the whole playground! Pretty soon, the other kids don't have much room left to
              play.
            </p>
            <p>
              Some plants act the same way. We call them <strong>invasive plants</strong>.
            </p>
          </div>

          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={weedBulliesImg}
              alt="Cartoon of invasive plants acting like playground bullies, crowding out native plants"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              Invasive plants act like playground bullies — pushing native plants out of their space.
            </p>
          </div>

          <div className="bg-info/10 border-2 border-info/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-info text-base">What Is an Invasive Plant?</p>
            <p className="text-sm text-foreground">
              Invasive plants are plants that spread into new places and grow very quickly. Because they're
              growing where they have less competition — and where the bugs and diseases that usually keep
              them in check aren't around — they can spread <strong>much faster</strong> than the native
              plants that belong there.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-display font-bold text-primary text-base">Invasive Plant "Superpowers"</p>
            <div className="grid gap-3 md:grid-cols-2">
              {SUPERPOWERS.map((s) => (
                <div key={s.key} className={`rounded-lg border-2 p-4 space-y-2 ${s.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                    <p className="font-display font-bold text-foreground text-base">{s.name}</p>
                  </div>
                  <p className="text-sm text-foreground">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-destructive text-base">Who Gets Left Out?</p>
            <p className="text-sm text-foreground">
              As invasive plants grow, they take up sunlight, water, nutrients, and space — leaving less for
              the plants that belong there. That makes it harder for native plants, wildflowers, and even
              some animals to survive.
            </p>
          </div>

          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={invasivePlantImg}
              alt="What is an invasive plant and how they overpower natives — cartoon comparison of a native plant and an invasive plant stealing sunlight and crowding roots"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              Invasive plants arrive from far away and out-compete natives for sunlight, space, and food.
            </p>
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-success text-base">Team Up to Keep Things Fair</p>
            <p className="text-sm text-foreground">
              Farmers, gardeners, and scientists work together to stop invasive plants before they take over.
              By protecting native plants and keeping invasive plants under control, we help our forests,
              parks, gardens, and farms stay healthy for everyone — plants, animals, and people!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>Invasive plants are like the too-fast tagger — they spread quickly and crowd out the plants that belong there.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       THE SECRET TUNNELS OF ROOTS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "root-tunnels": {
      const TUNNEL_FACTS = [
        {
          key: "explorer",
          title: "Underground Explorers",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          detail: "Some weeds send long roots creeping sideways through the soil — like secret tunnels no one can see from above.",
        },
        {
          key: "popup",
          title: "Surprise Pop-Ups",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          detail: "Every so often, a tunnel sends a new shoot up to the surface. A brand-new weed pops up — sometimes several feet away from the first one!",
        },
        {
          key: "connected",
          title: "All Connected",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          detail: "Even though they look like separate plants above ground, they're all part of one big hidden network below.",
        },
        {
          key: "tricky",
          title: "Tricky to Remove",
          dot: "bg-destructive",
          bg: "bg-destructive/10 border-destructive/40",
          detail: "If even a tiny piece of tunnel is left behind, it can grow into a brand-new weed. That's why root weeds are so hard to get rid of!",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">The Secret Tunnels of Roots</p>
            <p>
              Most plants spread by making seeds — but some weeds have another clever trick up their leafy
              sleeves!
            </p>
            <p>
              Imagine a weed is a <strong>secret explorer building underground tunnels</strong>. Those
              tunnels are actually long roots growing beneath the soil, hidden from view.
            </p>
          </div>

          <div className="space-y-3">
            {TUNNEL_FACTS.map((f) => (
              <div key={f.key} className={`rounded-lg border-2 p-4 space-y-2 ${f.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${f.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{f.title}</p>
                </div>
                <p className="text-sm text-foreground">{f.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-info/10 border-2 border-info/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-info text-base">Tunnel-Building Weeds</p>
            <p className="text-sm text-foreground">
              A few famous underground tunnelers you might spot: <strong>Canada Thistle</strong>,{" "}
              <strong>Field Bindweed</strong>, and <strong>Quackgrass</strong>. Their tunnels can stretch
              many feet in every direction!
            </p>
            <img
              src={rootTunnelsImg}
              alt="Cartoon weed digging secret underground tunnels with a lantern and pickaxe"
              className="w-full rounded-lg bg-background/60 object-contain mt-2"
            />
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">Why Farmers Dig Deep</p>
            <p className="text-sm text-foreground">
              Farmers and gardeners have to remove as much of the root system as they can. If they only pull
              the top off, the hidden tunnels keep sending up brand-new weeds. Getting the whole root helps
              stop the weed for good.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>Next time you see a weed, remember — there might be a whole network of secret tunnels hiding right beneath your feet!</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       10 DISTINCTIVE WEEDS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "distinctive-weeds": {
      const WEEDS_TO_SPOT: Array<{
        id: string;
        name: string;
        spotIt: string;
        funFact: string;
        dot: string;
        bg: string;
      }> = [
        {
          id: "Dandelion",
          name: "1. Dandelion",
          spotIt: "Bright yellow flowers that turn into fluffy white puffballs — nature's little parachutes for the seeds.",
          funFact: "One big puff of wind and those parachute seeds can float far, far away!",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
        },
        {
          id: "common_Cocklebur",
          name: "2. Common Cocklebur",
          spotIt: "Prickly, sticky burs that grab onto clothes and animal fur like tiny hitchhikers.",
          funFact: "Those burs are the weed's way of catching a free ride to a brand-new spot!",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
        },
        {
          id: "large-crabgrass",
          name: "3. Large Crabgrass",
          spotIt: "Wide, flat grass blades that sprawl out sideways — often popping up on lawns and playgrounds.",
          funFact: "It's still a grass, but it's a weed because it shows up where we don't want it!",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          photo: largeCrabgrassPhoto,
          photoAlt: "Large Crabgrass sprawling on gravel with wide flat blades",
        },
        {
          id: "giant-foxtail",
          name: "4. Giant Foxtail",
          spotIt: "A fuzzy seed head that curves over — just like a fox's bushy tail. Its leaves are covered in tiny short hairs.",
          funFact: "If you gently rub a leaf, you can feel the tiny hairs like soft fuzz.",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
        },
        {
          id: "yellow-foxtail",
          name: "5. Yellow Foxtail",
          spotIt: "Looks like giant foxtail but shorter, with a chubbier yellow seed head. The leaves are smooth — hairs only near the base.",
          funFact: "Two foxtails, two personalities! Check the leaves to tell them apart.",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
        },
        {
          id: "common_Milkweed",
          name: "6. Common Milkweed",
          spotIt: "Big broad leaves and clusters of pink-purple flowers. Snap a leaf and you'll see milky white sap!",
          funFact: "In nature, it's a hero — monarch butterflies NEED it! But in a crop field, it's still a weed.",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          photo: commonMilkweedPhoto,
          photoAlt: "Cluster of pink-purple Common Milkweed flowers with broad green leaves",
        },
        {
          id: "lambsquarters",
          name: "7. Common Lambsquarters",
          spotIt: "Green leaves that look like they've been sprinkled with a light dusting of flour.",
          funFact: "That 'flour' is really a natural waxy powder — try wiping it and it comes right off.",
          dot: "bg-primary",
          bg: "bg-primary/10 border-primary/40",
        },
        {
          id: "Common_Burdock",
          name: "8. Common Burdock",
          spotIt: "HUGE round burs with tiny hooks that stick to clothes, pets, and just about anything else.",
          funFact: "Burdock burs actually inspired the invention of VELCRO® — nature is a great engineer!",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
        },
        {
          id: "Wild_Carrot",
          name: "9. Wild Carrot",
          spotIt: "Flat clusters of tiny white flowers that look like lacy umbrellas — sometimes called 'Queen Anne's Lace.'",
          funFact: "It's a biennial — that means it takes TWO years to finish its whole life cycle.",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
        },
        {
          id: "canada-thistle",
          name: "10. Canada Thistle",
          spotIt: "Spiny, prickly lobed leaves and small purple flower puffs.",
          funFact: "It's super tricky to remove because its long roots stretch out underground like secret tunnels!",
          dot: "bg-destructive",
          bg: "bg-destructive/10 border-destructive/40",
        },
      ] as Array<{ id: string; name: string; spotIt: string; funFact: string; dot: string; bg: string; photo?: string; photoAlt?: string }>;

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">10 Weeds You Can Spot!</p>
            <p>
              Ready to become a Weed Spotter? Here are 10 famous weeds that show up in yards, fields, and
              parks. Each one has a special clue — like a shape, color, or texture — that makes it easy to
              recognize once you know what to look for.
            </p>
            <p className="text-xs text-muted-foreground">
              The photos below show the flower or seed part of each weed — the part that helps you tell them
              apart the fastest.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {WEEDS_TO_SPOT.map((w) => (
              <div key={w.id} className={`rounded-lg border-2 p-4 space-y-3 ${w.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${w.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{w.name}</p>
                </div>
                <div className="w-full aspect-video rounded-md overflow-hidden bg-background/60 border border-border">
                  {w.photo ? (
                    <img src={w.photo} alt={w.photoAlt ?? w.name} className="w-full h-full object-cover" />
                  ) : (
                    <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                  )}
                </div>
                <p className="text-sm text-foreground">
                  <strong>Spot it:</strong> {w.spotIt}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Fun fact:</strong> {w.funFact}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-success text-base">You're a Weed Spotter Now!</p>
            <p className="text-sm text-foreground">
              Next time you're outside, see how many of these 10 weeds you can spot. Just remember — look
              with your eyes, and if you don't recognize a plant, ask a trusted adult before touching it!
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       INTRO CONTROL METHODS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "resource-race": {
      const RESOURCES = [
        {
          key: "sunlight",
          title: "Sunlight",
          dot: "bg-warning",
          bg: "bg-warning/10 border-warning/40",
          detail: "The energy plants use to cook their own food. Whoever grows tallest first hogs the biggest slice of sunshine!",
        },
        {
          key: "water",
          title: "Water",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          detail: "Every racer needs a drink. Roots race down through the soil to sip up as much water as they can.",
        },
        {
          key: "nutrients",
          title: "Nutrients",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          detail: "Plant vitamins pulled from the soil. Big strong roots grab the most and grow the strongest stems.",
        },
      ];

      const RACERS: Array<{
        key: "farmer" | "crop" | "weed";
        label: string;
        color: string;
        chip: string;
        blurb: string;
      }> = [
        {
          key: "farmer",
          label: "The Farmer",
          color: "bg-primary/10 border-primary/40",
          chip: "bg-primary text-primary-foreground",
          blurb: "The coach of the whole race! Farmers plant crops, pull weeds, and cheer the crops on toward a big harvest.",
        },
        {
          key: "crop",
          label: "The Crop",
          color: "bg-success/10 border-success/40",
          chip: "bg-success text-white",
          blurb: "Corn, wheat, tomatoes — the plants we grow on purpose. Their prize is turning sunshine and water into the food we eat.",
        },
        {
          key: "weed",
          label: "The Weed",
          color: "bg-destructive/10 border-destructive/40",
          chip: "bg-destructive text-white",
          blurb: "The uninvited speed demon. Weeds sprout fast, grab resources, and try to make as many seeds as possible before the season ends.",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">On Your Mark, Get Set, Grow!</p>
            <p>
              Imagine a garden or farm field isn't just a place for plants to grow — it's the site of a{" "}
              <strong>high-stakes, season-long race!</strong> The finish line isn't about being the tallest
              or the fastest. The ultimate prize is to <strong>reproduce</strong> and send as many seeds as
              possible out into the world to start the next generation.
            </p>
          </div>

          {/* Race track illustration */}
          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={fieldMarathonImg}
              alt="Cartoon of Farmer Frank, Cornelius Cob, and Wally Weed racing in the Field Day Marathon"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              And they're off! Every plant is racing to make seeds before the season ends.
            </p>
          </div>

          {/* Contenders */}
          <div className="space-y-3">
            <p className="font-display font-bold text-primary text-base">Meet the Contenders</p>
            {RACERS.map((r) => (
              <div key={r.key} className={`rounded-lg border-2 p-4 space-y-2 ${r.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.chip}`}>{r.label}</span>
                </div>
                <p className="text-sm text-foreground">{r.blurb}</p>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <p className="font-display font-bold text-primary text-base">The Race for Resources</p>
            <p className="text-sm text-foreground">
              To win the race, a plant needs fuel. Every racer is scrambling to grab three big prizes from
              the field:
            </p>
            {RESOURCES.map((r) => (
              <div key={r.key} className={`rounded-lg border-2 p-4 space-y-2 ${r.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${r.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{r.title}</p>
                </div>
                <p className="text-sm text-foreground">{r.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-warning-foreground text-base">How the Race Plays Out</p>
            <p className="text-sm text-foreground">
              Weeds are the ultimate <strong>race car drivers</strong> of the plant world — built for speed
              and survival. They sprout quickly, drink up water, soak up sunshine, and pull nutrients out of
              the soil before the crops can catch up. If nobody helps, the weeds can zoom right past the
              crops and hog the whole field!
            </p>
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">Who Cheers the Crops On?</p>
            <p className="text-sm text-foreground">
              That's where the <strong>farmer</strong> jumps in! Farmers pull weeds, plant crops close
              together, mulch the soil, and use the 5 weed-fighting superpowers so the crops can reach the
              finish line first — and fill our plates with delicious food.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>
              Every field is a race for sunlight, water, and nutrients. With a good coach — the farmer — the
              crops can beat the weeds to the finish line and win a big harvest!
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       INTRO CONTROL METHODS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "weed-helpers": {
      const POWERS = [
        {
          key: "pollinators",
          title: "Superpower #1 — Feeding Pollinators",
          dot: "bg-warning",
          bg: "bg-warning/10 border-warning/40",
          detail:
            "Weed flowers are like tiny snack bars for bees, butterflies, and other pollinators. When they sip the sweet nectar, they carry pollen from flower to flower and help lots of plants make new seeds!",
        },
        {
          key: "erosion",
          title: "Superpower #2 — Holding Soil in Place",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          detail:
            "The roots of weeds work like tiny anchors, gripping the dirt tight. When wind blows or rain pours down, those roots keep the soil from washing or blowing away.",
        },
        {
          key: "soil",
          title: "Superpower #3 — Loosening Hard Soil",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          detail:
            "Some weeds grow long, deep taproots — like nature's tiny shovels. They break up hard, packed dirt so water and air can sneak down to help other plants grow strong.",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Weeds Can Be Helpers Too!</p>
            <p>
              Not every plant we call a "weed" is a troublemaker. We pull them out of gardens so our crops
              have room to grow — but out in nature, many weeds are actually{" "}
              <strong>secret helpers</strong> with important jobs!
            </p>
          </div>

          {/* Meadow illustration */}
          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <img
              src={goodWeedsImg}
              alt="The superpowers of weeds: supporting pollinators, preventing erosion, and improving soil health"
              className="w-full h-auto rounded-md bg-background/60 object-contain"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              A flower feeds a bee, a butterfly flutters by, and a weed's deep roots hold the soil in place.
            </p>
          </div>

          {/* Three superpowers */}
          <div className="space-y-3">
            {POWERS.map((p) => (
              <div key={p.key} className={`rounded-lg border-2 p-4 space-y-2 ${p.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${p.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{p.title}</p>
                </div>
                <p className="text-sm text-foreground">{p.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-info/10 border-2 border-info/40 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-info text-base">Right Plant, Right Place</p>
            <p className="text-sm text-foreground">
              A plant is only a "weed" when it's growing somewhere we don't want it. That same plant, out in
              a meadow or on the edge of a forest, might be feeding butterflies and holding the soil
              together! Farmers try to keep weeds out of crop fields — but along ditches, roadsides, and
              wild spaces, these plants help keep nature humming.
            </p>
          </div>

          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-5 space-y-2">
            <p className="font-display font-bold text-primary text-base">A Team of Tiny Helpers</p>
            <p className="text-sm text-foreground">
              Pollinators like bees and butterflies need flowers. Soil needs roots. Ecosystems need lots of
              different plants working together. When weeds do their jobs, they help keep our whole
              <strong> earth healthy</strong>.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>
              Weeds aren't always the bad guys. In the right place, they feed pollinators, hold the soil,
              and loosen the dirt — three superpowers that keep nature strong!
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       INTRO CONTROL METHODS (K-5 Plant Explorer)
    ═══════════════════════════════════════════════════════════ */
    case "intro-control-methods": {
      const METHODS = [
        {
          key: "physical",
          title: "Physical Control",
          dot: "bg-terracotta",
          bg: "bg-terracotta/10 border-terracotta/40",
          what: "Using your hands or tools to pull, cut, dig, or till weeds out of the soil.",
          examples: "Pulling dandelions by hand, hoeing the garden, or mowing tall weeds along a fence.",
          bestFor: "Great when there are only a few weeds, or in small gardens where sprays could hurt other plants.",
        },
        {
          key: "cultural",
          title: "Cultural Control",
          dot: "bg-success",
          bg: "bg-success/10 border-success/40",
          what: "Growing crops in smart ways that make it hard for weeds to sneak in.",
          examples: "Planting rows close together so crop leaves shade the soil, rotating corn and soybeans each year, or planting a cover crop in winter.",
          bestFor: "Best on big farm fields where the farmer wants weeds to lose the race before they even start.",
        },
        {
          key: "chemical",
          title: "Chemical Control",
          dot: "bg-info",
          bg: "bg-info/10 border-info/40",
          what: "Using special sprays called herbicides that stop weeds from growing.",
          examples: "A farmer spraying a soybean field so weeds like waterhemp can't take over.",
          bestFor: "Helpful when there are too many weeds to pull by hand — but must be used carefully so crops, people, and animals stay safe.",
        },
        {
          key: "biological",
          title: "Biological Control",
          dot: "bg-accent",
          bg: "bg-accent/10 border-accent/40",
          what: "Using living helpers — like insects, animals, or tiny germs — to eat or weaken weeds.",
          examples: "Beetles that munch on leafy spurge, or goats that love to eat prickly thistle.",
          bestFor: "A good fit for pastures, parks, and wild areas where sprays are hard to use.",
        },
        {
          key: "preventative",
          title: "Preventative Control",
          dot: "bg-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/40",
          what: "Stopping weeds before they ever get a chance to grow.",
          examples: "Cleaning mud off tractors and boots, using clean seed, and pulling one weed before it makes thousands of new seeds.",
          bestFor: "The smartest kind of control — a little bit of prevention saves a whole lot of work later!",
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Five Ways to Control Weeds</p>
            <p>
              Weeds can steal sunlight, water, air, nutrients, and space from crops. So how do farmers and
              gardeners fight back? There are <strong>five main ways</strong> to control weeds, and each one
              works best in a different kind of situation.
            </p>
            <p>
              A good farmer usually mixes several of them together — this is called an <strong>integrated</strong>
              {" "}approach, and it keeps weeds from ever getting the upper hand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {METHODS.map((m) => (
              <div key={m.key} className={`rounded-lg border-2 p-4 space-y-2 ${m.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${m.dot}`} />
                  <p className="font-display font-bold text-foreground text-base">{m.title}</p>
                </div>
                <p className="text-sm text-foreground">
                  <strong>What it is:</strong> {m.what}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Examples:</strong> {m.examples}
                </p>
                <p className="text-sm text-foreground">
                  <strong>When it works best:</strong> {m.bestFor}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-success/10 border-2 border-success/40 rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-success text-base">Different Tools for Different Jobs</p>
            <p className="text-sm text-foreground">
              No single method can stop every weed on its own. Pulling weeds by hand works in a small garden
              but not on a huge field. A spray might knock back a giant patch of weeds, but it won't help if
              new weed seeds keep hitching a ride on dirty boots.
            </p>
            <p className="text-sm text-foreground">
              That's why the best weed fighters <strong>pick the right tool for the right situation</strong>{" "}
              and use two or three methods together. Physical, cultural, chemical, biological, and preventative —
              five ways to keep crops winning the race!
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-1">Remember:</p>
            <p>
              Physical, cultural, chemical, biological, preventative. Five ways to control weeds — and each one
              shines in a different job.
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       FAMILIES
    ═══════════════════════════════════════════════════════════ */
    case "families": {
      const famGroups = new Map<string, Weed[]>();
      topicWeeds.forEach((w) => {
        const list = famGroups.get(w.family) || [];
        list.push(w);
        famGroups.set(w.family, list);
      });

      if (viewMode === "box") {
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold text-primary mb-2">Plant Families</p>
              <p>Click a family tile to learn about its characteristics and see its species.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(famGroups.entries())
                .sort()
                .map(([family, members]) => (
                  <SubheadingBox
                    key={family}
                    icon=""
                    label={family}
                    count={members.length}
                    description={
                      FAMILY_DESCRIPTIONS[family] ||
                      `The ${family} family includes ${members.length} weed species in this dataset.`
                    }
                    weeds={members}
                    grade={grade}
                    onSelectWeed={onSelectWeed}
                  />
                ))}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">Plant Families</p>
            <p>
              Plants in the same family share key characteristics like flower structure, leaf arrangement, and seed
              type.
            </p>
          </div>
          {Array.from(famGroups.entries())
            .sort()
            .map(([family, members]) => (
              <div key={family} className="bg-card border border-border rounded-lg p-5 space-y-3">
                <h3 className="font-display font-bold text-foreground text-base">
                  {family} ({members.length} species)
                </h3>
                <HorizontalWeedRow weeds={members} onSelectWeed={onSelectWeed} stage="flower" showScientific={grade === "high"} />
              </div>
            ))}
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       LOOK-ALIKES
    ═══════════════════════════════════════════════════════════ */
    case "look-alikes": {
      const seen = new Set<string>();
      const pairs: [Weed, Weed][] = [];
      topicWeeds.forEach((w) => {
        const pairedWith = weeds.find((x) => x.id === w.lookAlike.id);
        if (pairedWith && !seen.has(w.id) && !seen.has(pairedWith.id)) {
          seen.add(w.id);
          seen.add(pairedWith.id);
          pairs.push([w, pairedWith]);
        }
      });

      // Build invasive vs native look-alike pairs for 6-8 and 9-12
      const invasiveNativePairs: [Weed, Weed][] = [];
      if (grade === "middle" || grade === "high") {
        const invasiveWeeds = weeds.filter((w) => w.origin === "Introduced");
        const nativeWeeds = weeds.filter((w) => w.origin === "Native");
        const invNatSeen = new Set<string>();
        invasiveWeeds.forEach((inv) => {
          const nativeLookAlike = nativeWeeds.find(
            (nat) => nat.family === inv.family && !invNatSeen.has(nat.id) && !invNatSeen.has(inv.id),
          );
          if (nativeLookAlike) {
            invNatSeen.add(inv.id);
            invNatSeen.add(nativeLookAlike.id);
            invasiveNativePairs.push([inv, nativeLookAlike]);
          }
        });
      }

      const stages = [
        { stage: "seedling", label: "Seedling" },
        { stage: "vegetative", label: "Vegetative" },
        { stage: "flower", label: "Reproductive" },
        { stage: "whole", label: "Whole Plant" },
      ];

      // Curated 3-species look-alike groups live in @/data/lookAlikeGroups
      // so the 6-8 Look-Alike practice game can share them.
      const lookAlikeGroups: { weeds: Weed[]; difference: string }[] = LOOKALIKE_TRIPLES
        .map((t) => {
          const ws = t.ids.map((id) => weeds.find((w) => w.id === id));
          if (ws.some((w) => !w)) return null;
          return { weeds: ws as Weed[], difference: t.difference };
        })
        .filter((g): g is { weeds: Weed[]; difference: string } => g !== null);

      const renderPairCard = (a: Weed, b: Weed, key: string) => {
        const aIsGrass = a.plantType === "Monocot";
        const bIsGrass = b.plantType === "Monocot";
        const showLigule = aIsGrass || bIsGrass;
        return (
          <div key={key} className="bg-card border border-border rounded-lg p-4 space-y-4">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <ClickableWeedName weed={a} onSelect={onSelectWeed} className="text-sm font-bold" />
                {grade !== "elementary" && <div className="text-xs text-primary italic">{a.scientificName}</div>}
                <div className="text-[10px] text-muted-foreground">{a.family}</div>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${a.origin === "Introduced" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}
                >
                  {a.origin === "Introduced" ? "Introduced" : "Native"}
                </span>
              </div>
              <div className="text-center">
                <ClickableWeedName weed={b} onSelect={onSelectWeed} className="text-sm font-bold" />
                {grade !== "elementary" && <div className="text-xs text-primary italic">{b.scientificName}</div>}
                <div className="text-[10px] text-muted-foreground">{b.family}</div>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${b.origin === "Introduced" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}
                >
                  {b.origin === "Introduced" ? "Introduced" : "Native"}
                </span>
              </div>
            </div>

            {/* All growth stages side by side */}
            {(grade === "elementary" ? stages.slice(3) : stages).map((s) => (
              <div key={s.stage}>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">{s.label}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <WeedImage weedId={a.id} stage={s.stage} className="w-full h-full" />
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <WeedImage weedId={b.id} stage={s.stage} className="w-full h-full" />
                  </div>
                </div>
              </div>
            ))}

            {/* Ligule comparison for grasses */}
            {showLigule && grade !== "elementary" && (
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">Ligule</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    {aIsGrass ? (
                      <WeedImage weedId={a.id} stage="ligule" className="w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        Not a grass
                      </div>
                    )}
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    {bIsGrass ? (
                      <WeedImage weedId={b.id} stage="ligule" className="w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        Not a grass
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Difference explanation */}
            <div className="bg-muted/30 rounded p-3 text-xs text-foreground">
              <p className="font-semibold text-primary mb-1">How to tell them apart:</p>
              <p>{a.lookAlike.difference}</p>
            </div>
          </div>
        );
      };

      // 3-species comparison card: shows seedling / vegetative / reproductive (+ ligule
      // when any member is a grass) side-by-side for all three species.
      const renderTripleCard = (group: Weed[], key: string, customDifference?: string) => {
        const compareStages = [
          { stage: "seedling", label: "Seedling" },
          { stage: "vegetative", label: "Vegetative" },
          { stage: "flower", label: "Reproductive" },
        ];
        const anyGrass = group.some((w) => w.plantType === "Monocot");

        // High school layout: each species is its own ROW, stages laid out as
        // COLUMNS the user scrolls horizontally. Images are smaller for density.
        if (grade === "high") {
          const stageCols = anyGrass
            ? [...compareStages, { stage: "ligule", label: "Ligule" }]
            : compareStages;
          const colWidth = 9; // rem per stage column
          const nameColWidth = 11; // rem for the species name/label column
          return (
            <div key={key} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="overflow-x-auto -mx-1">
                <div
                  className="px-1"
                  style={{ minWidth: `${nameColWidth + stageCols.length * colWidth}rem` }}
                >
                  {/* Stage header row */}
                  <div
                    className="grid gap-2 mb-2"
                    style={{ gridTemplateColumns: `${nameColWidth}rem repeat(${stageCols.length}, ${colWidth}rem)` }}
                  >
                    <div />
                    {stageCols.map((s) => (
                      <div
                        key={s.stage}
                        className="text-[10px] font-bold text-muted-foreground uppercase text-center"
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                  {/* Species rows */}
                  {group.map((w) => (
                    <div
                      key={w.id}
                      className="grid gap-2 mb-2 items-center"
                      style={{ gridTemplateColumns: `${nameColWidth}rem repeat(${stageCols.length}, ${colWidth}rem)` }}
                    >
                      <div className="pr-2">
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs font-bold leading-tight block" />
                        <div className="text-[10px] text-primary italic leading-tight">{w.scientificName}</div>
                        <div className="text-[9px] text-muted-foreground">{w.family}</div>
                        <span
                          className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 ${w.origin === "Introduced" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}
                        >
                          {w.origin === "Introduced" ? "Introduced" : "Native"}
                        </span>
                      </div>
                      {stageCols.map((s) => (
                        <div
                          key={s.stage}
                          className="aspect-square rounded-md overflow-hidden bg-muted"
                        >
                          {s.stage === "ligule" && w.plantType !== "Monocot" ? (
                            <div className="flex items-center justify-center h-full text-[9px] text-muted-foreground text-center px-1">
                              Not a grass
                            </div>
                          ) : (
                            <WeedImage weedId={w.id} stage={s.stage} className="w-full h-full" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">← Scroll to see all stages →</p>
              {customDifference && (
                <div className="bg-muted/30 rounded p-3 text-xs text-foreground">
                  <p className="font-semibold text-primary mb-1">How to tell them apart:</p>
                  <p>{customDifference}</p>
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={key} className="bg-card border border-border rounded-lg p-4 space-y-4">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-3">
              {group.map((w) => (
                <div key={w.id} className="text-center">
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm font-bold" />
                  <div className="text-[11px] text-primary italic leading-tight">{w.scientificName}</div>
                  <div className="text-[10px] text-muted-foreground">{w.family}</div>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${w.origin === "Introduced" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}
                  >
                    {w.origin === "Introduced" ? "Introduced" : "Native"}
                  </span>
                </div>
              ))}
            </div>

            {/* Stage-by-stage comparison */}
            {compareStages.map((s) => (
              <div key={s.stage}>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">
                  {s.label}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {group.map((w) => (
                    <div key={w.id} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <WeedImage weedId={w.id} stage={s.stage} className="w-full h-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Ligule row (only if at least one species is a grass) */}
            {anyGrass && (
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">
                  Ligule
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {group.map((w) => (
                    <div key={w.id} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      {w.plantType === "Monocot" ? (
                        <WeedImage weedId={w.id} stage="ligule" className="w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground text-center px-1">
                          Not a grass (no ligule)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {customDifference && (
              <div className="bg-muted/30 rounded p-3 text-xs text-foreground">
                <p className="font-semibold text-primary mb-1">How to tell them apart:</p>
                <p>{customDifference}</p>
              </div>
            )}
          </div>
        );
      };

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Look-Alike Weeds</p>
              <p>
                Some weeds look very similar to other weeds. It is important to tell them apart so we can manage them
                the right way. The groups below have <strong>two, three, or even four</strong> weeds that all look
                alike — see if you can spot what makes each one different!
              </p>
            </div>
            <ElementaryLookAlikeGroups onSelectWeed={onSelectWeed} />
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">Look-Alike Species</p>
            {grade === "middle" ? (
              <>
                <p>
                  Have you ever looked out at a field or a lawn and thought all the weeds looked pretty much the same?
                  You're not alone — even farmers and scientists sometimes have to look twice. Many common weeds are
                  like nature's copycats. They have similar leaf shapes, the same spiky seeds, or grow in the exact
                  same spots, making them really easy to mix up.
                </p>
                <p>
                  But here's why it matters: not all weeds play by the same rules. Some can be pulled out easily, while
                  others have deep roots that grow back no matter how many times you remove them. Some weeds are just
                  annoying, while others — like <strong>poison hemlock</strong> — are actually dangerous to touch or
                  eat. And when farmers need to use herbicides (special sprays that kill unwanted plants), picking the
                  wrong one because they misidentified the weed is like taking cold medicine when you actually have a
                  broken arm. It just won't work, and you've wasted time and money.
                </p>
                <p>
                  Getting the ID right is the first step to dealing with a weed the smart way — whether that's pulling
                  it, spraying it, or knowing to stay away from it entirely. The good news is that once you know what
                  clues to look for, like <strong>leaf shape, stem texture, flower color, or whether the plant has
                  milky sap when you break it</strong> — telling these lookalikes apart becomes a lot easier than it
                  sounds.
                </p>
              </>
            ) : (
              <>
                <p>
                  In a soybean or corn field, two species that look nearly identical at the seedling stage can demand
                  completely different management programs. <strong>Waterhemp and Palmer Amaranth</strong> are a textbook
                  example — both are dioecious pigweeds, both can produce 250,000+ seeds per plant, and both have
                  evolved resistance to multiple herbicide groups, but Palmer is the more aggressive competitor and
                  triggers a zero-tolerance threshold across most of the Midwest. Misidentifying one as the other can
                  cost a grower 30–80% of yield in a heavily infested field.
                </p>
                <p>
                  Reliable identification at the high-school level means moving past general impressions and using
                  <strong> diagnostic morphological characters</strong>: leaf venation and pubescence, stem cross-section
                  and trichomes, petiole-to-leaf-blade ratio, inflorescence architecture, ligule and auricle shape in
                  grasses, and the presence or absence of milky latex, square stems, or sheathing ocreae. Many of these
                  features only become diagnostic at specific growth stages, so a single photograph at one stage is
                  rarely enough — you have to compare species across the seedling, vegetative, and reproductive phases.
                </p>
                <p>
                  The consequences of misidentification extend beyond yield loss. Choosing the wrong mode-of-action
                  herbicide because you confused a Group-9-resistant Waterhemp with a still-susceptible Redroot Pigweed
                  selects for further resistance and burns through control options. Confusing a native pollinator host
                  (<em>e.g.</em> Common Milkweed) with an invasive look-alike can waste conservation effort or destroy
                  monarch habitat. And confusing Wild Carrot with Poison Hemlock is a safety event, not a botany
                  mistake. The triples below are the species pairings most commonly confused in field-scouting reports;
                  use the side-by-side layout to build a mental key based on the features that actually distinguish
                  them.
                </p>
              </>
            )}
          </div>

          {/* 3-species look-alike groups — primary content for 6-8 and 9-12 */}
          {lookAlikeGroups.length > 0 && (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h3 className="font-display font-bold text-foreground text-base mb-1">
                  Look-Alike Groups (3 species each)
                </h3>
                <p className="text-sm text-foreground">
                  Compare these commonly-confused trios at each growth stage. For grass groups, the{" "}
                  <strong>ligule</strong> row is one of the most reliable ID features.
                </p>
              </div>
              {lookAlikeGroups.map((g, i) =>
                renderTripleCard(g.weeds, `tri-${i}-${g.weeds.map((w) => w.id).join("-")}`, g.difference)
              )}
            </div>
          )}

          {/* Invasive vs Native Look-Alikes section for 6-8 and 9-12 */}
          {invasiveNativePairs.length > 0 && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <h3 className="font-display font-bold text-foreground text-base mb-2">
                  Invasive vs Native Look-Alikes
                </h3>
                <p className="text-sm text-foreground">
                  These pairs contain an <strong className="text-destructive">invasive (introduced)</strong> species
                  that closely resembles a <strong className="text-accent">native</strong> species.
                </p>
              </div>
              {invasiveNativePairs.map(([a, b]) => renderPairCard(a, b, `inv-${a.id}-${b.id}`))}
            </div>
          )}

          {/* Family-based Look-Alike Pairs (legacy 2-weed) */}
          {pairs.length > 0 && (
            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="font-display font-bold text-foreground text-base">Family-Based Look-Alike Pairs</h3>
              {pairs.map(([a, b]) => renderPairCard(a, b, `fam-${a.id}`))}
            </div>
          )}
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       SAFETY & CONTROL
    ═══════════════════════════════════════════════════════════ */
    case "safety": {
      const ELEM_CONTROL_METHODS = [
        {
          label: "Hand Weeding",
          desc: "Pulling weeds out by hand or with a tool. This works best for small areas and when there are only a few weeds. Always wear gloves!",
        },
        {
          label: "Mowing",
          desc: "Cutting weeds down before they can spread seeds. This does not remove the roots, so weeds may grow back.",
        },
        {
          label: "Herbicides (Plant Sprays)",
          desc: "Special sprays used by farmers and adults that kill unsafe weeds. Kids should never spray these — they must be handled with gloves, goggles, and training.",
        },
      ];

      if (grade === "elementary") {
        // Group unsafe weeds by WHY they are dangerous, based on keywords in safetyNote.
        const matches = (w: Weed, re: RegExp) => re.test(w.safetyNote || "");
        const physical = topicWeeds.filter((w) => matches(w, /thorn|spine|prick|bur|sharp|puncture|stab/i));
        const skin = topicWeeds.filter(
          (w) =>
            !physical.includes(w) &&
            matches(w, /skin|dermat|rash|irrit|sap|sting|blister|burn|contact|allerg/i),
        );
        const toxic = topicWeeds.filter(
          (w) =>
            !physical.includes(w) &&
            !skin.includes(w) &&
            matches(w, /toxic|poison|ingest|consum|eat|swallow|livestock|cattle|horse|hallucin|fatal|death|nausea|vomit|nitrate/i),
        );
        const other = topicWeeds.filter(
          (w) => !physical.includes(w) && !skin.includes(w) && !toxic.includes(w),
        );

        const renderGroup = (
          title: string,
          desc: string,
          tone: string,
          group: Weed[],
        ) =>
          group.length === 0 ? null : (
            <div key={title} className={`border rounded-lg p-4 space-y-3 ${tone}`}>
              <div>
                <p className="font-display font-bold text-foreground text-sm">
                  {title} <span className="text-xs text-muted-foreground font-normal">({group.length})</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className="space-y-2">
                {group.map((w) => (
                  <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold text-sm" />
                      <div className="text-xs text-destructive mt-1">{w.safetyNote}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        return (
          <div className="space-y-5">
            <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-destructive text-base">Safety</p>
              <p>
                As we learned, some invasive weeds can hurt native plants and animals. There are also some weeds that
                hurt <strong>humans</strong>. These unsafe weeds can look like normal plants. However, when they are
                touched or ingested, they can cause harm to people.
              </p>
              <p>
                Not all unsafe weeds are dangerous in the same way. Some hurt your <strong>skin</strong> when you
                touch them, some are <strong>poisonous</strong> if eaten, and some have sharp parts that can{" "}
                <strong>physically</strong> hurt you. They are grouped below by the kind of harm they can cause.
              </p>
            </div>

            {/* Unsafe weeds grouped by reason */}
            {renderGroup(
              "Skin Irritation",
              "These weeds can cause a rash, itchy skin, or burns if you touch them. Always wear long sleeves and gloves!",
              "bg-amber-500/10 border-amber-500/30",
              skin,
            )}
            {renderGroup(
              "Toxic if Eaten",
              "These weeds are poisonous if a person or animal swallows any part of the plant. Never put wild plants in your mouth.",
              "bg-destructive/10 border-destructive/30",
              toxic,
            )}
            {renderGroup(
              "Physically Harmful (Sharp Parts)",
              "These weeds have thorns, spines, or prickly burs that can poke or cut your skin. Look before you reach!",
              "bg-orange-500/10 border-orange-500/30",
              physical,
            )}
            {renderGroup(
              "Other Hazards",
              "These weeds can be unsafe in other ways — for example, by causing allergies or harming livestock.",
              "bg-secondary/40 border-border",
              other,
            )}

            {/* Control methods */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">How Can We Remove Unsafe Weeds?</p>
              <p>
                Agronomists (plant scientists) use a few different tools to remove unsafe weeds from farms and yards.
                The right tool depends on how many weeds there are and how dangerous they are to touch.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ELEM_CONTROL_METHODS.map((m) => (
                <div key={m.label} className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <p className="font-bold text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (grade === "middle") {
        return (
          <div className="space-y-5">
            <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-destructive text-base">Safety</p>
              <p>
                Working around weeds might not sound dangerous, but there are actually quite a few hazards that
                farmers, scientists, and land managers need to watch out for in the field.
              </p>
              <p>
                Certain weed species pose direct physical risks, including plants with <strong>sharp thorns or
                spines</strong> capable of causing puncture wounds, species that produce <strong>irritating or toxic
                sap</strong> that causes dermatitis or chemical burns upon skin contact, and highly <strong>allergenic
                plants</strong> whose pollen triggers significant respiratory responses.
              </p>
              <p>
                Herbicide application introduces additional risks related to chemical exposure, requiring the proper
                selection and use of <strong>personal protective equipment</strong> such as chemical-resistant gloves,
                eye protection, protective clothing, and respiratory protection where indicated.
              </p>
              <p>
                Just like following safety rules in a science lab, knowing the risks and preparing properly makes the
                work safer and more effective for everyone involved.
              </p>
            </div>

            {/* PPE Checklist */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="font-bold text-foreground">Field Safety Checklist</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "Chemical-resistant gloves",
                  "Eye protection (goggles or safety glasses)",
                  "Long sleeves and pants",
                  "Closed-toe shoes or boots",
                  "Respiratory protection when spraying",
                  "Know hazardous plants in your area",
                ].map((item) => (
                  <div key={item} className="bg-secondary/30 border border-border rounded p-2 text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {topicWeeds.map((w) => (
              <div key={w.id} className="bg-card border border-destructive/30 rounded-lg p-4 flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                </div>
                <div>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                  <div className="text-sm text-destructive mt-1">{w.safetyNote}</div>
                  <div className="text-xs text-muted-foreground mt-1">Management: {w.management}</div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // 9-12
      {
        // Group safety weeds by the management technique their `management` field
        // most closely matches, so the page reads as Mechanical / Cultural / Chemical / etc.
        const TECHNIQUE_BUCKETS: { key: string; label: string; description: string; match: RegExp }[] = [
          {
            key: "mechanical",
            label: "Mechanical & Physical Removal (Hand-pulling, Mowing, Tillage)",
            description:
              "Crews physically remove or sever the plant — hand-pulling, hoeing, digging taproots, mowing before seed set, brush-cutting, or tillage (chisel, disk, row cultivator). Most effective on small infestations and before seed production, but it brings workers into direct contact with the plant, so PPE (chemical-resistant gloves, long sleeves, eye protection) is mandatory for species with toxic sap, spines, or allergenic pollen. Tillage can also bury herbicide-resistant seed and reset the seedbank.",
            match: /hand[- ]?pull|dig|mow|cut|till|cultivat|mechanical|removal/i,
          },
          {
            key: "cultural",
            label: "Cultural & Preventive Practices (Crop Rotation, Cover Crops, Sanitation)",
            description:
              "These practices change the field environment so the weed never gets a foothold. Includes crop rotation (corn → soybean → small grain) to disrupt life cycles, competitive cover crops (cereal rye, crimson clover) that shade and suppress germination, equipment sanitation to stop seed transport, livestock exclusion from infested pastures, and posted signage warning workers of toxic stands. Preventive — lowest worker exposure of any tactic because the dangerous plant ideally never reaches a harvestable size.",
            match: /rotat|cover crop|sanit|prevent|exclud|fenc|sign|graz/i,
          },
          {
            key: "chemical",
            label: "Chemical Control — Herbicides (PRE & POST Applications)",
            description:
              "Targeted application of a labeled herbicide — broadcast spray, banded over-the-row, or spot-treat with a backpack sprayer or wick. Effective on large infestations and species with deep roots or rhizomes that mechanical removal can't kill. Required PPE per the product label always includes chemical-resistant gloves and eye protection; long-sleeved coveralls and an organic-vapor respirator are required for many Group 4 (auxin) and Group 14 (PPO) products. Always rotate modes of action (Groups 1–27) to slow resistance.",
            match: /herbicid|spray|chemical|spot[- ]?treat/i,
          },
          {
            key: "biological",
            label: "Biological Control (Insects, Pathogens, Targeted Grazing)",
            description:
              "Releases a host-specific natural enemy — a leaf-feeding insect, a fungal pathogen, or a managed grazing animal (goats, sheep) — that selectively reduces the weed population without human handlers ever needing to touch it. Slow-acting and rarely eradicates a population on its own, but extremely low worker-exposure risk and well suited to large rangeland or roadside infestations of species like Leafy Spurge or Canada Thistle.",
            match: /biolog|insect|pathogen|biocontrol|graz/i,
          },
          {
            key: "ipm",
            label: "Integrated Pest Management — IPM (Scouting, Thresholds, Multiple Tactics)",
            description:
              "An overall decision framework — not a single tactic. IPM stacks regular scouting, economic and action thresholds, and a planned sequence of cultural, mechanical, biological, and chemical tools so no one tactic is overused. For toxic-plant management it also means matching each tool to the worker-exposure risk it carries (lowest-risk tool that still controls the population) and rotating herbicide modes of action to slow resistance.",
            match: /integrat|ipm|combin|monitor|scout|threshold/i,
          },
        ];

        const buckets = TECHNIQUE_BUCKETS.map((b) => ({
          ...b,
          weeds: topicWeeds.filter((w) => b.match.test(w.management || "")),
        }));
        const placedIds = new Set(buckets.flatMap((b) => b.weeds.map((w) => w.id)));
        const otherWeeds = topicWeeds.filter((w) => !placedIds.has(w.id));

        return (
          <div className="space-y-5">
            <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-5 text-sm text-foreground space-y-2">
              <p className="font-display font-bold text-destructive text-base">Safety First</p>
              <p>
                Some weeds are <strong>dangerous to touch, inhale, or ingest</strong> — they may carry irritating sap,
                allergenic pollen, sharp spines, or systemic toxins. The species below are grouped by the
                <strong> management technique</strong> most commonly recommended for them so you can see at a glance
                which control tool fits which population, and what level of PPE that tool requires. The right choice
                balances three things: how effective the tactic is on that species, how much it exposes the worker, and
                how it fits into a longer IPM rotation.
              </p>
            </div>

            {buckets.map(
              (b) =>
                b.weeds.length > 0 && (
                  <div key={b.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
                    <p className="font-display font-bold text-foreground text-base">{b.label}</p>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                    <div className="overflow-x-auto pb-3 -mx-1">
                      <div className="flex gap-3 px-1" style={{ minWidth: `${b.weeds.length * 18}rem` }}>
                        {b.weeds.map((w) => (
                          <div
                            key={w.id}
                            className="shrink-0 w-[17rem] bg-secondary/30 border border-destructive/30 rounded-lg p-3 flex gap-3"
                          >
                            <button
                              onClick={() => onSelectWeed(w)}
                              className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border hover:border-primary"
                            >
                              <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                            </button>
                            <div className="min-w-0">
                              <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold text-sm" />
                              <p className="text-[10px] italic text-primary">{w.scientificName}</p>
                              <p className="text-xs text-destructive mt-1 line-clamp-3">{w.safetyNote}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">← Scroll to see all {b.weeds.length} →</p>
                  </div>
                ),
            )}

            {otherWeeds.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <p className="font-display font-bold text-foreground text-base">Other Toxic Species</p>
                <p className="text-sm text-muted-foreground">
                  Species whose management notes do not map cleanly to a single technique above. Always check the
                  toxicology profile before selecting a control strategy.
                </p>
                <HorizontalWeedRow weeds={otherWeeds} onSelectWeed={onSelectWeed} stage="flower" showScientific />
              </div>
            )}
          </div>
        );
      }
    }

    /* ═══════════════════════════════════════════════════════════
       CONTROL METHODS
    ═══════════════════════════════════════════════════════════ */
    case "control-methods":
    {
      const isHighSchool = grade === "high";
      const isElementary = grade === "elementary";

      // Documented herbicide-resistant weeds by WSSA/HRAC group (Heap, Intl. Herbicide Resistance Database)
      const RESISTANT_WEEDS_BY_GROUP: Record<number, string[]> = {
        1: ["Italian ryegrass", "Wild oat", "Johnsongrass", "Giant foxtail"],
        2: ["Palmer amaranth", "Waterhemp", "Kochia", "Horseweed (marestail)", "Common ragweed"],
        3: ["Goosegrass", "Green foxtail"],
        4: ["Kochia", "Waterhemp", "Wild mustard", "Horseweed"],
        5: ["Common lambsquarters", "Redroot pigweed", "Kochia", "Waterhemp"],
        7: ["Smooth pigweed", "Common groundsel"],
        9: ["Horseweed (marestail)", "Palmer amaranth", "Waterhemp", "Kochia", "Giant ragweed", "Italian ryegrass"],
        10: ["Italian ryegrass", "Palmer amaranth (limited)"],
        14: ["Waterhemp", "Palmer amaranth", "Common ragweed"],
        15: ["Waterhemp (recent reports)"],
        22: ["Horseweed", "Hairy fleabane"],
        27: ["Waterhemp", "Palmer amaranth"],
      };

      const ELEM_METHODS = [
        {
          key: "hand-weeding",
          label: "Hand Weeding",
          desc: "Physically pulling weeds out by hand or with a hoe. This works great for small areas, gardens, or when only a few weeds are present. Always pull weeds before they produce seeds!",
          example: "Walking through a garden and pulling out dandelions before they form their white seed heads.",
        },
        {
          key: "cover-crops",
          label: "Cover Crops",
          desc: "Planting helper crops (like cereal rye or clover) between cash crops to shade the soil, take up space, and stop weed seeds from germinating. This is a natural, chemical-free approach.",
          example: "Planting cereal rye after the soybean harvest so the field is not bare during the winter.",
        },
        {
          key: "tillage",
          label: "Tillage",
          desc: "Using equipment to turn or stir the soil so that small weeds are uprooted and buried. There are different kinds of tillage: deep tillage (like a moldboard plow) flips the soil over, conservation tillage (like a chisel plow or disk) only stirs the top, and row cultivation pulls weeds from between crop rows.",
          example: "A farmer uses a row cultivator to remove weeds growing between rows of soybeans.",
        },
        {
          key: "chemical",
          label: "Chemical Methods (Herbicides)",
          desc: "Herbicides are special chemicals that farmers spray on fields to stop weeds. Pre-emergent herbicides are sprayed before weed seeds sprout. Post-emergent herbicides are sprayed on weeds that are already growing. Farmers wear safety gear and follow the label exactly to keep people, animals, and crops safe.",
          example: "A farmer sprays a pre-emergent herbicide on a soybean field in early spring to stop weeds before they sprout.",
        },
      ];

      const MIDDLE_METHODS = [
        {
          key: "cultural",
          label: "Cultural Control",
          desc: "Cultural control practices modify the growing environment or cropping system to reduce weed establishment and competitiveness. This includes techniques such as cover cropping, competitive variety selection, crop rotation, and optimized planting density.",
          example: "Planting crops closer together so they shade out weeds before they can establish.",
        },
        {
          key: "mechanical",
          label: "Mechanical Control",
          desc: "Mechanical control involves the physical removal or destruction of weeds through tillage, mowing, cultivation, or hand removal, and is most effective when timed to target weeds at vulnerable growth stages.",
          example: "Running a cultivator between crop rows to uproot small weeds without damaging the crop.",
        },
        {
          key: "biological",
          label: "Biological Control",
          desc: "Biological control uses living organisms, such as host-specific insects, pathogens, or grazing animals, to suppress target weed populations, and is particularly relevant in non-cropland and natural area management contexts.",
          example: "Releasing specific beetles that feed only on invasive thistle plants to reduce their population.",
        },
        {
          key: "chemical",
          label: "Chemical Control (Herbicides)",
          desc: "Herbicides are chemicals specifically designed to kill or slow the growth of unwanted plants. They are classified by their mode of action, application timing (pre-emergent or post-emergent), and selectivity. Pre-emergent herbicides are applied before weed seeds germinate. Post-emergent herbicides target actively growing weeds.",
          example: "Applying a pre-emergent herbicide to the soil surface before weeds sprout to create a chemical barrier.",
        },
        {
          key: "integrated",
          label: "Integrated Approach",
          desc: "The most effective and sustainable long-term weed management programs integrate multiple control methods in a coordinated strategy, reducing reliance on any single approach and minimizing the risk of weed adaptation or resistance development.",
          example: "Combining cover crops, crop rotation, mechanical cultivation, and targeted herbicide use across a season.",
        },
      ];

      const HIGH_SCHOOL_METHODS = [
        {
          key: "pre-emergent",
          label: "General Pre-Emergent Herbicide",
          desc: "Pre-emergent herbicides create a chemical barrier in the soil that inhibits cell division in germinating weed seeds. They must be applied before weed emergence and typically require rainfall or irrigation for activation. Timing is critical. Applying too early or too late reduces efficacy significantly.",
          example:
            "Applying pendimethalin or S-metolachlor to corn fields before planting to prevent annual grass and small-seeded broadleaf emergence.",
          weedId: "lambsquarters",
        },
        {
          key: "post-emergent",
          label: "General Post-Emergent Herbicide",
          desc: "Post-emergent herbicides target actively growing weeds. They can be selective (targeting specific weed types while leaving the crop unharmed) or non-selective (killing all vegetation). Efficacy depends on weed growth stage, environmental conditions, and application rate.",
          example:
            "Applying a selective broadleaf herbicide to a soybean field to control waterhemp at the 2-4 inch stage.",
          weedId: "waterhemp",
        },
        {
          key: "multi-moa",
          label: "Multi-MOA Herbicides",
          desc: "Multi-Mode of Action (MOA) herbicide programs use two or more herbicides with different mechanisms of killing weeds in a single application or across a season. This is the most critical strategy for preventing herbicide resistance.",
          example:
            "Tank-mixing a Group 15 pre-emergent with a Group 27 post-emergent to control resistant Palmer amaranth.",
          weedId: "palmer-amaranth",
        },
        {
          key: "wait",
          label: "Wait to Act",
          desc: "Economic threshold-based decision making is central to IPM. The pest threshold is the specific population density at which control action must be taken to prevent unacceptable harm or economic loss.",
          example:
            "A scout records 1-2 common chickweed plants per square meter in a vigorous winter wheat stand. Published thresholds indicate this causes less than 1% yield loss.",
          weedId: "CommonChickweed",
        },
        {
          key: "hand-weeding",
          label: "Hand Weeding",
          desc: "Manual removal of weeds, particularly important for removing herbicide-resistant escapes before they set seed. In resistance management, 'zero seed tolerance' programs rely on hand weeding.",
          example:
            "Walking bean fields in late summer to hand-pull waterhemp escapes that survived herbicide applications.",
          weedId: "waterhemp",
        },
        {
          key: "mulch-cover",
          label: "Mulch / Cover Crops",
          desc: "Cover crops suppress weeds through physical biomass that blocks light, allelopathic compounds that inhibit germination, and competition for resources. Species like cereal rye can produce 4,000-8,000 lbs/acre of biomass.",
          example:
            "Planting cereal rye at 60-90 lbs/acre after corn harvest, then roller-crimping in spring before soybean planting.",
          weedId: "giant-foxtail",
        },
        {
          key: "tillage",
          label: "Mechanical Cultivation (Tillage)",
          desc: "Tillage can be strategic or conventional. Strategic tillage targets specific weed flushes while minimizing soil disturbance. Deep inversion tillage can bury weed seeds below their emergence depth.",
          example:
            "Using a precision inter-row cultivator with guidance systems to mechanically remove weeds between soybean rows.",
          weedId: "canada-thistle",
        },
      ];

      const methods = isElementary ? ELEM_METHODS : isHighSchool ? HIGH_SCHOOL_METHODS : MIDDLE_METHODS;

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">Weed Control Methods</p>
            {isElementary ? (
              <p>
                There are many ways to manage and remove weeds. Farmers, gardeners, and scientists use different methods
                depending on the type of weed and where it is growing. Learning about control methods helps us keep
                our fields, gardens, and environments healthy.
              </p>
            ) : isHighSchool ? (
              <>
                <p>
                  Effective weed management requires an <strong>Integrated Pest Management (IPM)</strong> approach —
                  combining multiple control tactics to reduce weed pressure, prevent resistance, and protect crop yield.
                </p>
                <p className="text-muted-foreground">
                  Understanding each tool's <strong>mode of action</strong>, <strong>timing window</strong>, and{" "}
                  <strong>limitations</strong> is essential for building effective management programs.
                </p>
              </>
            ) : (
              <>
                <p>
                  Controlling weeds isn't just about spraying chemicals — there's actually a whole toolbox of strategies
                  that farmers can use including <strong>cultural, mechanical, biological, and chemical</strong> methods.
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            {methods.map((method) => (
              <div key={method.key} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <h3 className="font-display font-bold text-foreground">{method.label}</h3>
                <p className="text-sm text-foreground">{method.desc}</p>
                <div className="flex gap-3 items-start">
                  {isHighSchool && (method as any).weedId && (() => {
                    const exW = weeds.find((w) => w.id === (method as any).weedId);
                    if (!exW) return null;
                    return (
                      <button
                        onClick={() => onSelectWeed(exW)}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-colors"
                        aria-label={`Open ${exW.commonName}`}
                      >
                        <WeedImage weedId={exW.id} stage="mature" className="w-full h-full" />
                      </button>
                    );
                  })()}
                  <div className="bg-primary/10 rounded-lg p-3 flex-1">
                    <p className="text-xs text-primary">
                      <span className="font-semibold">Example:</span> {method.example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* High-school-only: crop-mismatch warning + herbicide-resistant traits */}
          {isHighSchool && (
            <>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-foreground space-y-2">
                <p className="font-bold text-destructive">Match the Herbicide to the Crop</p>
                <p className="text-xs">
                  Soybean is itself a <strong>broadleaf</strong>, so spraying a non-selective broadleaf herbicide
                  over conventional soybean will damage the crop along with the weeds. Corn is a <strong>grass</strong>,
                  so a non-selective grass herbicide will damage corn. Always read the label and confirm the herbicide is
                  labeled for the crop you are growing.
                </p>
              </div>
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground space-y-2">
                <p className="font-bold text-accent">Herbicide-Resistant Crop Traits</p>
                <p className="text-xs">
                  Modern corn and soybean varieties can be genetically engineered to tolerate specific herbicides, which
                  lets growers spray over the top of the crop. Common platforms include:
                </p>
                <ul className="text-xs list-disc ml-5 space-y-1">
                  <li><strong>Roundup Ready</strong> — tolerance to glyphosate (Group 9).</li>
                  <li><strong>LibertyLink</strong> — tolerance to glufosinate (Group 10).</li>
                  <li><strong>Xtend / XtendiMax</strong> — tolerance to dicamba (Group 4).</li>
                  <li><strong>Enlist E3</strong> — tolerance to 2,4-D choline + glyphosate + glufosinate.</li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Trait stacking allows multiple modes of action over the same crop, which is a key tool for managing
                  resistant Palmer amaranth and waterhemp.
                </p>
              </div>
            </>
          )}

          {/* Herbicide MOA Reference Table - only for 6-8 and 9-12 */}
          {!isElementary && (
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-3">
              <p className="font-semibold text-primary">Herbicide Modes of Action Reference</p>
              {isHighSchool ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    The table below lists the major herbicide MOA groups used in crop production, sorted by group
                    number. Where a group has both pre- and post-emergent chemistries, the PRE entry is listed first.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-secondary/50">
                          <th className="p-2 text-left font-bold text-foreground border border-border">MOA (Group)</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Timing</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Spectrum</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Chemical</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Resistance & Documented Resistant Weeds</th>
                        </tr>
                      </thead>
                       <tbody>
                         {[...HERBICIDE_MOA].sort((a, b) => {
                           if (a.group !== b.group) return a.group - b.group;
                           const order = { PRE: 0, BOTH: 1, POST: 2 } as const;
                           return (order[a.timing] ?? 3) - (order[b.timing] ?? 3);
                         }).map(h => {
                           const resistantWeeds = RESISTANT_WEEDS_BY_GROUP[h.group];
                           return (
                          <tr key={h.id} className="even:bg-muted/20">
                            <td className="p-2 border border-border font-medium text-foreground">{h.moa} (Group {h.group})</td>
                            <td className="p-2 border border-border text-muted-foreground">{h.timing}</td>
                            <td className="p-2 border border-border text-muted-foreground">{h.spectrum}</td>
                            <td className="p-2 border border-border text-muted-foreground">{h.brands[0]}</td>
                            <td className="p-2 border border-border align-top">
                              <span className={`font-medium ${h.resistanceLevel === 'Very high' || h.resistanceLevel === 'High' ? 'text-destructive' : 'text-foreground'}`}>{h.resistanceLevel}</span>
                              {resistantWeeds && (
                                <div className="text-[10px] text-muted-foreground mt-1">Examples: {resistantWeeds.join(', ')}</div>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="font-semibold text-primary mt-3">Injury Symptoms → MOA Groups</p>
                  <p className="text-xs text-muted-foreground">
                    Each symptom type below is followed by the MOA groups that produce it, so injury seen in the field
                    can be traced back to the responsible herbicide group.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(SYMPTOM_TYPES).map(([key, info]) => {
                      const groups = [...HERBICIDE_MOA]
                        .filter(h => h.symptomType === key)
                        .map(h => h.group)
                        .filter((g, i, arr) => arr.indexOf(g) === i)
                        .sort((a, b) => a - b);
                      return (
                        <div key={key} className="bg-card border border-border rounded-lg p-3">
                          <p className="font-bold text-foreground text-xs">{info.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{info.description}</p>
                          {groups.length > 0 && (
                            <p className="text-[10px] text-primary mt-1">
                              <span className="font-semibold">MOA groups:</span> {groups.map(g => `Group ${g}`).join(', ')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Herbicides work in different ways to kill weeds. Scientists group them by their
                    <strong> mode of action (MOA)</strong> — the specific way the chemical disrupts the weed's biology.
                  </p>
                  <div className="space-y-2">
                    {[...getMiddleSchoolMOAs()].sort((a, b) => a.group - b.group).map(h => (
                      <div key={h.id} className="bg-card border border-border rounded-lg p-3">
                        <p className="font-bold text-foreground text-xs">{h.moa} (Group {h.group})</p>
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium">Timing:</span> {h.timing === 'PRE' ? 'Pre-emergent (before weeds sprout)' : 'Post-emergent (after weeds are growing)'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium">Targets:</span> {h.spectrum === 'Both' ? 'Grasses and broadleaves' : h.spectrum === 'Grass' ? 'Grasses (monocots)' : 'Broadleaves (dicots)'}
                        </p>
                         <p className="text-[10px] text-muted-foreground">
                           <span className="font-medium">Chemical:</span> {h.brands[0]}
                         </p>
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium">What it looks like:</span> {SYMPTOM_TYPES[h.symptomType]?.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-accent text-sm">Key Takeaway</p>
            {isElementary ? (
              <p className="text-sm text-foreground">
                The best way to manage weeds is to use <strong>more than one method</strong>. For example, you can pull
                weeds by hand AND use mulch to stop new ones from growing. Using different methods together keeps weeds
                from coming back.
              </p>
            ) : isHighSchool ? (
              <p className="text-sm text-foreground">
                Sustainable weed management requires <strong>diversifying tactics across multiple MOA groups</strong>,
                integrating cultural practices like <strong>cover crops and tillage</strong>, and making data-driven
                decisions based on <strong>scouting and economic thresholds</strong>.
              </p>
            ) : (
              <p className="text-sm text-foreground">
                The best weed management uses <strong>multiple methods together</strong>. For example: start with a{" "}
                <strong>pre-emergent herbicide</strong>, plant <strong>cover crops</strong>, and use{" "}
                <strong>hand weeding</strong> for any weeds that break through.
              </p>
            )}
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       FIELD SCOUTING
    ═══════════════════════════════════════════════════════════ */
    case "field-scouting": {
      // Each pattern includes an inline SVG diagram showing how the route fits a typical field shape.
      const PATTERNS: { name: string; bestFor: string; desc: string; diagram: JSX.Element }[] = [
        {
          name: "W-Pattern",
          bestFor: "Rectangular fields",
          desc: "Walk a wide W shape across the field, sampling at each turn. Provides broad, representative coverage of a standard rectangular field.",
          diagram: (
            <svg viewBox="0 0 120 70" className="w-full h-auto">
              <rect x="4" y="6" width="112" height="58" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
              <polyline points="10,12 35,58 60,12 85,58 110,12" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" />
              {[[10,12],[35,58],[60,12],[85,58],[110,12]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--accent))" />
              ))}
            </svg>
          ),
        },
        {
          name: "X-Pattern",
          bestFor: "Square fields",
          desc: "Walk diagonally from corner to corner, forming an X. Best for square fields where all four quadrants need quick coverage.",
          diagram: (
            <svg viewBox="0 0 70 70" className="w-full h-auto max-w-[6rem] mx-auto">
              <rect x="4" y="4" width="62" height="62" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
              <line x1="8" y1="8" x2="62" y2="62" stroke="hsl(var(--primary))" strokeWidth="2.5" />
              <line x1="62" y1="8" x2="8" y2="62" stroke="hsl(var(--primary))" strokeWidth="2.5" />
              {[[8,8],[62,62],[62,8],[8,62],[35,35]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--accent))" />
              ))}
            </svg>
          ),
        },
        {
          name: "Zigzag",
          bestFor: "Long, narrow fields",
          desc: "Walk back and forth across the short axis of the field, advancing along its length. Ideal for long, narrow fields where straight passes would miss too much.",
          diagram: (
            <svg viewBox="0 0 160 40" className="w-full h-auto">
              <rect x="4" y="6" width="152" height="28" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
              <polyline points="10,30 30,10 50,30 70,10 90,30 110,10 130,30 150,10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" />
              {[[10,30],[30,10],[50,30],[70,10],[90,30],[110,10],[130,30],[150,10]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2" fill="hsl(var(--accent))" />
              ))}
            </svg>
          ),
        },
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Field Walking Methods and Patterns</p>
            {grade === "middle" ? (
              <>
                <p>
                  Imagine being asked to check an entire football field for weeds. Where would you even start?
                </p>
                <p>
                  Systematic field scouting is a foundational practice in weed management that involves walking through
                  a field in a <strong>structured, repeatable pattern</strong> to accurately assess the type,
                  distribution, and density of weed populations.
                </p>
                <p>
                  Common scouting patterns, such as the <strong>W-pattern, X-pattern, or zigzag</strong>, are designed
                  to provide representative coverage of an entire field rather than focusing on easily accessible or
                  visually obvious areas.
                </p>
                <p>
                  The choice of scouting pattern depends on factors such as <strong>field size, shape, crop type</strong>,
                  and the suspected distribution of weed pressure. Accurate scouting data ensures that weed populations
                  are neither overestimated nor underestimated.
                </p>
              </>
            ) : (
              <>
                <p>
                  Field scouting starts with <strong>manual walking patterns</strong> that an agronomist or grower can use on
                  foot. These patterns are the foundation of every weed assessment — they are how you ground-truth what is
                  actually growing in the field.
                </p>
                <p>
                  However, the average Iowa crop farm now spans roughly <strong>345 acres</strong>
                  <span className="text-xs text-muted-foreground"> (<a href="https://www.extension.iastate.edu/Agdm/articles/edwards/EdwMar24.html" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">Edwards, ISU Extension, March 2024</a>)</span>,
                  which is far too large for a person to cover thoroughly on foot every week. To scale up scouting,
                  agronomists now combine manual walks with <strong>drones, rovers, and satellites</strong> that can survey
                  whole fields quickly and pinpoint problem areas for a closer manual look.
                </p>
              </>
            )}
          </div>

          {/* Manual scouting patterns (always shown first) */}
          <h3 className="font-display font-bold text-foreground text-sm">Manual Scouting Patterns</h3>
          <p className="text-xs text-muted-foreground -mt-2">
            Match the pattern to the field shape so every part of the field has a fair chance of being sampled. The dots show
            sampling stops along each route.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PATTERNS.map((p) => (
              <div key={p.name} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="font-bold text-foreground text-lg text-center">{p.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-primary text-center font-semibold">Best for: {p.bestFor}</p>
                <div className="bg-secondary/30 rounded p-2">{p.diagram}</div>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>

          {grade === "high" && (
            <>
              <h3 className="font-display font-bold text-foreground text-sm">Technology-Assisted Scouting</h3>
              <p className="text-xs text-muted-foreground -mt-2">
                Because modern fields are too large to walk every week, manual patterns are now combined with these tools.
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Drones",
                    desc: "Cover acres in minutes from above. Drones do not measure NDVI directly — they collect spectral data and high-resolution images that are then used to calculate vegetation indices, weed density, patch mapping, stand counts, nutrient-deficiency patterns, and drainage or ponding issues.",
                  },
                  {
                    label: "Rovers",
                    desc: "Autonomous or remote-controlled machines that drive through fields using AI-powered cameras and sensors. They capture close-up images from inside the canopy that can be used to provide detailed information on weed identification, soil compaction, root health, emergence uniformity, and disease symptoms — information that is hard to see from the air.",
                  },
                  {
                    label: "Satellites",
                    desc: "Especially useful for remote or large farms. Satellites provide multi-spectral imagery from which analysts can extract weed pressure indicators, yield potential, soil moisture, field boundaries, and cover-crop coverage. Over time, this imagery builds a historical record of the field. That history makes it possible to pinpoint exact hotspot zones where abnormalities keep recurring.",
                  },
                ].map((t) => (
                  <div key={t.label} className="bg-card border border-border rounded-lg p-4 space-y-2">
                    <p className="font-display font-bold text-foreground">{t.label}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">Why Consistent Scouting Matters</p>
            <p className="mt-1">These tools help farmers find small weed patches early, ultimately reducing labor costs and yield losses from aggressive early-season weed competition.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       WEED COMPETITORS
    ═══════════════════════════════════════════════════════════ */
    case "weed-competitors": {
      // Build trait → species groupings from the curated data file
      const COMPETITION_EXAMPLES = TRAIT_DEFS.map((t) => ({
        trait: t.short,
        desc: t.desc,
        weedIds: Object.entries(COMPETITION_TRAITS)
          .filter(([, traits]) => traits.includes(t.key))
          .map(([id]) => id),
      }));
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Weed Adaptation to Compete</p>
            {grade === "middle" ? (
              <>
                <p>Plants might look peaceful, but they're locked in a constant battle for survival.</p>
                <p>
                  Every plant needs sunlight, water, and soil nutrients — and there's never enough to go around. To win,
                  plants have evolved some seriously clever strategies.
                </p>
                <p>
                  <strong>Competing for resources</strong> starts the moment a seed hits the soil. Some weeds have
                  incredibly fast germination rates — sprouting in just a day or two — which gives them a head start
                  over slower plants before the competition even begins. Once above ground, fast-growing weeds like
                  giant ragweed shoot up quickly to form an aggressive canopy, spreading their leaves wide to absorb
                  sunlight and shade out everything growing below them. Meanwhile, plants like crabgrass stay low and
                  spread outward, blanketing the ground so nothing else can sprout underneath. The battle continues
                  underground too, where deep or extensive root systems — like those of field bindweed or Canada
                  thistle, which can reach several feet down — tap into water and nutrients that shallower-rooted
                  neighbors simply can't access. Some plants even release toxic chemicals into the soil to poison
                  competitors, a process called <strong>allelopathy</strong>.
                </p>
                <p>
                  <strong>Defending against predators</strong> is another survival must. Since plants can't run, they
                  fight back in other ways. Many grow physical deterrents like spines, thorns, or stiff hairs —
                  buffalobur and Canada thistle are good examples. Others load their leaves and stems with toxic or
                  foul-tasting compounds, a strategy called chemical defense. Jimsonweed, poison hemlock, and
                  horsenettle are all toxic enough to make animals seriously ill — which is a very effective way to
                  avoid being eaten.
                </p>
                <p>
                  <strong>Surviving human control</strong> may be the most impressive trick of all. Some weeds produce
                  thousands of seeds that stay dormant in the soil for years, just waiting. Others rely on those same
                  deep root systems to regrow after being cut or sprayed. And some have even developed herbicide
                  resistance — small genetic changes that make a plant immune to chemicals designed to kill it.
                </p>
                <div className="bg-card border border-border rounded-lg p-3 mt-2">
                  <p className="font-bold text-foreground text-sm mb-2">Key definitions</p>
                  <dl className="text-xs space-y-1.5">
                    {[
                      ["Germination rate", "How quickly a seed sprouts after hitting the soil — faster means a bigger head start over competitors."],
                      ["Canopy competition", "Racing to grow tall and spread wide to shade out neighboring plants."],
                      ["Deep / extensive root systems", "Roots that reach far down or spread wide underground to access water and nutrients others can't reach."],
                      ["Allelopathy", "Releasing chemicals into the soil to slow or stop nearby plants from growing."],
                      ["Physical deterrents", "Spines, thorns, or rough hairs that make a plant hard to eat."],
                      ["Chemical defense", "Toxic or bad-tasting compounds produced inside the plant to discourage predators."],
                      ["Dormancy", "A seed's ability to pause development and wait in the soil until conditions are right to sprout."],
                    ].map(([term, def]) => (
                      <div key={term} className="grid grid-cols-[10rem_1fr] gap-2">
                        <dt className="font-semibold text-primary">{term}</dt>
                        <dd className="text-foreground">{def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            ) : (
              <>
                <p>
                  Weeds compete with crops — and with each other — for the same four limiting resources:
                  <strong> light, water, nutrients, and physical space</strong>. The most damaging field weeds combine
                  several competitive traits at once: rapid emergence, high seedling densities, aggressive vertical and
                  lateral growth, deep or fibrous root systems, and prolific seed production.
                </p>
                <p>
                  Research shows the <strong>critical period for weed control</strong> in corn and soybean usually falls
                  between the V2–V6 stages, when even short-lived competition can permanently reduce yield. After canopy
                  closure, late-emerging weeds matter less for yield but still drive next year's seedbank.
                </p>
                <p>
                  Understanding interspecific competition among weeds helps predict <strong>weed succession patterns</strong>
                  — for example, why repeated glyphosate use shifted Midwest fields toward Palmer amaranth and waterhemp —
                  and supports management strategies that account for the full ecological complexity of weed communities.
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-foreground">Rapid Germination</p>
              <p className="text-xs text-muted-foreground">
                Some weeds sprout faster than others, grabbing sunlight and soil space before neighbors can emerge.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-foreground">Canopy Spread</p>
              <p className="text-xs text-muted-foreground">
                Wide, fast-growing leaves shade out shorter plants, cutting off their access to sunlight.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-foreground">Allelopathy</p>
              <p className="text-xs text-muted-foreground">
                Some weeds release chemicals into the soil that prevent nearby seeds from germinating or growing.
              </p>
            </div>
          </div>

          {/* Visual species examples */}
          <div className="space-y-4">
            <p className="font-display font-bold text-foreground text-sm">Real-World Examples</p>
            {COMPETITION_EXAMPLES.map((cat) => {
              const ws = cat.weedIds
                .map((id) => weeds.find((w) => w.id === id) || weeds.find((w) => w.commonName.toLowerCase().replace(/[ _]/g, "") === id.toLowerCase().replace(/[ _]/g, "")))
                .filter((w): w is Weed => !!w);
              if (ws.length === 0) return null;
              return (
                <div key={cat.trait} className="bg-card border border-border rounded-lg p-3 space-y-2">
                  <p className="font-bold text-foreground text-sm">{cat.trait}</p>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {ws.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => onSelectWeed(w)}
                        className="flex-shrink-0 w-28 bg-muted/40 border border-border rounded-md p-2 hover:border-primary transition-colors text-left"
                      >
                        <div className="w-full h-20 rounded overflow-hidden bg-muted mb-1">
                          <WeedImage weedId={w.id} stage="mature" className="w-full h-full" />
                        </div>
                        <p className="text-[11px] font-bold text-foreground leading-tight">{w.commonName}</p>
                        <p className="text-[9px] italic text-muted-foreground leading-tight">{w.scientificName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">Why This Matters</p>
            <p className="mt-1">
              These competitive dynamics influence which weed species become dominant in a given field or landscape over
              time, and shifts in weed community composition can occur in response to changes in management practices,
              crop rotation, or environmental conditions.
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       ECONOMIC THRESHOLD
    ═══════════════════════════════════════════════════════════ */
    case "economic-threshold": {
      const THRESHOLD_EXAMPLES: { weedId: string; name: string; crop: string; threshold: string; note: string }[] = [
        { weedId: "palmer-amaranth", name: "Palmer Amaranth", crop: "Soybean", threshold: "1–2 plants per 30 ft of row", note: "Extremely low threshold — even sparse populations can cause 10%+ yield loss because of rapid biomass accumulation." },
        { weedId: "waterhemp", name: "Waterhemp", crop: "Soybean", threshold: "Fewer than 1 plant per ft of row", note: "Aggressive seed production (250k+ seeds/female) makes seedbank prevention as important as yield protection." },
        { weedId: "giant-ragweed", name: "Giant Ragweed", crop: "Corn", threshold: "~1 plant per 100 ft²", note: "Very tall, very competitive — a handful of plants per acre can justify control." },
        { weedId: "lambsquarters", name: "Lambsquarters", crop: "Soybean", threshold: "~4–8 plants per m²", note: "Higher tolerance — crop competes well early-season, so threshold is several times Palmer's." },
        { weedId: "velvetleaf", name: "Velvetleaf", crop: "Corn", threshold: "~1 plant per m²", note: "Wide leaves shade corn rapidly, but corn outgrows lower densities." },
        { weedId: "giant-foxtail", name: "Giant Foxtail", crop: "Corn", threshold: "10–20 plants per m²", note: "Much higher tolerance — economic loss only at dense infestations." },
      ].map(e => ({ ...e, weed: weeds.find(w => w.id === e.weedId) || weeds.find(w => w.commonName.toLowerCase() === e.name.toLowerCase()) }))
        .filter((e): e is typeof e & { weed: Weed } => !!e.weed) as any;
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Economic Threshold</p>
            {grade === "middle" ? (
              <>
                <p>
                  Here's a statement that might surprise you: sometimes it actually makes more sense to{" "}
                  <strong>leave weeds alone</strong> than to spend money trying to kill them.
                </p>
                <p>
                  The <strong>economic threshold</strong> is the point at which a weed population is large enough that
                  the damage it causes to a crop is worth more than what it would cost to control it.
                </p>
                <p>
                  Below this threshold, the expense of treatment — including the cost of herbicides, equipment, fuel,
                  and labor — exceeds the value of the yield that would be lost to weed competition, making treatment
                  economically counterproductive.
                </p>
                <p>
                  Above the threshold, the opposite is true: crop losses from uncontrolled weed pressure would cost more
                  than the investment required to manage them.
                </p>
              </>
            ) : (
              <p>
                Applying the economic threshold principle requires accurate field scouting data and knowledge of
                crop-weed competitive relationships.
              </p>
            )}
          </div>

          {/* Economic threshold graph */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="font-display font-bold text-foreground text-sm text-center">Economic Threshold Over Time</p>
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 420 260" className="w-full h-auto max-w-lg mx-auto block" role="img" aria-label="Economic threshold graph showing weed infestation level over time with and without control">
                {/* Axes */}
                <line x1="50" y1="220" x2="390" y2="220" stroke="hsl(var(--border))" strokeWidth="2" />
                <line x1="50" y1="20" x2="50" y2="220" stroke="hsl(var(--border))" strokeWidth="2" />
                {/* Y-axis label */}
                <text x="18" y="125" fontSize="11" fill="hsl(var(--foreground))" transform="rotate(-90 18 125)" textAnchor="middle" fontWeight="bold">Weed Infestation Level</text>
                {/* X-axis label */}
                <text x="225" y="250" fontSize="11" fill="hsl(var(--foreground))" textAnchor="middle" fontWeight="bold">Time</text>

                {/* Economic injury level (dashed, upper) */}
                <line x1="50" y1="55" x2="390" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="5 4" />
                <text x="60" y="50" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="bold">Economic injury level</text>

                {/* Economic threshold (solid, middle) */}
                <line x1="50" y1="105" x2="390" y2="105" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                <text x="60" y="100" fontSize="10" fill="hsl(var(--foreground))" fontWeight="bold">Economic threshold</text>

                {/* Without control curve (dashed black, rises above injury level) */}
                <path d="M 50 200 C 110 190, 150 150, 190 110 C 230 70, 280 40, 340 55 C 370 65, 390 90, 390 120" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeDasharray="6 4" />
                <text x="300" y="35" fontSize="10" fill="hsl(var(--foreground))" fontWeight="bold">Without control</text>

                {/* With control curve (solid green filled) */}
                <path d="M 50 200 C 110 190, 150 150, 185 105 L 185 220 L 50 220 Z" fill="#558B2F" fillOpacity="0.25" stroke="none" />
                <path d="M 185 105 C 210 80, 250 120, 290 140 C 330 160, 370 150, 390 165" fill="none" stroke="#558B2F" strokeWidth="2.5" />
                <path d="M 185 105 C 210 80, 250 120, 290 140 C 330 160, 370 150, 390 165 L 390 220 L 185 220 Z" fill="#558B2F" fillOpacity="0.25" stroke="none" />
                <text x="260" y="175" fontSize="10" fill="#558B2F" fontWeight="bold">With control</text>

                {/* Chemical control arrow and label */}
                <line x1="185" y1="25" x2="185" y2="95" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" />
                  </marker>
                </defs>
                <text x="120" y="22" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="bold">Chemical control</text>

                {/* Drop arrow at intervention */}
                <line x1="200" y1="95" x2="200" y2="125" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
              </svg>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              When weed pressure rises past the <span className="text-foreground font-bold">economic threshold</span>, control becomes profitable.
              Without action, the population may reach the <span className="text-foreground font-bold">economic injury level</span>, where losses exceed any recoverable yield.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="font-bold text-foreground">How It Works</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-bold text-foreground text-sm">Below Threshold</p>
                <p className="text-xs text-muted-foreground">
                  Cost of treatment is greater than the value of crop loss. No action needed — save your money.
                </p>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="font-bold text-foreground text-sm">Above Threshold</p>
                <p className="text-xs text-muted-foreground">
                  Crop losses would cost more than treatment. Time to act and apply control measures.
                </p>
              </div>
            </div>
          </div>

          {/* Species-specific thresholds */}
          {grade === "high" && THRESHOLD_EXAMPLES.length > 0 && (
            <div className="space-y-2">
              <p className="font-display font-bold text-foreground text-sm">Thresholds Differ Between Species</p>
              <p className="text-xs text-muted-foreground">
                Every weed species has its own competitive ability, so the threshold density that triggers control is very
                different from one weed to another — even in the same crop.
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {THRESHOLD_EXAMPLES.map((e: any) => (
                  <button
                    key={e.weedId}
                    onClick={() => onSelectWeed(e.weed)}
                    className="flex-shrink-0 w-48 bg-card border border-border rounded-lg p-3 text-left hover:border-primary transition-colors"
                  >
                    <div className="w-full h-20 rounded overflow-hidden bg-muted mb-2">
                      <WeedImage weedId={e.weed.id} stage="mature" className="w-full h-full" />
                    </div>
                    <p className="font-bold text-foreground text-xs">{e.name}</p>
                    <p className="text-[10px] italic text-primary">{e.weed.scientificName}</p>
                    <p className="text-[10px] text-foreground mt-1"><strong>{e.crop}:</strong> {e.threshold}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{e.note}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-bold text-accent">Key Principle</p>
            <p>
              Incorporating economic thresholds into weed management decisions promotes financially responsible,
              data-driven practice and discourages unnecessary herbicide applications that increase costs and
              accelerate the development of herbicide resistance.
            </p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       TAXONOMY
    ═══════════════════════════════════════════════════════════ */
    case "taxonomy": {
      // Use Dandelion as the worked example
      const exampleWeed = weeds.find((w) => w.commonName === "Dandelion") || weeds[0];
      const taxonomyLevels = [
        { level: "Kingdom", value: "Plantae", desc: "All plants" },
        { level: "Division", value: "Magnoliophyta", desc: "Flowering plants (Angiosperms)" },
        {
          level: "Class",
          value: exampleWeed.plantType === "Monocot" ? "Monocotyledon" : "Dicotyledon",
          desc: exampleWeed.plantType === "Monocot" ? "One seed leaf" : "Two seed leaves",
        },
        { level: "Family", value: exampleWeed.family, desc: `Shared flower/leaf structure` },
        { level: "Genus", value: exampleWeed.scientificName.split(" ")[0], desc: "Closely related species group" },
        { level: "Species", value: exampleWeed.scientificName, desc: `Unique organism: ${exampleWeed.commonName}` },
      ];

      // Group weeds by family for color-coded display
      const familyGroups = new Map<string, Weed[]>();
      topicWeeds.forEach((w) => {
        const list = familyGroups.get(w.family) || [];
        list.push(w);
        familyGroups.set(w.family, list);
      });
      const familyColors = [
        "bg-primary/10 border-primary/30",
        "bg-accent/10 border-accent/30",
        "bg-destructive/10 border-destructive/30",
        "bg-secondary border-border",
      ];

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Taxonomy</p>
            {grade === "middle" ? (
              <>
                <p>
                  Taxonomy is the system scientists use to organize and name every living thing on Earth — like a giant
                  filing system for nature.
                </p>
                <p>
                  Taxonomy is the scientific discipline of classifying and naming living organisms by organizing them
                  into a structured hierarchy based on shared characteristics and evolutionary relationships. In plant
                  science, this hierarchy runs from broad categories like <strong>Kingdom</strong> and{" "}
                  <strong>Division</strong> down through <strong>Family</strong>, <strong>Genus</strong>, and{" "}
                  <strong>Species</strong> — with each level becoming more specific.
                </p>
                <p>
                  Every weed species is assigned a two-part scientific name, known as a <strong>binomial</strong>,
                  consisting of its genus and species, which remains consistent across all languages and regions.
                </p>
                <p>
                  A working knowledge of plant taxonomy also helps identify{" "}
                  <strong>patterns among related weed species</strong>, which can inform predictions about shared
                  biological behaviors, habitat preferences, and herbicide sensitivities.
                </p>
              </>
            ) : (
              <p>
                Taxonomy is the scientific discipline of classifying organisms into a hierarchical system.
                Understanding taxonomy helps predict weed behavior, herbicide response, and management strategies
                based on evolutionary relationships.
              </p>
            )}
          </div>

          {/* Taxonomy pyramid with worked example */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="font-display font-bold text-foreground text-sm text-center mb-1">
              Taxonomy Pyramid: {exampleWeed.commonName}
            </p>
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border">
                <WeedImage weedId={exampleWeed.id} stage="flower" className="w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              {taxonomyLevels.map((t, i) => {
                const widths = ["100%", "88%", "76%", "64%", "52%", "40%"];
                return (
                  <div
                    key={t.level}
                    style={{ width: widths[i] }}
                    className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center transition-all"
                  >
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{t.level}</p>
                    <p className="text-sm font-bold text-foreground">{t.value}</p>
                    <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Family groupings */}
          <FamilyGroupings familyGroups={familyGroups} familyColors={familyColors} onSelectWeed={onSelectWeed} />
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       DIOECIOUS
    ═══════════════════════════════════════════════════════════ */
    case "dioecious": {
      const DIOECIOUS_SPECIES = [
        {
          id: "Hemp_dogbane",
          name: "Hemp Dogbane",
          maleDesc: "Has clusters of small white-pink bell-shaped flowers that attract pollinators",
          femaleDesc: "Has paired slender seed pods (follicles) that split open to release seeds with silky hairs",
        },
        {
          id: "Marijuana",
          name: "Marijuana",
          maleDesc: "Has loose, hanging clusters of small pollen-producing flowers on thin stalks",
          femaleDesc: "Has dense, resinous flower buds with protruding white pistils (hairs) at stem nodes",
        },
        {
          id: "palmer-amaranth",
          name: "Palmer Amaranth",
          maleDesc: "Has soft, drooping seed heads that release pollen",
          femaleDesc: "Has long, spiny, rigid seed heads that feel prickly to touch",
        },
        {
          id: "waterhemp",
          name: "Waterhemp",
          maleDesc: "Has drooping, tassel-like flower clusters that shed pollen into the wind",
          femaleDesc: "Has compact, dense seed heads packed tightly along the stem",
        },
      ];

      const availableDioecious = DIOECIOUS_SPECIES.filter(
        (sp) => hasImage(sp.id, "male.jpg") && hasImage(sp.id, "female.jpg"),
      );

      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Dioecious Weeds</p>
            <p>
              Dioecious weeds are plants that have distinct <strong>female and male individual plants</strong>. This
              means some plants have female flowers while other plants have male flowers, unlike monoecious plants,
              which have both male and female flowers on the same plant.
            </p>
            <p>
              Reproduction is <strong>impossible without both sexes</strong>. A dioecious weed population requires
              female and male plants in <strong>close proximity</strong> — pollen from a male must reach a female for
              any viable seed to be produced.
            </p>
            <p>
              When both sexes are present, dioecious weeds produce <strong>vast amounts of seed</strong> — a single
              female Palmer amaranth or waterhemp can produce hundreds of thousands of seeds in one season. Because
              every seed is the product of cross-pollination between two different parents, populations carry{" "}
              <strong>significant genetic diversity</strong>, which accelerates the evolution of resistance to many
              herbicides.
            </p>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">In this group of 88 weeds, there are 4 dioecious species:</p>
            <p className="mt-1">Hemp Dogbane, Marijuana, Palmer Amaranth, and Waterhemp.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Look at each species profile below to learn the key differences between the male and female plants.
            </p>
          </div>

          {/* Species profiles with male/female images */}
          {availableDioecious.map((sp) => {
            const weedData = weeds.find((w) => w.id === sp.id);
            return (
              <div key={sp.id} className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="text-center">
                  <p className="font-display font-bold text-foreground text-lg">{sp.name}</p>
                  {weedData && (
                    <button
                      onClick={() => onSelectWeed(weedData)}
                      className="text-xs text-primary italic hover:underline cursor-pointer"
                    >
                      {weedData.scientificName}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-32 sm:h-40 rounded-xl overflow-hidden bg-muted border-2 border-primary/30 mx-auto max-w-[12rem]">
                      <WeedImage weedId={sp.id} stage="male" className="w-full h-full" />
                    </div>
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                      <p className="font-bold text-foreground text-sm">Male Plant</p>
                      <p className="text-xs text-muted-foreground mt-1">{sp.maleDesc}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-32 sm:h-40 rounded-xl overflow-hidden bg-muted border-2 border-accent/30 mx-auto max-w-[12rem]">
                      <WeedImage weedId={sp.id} stage="female" className="w-full h-full" />
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
                      <p className="font-bold text-foreground text-sm">Female Plant</p>
                      <p className="text-xs text-muted-foreground mt-1">{sp.femaleDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {availableDioecious.length === 0 && (
            <div className="bg-secondary rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Male and female images (male.jpg, female.jpg) need to be uploaded to weed image folders to display here.
              </p>
            </div>
          )}
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       SEED DORMANCY (High School)
    ═══════════════════════════════════════════════════════════ */
    case "seed-dormancy": {
      const DORMANCY_TYPES: { label: string; desc: string; examples: string[] }[] = [
        {
          label: "Physical Dormancy",
          desc: "The seed has a hard or impenetrable seed coat that blocks water and gas exchange. The seed cannot germinate until the coat is broken down by weathering, fire, freeze–thaw cycles, or microbial activity.",
          examples: ["Field Bindweed", "Hedge Bindweed", "Tall Morningglory", "Velvetleaf"],
        },
        {
          label: "Physiological Dormancy",
          desc: "Caused by chemical inhibitors within the embryo or surrounding tissues that prevent embryonic growth. This is the most common form of seed dormancy. Seasonal cues — winter chilling, warming spring soils, fluctuating moisture, or light exposure — break the dormancy when conditions become favorable.",
          examples: ["Lambsquarters", "Redroot Pigweed", "Giant Foxtail", "Green Foxtail", "Yellow Foxtail", "Wild Mustard", "Curly Dock"],
        },
        {
          label: "Chemical Dormancy",
          desc: "A specialized case of physiological dormancy involving high concentrations of chemical inhibitors in the seed covering or embryo. These inhibitors must be leached out by rainfall or degraded by microbes before germination can occur.",
          examples: ["Common Cocklebur", "Wild Oat", "Johnsongrass"],
        },
        {
          label: "Morphological Dormancy",
          desc: "The embryo is underdeveloped at the time the seed is released from the parent plant. The seed must spend additional time in the soil maturing internally before it is structurally ready to germinate.",
          examples: ["Wild Carrot", "Poison Hemlock"],
        },
      ];
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Seed Dormancy</p>
            <p>To survive <strong>seasonal changes</strong> and other unfavorable conditions — cold winters, summer drought, waterlogged soils, or simply the wrong time of year — weed seeds have evolved the ability to pause germination until conditions improve.</p>
            <p><strong>Seed dormancy</strong> is the ability of a viable seed to remain dormant and avoid unfavorable conditions, waiting until favorable conditions (the right temperature, moisture, light, and oxygen) arise before germinating. For weed seeds this is a survival advantage; for agronomists trying to eradicate weeds it makes the seedbank persist for years.</p>
          </div>
          <div className="space-y-4">
            {DORMANCY_TYPES.map(d => {
              const exampleWeeds = d.examples
                .map(n => weeds.find(w => w.commonName.toLowerCase() === n.toLowerCase()))
                .filter((w): w is Weed => !!w);
              return (
                <div key={d.label} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <p className="font-display font-bold text-foreground">{d.label}</p>
                  <p className="text-sm text-foreground">{d.desc}</p>
                  {exampleWeeds.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">Example Weeds</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                        {exampleWeeds.map(w => (
                          <button
                            key={w.id}
                            onClick={() => onSelectWeed(w)}
                            className="flex-shrink-0 w-32 bg-muted/40 border border-border rounded-lg p-2 hover:border-primary transition-colors text-left"
                          >
                            <div className="w-full h-20 rounded overflow-hidden bg-muted mb-1">
                              <WeedImage weedId={w.id} stage="mature" className="w-full h-full" />
                            </div>
                            <p className="text-[11px] font-bold text-foreground leading-tight">{w.commonName}</p>
                            <p className="text-[10px] italic text-muted-foreground leading-tight">{w.scientificName}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       ALLELOPATHY (High School)
    ═══════════════════════════════════════════════════════════ */
    case "allelopathy": {
      const PATHWAYS = [
        { label: "Root Exudation", desc: "Chemicals are secreted directly from roots into the surrounding soil, disrupting nearby plant growth and nutrient uptake." },
        { label: "Leaf Leachate", desc: "Rainfall or dew washes inhibitory compounds off leaves onto the soil surface, suppressing the germination of other plants." },
        { label: "Decomposition Leaching", desc: "As plant residues break down, they release compounds into the soil that can linger and impact future crops." },
        { label: "Volatilization", desc: "Chemicals are released into the air that may reduce germination or growth of seedlings nearby." },
        { label: "Soil Accumulation", desc: "Allelopathic chemicals persist and build up over time, reducing soil health and crop vigor." },
      ];
      const ALLELOPATHIC_EXAMPLES: { id: string; name: string; compound: string; note: string }[] = [
        { id: "Johnsongrass", name: "Johnsongrass", compound: "Sorgoleone (root exudate)", note: "Root-released quinone strongly inhibits germination of corn, soybean, and small-seeded broadleaves." },
        { id: "Quackgrass", name: "Quackgrass", compound: "Phenolic acids & agropyrene from rhizomes", note: "Rhizome residues suppress alfalfa, corn, and soybean establishment." },
        { id: "Giant_Foxtail", name: "Giant Foxtail", compound: "Phenolic acids from decomposing residue", note: "Reduces corn and soybean seedling vigor when crop is planted into heavy residue." },
        { id: "Yellow_Nutsedge", name: "Yellow Nutsedge", compound: "Tuber-derived phenolics", note: "Suppresses germination of grasses and many broadleaf crops near tuber colonies." },
        { id: "Velvetleaf", name: "Velvetleaf", compound: "Phenolics & cyanogenic glycosides in residue", note: "Decomposing leaves and seeds inhibit soybean and corn radicle growth." },
        { id: "Canada_Thistle", name: "Canada Thistle", compound: "Root-exuded phenolic acids", note: "Reduces emergence and biomass of neighboring crops within thistle patches." },
        { id: "Volunteer_Sunflower", name: "Volunteer Sunflower", compound: "Chlorogenic & isochlorogenic acids", note: "Leaf leachate and residue suppress competing weeds and small-seeded crops." },
        { id: "Redroot_Pigweed", name: "Redroot Pigweed", compound: "Water-soluble leaf leachates", note: "Aqueous extracts measurably reduce soybean and wheat germination in field studies." },
        { id: "Common_Lambsquarters", name: "Lambsquarters", compound: "Oxalic acid & phenolic compounds", note: "Residue leachate inhibits germination of small-seeded crops like alfalfa and flax." },
      ];
      const availableAllelo = ALLELOPATHIC_EXAMPLES
        .map(e => ({ ...e, weed: weeds.find(w => w.commonName.toLowerCase() === e.name.toLowerCase()) }))
        .filter(e => !!e.weed);
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Allelopathy</p>
            <p>Allelopathy in weeds is the process where plants release biochemicals into the environment through their roots, leaves, or decaying tissues that <strong>inhibit the germination, growth, or development</strong> of neighboring plants.</p>
            <p>This chemical interference gives weeds a competitive advantage over crops, native plants, and even other weeds. Understanding allelopathy helps farmers see that weed impacts aren't limited to physical crowding or nutrient competition.</p>
          </div>
          <h3 className="font-display font-bold text-foreground text-sm">Allelopathic Pathways</h3>
          <div className="space-y-3">
            {PATHWAYS.map(p => (
              <div key={p.label} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="font-bold text-foreground">{p.label}</p>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
          <h3 className="font-display font-bold text-foreground text-sm">Documented Allelopathic Weeds</h3>
          <p className="text-xs text-muted-foreground -mt-2">Scroll to see species with peer-reviewed evidence of allelopathy.</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {availableAllelo.map(e => (
              <button
                key={e.name}
                onClick={() => e.weed && onSelectWeed(e.weed)}
                className="flex-shrink-0 w-48 bg-card border border-border rounded-lg p-3 text-left hover:border-primary transition-colors"
              >
                <div className="w-full h-24 rounded-md overflow-hidden bg-muted mb-2">
                  {e.weed && <WeedImage weedId={e.weed.id} stage="mature" className="w-full h-full" />}
                </div>
                <p className="font-bold text-foreground text-xs">{e.name}</p>
                <p className="text-[10px] italic text-primary">{e.weed?.scientificName}</p>
                <p className="text-[10px] text-muted-foreground mt-1"><strong>Compound:</strong> {e.compound}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{e.note}</p>
              </button>
            ))}
          </div>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">Connection to Economic Thresholds</p>
            <p className="mt-1">These biochemical interactions may influence economic thresholds by intensifying crop stress, sometimes requiring earlier or more strategic management to prevent lasting soil and yield effects.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       HERBICIDE MOA (High School)
    ═══════════════════════════════════════════════════════════ */
    case "herbicide-moa": {
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Herbicide Mode of Action (MOA)</p>
            <p>Herbicides are chemical or biological substances used to eliminate or reduce weeds. In addition to being an essential part of crop management, herbicides represent a <strong>major input cost</strong> in United States row-crop production.</p>
            <p>Herbicides are categorized into different groups based on their <strong>Mode of Action (MOA)</strong>. The MOA describes the specific biochemical pathway inside the plant that the herbicide disrupts — for example, blocking amino-acid synthesis, photosynthesis, or cell division.</p>
            <p>Chemicals within the same MOA group impact the plant in the same way, so <strong>resistance to one chemical typically results in resistance to every other chemical in that herbicide group</strong>. That is why rotating across different MOA groups — not just different brand names — is essential for long-term weed control.</p>
          </div>
          <h3 className="font-display font-bold text-foreground text-sm">Herbicide Groups in Use Today</h3>
          <div className="space-y-3">
            {[...HERBICIDE_MOA].sort((a, b) => a.group - b.group).map(m => (
              <div key={m.id} className="bg-card border border-border rounded-lg p-4">
                <p className="font-bold text-foreground">Group {m.group}: {m.moa}</p>
                <p className="text-sm text-muted-foreground mt-1"><strong>Chemistry:</strong> {m.chemistry}</p>
                <p className="text-sm text-muted-foreground mt-1"><strong>Timing / Spectrum:</strong> {m.timing} · {m.spectrum}</p>
                <p className="text-sm text-muted-foreground mt-1"><strong>Resistance risk:</strong> <span className={m.resistanceLevel === 'Very high' || m.resistanceLevel === 'High' ? 'text-destructive font-medium' : 'text-foreground'}>{m.resistanceLevel}</span> — {m.resistanceNotes}</p>
                <p className="text-xs text-primary mt-1">Examples: {m.brands.join(', ')}</p>
              </div>
            ))}
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary">Full MOA Reference Table</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="p-2 text-left font-bold text-foreground border border-border">MOA (Group)</th>
                    <th className="p-2 text-left font-bold text-foreground border border-border">Timing</th>
                    <th className="p-2 text-left font-bold text-foreground border border-border">Spectrum</th>
                    <th className="p-2 text-left font-bold text-foreground border border-border">Chemical</th>
                    <th className="p-2 text-left font-bold text-foreground border border-border">Resistance</th>
                  </tr>
                </thead>
                <tbody>
                  {[...HERBICIDE_MOA].sort((a, b) => a.group - b.group).map(h => (
                    <tr key={h.id} className="even:bg-muted/20">
                      <td className="p-2 border border-border font-medium text-foreground">{h.moa} (Group {h.group})</td>
                      <td className="p-2 border border-border text-muted-foreground">{h.timing}</td>
                      <td className="p-2 border border-border text-muted-foreground">{h.spectrum}</td>
                      <td className="p-2 border border-border text-muted-foreground">{h.brands[0]}</td>
                      <td className={`p-2 border border-border font-medium ${h.resistanceLevel === 'Very high' || h.resistanceLevel === 'High' ? 'text-destructive' : 'text-foreground'}`}>{h.resistanceLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">Key Takeaway</p>
            <p className="mt-1">Learning how these MOAs work helps farmers apply herbicides strategically by <strong>rotating different groups</strong> instead of relying on one to manage weeds effectively and slow the spread of herbicide resistance.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       CROP INJURY SYMPTOMS (High School)
    ═══════════════════════════════════════════════════════════ */
    case "crop-injury": {
      const INJURY_PATTERNS = [
        { group: "1", name: "ACCase Inhibitors", part: "New grass leaves at the whorl & growing points", symptoms: "Yellowing of the newest grass leaves and death at the central growing point; leaves pull easily from the whorl." },
        { group: "2", name: "ALS Inhibitors", part: "Top (newest) leaves, veins, and shoot tips", symptoms: "Stunted plants with purpling along veins and stems on the top leaves and interveinal chlorosis." },
        { group: "3", name: "Microtubule Inhibitors", part: "Roots and root tips", symptoms: "Pruned, stubby roots with swollen tips; poor stand establishment because seedlings cannot anchor." },
        { group: "4", name: "Synthetic Auxins", part: "New growth: top leaves, stems, and petioles", symptoms: "Leaf cupping, strap-leafing, and downward twisting of stems and petioles (epinasty)." },
        { group: "5", name: "PSII Inhibitors (Triazines)", part: "Older (bottom) leaves first", symptoms: "Interveinal chlorosis and necrosis that starts on the margins of the oldest leaves and moves inward." },
        { group: "6", name: "PSII Inhibitors (Benzothiadiazoles)", part: "Leaf surface where spray contacted", symptoms: "Bronzing and rapid necrotic speckling between leaf veins after sunlight exposure." },
        { group: "7", name: "PSII Inhibitors (Ureas & Amides)", part: "Older (bottom) leaves first", symptoms: "Slow-developing interveinal chlorosis on older leaves followed by leaf-edge browning." },
        { group: "8", name: "Lipid Synthesis Inhibitors", part: "Emerging seedling whorl and shoots", symptoms: "Twisted, malformed seedlings whose leaves fail to unfurl from the whorl." },
        { group: "9", name: "EPSPS Inhibitors", part: "Whole plant, starting at growing points and newest leaves", symptoms: "Gradual yellowing then browning starting at the youngest tissue and meristems; plant collapses over 1–3 weeks." },
        { group: "10", name: "Glutamine Synthase Inhibitors", part: "Leaf surface where spray contacted", symptoms: "Rapid wilting, marginal leaf burn, and tissue collapse within days of application." },
        { group: "12", name: "Phytoene Desaturase Inhibitors", part: "Newest leaves and growing points", symptoms: "Bright white bleached new growth; older leaves stay green." },
        { group: "13", name: "DOXP Inhibitors", part: "Newest leaves and shoot tips", symptoms: "Bleached white new growth with green veining; seedlings may regreen as they mature." },
        { group: "14", name: "PPO Inhibitors", part: "Leaf surface and emerging cotyledons/stems", symptoms: "Brown or scorched leaf spots soon after application; cotyledon and stem cracking on emerging seedlings." },
        { group: "15", name: "VLCFA Inhibitors", part: "Emerging seedling shoots and hypocotyl", symptoms: "Tightly rolled 'buggy-whipped' whorls; swollen hypocotyls and stunted seedlings." },
        { group: "19", name: "Auxin Transport Inhibitors", part: "New growth: top leaves and stems", symptoms: "Severely crinkled, cupped leaves with thickened, leathery surfaces — auxin-style injury amplified." },
        { group: "22", name: "PSI Electron Diverters", part: "Leaf surface where spray contacted", symptoms: "Sunburn-like necrotic spots and bleached patches within hours of contact." },
        { group: "23", name: "Mitosis Inhibitors", part: "Outer (oldest) leaves and central whorl", symptoms: "Outer leaves desiccate and brown while the central whorl stays green." },
        { group: "25", name: "Cell Wall (Cellulose) Inhibitors", part: "Newest leaves at the whorl", symptoms: "Whorl twisting with bleached leaf margins and curled, distorted tips." },
        { group: "26", name: "Nucleic Acid Inhibitors", part: "Leaf surface where spray contacted", symptoms: "Mild interveinal yellowing with small necrotic flecks; mostly cosmetic contact injury." },
        { group: "27", name: "HPPD Inhibitors", part: "Newest leaves and growing points", symptoms: "Bleached white-to-pink new growth; older leaves remain green; seedlings may regreen if dose is sub-lethal." },
      ];
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Herbicide Injury Symptoms</p>
            <p>While herbicides are designed to kill weeds, sometimes they miss their target and harm crops or other nearby plants. Herbicide injury can range from <strong>mild discoloration to severe damage</strong> that reduces crop yield.</p>
            <p>Each herbicide group damages plants in a specific way, depending on which process in the plant it disrupts. Because herbicides in the same group share the same MOA, they often cause <strong>similar injury symptoms</strong>.</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="font-bold text-foreground">Common Injury Types</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {["Chlorosis (yellowing)", "Bleaching (whitening)", "Epinasty (twisting/curling)", "Necrosis (browning/death)", "Stunting (reduced growth)", "Purpling (anthocyanin)"].map(s => (
                <div key={s} className="bg-secondary/30 border border-border rounded p-2 text-foreground text-center">{s}</div>
              ))}
            </div>
          </div>
          <h3 className="font-display font-bold text-foreground text-sm">Injury Patterns by Group</h3>
          <div className="space-y-3">
            {INJURY_PATTERNS.map(p => (
              <div key={p.group} className="bg-card border border-border rounded-lg p-4">
                <p className="font-bold text-foreground">Group {p.group}: {p.name}</p>
                <p className="text-xs text-primary mt-1"><span className="font-semibold">Where injury appears:</span> {p.part}</p>
                <p className="text-sm text-muted-foreground mt-1">{p.symptoms}</p>
                {(() => {
                  const g = parseInt(p.group, 10);
                  const br = resolveInjuryImage(g, "br");
                  const gr = resolveInjuryImage(g, "gr");
                  if (!br && !gr) return null;
                  return (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {br && (
                        <figure>
                          <img src={br} alt={`Group ${p.group} broadleaf injury`} className="w-full h-32 object-cover rounded-md border border-border" />
                          <figcaption className="text-[10px] text-muted-foreground text-center mt-1">Broadleaf injury</figcaption>
                        </figure>
                      )}
                      {gr && (
                        <figure>
                          <img src={gr} alt={`Group ${p.group} grass injury`} className="w-full h-32 object-cover rounded-md border border-border" />
                          <figcaption className="text-[10px] text-muted-foreground text-center mt-1">Grass injury</figcaption>
                        </figure>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">Diagnosis Tip</p>
            <p className="mt-1">By paying close attention to <strong>which part of the plant shows damage</strong> — whether it appears first on leaves, stems, or roots — agronomists can often determine which herbicide group caused the injury.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       LIFE STAGE CONTROL (High School)
    ═══════════════════════════════════════════════════════════ */
    case "life-stage-control": {
      const STAGE_CONTROL = [
        { stage: "Seed (Seed Bank)", exampleWeedIds: ["lambsquarters", "waterhemp", "velvetleaf"], desc: "Many weed seeds are stored in seed banks and can remain dormant for years until growing conditions are favorable. Preventing seed bank replenishment is critical.", control: "Pre-emergent herbicides, cover crops, tillage to bury seeds" },
        { stage: "Seedling", exampleWeedIds: ["palmer-amaranth", "giant-foxtail", "common-ragweed"], desc: "Weeds are the easiest to control because they are small and have not yet developed extensive roots or stems.", control: "Post-emergent herbicides, cultivation, hand removal — most cost-effective window" },
        { stage: "Vegetative", exampleWeedIds: ["waterhemp", "kochia", "barnyardgrass"], desc: "Weeds become harder to manage but can still be controlled through herbicide applications, cultivation, mowing, or hand removal.", control: "Higher herbicide rates needed, mechanical cultivation" },
        { stage: "Reproductive", exampleWeedIds: ["giant-ragweed", "Horseweed", "velvetleaf"], desc: "Especially important to manage before they disperse seeds. Once seeds are released, they may be added back into the seed bank.", control: "Hand weeding escapes, prevent seed set at all costs" },
        { stage: "Mature", exampleWeedIds: ["canada-thistle", "johnsongrass", "Field_bindweed"], desc: "Mature perennial weeds regrow from roots, rhizomes, tubers, or crowns, requiring repeated management over time. (Note: seed dispersal happens during the mature stage — it is not a separate life stage.)", control: "Systemic herbicides, deep tillage, multi-year management plans" },
      ];
      const STAGE_TO_IMAGE_STAGE: Record<string, string> = {
        "Seed (Seed Bank)": "seed",
        "Seedling": "seedling",
        "Vegetative": "vegetative",
        "Reproductive": "flower",
        "Mature": "flower",
      };
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Weed Control Across Life Stages</p>
            <p>Agronomists can use their knowledge of weed life stages and life cycles to target weeds and use control methods more effectively.</p>
            <p>The general rule of thumb: <strong>control weeds early in their life cycle</strong>, before they have the chance to become established and reproduce.</p>
          </div>
          {/* Control timeline */}
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="font-display font-bold text-foreground text-sm text-center mb-3">Control Effectiveness Timeline</p>
            <div className="flex items-center gap-1">
              {["Seed", "Seedling", "Vegetative", "Reproductive", "Mature"].map((s, i) => (
                <div key={s} className="flex-1 text-center">
                  <div className={`rounded-lg p-2 text-xs font-bold ${
                    i === 0 ? 'bg-success/60 text-success-foreground border-2 border-success' :
                    i === 1 ? 'bg-success/45 text-success-foreground border-2 border-success/80' :
                    i === 2 ? 'bg-primary/15 text-primary border border-primary/30' :
                    i === 3 ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                    'bg-destructive/25 text-destructive border border-destructive/50'
                  }`}>
                    {s}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{i === 0 ? 'Easiest' : i === 1 ? 'Easy' : i === 2 ? 'Moderate' : i === 3 ? 'Hard' : 'Hardest'}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 italic">Darker green (Seed &amp; Seedling) = easiest control window. Darker red = hardest. Hit weeds early.</p>
          </div>
          <div className="space-y-3">
            {STAGE_CONTROL.map(s => (
              <div key={s.stage} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="font-display font-bold text-foreground">{s.stage}</p>
                <p className="text-sm text-foreground">{s.desc}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {s.exampleWeedIds.map(wid => {
                    const w = weeds.find(x => x.id === wid);
                    return (
                      <figure key={wid} className="space-y-1">
                        <div className="aspect-square rounded-md overflow-hidden bg-secondary border border-border">
                          <WeedImage weedId={wid} stage={STAGE_TO_IMAGE_STAGE[s.stage] || 'flower'} className="w-full h-full object-cover" />
                        </div>
                        <figcaption className="text-[10px] text-center text-muted-foreground">{w?.commonName ?? wid}</figcaption>
                      </figure>
                    );
                  })}
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-xs text-primary"><span className="font-semibold">Best methods:</span> {s.control}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

/** Expandable family grouping for taxonomy section */
function FamilyGroupings({
  familyGroups,
  familyColors,
  onSelectWeed,
}: {
  familyGroups: Map<string, Weed[]>;
  familyColors: string[];
  onSelectWeed: (w: Weed) => void;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
      <p className="font-bold text-primary mb-2">Plant Families in Our Database</p>
      <p className="text-xs text-muted-foreground mb-3">
        Weeds in the same family share characteristics. Each card shows the common name, a photo, and the scientific
        name. Scroll sideways within a family to see every species; tap a card to open its profile.
      </p>
      <div className="space-y-3">
        {Array.from(familyGroups.entries())
          .sort()
          .map(([family, members], fi) => {
            return (
              <div key={family} className={`${familyColors[fi % familyColors.length]} border rounded-lg p-3`}>
                <p className="font-bold text-foreground text-xs mb-2">
                  {family} ({members.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {members.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onSelectWeed(w)}
                      className="flex-shrink-0 w-28 bg-card border border-border rounded-md p-2 text-left hover:border-primary transition-colors"
                    >
                      <p className="text-[11px] font-bold text-foreground leading-tight mb-1 line-clamp-2 min-h-[2rem]">
                        {w.commonName}
                      </p>
                      <div className="w-full h-20 rounded overflow-hidden bg-muted mb-1">
                        <WeedImage weedId={w.id} stage="mature" className="w-full h-full" />
                      </div>
                      <p className="text-[9px] italic text-muted-foreground leading-tight line-clamp-2">
                        {w.scientificName}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
