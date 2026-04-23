import { useState, useMemo } from "react";
import { weeds } from "@/data/weeds";
import type { GradeLevel, Weed } from "@/types/game";
import { GRADE_NAMES, GRADE_RANGES } from "@/data/phases";
import WeedImage from "./WeedImage";
import WeedDetailPopup from "./WeedDetailPopup";
import HomeButton from "./HomeButton";
import { FAMILY_DESCRIPTIONS, HABITAT_DESCRIPTIONS, LIFECYCLE_DESCRIPTIONS } from "@/data/familyDescriptions";
import { ArrowLeft, X } from "lucide-react";
import { hasImage, resolveCropImageUrl } from "@/lib/imageMap";
import { HERBICIDE_MOA, SYMPTOM_TYPES, getMiddleSchoolMOAs } from "@/data/herbicides";

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
  | "field-scouting"
  | "weed-competitors"
  | "economic-threshold"
  | "seed-dormancy"
  | "allelopathy"
  | "herbicide-moa"
  | "crop-injury"
  | "life-stage-control";

interface Topic {
  id: TopicId;
  name: string;
  icon: string;
  description: string;
  grades: GradeLevel[];
}

const TOPICS: Topic[] = [
  {
    id: "names",
    name: "Weed Names & ID",
    icon: "names",
    description: "Learn common names, scientific names, and key traits",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "seeds",
    name: "Seeds & Seed Banks",
    icon: "seeds",
    description: "Learn about weed seeds, how they look, spread, and persist in the soil",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "monocot-dicot",
    name: "Monocot vs Dicot",
    icon: "monocot",
    description: "Understand the difference between monocots and dicots",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "life-stages",
    name: "Life Stages",
    icon: "stages",
    description: "Learn to identify weeds at seed, seedling, vegetative, and reproductive stages",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "life-cycles",
    name: "Life Cycles",
    icon: "cycles",
    description: "Annual, biennial, and perennial growth patterns",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "habitats",
    name: "Habitats & Climate",
    icon: "habitats",
    description: "Where each weed thrives -- warm, cool, wet, or dry",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "ecology",
    name: "Ecology & Growth Types",
    icon: "ecology",
    description: "Terrestrial, aquatic, and parasitic weeds and their unique needs",
    grades: ["elementary", "middle"],
  },
  {
    id: "native-introduced",
    name: "Native vs Introduced",
    icon: "origin",
    description: "Which species are native and which were introduced",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "look-alikes",
    name: "Look-Alike Species",
    icon: "lookalike",
    description: "Compare easily confused species pairs",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "safety",
    name: "Safety & Control",
    icon: "safety",
    description: "Identify dangerous species and learn basic control methods",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "control-methods",
    name: "Control Methods",
    icon: "control",
    description: "Learn about different ways to manage weeds -- from hand weeding to herbicides",
    grades: ["elementary", "middle", "high"],
  },
  {
    id: "field-scouting",
    name: "Field Scouting",
    icon: "scouting",
    description: "Learn systematic field walking methods and scouting patterns",
    grades: ["middle", "high"],
  },
  {
    id: "weed-competitors",
    name: "Weed Competition",
    icon: "competition",
    description: "How weeds compete with each other and with crops for resources",
    grades: ["middle", "high"],
  },
  {
    id: "economic-threshold",
    name: "Economic Threshold",
    icon: "threshold",
    description: "When is it worth treating weeds? Understanding cost vs. benefit",
    grades: ["middle", "high"],
  },
   {
    id: "taxonomy",
    name: "Taxonomy",
    icon: "taxonomy",
    description: "The scientific system for classifying and naming every living organism",
    grades: ["middle", "high"],
  },
  {
    id: "families",
    name: "Plant Families",
    icon: "families",
    description: "Group weeds by their botanical families",
    grades: ["high"],
  },
  {
    id: "dioecious",
    name: "Dioecious Weeds",
    icon: "dioecious",
    description: "Learn about weeds with separate male and female plants",
    grades: ["high"],
  },
  {
    id: "seed-dormancy",
    name: "Seed Dormancy",
    icon: "dormancy",
    description: "How seeds survive unfavorable conditions through physical, physiological, chemical, and morphological dormancy",
    grades: ["high"],
  },
  {
    id: "allelopathy",
    name: "Allelopathy",
    icon: "allelopathy",
    description: "How weeds release chemicals to inhibit other plants' growth",
    grades: ["high"],
  },
  {
    id: "herbicide-moa",
    name: "Herbicide MOA",
    icon: "herbicide",
    description: "Herbicide groups, modes of action, and how they affect weeds",
    grades: ["high"],
  },
  {
    id: "crop-injury",
    name: "Crop Injury Symptoms",
    icon: "injury",
    description: "Recognize herbicide injury patterns by MOA group",
    grades: ["high"],
  },
  {
    id: "life-stage-control",
    name: "Life Stage Control",
    icon: "stagecontrol",
    description: "Target weeds at their most vulnerable growth stage for effective management",
    grades: ["high"],
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
              <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
}

export default function LearningModule({ onClose }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>("elementary");
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);
  const [selectedWeed, setSelectedWeed] = useState<Weed | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "box">("list");

  const availableTopics = useMemo(() => TOPICS.filter((t) => t.grades.includes(selectedGrade)), [selectedGrade]);

  const gradeCards: { grade: GradeLevel; label: string; color: string }[] = [
    { grade: "elementary", label: "K-5", color: "border-grade-elementary" },
    { grade: "middle", label: "6-8", color: "border-grade-middle" },
    { grade: "high", label: "9-12", color: "border-grade-high" },
  ];

  const topicNeedsViewToggle =
    selectedTopic === "families" || selectedTopic === "habitats" || selectedTopic === "life-cycles";

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HomeButton onClose={onClose} />
            <span className="text-border mx-1">|</span>
            {selectedTopic && (
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setViewMode("list");
                }}
                className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl font-display font-bold text-foreground">Learning Module</h1>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
              {GRADE_NAMES[grade]} ({GRADE_RANGES[grade]})
            </button>
          ))}
        </div>

        {!selectedTopic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="bg-card border border-border rounded-lg p-6 text-left shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
              >
                <div className="font-display font-bold text-foreground mb-1">{topic.name}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{topic.description}</div>
                <div className="text-xs text-primary mt-3 font-medium">{getTopicWeeds(topic.id).length} species →</div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {/* Topic bubbles at top */}
            <div className="flex flex-wrap gap-2 mb-6">
              {availableTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setViewMode("list");
                  }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedTopic === topic.id
                      ? "bg-primary text-primary-foreground shadow-subtle"
                      : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
            {/* Topic content */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold text-foreground">
                  {TOPICS.find((t) => t.id === selectedTopic)?.name}
                </h2>
                {topicNeedsViewToggle && <ViewToggle view={viewMode} onChange={setViewMode} />}
              </div>
              <TopicContent
                topicId={selectedTopic}
                grade={selectedGrade}
                topicWeeds={getTopicWeeds(selectedTopic)}
                onSelectWeed={setSelectedWeed}
                viewMode={viewMode}
              />
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
}: {
  topicId: TopicId;
  grade: GradeLevel;
  topicWeeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  viewMode: "list" | "box";
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
              <p className="font-display font-bold text-primary text-base">Common Names and Descriptions</p>
              <p>
                There are lots of plants that can be weeds. Each weed is different in how it looks. Weeds can also look
                similar to one another.
              </p>
              <p>
                We use words called <strong>adjectives</strong> to describe weeds based on their <strong>color, leaf
                shape, leaf number, height</strong>, and other features.
              </p>
              <p>
                Knowing the description of weeds and their common names helps us <strong>identify weeds, manage
                them</strong>, and <strong>keep humans and animals safe</strong>.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Memory Tricks</p>
              <p>
                We can use "memory tricks" to help us remember weed names and appearances. A memory trick connects
                something about the weed -- like its shape, color, or name -- to something you already know.
              </p>
            </div>

            {/* Weed examples with descriptions and memory hooks */}
            <h3 className="font-display font-bold text-foreground text-sm">
              Weed Examples ({topicWeeds.length} species)
            </h3>
            {topicWeeds.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div className="space-y-1">
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                  <p className="text-xs text-muted-foreground">{w.plantType} • {w.lifeCycle}</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                    {w.traits.slice(0, 2).map((t, i) => (
                      <li key={i}>- {t}</li>
                    ))}
                  </ul>
                  <div className="bg-primary/10 rounded px-2 py-1 mt-1">
                    <p className="text-xs text-primary"><span className="font-bold">Memory trick:</span> {w.memoryHook}</p>
                  </div>
                </div>
              </div>
            ))}
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
                other plants for <strong>sunlight, water, and nutrients</strong>. While some plants are considered weeds
                in one place, the same plant might be perfectly welcome somewhere else, making "weed" less about what
                the plant is and more about <strong>where it is growing</strong>.
              </p>
              <p>
                Weeds are frequently known by <strong>multiple common names</strong> that vary by region, state, and
                country, which can create significant confusion in identification and communication among farmers,
                scientists, and land managers.
              </p>
              <p>
                A single plant species may carry entirely different names depending on geographic location, local
                tradition, or historical usage, and in some cases, the <strong>same common name</strong> may refer to
                two completely different plant species in different parts of the country. This inconsistency in naming
                makes accurate communication about weed identification and management more difficult across different
                regions and disciplines.
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

            {/* Split panel showing a weed with multiple common names */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="font-display font-bold text-foreground text-sm text-center">One Plant, Many Names</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topicWeeds
                  .filter((w) => w.commonName.includes("/"))
                  .slice(0, 2)
                  .concat(topicWeeds.filter((w) => !w.commonName.includes("/")).slice(0, 2))
                  .slice(0, 4)
                  .map((w) => (
                    <div key={w.id} className="bg-secondary/30 border border-border rounded-lg p-3 text-center">
                      <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden mb-2">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm font-bold" />
                      <div className="text-xs text-primary italic mt-1">{w.scientificName}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* All weeds with scientific names */}
            {topicWeeds.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div className="space-y-1">
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                  <div className="text-sm text-primary italic">{w.scientificName}</div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                    {w.traits.slice(0, 3).map((t, i) => (
                      <li key={i}>- {t}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-primary">{w.memoryHook}</p>
                </div>
              </div>
            ))}
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
                soybean, and sugar beet fields in Minnesota, farmers would have lost <strong>half their yield</strong>.
              </p>
              <p>
                At a national and global level, scientists need more precise terms to ensure they are discussing the same
                plant. Scientific names are written in the form of <strong>binomial nomenclature</strong>.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">What is Binomial Nomenclature?</p>
              <p>
                Binomial nomenclature is the formal, two-term scientific system for naming organisms, which uses terms
                in Latin to state the <strong>genus</strong> and <strong>specific epithet</strong>. It was developed by
                <strong> Carl Linnaeus</strong> in the 18th century to provide a standardized, universal name for species
                worldwide.
              </p>
            </div>

            {/* Waterhemp example */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Example: {waterhemp.commonName}</p>
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-border">
                  <WeedImage weedId={waterhemp.id} stage="whole" className="w-full h-full" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg italic text-primary font-bold">{waterhemp.scientificName}</p>
                  <p className="text-sm text-foreground">
                    Also known as <strong>{waterhemp.commonName}</strong>. A weed often found near rivers and wet field
                    edges, known for its smooth hairless stems and distinct leaf shape.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
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
                  Organisms with scientific names closer in form can be more closely related. These foxtails all share
                  the genus <strong className="italic">Setaria</strong>, showing their common heritage and characteristics.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {foxtails.slice(0, 3).map(w => (
                    <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden mb-2">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs font-bold" />
                      <p className="text-xs text-primary italic mt-1">{w.scientificName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All species */}
            <h3 className="font-display font-bold text-foreground text-sm">All Species ({topicWeeds.length})</h3>
            {topicWeeds.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div className="space-y-1">
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                  <div className="text-sm text-primary italic">{w.scientificName}</div>
                  <div className="text-xs text-muted-foreground">Family: {w.family}</div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                    {w.traits.slice(0, 3).map((t, i) => (
                      <li key={i}>- {t}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-primary">{w.memoryHook}</p>
                </div>
              </div>
            ))}
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
                <p>
                  Weed seeds are remarkably diverse in shape, size, and color. Understanding seed morphology helps with
                  identification before plants even emerge.
                </p>
                <p>
                  The <strong>soil seed bank</strong> is the reservoir of viable seeds in the soil. A single field can
                  contain millions of weed seeds per acre. Some species produce over 100,000 seeds per plant.
                </p>
                <p>
                  <strong>Seed dormancy</strong> allows seeds to survive unfavorable conditions. Some weed seeds can
                  remain viable for decades in the soil.
                </p>
              </>
            )}
            {grade === "high" && (
              <>
                <p>
                  Seed biology is fundamental to weed management strategy. Key concepts include{" "}
                  <strong>seed rain</strong> (annual seed input), <strong>seed bank dynamics</strong> (persistence and
                  decay rates), and <strong>dormancy mechanisms</strong> (physical, physiological, and chemical).
                </p>
                <p>
                  Understanding seed dispersal vectors -- wind (anemochory), water (hydrochory), animals (zoochory), and
                  machinery (anthropochory) -- is critical for predicting weed spread and designing management plans.
                </p>
                <p>
                  The <strong>economic threshold</strong> for weed management is often linked to preventing seed bank
                  replenishment. Allowing even a few plants to set seed can negate years of control efforts.
                </p>
              </>
            )}
          </div>

          {grade === "elementary" && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground space-y-3">
              <p className="font-bold text-primary">Seed Dispersal</p>
              <p>
                Seeds have special features that help them travel to new places. Some seeds have <strong>tiny wings
                or parachutes</strong> that let them float on the wind. Others have <strong>hooks or barbs</strong> that
                stick to animal fur or clothing. Some seeds can even <strong>float on water</strong> to travel to new
                locations.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {topicWeeds.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-border mb-2">
                  <WeedImage weedId={w.id} stage="seed" className="w-full h-full" />
                </div>
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                {grade !== "elementary" && <div className="text-[10px] text-primary italic">{w.scientificName}</div>}
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
          </div>
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
          desc: "A seed is a small, protective package containing a baby plant and food, designed to grow into a new plant like a flower or tree when given water, warmth, and soil. They are the start of a plant's life cycle and come in many shapes, sizes, and colors, often found inside fruits or produced by flowers. Part of each seed is the cotyledon, a place where a seed stores its food to give it energy to grow. Seeds can have different shapes and characteristics to help protect and move them in and around the environment.",
        },
        {
          stage: "seedling",
          label: "Seedling",
          desc: "A seedling is a weed just beginning to take root. Seedlings are the first stage of life a weed goes through after it emerges from the seed. Weeds can be in the seedling stage until they grow more than two leaves. Then, they move on to the vegetative stage. Seedlings can look just as different as the plants they come from.",
        },
        {
          stage: "vegetative",
          label: "Vegetative",
          desc: "Think of a weed in a vegetative stage as a growing teenager. The weed is getting larger and taller, and it is growing more leaves. Weeds in the vegetative stage do not have flowers or seed pods yet.",
        },
        {
          stage: "flower",
          label: "Reproductive",
          desc: "Weeds in the reproductive stage are getting ready to release seeds, grow flowers, and attract pollinators to aid reproduction. Each weed looks different at this stage, but they may share some common features. Weeds in the reproductive stage may have flower buds, flowers, seed pods, or seed heads.",
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
                  Just like people, weeds go through different stages of development. Weeds start as seedlings and grow
                  into mature plants through five stages: <strong>seed, seedling, vegetative, reproductive, and
                  maturity</strong>.
                </p>
                <p>
                  Weeds look different in each stage of life. Knowing what weeds look like in different life stages can
                  help us <strong>identify and manage them</strong>.
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
                  A weed reaches maturity after it has gone through all the life stages and spread its seeds to begin
                  new weeds. Mature weeds usually have more leaves, flowers, and other parts than younger weeds. At the
                  end of a growing season, a mature weed may die on its own.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LIFE_STAGE_INFO.map((s) => (
                <div key={s.stage} className="bg-card border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-foreground">{s.label}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.desc.split(".")[0]}.</p>
                </div>
              ))}
            </div>
          )}

          {/* ALL weeds shown for all grade levels */}
          {topicWeeds.map((w) => {
            const isGrass = w.plantType === "Monocot";
            return (
              <div key={w.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-display font-bold" />
                  {grade !== "elementary" && <span className="text-xs text-primary italic">{w.scientificName}</span>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {w.family}
                  </span>
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
                {grade !== "elementary" && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Best control timing:</span> {w.controlTiming}
                  </div>
                )}
                <p className="text-xs text-primary">{w.memoryHook}</p>
              </div>
            );
          })}
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
        const LEAF_SHAPES = [
          { name: "Ovate", desc: "Egg-shaped, wider at the base" },
          { name: "Lanceolate", desc: "Long and narrow, like a lance" },
          { name: "Cordate", desc: "Heart-shaped" },
          { name: "Linear", desc: "Very long and thin, like grass" },
          { name: "Palmate", desc: "Shaped like an open hand with fingers" },
          { name: "Lobed", desc: "Has rounded sections cut into the leaf" },
          { name: "Serrate", desc: "Has toothed or jagged edges" },
          { name: "Entire", desc: "Smooth edges with no teeth" },
        ];

        return (
          <div className="space-y-5">
            {/* Leaf Morphology intro */}
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Leaf Morphology (Venation and Leaf Shape)</p>
              <p>
                Weeds look unique because of their <strong>color, leaf shape, leaf number, height</strong>, and other
                features. Leaves can help us identify weeds.
              </p>
              <p>
                Leaves can be <strong>broadleaves</strong> (on dicots) or <strong>grasses</strong> (on monocots).
              </p>
            </div>

            {/* Venation patterns */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Venation Patterns</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                  <p className="font-bold text-foreground text-sm">Netted Venation (Dicots)</p>
                  <p className="text-xs text-muted-foreground">
                    Broadleaves have <strong>netted venation</strong>, meaning the veins in the leaves are in a net or
                    web pattern.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {dicots.slice(0, 2).map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-2">
                  <p className="font-bold text-foreground text-sm">Parallel Venation (Monocots)</p>
                  <p className="text-xs text-muted-foreground">
                    Grasses have <strong>parallel venation</strong>, meaning the veins in the leaves are straight from
                    the bottom to the top of the leaf. Veins in grasses do not touch each other. This is what it means
                    to be parallel.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {monocots.slice(0, 2).map((w) => (
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
            </div>

            {/* Leaf shapes chart */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Leaf Shapes</p>
              <p className="text-xs text-muted-foreground">
                Some leaves are wide, others are thin. Broadleaves can also have lots of different-shaped edges. Here
                are some different leaf shapes:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LEAF_SHAPES.map((ls) => (
                  <div key={ls.name} className="bg-secondary/30 border border-border rounded-lg p-3 text-center">
                    <p className="font-bold text-foreground text-sm">{ls.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{ls.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monocots vs Dicots comparison */}
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Monocots vs. Dicots</p>
              <p>
                You may have noticed that some weeds look more different from each other than other weeds. Take a look
                at the two groups of weeds below.
              </p>
            </div>

            {/* Side-by-side example images - 4 each */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <p className="font-display font-bold text-foreground text-sm text-center">Dicots (Broadleaves)</p>
                <div className="grid grid-cols-2 gap-2">
                  {dicots.slice(0, 4).map((w) => (
                    <div key={w.id} className="text-center">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-bold text-foreground">What are some of the differences between the two groups?</p>
              <p>
                The weeds on the left have <strong>broad leaves</strong>; the weeds on the right have{" "}
                <strong>thin, straight leaves</strong>. These two groups of weeds are called <strong>monocots</strong>{" "}
                (thin, straight leaves) and <strong>dicots</strong> (broad, wide leaves). You can distinguish them based
                on their physical characteristics or on what they look like as seedlings.
              </p>
            </div>

            {/* What the words mean */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">What do these words mean?</p>
              <p>
                Before we can understand the difference between monocots and dicots, we need to know what these words
                mean. Scientists like to use words in Latin to help describe plants and plant parts.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-card border border-border rounded-lg p-4 text-center space-y-2">
                  <p className="font-bold text-foreground text-lg">"Mono" = One</p>
                  <p className="text-xs text-muted-foreground">"Cot" = Cotyledon</p>
                  <div className="bg-secondary rounded-lg p-3 mt-2">
                    <p className="text-xs text-foreground">
                      A <strong>cotyledon</strong> is a place where a seed stores its food to give it energy to grow.
                    </p>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-2">Monocot = ONE cotyledon</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center space-y-2">
                  <p className="font-bold text-foreground text-lg">"Di" = Two</p>
                  <p className="text-xs text-muted-foreground">"Cot" = Cotyledon</p>
                  <div className="bg-secondary rounded-lg p-3 mt-2">
                    <p className="text-xs text-foreground">
                      As plants grow from seeds to seedlings to mature plants, the number of cotyledons impacts what the
                      plant looks like.
                    </p>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-2">Dicot = TWO cotyledons</p>
                </div>
              </div>
            </div>

            {/* Detailed monocot section with scrollbar */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">
                Monocots (Grasses) -- All {monocots.length} Species
              </p>
              <p className="text-sm text-foreground">
                Monocots are plants with <strong>thin, straight leaves</strong>. They are also called{" "}
                <strong>grasses</strong>. As discussed above, monocots have <strong>one cotyledon</strong>.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- One seed leaf (cotyledon)</li>
                <li>- Parallel leaf veins</li>
                <li>- Fibrous root system</li>
              </ul>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3" style={{ minWidth: `${monocots.length * 7}rem` }}>
                  {monocots.map((w) => (
                    <div key={w.id} className="text-center shrink-0 w-24">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                Dicots (Broadleaves) -- All {dicots.length} Species
              </p>
              <p className="text-sm text-foreground">
                Dicots are plants with <strong>wide, broad leaves</strong>. They are also called{" "}
                <strong>broadleaves</strong>. As discussed above, dicots have <strong>two cotyledons</strong>.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- Two seed leaves (cotyledons)</li>
                <li>- Branching (net) leaf veins</li>
                <li>- Taproot system</li>
              </ul>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3" style={{ minWidth: `${dicots.length * 7}rem` }}>
                  {dicots.map((w) => (
                    <div key={w.id} className="text-center shrink-0 w-24">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">← Scroll to see all dicots →</p>
            </div>

            {/* Seedling comparison */}
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
              <p className="font-display font-bold text-accent text-sm">Seedling Comparison</p>
              <p className="text-xs text-foreground">
                You can also tell monocots and dicots apart when they are seedlings. Monocot seedlings have one seed
                leaf; dicot seedlings have two.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-center text-foreground">Monocot Seedling</p>
                  {monocots.slice(0, 2).map((w) => (
                    <div key={w.id} className="flex gap-2 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <WeedImage weedId={w.id} stage="seedling" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-center text-foreground">Dicot Seedling</p>
                  {dicots.slice(0, 2).map((w) => (
                    <div key={w.id} className="flex gap-2 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <WeedImage weedId={w.id} stage="seedling" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 6-8 and 9-12: existing content
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">Monocots vs Dicots</p>
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
          <h3 className="font-semibold text-foreground text-sm">Monocots ({monocots.length} species)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {monocots.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm">Dicots ({dicots.length} species)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dicots.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
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
        { key: "Biennial", icon: "", desc: "Takes two years -- rosette in year 1, flowers and seeds in year 2." },
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(summerAnnuals.length > 0 ? summerAnnuals : annuals).slice(0, 8).map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                    </div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Biennial */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Biennial Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Biennial</strong> weeds complete their life cycle in <strong>two years</strong>. During the
                first year, weeds grow vegetatively and develop deep root systems to help gather nutrients. Biennial
                weeds form a <strong>rosette</strong> during their first year -- a flat circle of leaves close to the
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {biennials.slice(0, 8).map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                <strong>Perennials</strong> are weeds with multi-year life cycles. They regrow from strong roots or
                bulbs each year. Perennials spread by seeds or through <strong>underground stems and roots</strong> that
                form new plants. Perennials can be difficult to manage because of their deep root systems.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {perennials.slice(0, 8).map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                    </div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                  </div>
                ))}
              </div>
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
                includes going through 6 stages:{" "}
                <strong>
                  seed, germination, seedling growth, maturity (flowering), pollination/fertilization, and seed
                  dispersal
                </strong>
                .
              </p>
            </div>

            {/* Life cycle flow chart */}
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="font-display font-bold text-foreground text-sm text-center mb-3">Life Cycle Flow</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["Seed", "Germination", "Seedling", "Maturity", "Pollination", "Seed Dispersal"].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-2">
                    <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs font-bold text-primary">
                      {stage}
                    </div>
                    {i < 5 && <span className="text-muted-foreground font-bold">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground">Common weeds have three general life cycle lengths.</p>

            {/* Annual section */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Annual Weeds</p>
              <p className="text-sm text-foreground">
                Annual weeds complete their entire life cycle -- from seed germination to seed production and death --
                within a <strong>single growing season</strong>. They rely entirely on prolific seed production for
                survival.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                  <p className="font-bold text-foreground text-sm">Summer Annuals</p>
                  <p className="text-xs text-muted-foreground">Germinate in spring and die after frost.</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(summerAnnuals.length > 0 ? summerAnnuals : otherAnnuals).slice(0, 6).map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded overflow-hidden bg-muted">
                          <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                    {winterAnnuals.slice(0, 6).map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded overflow-hidden bg-muted">
                          <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                {biennials.slice(0, 8).map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                {perennials.slice(0, 8).map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
              {["Seed", "Germination", "Seedling", "Maturity", "Pollination", "Seed Dispersal"].map((stage, i) => (
                <div key={stage} className="flex items-center gap-2">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs font-bold text-primary">
                    {stage}
                  </div>
                  {i < 5 && <span className="text-muted-foreground font-bold">→</span>}
                </div>
              ))}
            </div>
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
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                    <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                    <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                <p className="font-display font-bold text-foreground text-sm">Invasive Weeds in the Midwest</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {invasives.slice(0, 9).map((w) => (
                    <div key={w.id} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-center">
                      <div className="w-16 h-16 mx-auto rounded overflow-hidden mb-1">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                      <p className="text-[10px] text-destructive mt-1">{w.actReason?.split('.')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="font-semibold text-foreground text-sm">Native Species ({natives.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {natives.map((w) => (
                <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                    <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                  </div>
                  <div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                    <div className="text-xs text-muted-foreground">{w.habitat}</div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-foreground text-sm">Introduced Species ({introduced.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {introduced.map((w) => (
                <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                    <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                  </div>
                  <div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                    <div className="text-xs text-muted-foreground">{w.habitat}</div>
                  </div>
                </div>
              ))}
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
                Invasive weeds are like uninvited guests that show up, take over, and refuse to leave -- and they
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

            <h3 className="font-semibold text-foreground text-sm">Native Species ({natives.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {natives.map((w) => (
                <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                    <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                  </div>
                  <div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                    <div className="text-xs text-muted-foreground">{w.habitat}</div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-foreground text-sm">Introduced Species ({introduced.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {introduced.map((w) => (
                <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                    <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                  </div>
                  <div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                    <div className="text-xs text-primary italic">{w.scientificName}</div>
                    <div className="text-xs text-muted-foreground">{w.habitat}</div>
                  </div>
                </div>
              ))}
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
          <h3 className="font-semibold text-foreground text-sm">Native Species ({natives.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {natives.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                  <div className="text-xs text-primary italic">{w.scientificName}</div>
                  <div className="text-xs text-muted-foreground">{w.habitat}</div>
                </div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm">Introduced Species ({introduced.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {introduced.map((w) => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                  <div className="text-xs text-primary italic">{w.scientificName}</div>
                  <div className="text-xs text-muted-foreground">{w.habitat}</div>
                </div>
              </div>
            ))}
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
            desc: "Warm-season weeds thrive in hot summer conditions with full sun exposure. They germinate when soil temperatures rise in late spring and grow most vigorously during the hottest months. Warm-season weeds are common in corn, soybean, and sorghum fields across the Midwest.",
          },
          {
            key: "Cool-Season / Early Spring",
            label: "Cool-Season Weeds",
            desc: "Cool-season weeds germinate in fall or early spring when temperatures are lower. They grow rapidly before warm-season crops are planted and can compete early in the growing season. Many are winter annuals that overwinter as rosettes.",
          },
          {
            key: "Wet / Poorly Drained",
            label: "Wet-Habitat Weeds",
            desc: "Wet-habitat weeds are adapted to poorly drained soils, field edges near waterways, and areas with high water tables. They often have specialized tissues for waterlogged conditions and can indicate drainage problems in fields.",
          },
          {
            key: "Dry / Disturbed",
            label: "Dry-Habitat Weeds",
            desc: "Dry-habitat weeds are adapted to well-drained, often sandy soils and disturbed areas like roadsides, construction sites, and field margins. They are typically drought-tolerant with deep root systems or water-conserving leaf structures.",
          },
        ];

        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Habitats</p>
              <p>
                Some people like to live in warm areas with lots of sun. Others like to live in cooler regions with lots
                of rain. Weeds are just the same! Weeds live in different areas based on their preferences and{" "}
                <strong>adaptations</strong> to survive.
              </p>
              <p>
                An <strong>adaptation</strong> is a new trait that is developed to help a weed survive in a specific
                area. Knowing what habitats weeds like to grow in can help us <strong>predict where weeds will
                grow</strong>.
              </p>
            </div>

            {elemHabitats.map((h) => {
              const grouped = topicWeeds.filter((w) => w.primaryHabitat === h.key);
              return (
                <div key={h.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <p className="font-display font-bold text-foreground text-base">{h.label}</p>
                  <p className="text-sm text-foreground">{h.desc}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {grouped.slice(0, 8).map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      if (grade === "middle") {
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
                Some weed species are highly specialized and only thrive under a narrow set of conditions, while others
                are broadly adaptable generalists capable of colonizing a wide variety of habitats. Recognizing the
                relationship between environmental conditions and weed community composition allows land managers to
                anticipate where new weed pressure is likely to develop.
              </p>
            </div>
            {habGroups.map((g) => {
              const grouped = topicWeeds.filter((w) => w.primaryHabitat === g.key);
              return (
                <div key={g.key}>
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    {g.label} ({grouped.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grouped.map((w) => (
                      <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                        <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1">
                          <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 9-12 - Detailed habitats with phenotypic plasticity
      {
        const HIGH_HABITATS = [
          {
            key: "Warm-Season / Full Sun",
            label: "Warm-Season Weeds",
            desc: "Warm-season weeds thrive in hot summer conditions with full sun exposure. They germinate when soil temperatures rise in late spring and grow most vigorously during the hottest months. Warm-season weeds are common in corn, soybean, and sorghum fields across the Midwest.",
          },
          {
            key: "Cool-Season / Early Spring",
            label: "Cool-Season Weeds",
            desc: "Cool-season weeds germinate in fall or early spring when temperatures are lower. They grow rapidly before warm-season crops are planted and can compete early in the growing season. Many are winter annuals that overwinter as rosettes.",
          },
          {
            key: "Wet / Poorly Drained",
            label: "Wet-Habitat Weeds",
            desc: "Wet-habitat weeds are adapted to poorly drained soils, field edges near waterways, and areas with high water tables. They often have specialized tissues for waterlogged conditions and can indicate drainage problems in fields.",
          },
          {
            key: "Dry / Disturbed",
            label: "Dry-Habitat Weeds",
            desc: "Dry-habitat weeds are adapted to well-drained, often sandy soils and disturbed areas like roadsides, construction sites, and field margins. They are typically drought-tolerant with deep root systems or water-conserving leaf structures.",
          },
        ];
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Habitats</p>
              <p>
                Weeds are adapted to specific growing conditions. Understanding where a weed thrives helps predict where
                it will appear. Weeds adapt through <strong>high genetic diversity, rapid reproduction</strong>, and high
                <strong> phenotypic plasticity</strong>.
              </p>
              <p>
                <strong>Phenotypic plasticity</strong> is the ability to change form in response to the environment.
                Environmental factors such as sunlight exposure, rainfall, temperature, and weather effects all impact a
                weed's adaptation to its environment.
              </p>
              <p>
                These environmental factors can be found regionally across the globe, depending on the area's climate.
                While a weed may be native to North America, it may also thrive in European areas where the climate is
                similar.
              </p>
            </div>

            {HIGH_HABITATS.map((h) => {
              const grouped = topicWeeds.filter((w) => w.primaryHabitat === h.key);
              return (
                <div key={h.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <p className="font-display font-bold text-foreground text-base">{h.label}</p>
                  <p className="text-sm text-foreground">{h.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    Examples: {grouped.slice(0, 5).map(w => w.commonName).join(', ')}{grouped.length > 5 ? `, and ${grouped.length - 5} more` : ''}.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {grouped.map((w) => (
                      <div key={w.id} className="text-center">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                        </div>
                        <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                        <div className="text-[9px] text-primary italic">{w.scientificName}</div>
                      </div>
                    ))}
                  </div>
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
                You learned that weeds grow in different areas based on their preferences and adaptations. Weeds living
                in different areas have different needs. We can group weeds into three categories based on what kind of
                needs they have in their environment.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Terrestrial Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Terrestrial weeds</strong> are weeds that grow on land. Terrestrial weeds need <strong>soil to
                root into, rainfall, and open air space</strong> to keep them alive.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {terrestrial.slice(0, 8).map((w) => (
                  <div key={w.id} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                    </div>
                    <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Aquatic Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Aquatic weeds</strong> grow near water or in water. They can be underwater or sticking out of
                the water. Aquatic weeds have different needs than terrestrial weeds. Aquatic weeds need{" "}
                <strong>water to grow in, underwater sunlight, and nutrients dissolved in the water</strong>. These
                special adaptations help aquatic weeds survive in wet areas.
              </p>
              {aquatic.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {aquatic.map((w) => (
                    <div key={w.id} className="text-center">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                      </div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-[10px] mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <p className="font-display font-bold text-foreground text-base">Parasitic Weeds</p>
              <p className="text-sm text-foreground">
                <strong>Parasitic weeds</strong> do not make their own food. Instead, they steal food and energy from
                other plants called <strong>hosts</strong>. To steal nutrients from a host, they need special roots to
                attach themselves to the host plant.
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
              Not all weeds grow the same way or in the same places -- some grow on land, some grow in water, and some
              actually steal nutrients from other plants!
            </p>
            <p>
              Weeds can be broadly categorized into three growth types based on where and how they obtain resources:
              <strong> terrestrial, parasitic, and aquatic</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-foreground">Terrestrial</p>
              <p className="text-xs text-muted-foreground">
                Grow in soil on land and compete directly with crops and other plants for light, water, and nutrients
                in agricultural and natural settings.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-foreground">Aquatic</p>
              <p className="text-xs text-muted-foreground">
                Establish in or around bodies of water such as ponds, lakes, irrigation canals, and wetlands, where
                they can disrupt water flow and reduce water quality.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-foreground">Parasitic</p>
              <p className="text-xs text-muted-foreground">
                Among the most damaging, as they attach directly to the root or stem tissue of a host plant through
                specialized structures and extract water and nutrients at the host's expense.
              </p>
            </div>
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
              <div key={family}>
                <h3 className="font-semibold text-foreground text-sm mb-2">
                  {family} ({members.length} species)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((w) => (
                    <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                        <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">Look-Alike Weeds</p>
              <p>
                Some weeds look very similar to other weeds. It is important to tell them apart so we can manage them
                the right way. Look at the pairs below and see if you can spot the differences!
              </p>
            </div>
            {pairs.map(([a, b]) => renderPairCard(a, b, `elem-${a.id}`))}
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
                  Some weeds are master disguisers -- they look almost identical to crop plants or harmless native
                  plants, which can trick even experienced farmers. Misidentification can result in missed treatment
                  opportunities, unnecessary herbicide applications, crop damage from incorrectly targeted spraying, or
                  failure to detect a problematic species before it becomes well established.
                </p>
                <p>
                  Distinguishing between look-alike species requires careful attention to morphological details that may
                  be subtle, including <strong>leaf margin shape, stem cross-section, surface texture, hair presence or
                  absence, node structure</strong>, and flower or seedhead characteristics.
                </p>
              </>
            ) : (
              <p>
                Some weeds look very similar but require different management. Compare them at every growth stage to learn
                the key differences.
              </p>
            )}
          </div>

          {/* Invasive vs Native Look-Alikes section for 6-8 and 9-12 */}
          {invasiveNativePairs.length > 0 && (
            <div className="space-y-4">
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

          {/* Family-based Look-Alikes */}
          {invasiveNativePairs.length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="font-display font-bold text-foreground text-base mb-4">Family-Based Look-Alikes</h3>
            </div>
          )}
          {pairs.map(([a, b]) => renderPairCard(a, b, `fam-${a.id}`))}
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
          label: "Mulching",
          desc: "Covering the soil with materials like straw or wood chips to block sunlight and prevent weed seeds from growing.",
        },
        {
          label: "Mowing",
          desc: "Cutting weeds down before they can spread seeds. This does not remove the roots, so weeds may grow back.",
        },
      ];

      if (grade === "elementary") {
        return (
          <div className="space-y-5">
            <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-destructive text-base">Safety</p>
              <p>
                As we learned, some invasive weeds can hurt native plants and animals. There are also some weeds that
                hurt <strong>humans</strong>. These unsafe weeds can look like normal plants. However, when they are
                touched or ingested, they can cause harm to people.
              </p>
            </div>

            {/* Toxic weeds */}
            <h3 className="font-display font-bold text-foreground text-sm">Unsafe Weeds to Watch For</h3>
            {topicWeeds.slice(0, 8).map((w) => (
              <div key={w.id} className="bg-card border border-destructive/30 rounded-lg p-4 flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div>
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                  <div className="text-sm text-destructive mt-1">{w.safetyNote}</div>
                </div>
              </div>
            ))}

            {/* Control methods */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm text-foreground space-y-3">
              <p className="font-display font-bold text-primary text-base">How Can We Remove Unsafe Weeds?</p>
              <p>
                There are three basic ways that agronomists remove unsafe or unwanted weeds. Click on each tile below
                to learn about each method.
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
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
      return (
        <div className="space-y-4">
          <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-destructive mb-2">Safety First!</p>
            <p>
              Some weeds are <strong>dangerous to touch or handle</strong>. Always wear gloves when working near unknown
              plants.
            </p>
          </div>
          {topicWeeds.map((w) => (
            <div key={w.id} className="bg-card border border-destructive/30 rounded-lg p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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

    /* ═══════════════════════════════════════════════════════════
       CONTROL METHODS
    ═══════════════════════════════════════════════════════════ */
    case "control-methods":
    {
      const isHighSchool = grade === "high";
      const isElementary = grade === "elementary";

      const ELEM_METHODS = [
        {
          key: "hand-weeding",
          label: "Hand Weeding",
          desc: "Physically pulling weeds out by hand or with a hoe. This works great for small areas, gardens, or when only a few weeds are present. Always pull weeds before they produce seeds!",
          example: "Walking through a garden and pulling out dandelions before they form their white seed heads.",
        },
        {
          key: "mulch-cover",
          label: "Mulch and Cover Crops",
          desc: "Covering the soil with mulch (straw, wood chips) or planting cover crops (like clover or rye) to block sunlight and prevent weed seeds from germinating. This is a natural, chemical-free approach.",
          example: "Putting wood chips around your garden plants to stop weeds from growing between them.",
        },
        {
          key: "mowing",
          label: "Mowing",
          desc: "Cutting weeds down before they can spread their seeds. This helps stop weeds from making new weeds, but they may grow back from their roots.",
          example: "Mowing a field of tall weeds before they flower and drop seeds.",
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
          desc: "Pre-emergent herbicides create a chemical barrier in the soil that inhibits cell division in germinating weed seeds. They must be applied before weed emergence and typically require rainfall or irrigation for activation. Timing is critical -- applying too early or too late reduces efficacy significantly.",
          example:
            "Applying pendimethalin or S-metolachlor to corn fields before planting to prevent annual grass and small-seeded broadleaf emergence.",
        },
        {
          key: "post-emergent",
          label: "General Post-Emergent Herbicide",
          desc: "Post-emergent herbicides target actively growing weeds. They can be selective (targeting specific weed types while leaving the crop unharmed) or non-selective (killing all vegetation). Efficacy depends on weed growth stage, environmental conditions, and application rate.",
          example:
            "Applying a selective broadleaf herbicide to a soybean field to control waterhemp at the 2-4 inch stage.",
        },
        {
          key: "multi-moa",
          label: "Multi-MOA Herbicides",
          desc: "Multi-Mode of Action (MOA) herbicide programs use two or more herbicides with different mechanisms of killing weeds in a single application or across a season. This is the most critical strategy for preventing herbicide resistance.",
          example:
            "Tank-mixing a Group 15 pre-emergent with a Group 27 post-emergent to control resistant Palmer amaranth.",
        },
        {
          key: "wait",
          label: "Wait to Act",
          desc: "Economic threshold-based decision making is central to IPM. The pest threshold is the specific population density at which control action must be taken to prevent unacceptable harm or economic loss.",
          example:
            "A scout records 1-2 common chickweed plants per square meter in a vigorous winter wheat stand. Published thresholds indicate this causes less than 1% yield loss.",
        },
        {
          key: "hand-weeding",
          label: "Hand Weeding",
          desc: "Manual removal of weeds, particularly important for removing herbicide-resistant escapes before they set seed. In resistance management, 'zero seed tolerance' programs rely on hand weeding.",
          example:
            "Walking bean fields in late summer to hand-pull waterhemp escapes that survived herbicide applications.",
        },
        {
          key: "mulch-cover",
          label: "Mulch / Cover Crops",
          desc: "Cover crops suppress weeds through physical biomass that blocks light, allelopathic compounds that inhibit germination, and competition for resources. Species like cereal rye can produce 4,000-8,000 lbs/acre of biomass.",
          example:
            "Planting cereal rye at 60-90 lbs/acre after corn harvest, then roller-crimping in spring before soybean planting.",
        },
        {
          key: "tillage",
          label: "Mechanical Cultivation (Tillage)",
          desc: "Tillage can be strategic or conventional. Strategic tillage targets specific weed flushes while minimizing soil disturbance. Deep inversion tillage can bury weed seeds below their emergence depth.",
          example:
            "Using a precision inter-row cultivator with guidance systems to mechanically remove weeds between soybean rows.",
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
                  Effective weed management requires an <strong>Integrated Pest Management (IPM)</strong> approach --
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
                  Controlling weeds isn't just about spraying chemicals -- there's actually a whole toolbox of strategies
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
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-xs text-primary">
                    <span className="font-semibold">Example:</span> {method.example}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Herbicide MOA Reference Table - only for 6-8 and 9-12 */}
          {!isElementary && (
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-3">
              <p className="font-semibold text-primary">Herbicide Modes of Action Reference</p>
              {isHighSchool ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    The table below lists the major herbicide MOA groups used in crop production.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-secondary/50">
                          <th className="p-2 text-left font-bold text-foreground border border-border">MOA (Group)</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Timing</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Spectrum</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Brand Example</th>
                          <th className="p-2 text-left font-bold text-foreground border border-border">Resistance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {HERBICIDE_MOA.map(h => (
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
                  <p className="font-semibold text-primary mt-3">Symptom Types</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(SYMPTOM_TYPES).map(([key, info]) => (
                      <div key={key} className="bg-card border border-border rounded-lg p-3">
                        <p className="font-bold text-foreground text-xs">{info.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Herbicides work in different ways to kill weeds. Scientists group them by their
                    <strong> mode of action (MOA)</strong> -- the specific way the chemical disrupts the weed's biology.
                  </p>
                  <div className="space-y-2">
                    {getMiddleSchoolMOAs().map(h => (
                      <div key={h.id} className="bg-card border border-border rounded-lg p-3">
                        <p className="font-bold text-foreground text-xs">{h.moa} (Group {h.group})</p>
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium">Timing:</span> {h.timing === 'PRE' ? 'Pre-emergent (before weeds sprout)' : 'Post-emergent (after weeds are growing)'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium">Targets:</span> {h.spectrum === 'Both' ? 'Grasses and broadleaves' : h.spectrum === 'Grass' ? 'Grasses (monocots)' : 'Broadleaves (dicots)'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium">Brand example:</span> {h.brands[0]}
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
      const PATTERNS = [
        {
          name: "W-Pattern",
          desc: "Walk in a W shape across the field. Good for most rectangular fields and provides broad coverage.",
        },
        {
          name: "X-Pattern",
          desc: "Walk diagonally from corner to corner, forming an X. Best for square fields to cover all quadrants.",
        },
        {
          name: "Zigzag",
          desc: "Walk back and forth across the field in a zigzag pattern. Ideal for long, narrow fields.",
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
                <p>The average Iowa crop farm spans about <strong>345 acres</strong>, which is far too large for field scouts to cover on foot efficiently. By using field scouting tools such as <strong>drones, rovers, and satellites</strong>, agronomists can scout fields more efficiently with greater accuracy.</p>
              </>
            )}
          </div>

          {grade === "high" && (
            <div className="space-y-3">
              {[
                { label: "Drones", desc: "Cover acres in minutes from above. Collect NDVI plant health maps, weed density and patch mapping, stand counts, nutrient deficiency patterns, and drainage/ponding issues. All information is sent live to smartphone apps for instant analysis." },
                { label: "Rovers", desc: "Autonomous or remote-controlled machines that drive through fields using AI-powered cameras and sensors. They gather species-level weed identification, soil compaction measurements, root health via ground sensors, emergence uniformity, and disease scouting through close-up leaf images." },
                { label: "Satellites", desc: "Especially useful for remote or large farms. Provide multi-spectral imagery (6-10 bands beyond visible light), historical yield potential maps, soil moisture, field boundary verification, and cover crop monitoring. Pinpoint exact hotspot zones of anomalies." },
              ].map(t => (
                <div key={t.label} className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <p className="font-display font-bold text-foreground">{t.label}</p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PATTERNS.map((p) => (
              <div key={p.name} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="font-bold text-foreground text-lg text-center">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>

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
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Weed Adaptation to Compete</p>
            {grade === "middle" ? (
              <>
                <p>
                  Weeds aren't just competing with crops -- they're also fighting each other for space, sunlight, water,
                  and nutrients in a fierce natural battle.
                </p>
                <p>
                  Certain weed species have developed highly effective competitive traits that allow them to establish
                  dominance over other plants, including <strong>rapid germination rates, aggressive canopy spread</strong>
                  that shades neighboring vegetation, and <strong>deep or extensive root systems</strong> that access soil
                  resources before competitors can reach them.
                </p>
                <p>
                  Some species practice <strong>allelopathy</strong>, releasing chemical compounds from their roots or
                  decomposing tissue into the surrounding soil that inhibit the germination or growth of competing plants.
                </p>
              </>
            ) : (
              <p>
                Understanding interspecific competition among weeds helps predict weed succession patterns and supports
                the design of management strategies that account for the full ecological complexity of weed communities.
              </p>
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
                  Below this threshold, the expense of treatment -- including the cost of herbicides, equipment, fuel,
                  and labor -- exceeds the value of the yield that would be lost to weed competition, making treatment
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

          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="font-bold text-foreground">How It Works</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-bold text-foreground text-sm">Below Threshold</p>
                <p className="text-xs text-muted-foreground">
                  Cost of treatment is greater than the value of crop loss. No action needed -- save your money.
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
                  Taxonomy is the system scientists use to organize and name every living thing on Earth -- like a giant
                  filing system for nature.
                </p>
                <p>
                  Taxonomy is the scientific discipline of classifying and naming living organisms by organizing them
                  into a structured hierarchy based on shared characteristics and evolutionary relationships. In plant
                  science, this hierarchy runs from broad categories like <strong>Kingdom</strong> and{" "}
                  <strong>Division</strong> down through <strong>Family</strong>, <strong>Genus</strong>, and{" "}
                  <strong>Species</strong> -- with each level becoming more specific.
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
                <WeedImage weedId={exampleWeed.id} stage="whole" className="w-full h-full" />
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
              To reproduce, dioecious weeds must have female and male plants in <strong>close proximity</strong>.
              Without one or the other, these weeds struggle to reproduce.
            </p>
            <p>
              However, because of their unique genetic makeups, dioecious plants can have{" "}
              <strong>significant genetic diversity</strong>, helping them become resistant to many herbicides. They can
              also produce <strong>vast amounts of seeds</strong>.
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
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted border-2 border-primary/30">
                      <WeedImage weedId={sp.id} stage="male" className="w-full h-full" />
                    </div>
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                      <p className="font-bold text-foreground text-sm">Male Plant</p>
                      <p className="text-xs text-muted-foreground mt-1">{sp.maleDesc}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted border-2 border-accent/30">
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
      const DORMANCY_TYPES = [
        { label: "Physical Dormancy", desc: "The seed has a hard or impenetrable seed coat that blocks water and gas exchange. The seed cannot germinate until the coat is broken down by weathering, fire, or microbial activity." },
        { label: "Physiological Dormancy", desc: "Caused by chemical inhibitors within the embryo or surrounding tissues that prevent embryonic growth. This is the most common form of seed dormancy. Environmental cues like temperature shifts or light exposure can break this dormancy." },
        { label: "Chemical Dormancy", desc: "Part of physiological dormancy, but focuses specifically on high concentrations of chemical inhibitors in the seed covering or embryo. These inhibitors must be leached out or degraded before germination can occur." },
        { label: "Morphological Dormancy", desc: "Determined by underdeveloped embryos at the time of seed release from the mature plant. By delaying embryo maturity and ability to germinate, seeds can last longer in the soil until they are morphologically ready to develop." },
      ];
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Seed Dormancy</p>
            <p>To survive in changing environments, weed seeds must adapt and know when to begin germination. To prevent germination in unfavorable conditions, such as the presence of herbicides or cold weather, seeds have developed adaptations to remain dormant.</p>
            <p><strong>Seed dormancy</strong> is the incapacity of a viable seed to germinate under favorable conditions. For weed seeds under stress, seed dormancy is a good thing. For agronomists trying to eradicate weeds, it can be challenging.</p>
          </div>
          <div className="space-y-3">
            {DORMANCY_TYPES.map(d => (
              <div key={d.label} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="font-display font-bold text-foreground">{d.label}</p>
                <p className="text-sm text-foreground">{d.desc}</p>
              </div>
            ))}
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
      const MOA_EXAMPLES = [
        { group: "1", name: "ACCase Inhibitors", desc: "Disrupt enzymes that produce fatty acids, stopping growth in grasses.", example: "clethodim" },
        { group: "2", name: "ALS Inhibitors", desc: "Block amino acid production needed for proteins.", example: "imazethapyr" },
        { group: "4", name: "Synthetic Auxins", desc: "Mimic plant growth hormones, causing abnormal growth and death.", example: "2,4-D" },
        { group: "9", name: "EPSPS Inhibitors", desc: "Shut down amino acid synthesis pathways.", example: "glyphosate" },
        { group: "14", name: "PPO Inhibitors", desc: "Interfere with chlorophyll production and burn plant leaves.", example: "fomesafen" },
      ];
      return (
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-5 text-sm text-foreground space-y-3">
            <p className="font-display font-bold text-primary text-base">Herbicide Mode of Action (MOA)</p>
            <p>Herbicides are chemical or biological substances used to eliminate or reduce weeds. In addition to being an essential part of crop management, herbicides are also a <strong>multi-billion-dollar industry</strong> in the United States.</p>
            <p>Herbicides are categorized into different groups based on their <strong>Mode of Action (MOA)</strong>. The MOA is the specific way a herbicide affects a plant's growth or survival, similar to how medicine targets a specific part of the human body.</p>
            <p>Herbicide groups share the same chemical foundation within each category. Because of that, weeds resistant to one herbicide in a group are often resistant to others with the same MOA.</p>
          </div>
          <h3 className="font-display font-bold text-foreground text-sm">Key Herbicide Groups</h3>
          <div className="space-y-3">
            {MOA_EXAMPLES.map(m => (
              <div key={m.group} className="bg-card border border-border rounded-lg p-4">
                <p className="font-bold text-foreground">Group {m.group}: {m.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                <p className="text-xs text-primary mt-1">Example: {m.example}</p>
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
                    <th className="p-2 text-left font-bold text-foreground border border-border">Brand Example</th>
                    <th className="p-2 text-left font-bold text-foreground border border-border">Resistance</th>
                  </tr>
                </thead>
                <tbody>
                  {HERBICIDE_MOA.map(h => (
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
        { group: "1", name: "ACCase Inhibitors", symptoms: "Yellowing in young grass leaves and death at the growing points." },
        { group: "2", name: "ALS Inhibitors", symptoms: "Stunted plants with purpling on the veins or stems." },
        { group: "4", name: "Synthetic Auxins", symptoms: "Leaf cupping, twisting, and bent stems (epinasty)." },
        { group: "9", name: "EPSPS Inhibitors", symptoms: "Gradual yellowing and death starting from the oldest leaves." },
        { group: "14", name: "PPO Inhibitors", symptoms: "Brown or scorched leaf spots soon after application." },
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
                <p className="text-sm text-muted-foreground mt-1">{p.symptoms}</p>
              </div>
            ))}
          </div>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-bold text-accent">Diagnosis Tip</p>
            <p className="mt-1">By paying close attention to <strong>which part of the plant shows damage</strong> -- whether it appears first on leaves, stems, or roots -- agronomists can often determine which herbicide group caused the injury.</p>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════════
       LIFE STAGE CONTROL (High School)
    ═══════════════════════════════════════════════════════════ */
    case "life-stage-control": {
      const STAGE_CONTROL = [
        { stage: "Seed (Seed Bank)", desc: "Many weed seeds are stored in seed banks and can remain dormant for years until growing conditions are favorable. Preventing seed bank replenishment is critical.", control: "Pre-emergent herbicides, cover crops, tillage to bury seeds" },
        { stage: "Seedling", desc: "Weeds are the easiest to control because they are small and have not yet developed extensive roots or stems.", control: "Post-emergent herbicides, cultivation, hand removal -- most cost-effective window" },
        { stage: "Vegetative", desc: "Weeds become harder to manage but can still be controlled through herbicide applications, cultivation, mowing, or hand removal.", control: "Higher herbicide rates needed, mechanical cultivation" },
        { stage: "Reproductive", desc: "Especially important to manage before they disperse seeds. Once seeds are released, they may be added back into the seed bank.", control: "Hand weeding escapes, prevent seed set at all costs" },
        { stage: "Mature / Dispersal", desc: "Perennial weeds can regrow from roots, rhizomes, tubers, or crowns, requiring repeated management over time.", control: "Systemic herbicides, deep tillage, multi-year management plans" },
      ];
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
                  <div className={`rounded-lg p-2 text-xs font-bold ${i <= 1 ? 'bg-accent/20 text-accent border border-accent/30' : i <= 2 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}>
                    {s}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{i <= 1 ? 'Easiest' : i <= 2 ? 'Moderate' : 'Hardest'}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {STAGE_CONTROL.map(s => (
              <div key={s.stage} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="font-display font-bold text-foreground">{s.stage}</p>
                <p className="text-sm text-foreground">{s.desc}</p>
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
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const toggleFamily = (family: string) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
      <p className="font-bold text-primary mb-2">Plant Families in Our Database</p>
      <p className="text-xs text-muted-foreground mb-3">
        Weeds in the same family share characteristics. Color-coded groups show related species. Tap "+X more" to
        expand.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from(familyGroups.entries())
          .sort()
          .map(([family, members], fi) => {
            const isExpanded = expandedFamilies.has(family);
            const shownMembers = isExpanded ? members : members.slice(0, 4);
            return (
              <div key={family} className={`${familyColors[fi % familyColors.length]} border rounded-lg p-3`}>
                <p className="font-bold text-foreground text-xs">
                  {family} ({members.length})
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {shownMembers.map((w) => (
                    <ClickableWeedName
                      key={w.id}
                      weed={w}
                      onSelect={onSelectWeed}
                      className="text-[10px] bg-card px-1.5 py-0.5 rounded"
                    />
                  ))}
                  {!isExpanded && members.length > 4 && (
                    <button
                      onClick={() => toggleFamily(family)}
                      className="text-[10px] text-primary font-medium hover:underline cursor-pointer"
                    >
                      +{members.length - 4} more
                    </button>
                  )}
                  {isExpanded && members.length > 4 && (
                    <button
                      onClick={() => toggleFamily(family)}
                      className="text-[10px] text-primary font-medium hover:underline cursor-pointer"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
