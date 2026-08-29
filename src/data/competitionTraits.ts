// Survival / competition traits per weed (used by the 6-8 Weed Competitors
// learning module section and the 6-8 Weed Competitors practice game).
export type CompetitionTrait =
  | "Fast germination"
  | "Aggressive canopy"
  | "Allelopathy"
  | "Deep/wide roots"
  | "Physical defense"
  | "Chemical defense"
  | "Seed dormancy"
  | "High seed output"
  | "Seed dispersal";

export interface TraitDef {
  key: CompetitionTrait;
  short: string;
  desc: string;
}

export const TRAIT_DEFS: TraitDef[] = [
  {
    key: "Fast germination",
    short: "Fast germination",
    desc: "Sprouts within a day or two of hitting moist soil, claiming sunlight and space before slower seeds even wake up.",
  },
  {
    key: "Aggressive canopy",
    short: "Aggressive canopy",
    desc: "Grows tall or spreads wide quickly, forming a leaf canopy that shades out shorter neighbors.",
  },
  {
    key: "Allelopathy",
    short: "Allelopathy",
    desc: "Releases biochemicals from roots, leaves, or decaying tissue that suppress germination and growth of nearby plants.",
  },
  {
    key: "Deep/wide roots",
    short: "Deep / wide roots",
    desc: "Roots reach far below the surface or spread laterally to tap water and nutrients other plants can't reach — and to regrow after damage.",
  },
  {
    key: "Physical defense",
    short: "Physical defense",
    desc: "Spines, thorns, stiff hairs, or burs that make the plant hard to eat, hard to pull, and easy to disperse.",
  },
  {
    key: "Chemical defense",
    short: "Chemical defense",
    desc: "Toxic or foul-tasting compounds in leaves and stems that discourage animals (and people) from eating the plant.",
  },
  {
    key: "Seed dormancy",
    short: "Seed dormancy",
    desc: "Seeds can pause and wait in the soil for years until conditions are right, refilling the seed bank between control attempts.",
  },
  {
    key: "High seed output",
    short: "High seed output",
    desc: "A single plant produces thousands — sometimes hundreds of thousands — of seeds, overwhelming any control program.",
  },
  {
    key: "Seed dispersal",
    short: "Seed dispersal",
    desc: "Seeds travel — by wind, water, animals, burs, or machinery — spreading the species to new fields and habitats.",
  },
];

export const COMPETITION_TRAITS: Record<string, CompetitionTrait[]> = [
  {
    commonName: "Annual Ryegrass",
    scientificName: "Lolium multiflorum",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Asian Copperleaf",
    scientificName: "Acalypha australis",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Asiatic Dayflower",
    scientificName: "Commelina communis",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Barnyardgrass",
    scientificName: "Echinochloa crus-galli",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Buffalobur",
    scientificName: "Solanum rostratum",
    traits: [
      "Fast germination",
      "Physical defense",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Burcucumber",
    scientificName: "Sicyos angulatus",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Canada Thistle",
    scientificName: "Cirsium arvense",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Deep/wide roots",
      "Allelopathy",
      "Physical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Caraway",
    scientificName: "Carum carvi",
    traits: ["Deep/wide roots", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Catchweed Bedstraw",
    scientificName: "Galium aparine",
    traits: ["Fast germination", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Common Burdock",
    scientificName: "Arctium minus",
    traits: ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Common Chickweed",
    scientificName: "Stellaria media",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Physical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Common Cocklebur",
    scientificName: "Xanthium strumarium",
    traits: ["Fast germination", "Deep/wide roots", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Common Copperleaf",
    scientificName: "Acalypha rhomboidea",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Common Mallow",
    scientificName: "Malva neglecta",
    traits: [
      "Aggressive canopy",
      "Deep/wide roots",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Common Milkweed",
    scientificName: "Asclepias syriaca",
    traits: ["Aggressive canopy", "Deep/wide roots", "Physical defense", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Common Morningglory",
    scientificName: "Ipomoea purpurea",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Common Mullein",
    scientificName: "Verbascum thapsus",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Common Pokeweed",
    scientificName: "Phytolacca americana",
    traits: [
      "Aggressive canopy",
      "Deep/wide roots",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Common Ragweed",
    scientificName: "Ambrosia artemisiifolia",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Common Sunflower",
    scientificName: "Helianthus annuus",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Common Teasel",
    scientificName: "Dipsacus fullonum",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Corn Speedwell",
    scientificName: "Veronica arvensis",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Curly Dock",
    scientificName: "Rumex crispus",
    traits: ["Deep/wide roots", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Dandelion",
    scientificName: "Taraxacum officinale",
    traits: ["Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Downy Brome",
    scientificName: "Bromus tectorum",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Eastern Black Nightshade",
    scientificName: "Solanum emulans",
    traits: ["Fast germination", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Fall Panicum",
    scientificName: "Panicum dichotomiflorum",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Field Bindweed",
    scientificName: "Convolvulus arvensis",
    traits: ["Aggressive canopy", "Deep/wide roots", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Field Horsetail",
    scientificName: "Equisetum arvense",
    traits: ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dispersal"],
  },
  {
    commonName: "Field Pennycress",
    scientificName: "Thlaspi arvense",
    traits: ["Fast germination", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Foxtail Barley",
    scientificName: "Hordeum jubatum",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Physical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Garlic Mustard",
    scientificName: "Alliaria petiolata",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
    ],
  },
  {
    commonName: "Giant Foxtail",
    scientificName: "Setaria faberi",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Giant Ragweed",
    scientificName: "Ambrosia trifida",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Golden Alexanders",
    scientificName: "Zizia aurea",
    traits: ["Deep/wide roots", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Goosegrass",
    scientificName: "Eleusine indica",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Green Foxtail",
    scientificName: "Setaria viridis",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Ground Ivy",
    scientificName: "Glechoma hederacea",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Deep/wide roots",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Hedge Bindweed",
    scientificName: "Calystegia sepium",
    traits: ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Hemp",
    scientificName: "Cannabis sativa",
    traits: ["Fast germination", "Aggressive canopy", "Chemical defense", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Hemp Dogbane",
    scientificName: "Apocynum cannabinum",
    traits: ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Henbit",
    scientificName: "Lamium amplexicaule",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Honeyvine Milkweed",
    scientificName: "Cynanchum laeve",
    traits: ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Horsenettle",
    scientificName: "Solanum carolinense",
    traits: [
      "Deep/wide roots",
      "Physical defense",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Horseweed",
    scientificName: "Erigeron canadensis",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Ivyleaf Morningglory",
    scientificName: "Ipomoea hederacea",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Jimsonweed",
    scientificName: "Datura stramonium",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Johnsongrass",
    scientificName: "Sorghum halepense",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Deep/wide roots",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Kochia",
    scientificName: "Bassia scoparia",
    traits: ["Fast germination", "Aggressive canopy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Lady's Thumb",
    scientificName: "Persicaria maculosa",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Lambsquarters",
    scientificName: "Chenopodium album",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Large Crabgrass",
    scientificName: "Digitaria sanguinalis",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Longspine Sandbur",
    scientificName: "Cenchrus longispinus",
    traits: ["Fast germination", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Mouseear Chickweed",
    scientificName: "Cerastium fontanum",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Musk Thistle",
    scientificName: "Carduus nutans",
    traits: ["Aggressive canopy", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Nimblewill",
    scientificName: "Muhlenbergia schreberi",
    traits: ["Aggressive canopy", "Deep/wide roots", "High seed output"],
  },
  {
    commonName: "Palmer Amaranth",
    scientificName: "Amaranthus palmeri",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Pennsylvania Smartweed",
    scientificName: "Persicaria pensylvanica",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Pinnate Tansymustard",
    scientificName: "Descurainia pinnata",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Poison Hemlock",
    scientificName: "Conium maculatum",
    traits: ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Prickly Lettuce",
    scientificName: "Lactuca serriola",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Prickly Sida",
    scientificName: "Sida spinosa",
    traits: ["Fast germination", "Physical defense", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Quackgrass",
    scientificName: "Elytrigia repens",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Deep/wide roots",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
    ],
  },
  {
    commonName: "Redroot Pigweed",
    scientificName: "Amaranthus retroflexus",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Russian Thistle",
    scientificName: "Salsola tragus",
    traits: ["Fast germination", "Aggressive canopy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Scouring-rush",
    scientificName: "Equisetum hyemale",
    traits: ["Aggressive canopy", "Deep/wide roots", "Chemical defense"],
  },
  {
    commonName: "Shattercane / Sorghums",
    scientificName: "Sorghum bicolor",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Seed dormancy",
      "High seed output",
      "Seed dispersal",
    ],
  },
  {
    commonName: "Shepherd's Purse",
    scientificName: "Capsella bursa-pastoris",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Smooth Groundcherry",
    scientificName: "Physalis longifolia",
    traits: ["Fast germination", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Spotted Spurge",
    scientificName: "Euphorbia maculata",
    traits: [
      "Fast germination",
      "Aggressive canopy",
      "Allelopathy",
      "Chemical defense",
      "Seed dormancy",
      "High seed output",
    ],
  },
  {
    commonName: "Star of Bethlehem",
    scientificName: "Ornithogalum umbellatum",
    traits: ["Deep/wide roots", "Chemical defense", "Seed dormancy"],
  },
  {
    commonName: "Tall Hedge Mustard",
    scientificName: "Sisymbrium loeselii",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Toothed Spurge",
    scientificName: "Euphorbia dentata",
    traits: ["Fast germination", "Chemical defense", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Velvetleaf",
    scientificName: "Abutilon theophrasti",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Venice Mallow",
    scientificName: "Hibiscus trionum",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Water Smartweed",
    scientificName: "Persicaria amphibia",
    traits: ["Seed dormancy", "High seed output"],
  },
  {
    commonName: "Waterhemp",
    scientificName: "Amaranthus tuberculatus",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "White Campion",
    scientificName: "Silene latifolia",
    traits: ["Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Wild Buckwheat",
    scientificName: "Fallopia convolvulus",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Wild Carrot",
    scientificName: "Daucus carota",
    traits: ["Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  },
  {
    commonName: "Wild Four-o'clock",
    scientificName: "Mirabilis nyctaginea",
    traits: ["Deep/wide roots", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Wild Mustard",
    scientificName: "Rhamphospermum arvense",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Wild Oat",
    scientificName: "Avena fatua",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Wild Parsnip",
    scientificName: "Pastinaca sativa",
    traits: ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Witchgrass",
    scientificName: "Panicum capillare",
    traits: ["Fast germination", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Woolly Cupgrass",
    scientificName: "Eriochloa villosa",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Yellow Foxtail",
    scientificName: "Setaria pumila",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
  {
    commonName: "Yellow Nutsedge",
    scientificName: "Cyperus esculentus",
    traits: ["Fast germination", "Aggressive canopy", "Allelopathy", "Deep/wide roots"],
  },
  {
    commonName: "Yellow Rocket",
    scientificName: "Barbarea vulgaris",
    traits: ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  },
];
