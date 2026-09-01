// Seed production and dispersal facts used by the Seeds & Seed Banks learning
// modules. Values are typical published ranges (university extension / WSSA).
// Seed production and dispersal facts used by the Seeds & Seed Banks learning
// modules. Values are typical published ranges (university extension / WSSA).
// Updated from 8_27_seedFacts.xlsx (89 species), aligned to the same species set as weedKnowledge.ts.

export interface SeedFact {
  production: string;
  dispersal: string;
  seedDescription: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "");

const CURATED: Record<string, SeedFact> = {
  annualryegrass: {
    production: "Up to 1100 per plant",
    dispersal: "Animal Fur and manure",
    seedDescription:
      "Slender, tan to straw-colored grass seed (floret) about 5-7 mm long with an awn, narrow and cylindrical with a ribbed, papery lemma enclosing the grain.",
  },
  asiancopperleaf: {
    production: "<300 per plant",
    dispersal: "Water; machinery; contaminated; manure",
    seedDescription:
      "Tiny (about 1.5 mm) reddish-brown to black seed, roughly oval and flattened, with a finely pitted or granular surface.",
  },
  asiaticdayflower: {
    production: "4 seeds per flower",
    dispersal: "Machinery",
    seedDescription:
      "Dark brown to black, irregularly angular seed about 3-4 mm, with a rough, pitted or honeycombed surface texture.",
  },
  barnyardgrass: {
    production: "Up to 40000 seeds per plant",
    dispersal: "Gravity near parent plant; farm equipment; contaminated seed; waterfowl; water",
    seedDescription:
      "Oval, plump spikelet 2-3 mm, straw to purplish tan in color, ribbed lengthwise, sometimes bearing a short bristly awn at the tip.",
  },
  buffalobur: {
    production: "2000-8000 seeds per plant",
    dispersal: "Spiny burs cling to livestock and equipment; plant also tumbles",
    seedDescription:
      "Flattened, disc-shaped seed 2-3 mm, yellowish-tan to brown, with a smooth to finely pitted surface and a slightly notched edge.",
  },
  burcucumber: {
    production: "20-500 seeds per plant",
    dispersal: "Water and machinery; spiny bur clusters cling to equipment",
    seedDescription:
      "Large (10-15 mm), flattened, oval seed that is tan to brown with a rough, warty or netted surface texture.",
  },
  canadathistle: {
    production: "1500-5000 seeds per plant",
    dispersal: "Wind by pappus; aggressive spread by creeping roots; contaminated seed or hay; water",
    seedDescription:
      "Slender, slightly curved achene 3-4 mm, tan to light brown with fine longitudinal ridges, tapering to a small pale attachment point (pappus scar).",
  },
  caraway: {
    production: "<2500 per plant",
    dispersal: "Fall close to the mother plant; mechanical",
    seedDescription:
      "Small crescent-shaped, ribbed seed about 4-6 mm, brown with five pale longitudinal ridges and a curved, boat-like profile.",
  },
  catchweedbedstraw: {
    production: "<400 seeds per plant",
    dispersal: "Animal fur and clothing; contaminated seed",
    seedDescription:
      "Small (2-3 mm), round to kidney-shaped seed, grayish-tan to brown, covered densely in tiny hooked bristles giving a burr-like, velcro texture.",
  },
  commonburdock: {
    production: "6000-16000 seeds per plant",
    dispersal: "Hooked burs on animal fur and clothing",
    seedDescription:
      "Oblong seed 5-7 mm, mottled gray-brown to dark brown with darker speckling, slightly curved with a flattened, ridged surface.",
  },
  commonchickweed: {
    production: "2500-15000 seeds per plant",
    dispersal: "Gravity mud on tires and boots and mowing",
    seedDescription:
      "Very small (about 1 mm), round, reddish-brown seed with concentric rows of small rounded bumps (tubercles) giving a bumpy, ridged texture.",
  },
  commoncocklebur: {
    production: "400-1000 burs per plant (2 seeds each)",
    dispersal: "Hooked burs cling to fur clothing and equipment; also float in water",
    seedDescription:
      "Large (10-18 mm), woody, brown bur covered in stiff hooked spines, oval-shaped and containing two seeds inside.",
  },
  commoncopperleaf: {
    production: "3 seeds per bract",
    dispersal: "Fall close to the mother plant; mechanical",
    seedDescription:
      "Small (about 2 mm), grayish-brown to black seed, oval and slightly flattened with a finely wrinkled or pitted surface.",
  },
  commonmallow: {
    production: "10-12 seeds per pod",
    dispersal: "Fall close to the mother plant",
    seedDescription:
      "Small (1.5-2 mm), kidney or disc-shaped seed, grayish-brown to tan with a finely netted or wrinkled surface.",
  },
  commonmilkweed: {
    production: "200-400 seeds per pod cluster",
    dispersal: "Wind on silky floss (coma)",
    seedDescription:
      "Flattened, teardrop-shaped seed 6-8 mm, brown with a narrow papery wing margin; in nature attached to a tuft of white silky hair (coma).",
  },
  commonmorningglory: {
    production: "10000-26000 per plant",
    dispersal: "Wind; rain; gravity; birds; contaminated crops",
    seedDescription:
      "Angular, wedge-shaped (pie-slice) seed 4-6 mm, dark brown to black with a rough, minutely hairy surface.",
  },
  commonmullein: {
    production: "136000-175000 per plant",
    dispersal: "Fall near parent plant",
    seedDescription:
      "Very small (0.5-1 mm), irregularly angular, dark brown to black seed with deep longitudinal ridges and pitted grooves, giving a corncob-like texture.",
  },
  commonpokeweed: {
    production: "1500-7000 seeds per plant",
    dispersal: "Birds eat the berries and deposit seeds far from the parent plant",
    seedDescription:
      "Round, glossy black to dark reddish-black seed 2-3 mm, lens-shaped with a smooth, hard, shiny seed coat.",
  },
  commonragweed: {
    production: "3000-4000 seeds per plant",
    dispersal: "Gravity and machinery; seeds also move in mud and crop seed lots",
    seedDescription:
      "Woody, tan to brown seed 3-5 mm shaped like a small crown or acorn, with a pointed tip surrounded by 5-7 short spiny projections.",
  },
  commonsunflower: {
    production: "3300 seeds per plant",
    dispersal: "Fall close to the mother plant; birds; other animals",
    seedDescription:
      "Slender, four-sided seed 4-6 mm, tan to yellowish-brown with lengthwise ribs and a slightly tapered, angular shape.",
  },
  commonteasel: {
    production: "5300-7200 seeds per plant",
    dispersal: "Birds and small mammals; water; equipment",
    seedDescription:
      "Elongated, wedge-shaped seed (achene) 6-10 mm, black with gray to white longitudinal stripes and a smooth, hard shell.",
  },
  cornspeedwell: {
    production: "14-20 seeds per pod",
    dispersal: "Machinery; humans; soil",
    seedDescription:
      "Tiny (1 mm), boat-shaped or cupped seed, yellowish-tan to orange-brown with a pitted, honeycomb-like surface.",
  },
  curlydock: {
    production: "3000-40000 seeds per plant",
    dispersal: "Water (winged fruits float) wind and livestock",
    seedDescription:
      "Small (2-3 mm), glossy reddish-brown, three-sided (triangular in cross-section) seed with smooth, shiny surfaces tapering to a point.",
  },
  dandelion: {
    production: "2000-15000 seeds per plant",
    dispersal: "Wind (anemochory) on a feathery pappus",
    seedDescription:
      "Slender, spindle-shaped achene 3-4 mm, tan to light brown with fine longitudinal ridges and small spines near the tip, topped by a thin beak (once attached to the white pappus).",
  },
  downybrome: {
    production: "100-5000 seeds per plant",
    dispersal: "Awns catch on fur and clothing; also in hay and machinery",
    seedDescription:
      "Slender, tapering grass floret 8-15 mm, light tan to purplish-tan, covered in soft downy hairs with a long straight awn.",
  },
  easternblacknightshade: {
    production: "2000-8000 seeds per plant",
    dispersal: "Birds and mammals eat the berries; also moves with harvest equipment",
    seedDescription:
      "Small (1.5-2 mm), flattened, teardrop to disc-shaped seed, pale yellow to tan with a finely pitted, netted surface.",
  },
  fallpanicum: {
    production: "10000-100000 seeds per plant",
    dispersal: "Machinery water and gravity",
    seedDescription:
      "Oval grass seed 2-3 mm, straw-colored to tan with a smooth, glossy, somewhat wrinkled hull and a rounded tip.",
  },
  fieldbindweed: {
    production: "25-500 seeds per plant",
    dispersal: "Seed in crop lots and manure; hard seed lasts decades roots spread locally",
    seedDescription:
      "Pear-shaped to angular seed 3-4 mm, dark brown to gray-black with a rough, granular surface and flattened sides.",
  },
  fieldhorsetail: {
    production: "Not Applicable",
    dispersal: "Spread by Spores not seeds",
    seedDescription:
      "Reproduces by spores, not true seeds; spores are minute, round, and pale green with thread-like elaters that curl and uncurl with humidity.",
  },
  fieldpennycress: {
    production: "1600-15000 per plant",
    dispersal: "Equipment; manure; birds; contaminated seed; wind; water",
    seedDescription:
      "Tiny (1.5-2 mm), oval, reddish-brown to dark brown seed with fine concentric ridges giving a slightly grooved surface. Resembles a fingerprint",
  },
  foxtailbarley: {
    production: "Up to 200 per plant",
    dispersal: "wind; animals; harvest equipment",
    seedDescription:
      "Slender spikelet 8-10 mm with several long, fine, spreading bristly awns 30-70 mm, straw-colored to purplish, giving a soft bottlebrush appearance.",
  },
  garlicmustard: {
    production: "350-8000 seeds per plant",
    dispersal: "Water footwear wildlife and vehicles",
    seedDescription:
      "Small (2-3 mm), oblong to cylindrical seed, black to dark brown with fine longitudinal ridges and a slightly shiny surface.",
  },
  giantfoxtail: {
    production: "250-1500 seeds per plant",
    dispersal: "Bristly seedheads catch on fur clothing and machinery",
    seedDescription:
      "Oval grass seed 2-3 mm enclosed in a hull with a bristly, bottlebrush-like awned spikelet; hull is yellowish-green to tan and finely cross-ridged.",
  },
  giantragweed: {
    production: "1000-5000 seeds per plant",
    dispersal: "Gravity water and equipment; large seeds cached by rodents",
    seedDescription:
      "Woody, tan to gray-brown seed 6-10 mm, larger than common ragweed, shaped like a small crown with a central pointed beak and several shorter spiny points at the base.",
  },
  goldenalexanders: {
    production: "500-1000 seeds per plant",
    dispersal: "Gravity, wind, animals",
    seedDescription:
      "Small, flattened, oval seed 2-3 mm, tan to brown with prominent narrow lengthwise ribs, in the celery-family (winged, ridged) style.",
  },
  goosegrass: {
    production: "40000-50000 seeds per plant",
    dispersal: "wind; animals; machinery",
    seedDescription:
      "Small (1.5-2 mm), oval, ridged seed, dark brown to black with deep longitudinal grooves giving a corrugated texture.",
  },
  greenfoxtail: {
    production: "5000-10000 seeds per plant",
    dispersal: "Bristles catch on animals and equipment",
    seedDescription:
      "Small (2 mm) oval grass seed with a bristly, greenish to purplish awned spikelet and finely cross-ridged hull.",
  },
  groundivy: {
    production: "100 seeds per plant",
    dispersal: "Gravity; animals",
    seedDescription:
      "Small (1.5 mm), oval to oblong seed, brown with a smooth to slightly rough surface and one flattened side.",
  },
  hedgebindweed: {
    production: "100-500 seeds per plant",
    dispersal: "Gravity and machinery; deep rhizomes drive local spread",
    seedDescription:
      "Larger relative of field bindweed, 4-6 mm, dark brown to black, pear-shaped with flattened angular sides and a rough, granular texture.",
  },
  hemp: {
    production: "1000-3000 seeds per plant",
    dispersal: "Birds water and machinery",
    seedDescription:
      "Round to oval, hard-shelled seed 3-5 mm, grayish-brown to green-brown with faint mottled marbling and a smooth glossy surface.",
  },
  hempdogbane: {
    production: "800-12000 per plant",
    dispersal: "Wind on tufted seeds; also spreads by creeping roots",
    seedDescription:
      "Slender, spindle-shaped seed 4-6 mm, brown, tapering at both ends, historically attached to a tuft of silky white hairs.",
  },
  henbit: {
    production: "40-2000 per plant",
    dispersal: "machinery; animals; ants",
    seedDescription:
      "Tiny (1-1.5 mm), three-angled (tetrahedral), grayish-brown seed with fine white speckling and a smooth to slightly textured surface.",
  },
  honeyvinemilkweed: {
    production: "Up to 2500-5000 seeds per plant",
    dispersal: "Wind",
    seedDescription:
      "Flattened, oval to teardrop-shaped seed 6-8 mm, brown with a smooth surface, historically attached to a tuft of silky white hair.",
  },
  horsenettle: {
    production: "2000-5000 seeds per plant",
    dispersal: "Birds and mammals eat the berries; roots spread locally",
    seedDescription:
      "Flattened, disc-shaped seed 2-3 mm, yellowish-tan to light brown with a smooth to finely pitted surface, resembling a tiny lentil.",
  },
  horseweed: {
    production: "100000-200000 seeds per plant",
    dispersal: "Wind; seeds can travel more than a half mile in air currents",
    seedDescription:
      "Extremely small (1 mm), narrow spindle-shaped achene, tan to light brown with fine ridges, tipped by a whitish tuft of bristles (pappus).",
  },
  ivyleafmorningglory: {
    production: "5000-11000 per plant",
    dispersal: "Manure; contaminated seed",
    seedDescription:
      "Angular, wedge-shaped seed 4-5 mm, dark brown to black with a rough, minutely hairy surface, similar to but slightly smaller than common morningglory.",
  },
  jimsonweed: {
    production: "500-30000 seeds per plant",
    dispersal: "Capsules split and drop seed; soil manure and machinery move it further",
    seedDescription:
      "Kidney-shaped, flattened seed 3-4 mm, dark brown to black with a pitted, honeycomb-like surface texture.",
  },
  johnsongrass: {
    production: "20000-80000 seeds per plant",
    dispersal: "Machinery water and contaminated hay; also spreads by rhizomes",
    seedDescription:
      "Oval to egg-shaped grass seed 3-4 mm, glossy reddish-brown to dark brown, plump with a smooth, shiny hull.",
  },
  kochia: {
    production: "10000-30000 seeds per plant",
    dispersal: "Tumbleweed ; the plant breaks off and rolls with the wind",
    seedDescription:
      "Small (1.5-2 mm), flattened, triangular to teardrop-shaped seed, grayish-brown to black with fine ridging and a winged edge.",
  },
  ladysthumb: {
    production: "200-4500 seeds per plant",
    dispersal: "Manure; contaminated seed; water",
    seedDescription:
      "Small (2 mm), lens-shaped (biconvex), dark reddish-brown to black seed with a smooth, glossy surface.",
  },
  lambsquarters: {
    production: "30000-176000 seeds per plant",
    dispersal: "Gravity machinery and manure; seeds stay viable for decades",
    seedDescription:
      "Very small (1-1.5 mm), round, flattened, black seed with a smooth, glossy surface and a fine circular rim edge.",
  },
  largecrabgrass: {
    production: "Up to 150000 seeds per plant",
    dispersal: "Gravity mowers water and foot traffic",
    seedDescription:
      "Small (2-3 mm) oval to elliptical grass seed, straw-colored to purplish-tan with fine longitudinal ridges and a pointed tip.",
  },
  longspinesandbur: {
    production: "1000-2000 seeds per plant",
    dispersal: "Spiny burs cling to tires fur and footwear",
    seedDescription:
      "Spiny, woody bur 5-10 mm covered in numerous sharp, barbed spines, tan to straw-colored, containing 1-2 seeds.",
  },
  mouseearchickweed: {
    production: "Up to 6500 seeds per plant",
    dispersal: "Gravity mud on tires and boots and mowing",
    seedDescription:
      "Very small (0.7-1 mm), round, tan to reddish-brown seed with a bumpy, tuberculate surface similar to common chickweed but slightly smaller.",
  },
  muskthistle: {
    production: "10000-20000 seeds per plant",
    dispersal: "Wind by pappus; also on machinery and hay",
    seedDescription:
      "Slender, slightly curved achene 4-5 mm, glossy yellow-brown to gray with fine longitudinal stripes and a pale tuft attachment scar at the tip.",
  },
  nimblewill: {
    production: "100-200 seeds per head",
    dispersal: "Spreads by stolons primarily",
    seedDescription:
      "Tiny (1-1.5 mm), narrow, tan to light brown grass seed with a smooth, slender, cylindrical shape.",
  },
  palmeramaranth: {
    production: "100000-500000 seeds per female plant",
    dispersal: "Machinery manure contaminated crop seed and irrigation water",
    seedDescription:
      "Very small (1 mm), round, flattened, glossy black to dark reddish-brown seed with a smooth surface, resembling other pigweed seeds.",
  },
  pennsylvaniasmartweed: {
    production: "19000-119000 seeds per plant",
    dispersal: "manure; animals; water",
    seedDescription:
      "Round to oval, flattened, dark brown to black seed 2-3 mm with a dull to slightly glossy surface.",
  },
  pinnatetansymustard: {
    production: "10-40 seeds per pod",
    dispersal: "Fall near parent plant; wind; water; machinery; animals",
    seedDescription:
      "Tiny (1 mm), oblong, orange-brown to reddish seed with a smooth to finely pitted surface, typical of mustard-family seeds.",
  },
  poisonhemlock: {
    production: "30000-40000 seeds per plant",
    dispersal: "Water mud machinery and animals",
    seedDescription:
      "Small (3 mm), oval, ribbed seed, gray-brown to tan with prominent wavy longitudinal ridges, flattened on one side.",
  },
  pricklylettuce: {
    production: "10000-50000 seeds per plant",
    dispersal: "Wind on a feathery pappus",
    seedDescription:
      "Slender, flattened achene 3-4 mm, gray-brown to tan with fine longitudinal ribs, tapering to a thin beak (once bearing a white pappus).",
  },
  pricklysida: {
    production: "1900-8100 seeds per plant",
    dispersal: "seed pods cling to fur or clothing; water",
    seedDescription:
      "Small (2-3 mm), wedge or kidney-shaped seed, dark brown to black with a rough, angular, surface with two points",
  },
  quackgrass: {
    production: "25-400 seeds per plant",
    dispersal: "Mostly rhizome fragments moved by tillage; some seed in hay",
    seedDescription:
      "Slender, tan to straw-colored grass seed 6-8 mm, narrow and ribbed with a short awn, resembling wheat but more elongated.",
  },
  redrootpigweed: {
    production: "100000-200000 seeds per plant",
    dispersal: "Machinery birds and livestock manure",
    seedDescription:
      "Very small (1 mm), round, flattened, shiny black to dark brown seed with a smooth glossy surface and a fine circular rim.",
  },
  russianthistle: {
    production: "20000-250000 seeds per plant",
    dispersal: "Tumbleweed ; the plant breaks off and rolls with the wind",
    seedDescription:
      "Small, spirally coiled, tan to greenish-brown seed with no true seed coat visible, appearing as a coiled thread-like embryo.",
  },
  scouringrush: {
    production: "Not Applicable",
    dispersal: "Spread by Spores not seeds",
    seedDescription:
      "Reproduces by spores, not true seeds; spores are tiny, round, and pale green with elaters that respond to humidity by curling.",
  },
  shattercanesorghums: {
    production: "3,000 seeds per plant",
    dispersal: "machinery; manure; water",
    seedDescription:
      "Round, plump grain 3-4 mm, reddish-brown to tan, often partially enclosed in dark brown to black glumes giving a two-toned look.",
  },
  shepherdspurse: {
    production: "4000-40000 seeds per plant",
    dispersal: "Gravity and mud; sticky wet seeds hitchhike on equipment",
    seedDescription:
      "Tiny (1 mm), oblong, orange-brown seed with a smooth, slightly ridged surface, typical small mustard-family seed.",
  },
  smoothgroundcherry: {
    production: "100-300 seeds per plant",
    dispersal: "Spread by rhizomes most of the time",
    seedDescription:
      "Small (2 mm), flattened, disc-shaped seed, pale yellow to tan with a finely pitted, netted surface.",
  },
  spottedspurge: {
    production: "Thousands",
    dispersal: "Water",
    seedDescription:
      "Tiny (0.7-1 mm), angular, grayish-brown seed with distinct transverse wrinkles or ridges across its four-sided shape.",
  },
  starofbethlehem: {
    production: "Few seeds produced; produced many small bulblets",
    dispersal: "Underground Bulbs",
    seedDescription:
      "Small, angular, black seed 2-3 mm with a matte, slightly rough surface, found in a papery capsule.",
  },
  tallhedgemustard: {
    production: "Up to 100 seeds per pod",
    dispersal: "Tumbleweed ; the plant breaks off and rolls with the wind",
    seedDescription:
      "Tiny (1 mm), oblong, yellowish-brown to orange seed with a smooth surface, typical of mustard-family seeds.",
  },
  toothedspurge: {
    production: "3 seeds per fruit",
    dispersal: "Explosive spread of seeds",
    seedDescription: "Small (2 mm), oval, grayish-tan to brown seed with irregular ridges and a rough, warty texture.",
  },
  velvetleaf: {
    production: "2000-17000 seeds per plant",
    dispersal: "Gravity and machinery; hard seed coat survives years in soil",
    seedDescription:
      "Kidney to heart-shaped seed 3-4 mm, gray-brown to dark brown with a finely pebbled, minutely hairy surface.",
  },
  venicemallow: {
    production: "3100 seeds per plant",
    dispersal: "Gravity",
    seedDescription:
      "Small (2 mm), kidney-shaped, dark brown to black seed with a finely netted, slightly rough surface.",
  },
  waterhemp: {
    production: "Up to 250000 seeds per female plant",
    dispersal: "Water combines and tillage equipment; tiny seeds move easily in mud",
    seedDescription:
      "Very small (0.8-1 mm), round, flattened, glossy black seed with a smooth surface, nearly identical to Palmer amaranth.",
  },
  watersmartweed: {
    production: "1 seed per flower",
    dispersal: "Spread by rhizomes most of the time",
    seedDescription:
      "Round to oval, flattened, dark brown to black seed 2-3 mm with a glossy, smooth surface, similar to Pennsylvania smartweed.",
  },
  whitecampion: {
    production: "Up to 25000 per plant",
    dispersal: "Gravity",
    seedDescription:
      "Small (1.5 mm), kidney-shaped, grayish-brown seed covered in rows of small rounded tubercles giving a bumpy texture.",
  },
  wildbuckwheat: {
    production: "1000-30000 seeds per plant",
    dispersal: "Harvest equipment and contaminated grain",
    seedDescription:
      "Three-sided (triangular), glossy dark brown to black seed 3-4 mm, smooth-surfaced and tapering to a point, resembling a tiny beechnut.",
  },
  wildcarrot: {
    production: "1000-40000 seeds per plant",
    dispersal: "Barbed fruits cling to animals and clothing",
    seedDescription:
      "Small (3-4 mm), oval, ribbed seed covered in short bristly hairs or spines along the ridges, tan to grayish-brown.",
  },
  wildfouroclock: {
    production: "1 seed per flower",
    dispersal: "Gravity",
    seedDescription:
      "Large (5-8 mm), oval to club-shaped, dark brown to black seed with prominent longitudinal ribs and a rough, warty surface.",
  },
  wildmustard: {
    production: "200-3500 seeds per plant",
    dispersal: "contaminated seeds; manure; machinery",
    seedDescription:
      "Tiny (1-1.5 mm), round, reddish-brown to dark brown seed with a smooth, glossy surface, typical small round mustard-family seed.",
  },
  wildoat: {
    production: "100-150 seeds per plant",
    dispersal: "Harvesting equipment",
    seedDescription:
      "Slender grass seed 12-20 mm, tan to brown, covered in fine stiff hairs with a prominent bent, twisted awn attached.",
  },
  wildparsnip: {
    production: "500-2500 seeds per plant",
    dispersal: "Wind over short distances water and mowing equipment",
    seedDescription:
      "Flattened, oval seed 5-7 mm with thin papery wings along the edges, yellowish-tan to light brown with fine ribs.",
  },
  witchgrass: {
    production: "Up to 50000 seeds per plant",
    dispersal: "Whole seedhead breaks off and tumbles with the wind",
    seedDescription:
      "Small (2 mm) oval grass seed, pale tan to straw-colored with a smooth, somewhat glossy hull and rounded shape.",
  },
  woollycupgrass: {
    production: "3,000-164000 seeds per plant",
    dispersal: "Gravity and Humans",
    seedDescription:
      "Small oval grass seed 2-3 mm, pale green to straw-colored, covered in fine soft hairs giving a woolly texture.",
  },
  yellowfoxtail: {
    production: "2000-8000 seeds per plant",
    dispersal: "Bristles catch on animals and equipment",
    seedDescription:
      "Small (2-2.5 mm) oval grass seed with a bristly yellowish awned spikelet and finely cross-ridged, straw-colored hull.",
  },
  yellownutsedge: {
    production: "Few viable seeds; up to 5000 tubers per plant",
    dispersal: "Tubers moved by tillage water and soil transport",
    seedDescription:
      "Small (1-1.5 mm), three-sided, dark brown to black seed with a dull, finely textured surface (tubers are the more common propagule).",
  },
  yellowrocket: {
    production: "Up to 88000 seeds per plant",
    dispersal: "Fall near parent plant",
    seedDescription:
      "Tiny (1 mm), oblong, dark brown to black seed with a smooth to finely pitted surface, typical mustard-family seed.",
  },
};

const FAMILY_FALLBACK: Record<string, SeedFact> = {
  Asteraceae: {
    production: "Several thousand seeds per plant",
    dispersal: "Wind, on a feathery pappus attached to each seed",
    seedDescription:
      "Small achene-type seed typical of the aster family, often bearing a feathery pappus for wind dispersal.",
  },
  Poaceae: {
    production: "Thousands of seeds per seedhead",
    dispersal: "Machinery, animals and gravity; awns and bristles aid attachment",
    seedDescription: "Small grass floret or caryopsis, often slender and ribbed, sometimes bearing an awn or bristle.",
  },
  Amaranthaceae: {
    production: "Tens of thousands of very small seeds per plant",
    dispersal: "Machinery, water, manure and contaminated crop seed",
    seedDescription: "Tiny, glossy, lens-shaped seed typical of the amaranth family, produced in huge numbers.",
  },
  Brassicaceae: {
    production: "Thousands of seeds per plant in pods",
    dispersal: "Pods split and drop seed; mud and equipment spread it further",
    seedDescription: "Small round to oval seed borne in a dry pod (silique), typically brown to reddish-brown.",
  },
  Polygonaceae: {
    production: "Hundreds to thousands of hard-coated seeds",
    dispersal: "Water, machinery and grain lots",
    seedDescription: "Hard, angular, often three-sided achene typical of the buckwheat family.",
  },
  Solanaceae: {
    production: "Thousands of seeds carried in berries",
    dispersal: "Birds and mammals that eat the fruit",
    seedDescription: "Small, flattened, disc-shaped seed embedded in a fleshy berry.",
  },
  Convolvulaceae: {
    production: "Dozens to hundreds of long-lived hard seeds",
    dispersal: "Crop seed lots, manure and equipment",
    seedDescription: "Angular, hard-coated seed with a thick seed coat that allows long-term soil persistence.",
  },
  Fabaceae: {
    production: "Hundreds of hard-coated seeds in pods",
    dispersal: "Pod shatter, livestock and machinery",
    seedDescription: "Hard-coated, bean-like seed borne in a dry, splitting pod.",
  },
  Malvaceae: {
    production: "Thousands of hard-coated seeds per plant",
    dispersal: "Gravity and harvest equipment",
    seedDescription: "Small, hard, kidney-shaped seed often borne in a segmented capsule.",
  },
  Euphorbiaceae: {
    production: "Hundreds to thousands of seeds per plant",
    dispersal: "Explosive capsule release, ants, and machinery",
    seedDescription: "Small, smooth to textured seed released explosively from a three-lobed capsule.",
  },
  Apiaceae: {
    production: "Thousands of seeds per umbel-bearing plant",
    dispersal: "Water, animals and mowing equipment",
    seedDescription:
      "Small, ribbed, flattened schizocarp typical of the carrot family, often splitting into two seed-like halves.",
  },
  Cyperaceae: {
    production: "Limited viable seed; spreads mostly by tubers",
    dispersal: "Tubers and rhizomes moved by tillage and water",
    seedDescription:
      "Small three-angled achene typical of the sedge family; below-ground tubers are the main propagule.",
  },
};

export function getSeedFact(commonName: string, family: string, plantType: string): SeedFact {
  const curated = CURATED[norm(commonName)];
  if (curated) return curated;
  const fam = FAMILY_FALLBACK[family];
  if (fam) return fam;
  return {
    production:
      plantType === "Monocot" ? "Thousands of seeds per seedhead" : "Hundreds to thousands of seeds per plant",
    dispersal: "Gravity near the parent plant, plus movement on machinery, animals and water",
    seedDescription: "No detailed seed description available for this species.",
  };
}
