import { useMemo, useState } from "react";
import { Search, X, FlaskConical, Leaf } from "lucide-react";
import { HERBICIDE_MOA, SYMPTOM_TYPES, type HerbicideMOA } from "@/data/herbicides";
import { WEED_TOP_MOAS } from "@/data/weedKnowledge";
import { collegiateWeeds } from "@/data/gradeWeeds";

/** Plain-language explanation of what each WSSA group actually does inside the plant. */
const GROUP_HOW_IT_WORKS: Record<number, string> = {
  1: "Shuts down the enzyme (ACCase) grasses use to build fatty acids, so new grass tissue cannot form. Broadleaf plants have a different ACCase, which is why these products are grass-only.",
  2: "Blocks ALS, the enzyme that makes three branched-chain amino acids. Without those building blocks the plant cannot make protein, so growth stops within days.",
  3: "Stops cell division in germinating seedlings by preventing microtubules from assembling — roots and shoots cannot elongate.",
  4: "Mimics the plant's natural auxin hormone at a huge overdose, so growth becomes uncontrolled and disorganized until the plant collapses.",
  5: "Binds photosystem II (urea/amide site) and stops the light reactions of photosynthesis; the plant starves and oxidative damage burns the leaves.",
  6: "Binds photosystem II at the serine site — same result as Group 5 but a different binding pocket, which matters for resistance patterns.",
  8: "Interferes with lipid and fatty-acid synthesis in germinating seedlings (not through ACCase), deforming the emerging shoot.",
  9: "Blocks EPSPS in the shikimate pathway, so no aromatic amino acids are made. Effects are slow but systemic — it moves to the growing points and roots.",
  10: "Blocks glutamine synthetase, letting ammonia build up to toxic levels. Contact-heavy and very fast, but needs good spray coverage and sunlight.",
  13: "Blocks the MEP pathway that makes carotenoids, so chlorophyll is destroyed by light and new growth emerges white.",
  14: "Blocks PPO, causing a buildup that reacts with light to shred cell membranes. Damage appears within hours where spray landed.",
  15: "Blocks very-long-chain fatty acid synthesis so seedlings cannot build cell membranes as they push toward the surface.",
  19: "Stops auxin from moving through the plant, concentrating hormone effects; used with Group 4 to intensify and speed the response.",
  22: "Steals electrons from photosystem I and creates free radicals that rupture cells almost immediately in sunlight.",
  23: "Same very-long-chain fatty acid target as Group 15 but different chemistry; strong residual control of small-seeded weeds.",
  25: "Blocks HPPD, which the plant needs to protect chlorophyll; without it, new tissue bleaches white and then dies.",
  26: "Disrupts microtubules in very young tissue, halting root and shoot elongation shortly after germination.",
};

/** Field-diagnosable injury pattern per group: where to look and what you will see. */
const GROUP_INJURY: Record<number, { where: string; signs: string; speed: string }> = {
  1: { where: "Newest grass leaves at the whorl and growing point", signs: "Yellow/purple whorl leaves, dead growing point; the center leaf pulls out easily", speed: "7-14 days" },
  2: { where: "Newest leaves, veins, and shoot tips", signs: "Severe stunting, purple veins, interveinal yellowing, stubby bottle-brush roots", speed: "7-21 days (slow)" },
  3: { where: "Roots and root tips", signs: "Short, stubby, club-tipped roots; seedlings never anchor and stands are thin", speed: "At emergence" },
  4: { where: "Stems, petioles, and new leaves", signs: "Twisting (epinasty), cupped or strapped leaves, callus tissue and stem cracking", speed: "1-3 days" },
  5: { where: "Older, lower leaves first", signs: "Leaf-margin and interveinal yellowing turning brown; leaves scorch from the edges in", speed: "3-10 days" },
  6: { where: "Older, lower leaves first", signs: "Yellowing between veins then browning and death of older tissue", speed: "3-10 days" },
  8: { where: "Emerging shoot below the soil surface", signs: "Shoots fail to unroll, appear swollen, buggy-whipped or malformed", speed: "At emergence" },
  9: { where: "Whole plant, newest growth first", signs: "General yellowing then reddening/browning; growing points die back; plant collapses", speed: "7-14 days" },
  10: { where: "All sprayed tissue", signs: "Water-soaked spots turning bronze then brown; only the tissue actually hit is killed", speed: "1-4 days" },
  13: { where: "Newly emerged leaves", signs: "Bright white or bleached new growth while older leaves stay green", speed: "3-10 days" },
  14: { where: "Leaf surfaces contacted by the spray", signs: "Speckled, water-soaked spots that dry to brown necrotic flecks; edges burn", speed: "Hours to 2 days" },
  15: { where: "Emerging shoots and coleoptiles", signs: "Seedlings die before or right at emergence; leaves stuck in the whorl, crinkled or drawn", speed: "At emergence" },
  19: { where: "Stems and new leaves", signs: "Twisting and cupping similar to Group 4, but faster and more pronounced", speed: "1-3 days" },
  22: { where: "All sprayed tissue", signs: "Rapid wilting, water-soaking, then complete brown desiccation of contacted leaves", speed: "Hours" },
  23: { where: "Emerging shoots", signs: "Failure to emerge; short, thickened shoots and stunted seedlings", speed: "At emergence" },
  25: { where: "Newest leaves and growing points", signs: "White-to-pink bleaching of new growth, followed by necrosis", speed: "3-10 days" },
  26: { where: "Root and shoot tips of seedlings", signs: "Stunted, swollen tips; poor establishment", speed: "At emergence" },
};

const RESISTANT_WEEDS_BY_GROUP: Record<number, string[]> = {
  1: ["Italian ryegrass", "Wild oat", "Johnsongrass", "Giant foxtail"],
  2: ["Palmer amaranth", "Waterhemp", "Kochia", "Horseweed", "Common ragweed"],
  3: ["Goosegrass", "Green foxtail"],
  4: ["Kochia", "Waterhemp", "Wild mustard", "Horseweed"],
  5: ["Common lambsquarters", "Redroot pigweed", "Kochia", "Waterhemp"],
  9: ["Horseweed", "Palmer amaranth", "Waterhemp", "Kochia", "Giant ragweed", "Italian ryegrass"],
  10: ["Italian ryegrass"],
  14: ["Waterhemp", "Palmer amaranth", "Common ragweed"],
  15: ["Waterhemp (recent reports)"],
  22: ["Horseweed", "Hairy fleabane"],
  25: ["Waterhemp", "Palmer amaranth"],
};

const timingLabel = (t: HerbicideMOA["timing"]) =>
  t === "PRE" ? "Pre-emergent" : t === "POST" ? "Post-emergent" : "Pre- or post-emergent";
const spectrumLabel = (s: HerbicideMOA["spectrum"]) => (s === "Both" ? "Grass & broadleaf" : `${s} weeds`);

const riskClass = (level: HerbicideMOA["resistanceLevel"]) =>
  level === "Very high" || level === "High"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : level === "Moderate" || level === "Low-moderate"
      ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
      : "bg-primary/10 text-primary border-primary/30";

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

/** Weeds (from the collegiate pool) whose curated top MOAs include this entry. */
function weedsControlledBy(moaId: string): string[] {
  return collegiateWeeds
    .filter((w) => WEED_TOP_MOAS[w.id]?.includes(moaId))
    .map((w) => w.commonName)
    .sort((a, b) => a.localeCompare(b));
}

function MOADetail({ m, onClose }: { m: HerbicideMOA; onClose: () => void }) {
  const symptom = SYMPTOM_TYPES[m.symptomType];
  const injury = GROUP_INJURY[m.group];
  const controls = weedsControlledBy(m.id);
  const resistant = RESISTANT_WEEDS_BY_GROUP[m.group];

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full my-8 shadow-xl">
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-primary">WSSA Group {m.group}</p>
            <h3 className="font-display font-bold text-foreground text-lg leading-tight">{m.moa}</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Chip className="bg-secondary text-foreground border-border">{timingLabel(m.timing)}</Chip>
              <Chip className="bg-secondary text-foreground border-border">{spectrumLabel(m.spectrum)}</Chip>
              <Chip className={riskClass(m.resistanceLevel)}>Resistance: {m.resistanceLevel}</Chip>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close herbicide details"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-foreground">
          <section>
            <p className="font-bold text-primary mb-1">How it works</p>
            <p className="text-muted-foreground">{GROUP_HOW_IT_WORKS[m.group] ?? m.chemistry}</p>
          </section>

          <section className="bg-muted/30 rounded-xl p-4">
            <p className="font-bold text-primary mb-1">Injury symptoms</p>
            <p className="font-semibold">{symptom?.label}</p>
            <p className="text-muted-foreground mt-1">{symptom?.description}</p>
            {injury && (
              <div className="grid sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">Where to look</p>
                  <p className="text-xs text-muted-foreground">{injury.where}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">What you see</p>
                  <p className="text-xs text-muted-foreground">{injury.signs}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">How fast</p>
                  <p className="text-xs text-muted-foreground">{injury.speed}</p>
                </div>
              </div>
            )}
          </section>

          <section className="grid sm:grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">Chemistry families</p>
              <p className="text-xs text-muted-foreground mt-1">{m.chemistry}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">Common actives</p>
              <p className="text-xs text-muted-foreground mt-1">{m.brands.join(", ")}</p>
            </div>
          </section>

          <section>
            <p className="font-bold text-primary mb-1">Resistance watch</p>
            <p className="text-muted-foreground text-xs">{m.resistanceNotes}</p>
            {resistant && (
              <p className="text-xs mt-1">
                <span className="font-semibold text-foreground">Documented resistant weeds:</span>{" "}
                <span className="text-muted-foreground">{resistant.join(", ")}</span>
              </p>
            )}
          </section>

          {controls.length > 0 && (
            <section>
              <p className="font-bold text-primary mb-1">Weeds this group is a top choice for ({controls.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {controls.map((n) => (
                  <Chip key={n} className="bg-secondary text-foreground border-border font-normal">
                    {n}
                  </Chip>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HerbicideMOAExplorer() {
  const [tab, setTab] = useState<"group" | "weed">("group");
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openWeed, setOpenWeed] = useState<string | null>(null);

  const groups = useMemo(() => [...HERBICIDE_MOA].sort((a, b) => a.group - b.group), []);
  const selected = groups.find((g) => g.id === openId) ?? null;

  const weedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collegiateWeeds
      .filter((w) => WEED_TOP_MOAS[w.id])
      .filter((w) => !q || w.commonName.toLowerCase().includes(q) || w.scientificName.toLowerCase().includes(q))
      .sort((a, b) => a.commonName.localeCompare(b.commonName));
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            { key: "group", label: "By Herbicide Group" },
            { key: "weed", label: "By Weed" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "group" ? (
        <>
          <p className="text-xs text-muted-foreground">
            Tap any group to open the full breakdown: how it works, injury symptoms in the field, resistance risk, and
            the weeds it controls best.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.map((m) => (
              <button
                key={m.id}
                onClick={() => setOpenId(m.id)}
                className="text-left bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-primary">Group {m.group}</p>
                  <Chip className={riskClass(m.resistanceLevel)}>{m.resistanceLevel}</Chip>
                </div>
                <p className="font-display font-bold text-foreground leading-snug mt-1">{m.moa}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {timingLabel(m.timing)} · {spectrumLabel(m.spectrum)}
                </p>
                <p className="text-xs text-foreground mt-2">
                  <span className="font-semibold">Injury:</span> {SYMPTOM_TYPES[m.symptomType]?.label}
                </p>
                <p className="text-[11px] text-primary font-semibold mt-2">Tap for details →</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Search a species to see the herbicide groups extension programs rank highest for it, in order.
          </p>
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a weed by common or scientific name"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground"
            />
          </div>
          <div className="space-y-2">
            {weedRows.map((w) => {
              const ids = WEED_TOP_MOAS[w.id];
              const open = openWeed === w.id;
              return (
                <div key={w.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenWeed(open ? null : w.id)}
                    className="w-full text-left p-3 flex items-center gap-3"
                  >
                    <Leaf className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{w.commonName}</p>
                      <p className="text-[11px] text-muted-foreground italic">{w.scientificName}</p>
                    </div>
                    <span className="text-[11px] text-primary font-semibold">{open ? "Hide" : "Show herbicides"}</span>
                  </button>
                  {open && (
                    <div className="px-3 pb-3 space-y-2">
                      {ids.map((id, i) => {
                        const m = HERBICIDE_MOA.find((h) => h.id === id);
                        if (!m) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => setOpenId(m.id)}
                            className="w-full text-left bg-muted/30 rounded-lg p-3 hover:bg-muted/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-primary-foreground bg-primary rounded-full w-5 h-5 flex items-center justify-center">
                                {i + 1}
                              </span>
                              <p className="font-semibold text-foreground text-sm">
                                {m.moa} (Group {m.group})
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {timingLabel(m.timing)} · {spectrumLabel(m.spectrum)} · e.g. {m.brands[0]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Injury:</span>{" "}
                              {SYMPTOM_TYPES[m.symptomType]?.label}
                            </p>
                          </button>
                        );
                      })}
                      <p className="text-[11px] text-muted-foreground">
                        Rotate between these groups across seasons — never rely on the same one twice in a row.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {weedRows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No weeds match that search.</p>
            )}
          </div>
        </>
      )}

      {selected && <MOADetail m={selected} onClose={() => setOpenId(null)} />}
    </div>
  );
}
