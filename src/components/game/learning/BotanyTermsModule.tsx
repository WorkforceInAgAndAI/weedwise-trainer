import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { DetectiveCard, NotebookSection, SelfCheck } from "./ThemedBlocks";

interface BotanyTerm {
  term: string;
  say: string;
  plain: string;
  technical: string;
  example: string;
}

const BOTANY_TERM_GROUPS: { group: string; blurb: string; tone: string; terms: BotanyTerm[] }[] = [
  {
    group: "Leaves & Stems",
    blurb: "The parts you see first when you walk a field.",
    tone: "border-success/40 bg-success/5",
    terms: [
      { term: "Petiole", say: "PET-ee-ohl", plain: "The little stalk that joins a leaf to the stem.", technical: "The stalk attaching the leaf blade to the stem; length, shape, and whether it is grooved, winged, or hairy are diagnostic characters.", example: "Velvetleaf has a long petiole; a sessile leaf has none at all." },
      { term: "Blade", say: "blayd", plain: "The flat, wide part of the leaf.", technical: "The expanded photosynthetic surface of a leaf; outline, margin, venation, and tip shape separate look-alike species.", example: "Grass blades are long and narrow with parallel veins." },
      { term: "Lobes", say: "lohbz", plain: "Big rounded or pointed 'fingers' cut into the edge of a leaf.", technical: "Rounded or pointed projections created by indentations in the leaf margin that do not reach the midrib.", example: "Dandelion leaves are deeply lobed and point back toward the base." },
      { term: "Node", say: "nohd", plain: "The bump on a stem where leaves or branches attach.", technical: "The point of leaf, bud, or branch attachment; internodes are the stem segments between nodes, and many perennials root at nodes.", example: "Field bindweed and quackgrass can root at stem nodes." },
      { term: "Whorled", say: "WORLD", plain: "Three or more leaves circling the stem at the same spot.", technical: "A leaf arrangement with three or more leaves at a single node, contrasted with opposite (two per node) and alternate (one per node).", example: "Catchweed bedstraw has whorled leaves." },
      { term: "Bolting", say: "BOHL-ting", plain: "When a low rosette shoots up a tall flowering stem.", technical: "Rapid elongation of a flowering stem from a vegetative rosette, usually triggered by day length or temperature; control after bolting is far less effective.", example: "Musk thistle bolts in its second year." },
    ],
  },
  {
    group: "Grass & Sedge Parts",
    blurb: "Grasses hide their ID clues at the collar, where blade meets stem.",
    tone: "border-info/40 bg-info/5",
    terms: [
      { term: "Sheath", say: "sheeth", plain: "The part of a grass leaf that wraps around the stem like a sleeve.", technical: "The lower portion of a grass leaf that encircles the culm; it may be open, split, closed, flattened, or hairy — all useful pre-heading characters.", example: "Barnyardgrass has a smooth, open sheath." },
      { term: "Ligule", say: "LIG-yool", plain: "A tiny flap or fringe of hairs where the leaf bends away from the stem.", technical: "A membranous or hairy appendage at the inner junction of blade and sheath; presence, height, and type (membranous, ciliate, absent) are primary grass keys.", example: "Large crabgrass has a tall membranous ligule; barnyardgrass has none." },
      { term: "Auricle", say: "AWR-ih-kul", plain: "Small claw-like 'ears' that hug the stem at the collar.", technical: "Ear-like projections extending from the collar region and clasping the culm; present in quackgrass, absent in most summer annual grasses.", example: "Quackgrass has clasping auricles." },
      { term: "Culm", say: "kulm", plain: "The stem of a grass — usually hollow and round.", technical: "The jointed, typically hollow flowering stem of grasses; sedge stems are solid and triangular in cross-section.", example: "\"Sedges have edges\" — nutsedge stems are triangular, not round." },
    ],
  },
  {
    group: "Flowers & Seed Heads",
    blurb: "How flowers are arranged is often the fastest family clue.",
    tone: "border-terracotta/40 bg-terracotta/5",
    terms: [
      { term: "Bracts", say: "brakts", plain: "Special leaves right under a flower — sometimes colorful or spiny.", technical: "Modified leaves subtending a flower or inflorescence; bract shape, spination, and margin color are key thistle and Asteraceae characters.", example: "Musk thistle's broad, spine-tipped bracts curve back under the head." },
      { term: "Raceme", say: "ray-SEEM", plain: "Flowers on tiny stalks lined up along one main stem.", technical: "An unbranched inflorescence in which stalked (pedicellate) flowers open from the bottom upward along a central axis.", example: "Wild mustard flowers in an open raceme." },
      { term: "Umbel", say: "UM-bul", plain: "Flower stalks that spread from one point like umbrella ribs.", technical: "An inflorescence whose pedicels all arise from a common point; characteristic of the carrot family (Apiaceae).", example: "Wild carrot, poison hemlock, and wild parsnip all form umbels." },
      { term: "Panicle", say: "PAN-ih-kul", plain: "A branched, loose spray of flowers or seeds.", technical: "A branched inflorescence with flowers borne on secondary branches; common in grass seed heads.", example: "Witchgrass makes a wide, airy panicle." },
      { term: "Pappus", say: "PAP-us", plain: "The fluffy parachute on top of a seed.", technical: "A tuft of bristles or hairs crowning the achene in Asteraceae, functioning as a wind-dispersal structure.", example: "Dandelion and Canada Thistle seeds ride the wind on a pappus." },
      { term: "Ocrea (ochrea)", say: "OH-kree-uh", plain: "A papery collar wrapped around the stem at each joint.", technical: "A membranous sheath formed by fused stipules encircling the node; diagnostic for the smartweed family (Polygonaceae).", example: "Pennsylvania Smartweed and Curly Dock both have an ocrea." },
    ],
  },
  {
    group: "Seeds & Fruits",
    blurb: "The 'seed' you find in the field is often really a dry fruit.",
    tone: "border-primary/40 bg-primary/5",
    terms: [
      { term: "Nutlet", say: "NUT-let", plain: "A small, hard, one-seeded nut-like fruit.", technical: "A small, hard, indehiscent one-seeded fruit; in the mint and borage families each flower produces four nutlets.", example: "Ground Ivy produces nutlets." },
      { term: "Achene", say: "ay-KEEN", plain: "A dry one-seeded fruit that does not split open.", technical: "A dry, indehiscent fruit with a single seed loosely attached to the fruit wall; the standard Asteraceae fruit.", example: "A dandelion 'seed' is an achene plus its pappus." },
      { term: "Capsule", say: "KAP-sul", plain: "A dry pod that splits open to spill many seeds.", technical: "A dry dehiscent fruit derived from two or more fused carpels that opens by slits, pores, or a lid.", example: "Velvetleaf's cup-shaped capsule holds dozens of seeds." },
    ],
  },
  {
    group: "Underground Parts",
    blurb: "What is below ground decides whether tillage helps or spreads a weed.",
    tone: "border-amber-500/40 bg-amber-500/5",
    terms: [
      { term: "Tuber", say: "TOO-ber", plain: "A swollen underground food-storage lump that can grow a whole new plant.", technical: "A thickened underground storage organ, usually a modified stem tip, containing buds capable of producing new shoots.", example: "Yellow Nutsedge spreads by tubers — tillage scatters them." },
      { term: "Rhizome", say: "RYE-zohm", plain: "An underground stem that creeps sideways and sends up new shoots.", technical: "A horizontal underground stem with nodes and buds; fragments cut by tillage can each regenerate a plant.", example: "Johnsongrass and Quackgrass spread by rhizomes." },
      { term: "Stolon", say: "STOH-lon", plain: "A stem that runs along the top of the ground and roots as it goes.", technical: "A horizontal above-ground stem that roots at the nodes to form new plants.", example: "Nimblewill and Ground Ivy creep by stolons." },
      { term: "Taproot", say: "TAP-root", plain: "One thick main root that drills straight down.", technical: "A dominant central root with smaller laterals, often storing carbohydrates and enabling regrowth after mowing.", example: "Curly Dock and Dandelion regrow from a taproot." },
    ],
  },
  {
    group: "Reproduction Words",
    blurb: "Where the male and female flower parts sit changes control strategy.",
    tone: "border-info/40 bg-info/5",
    terms: [
      { term: "Dioecious", say: "dye-EE-shus", plain: "Male and female flowers grow on separate plants.", technical: "A species in which staminate and pistillate flowers occur on separate individuals, forcing cross-pollination and speeding the spread of herbicide-resistance genes.", example: "Waterhemp and Palmer Amaranth are dioecious." },
      { term: "Monoecious", say: "muh-NEE-shus", plain: "One plant carries both male and female flowers.", technical: "A species bearing separate staminate and pistillate flowers on the same individual, allowing self-pollination.", example: "Common Ragweed and Burcucumber are monoecious." },
      { term: "Perfect flower", say: "PER-fekt", plain: "A single flower that has both male and female parts.", technical: "A bisexual flower containing both stamens and a pistil.", example: "Most mustard-family weeds have perfect flowers." },
    ],
  },
];

function BotanyTermCard({ t, advanced }: { t: BotanyTerm; advanced: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="text-left w-full bg-card border border-border rounded-lg p-3 hover:border-primary/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-bold text-foreground text-sm">{t.term}</p>
          <p className="text-[10px] text-muted-foreground italic">say: {t.say}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      <p className="text-xs text-foreground mt-2">{advanced ? t.technical : t.plain}</p>
      {open && (
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground">
            {advanced ? `In plain words: ${t.plain}` : `Field definition: ${t.technical}`}
          </p>
          <p className="text-xs text-primary font-medium">Example: {t.example}</p>
        </div>
      )}
    </button>
  );
}

export default function BotanyTermsModule({ advanced }: { advanced: boolean }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const groups = BOTANY_TERM_GROUPS.map((g) => ({
    ...g,
    terms: q
      ? g.terms.filter(
          (t) =>
            t.term.toLowerCase().includes(q) ||
            t.plain.toLowerCase().includes(q) ||
            t.technical.toLowerCase().includes(q),
        )
      : g.terms,
  })).filter((g) => g.terms.length > 0);

  return (
    <div className="space-y-5">
      {advanced ? (
        <NotebookSection title="Morphological Vocabulary" subtitle="Entry 00 · Terminology">
          <p className="text-sm">
            Every identification key you will ever use is written in this vocabulary. Before you can key out a weed you
            have to name its parts precisely — a <strong>ligule</strong>, an <strong>ocrea</strong>, or an{" "}
            <strong>umbel</strong> each narrows the possibilities to a handful of species.
          </p>
        </NotebookSection>
      ) : (
        <DetectiveCard title="Case File: Learn the Words First" badge="Case 00 · Plant Parts">
          <p className="text-sm">
            Weed scouts use special words for plant parts. Learn these first and every other module will make sense.
            Tap any card to see the full field definition and a real weed that shows the part off.
          </p>
        </DetectiveCard>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a term (ligule, umbel, tuber...)"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
        />
      </div>

      {groups.map((g) => (
        <div key={g.group} className={`rounded-lg border p-4 space-y-3 ${g.tone}`}>
          <div>
            <p className="font-display font-bold text-foreground">{g.group}</p>
            <p className="text-xs text-muted-foreground">{g.blurb}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.terms.map((t) => (
              <BotanyTermCard key={t.term} t={t} advanced={advanced} />
            ))}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No terms match that search.</p>
      )}

      <SelfCheck
        question={
          advanced
            ? "You find a weed with a solid, triangular stem and small underground tubers. What terms describe it, and why does tillage make it worse?"
            : "A grass has a little flap where the leaf bends away from the stem. What is that part called?"
        }
        answer={
          advanced
            ? "A sedge (culm triangular in cross-section) spreading by tubers — Yellow Nutsedge. Tillage fragments and scatters the tubers, and each one can sprout a new plant."
            : "The ligule. Checking the ligule is one of the fastest ways to tell grasses apart before they head out."
        }
      />
    </div>
  );
}
