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
  | "Seed dispersal"

export interface TraitDef {
  key: CompetitionTrait;
  short: string;
  desc: string;
}

export const TRAIT_DEFS: TraitDef[] = [
  { key: "Fast germination", short: "Fast germination", desc: "Sprouts within a day or two of hitting moist soil, claiming sunlight and space before slower seeds even wake up." },
  { key: "Aggressive canopy", short: "Aggressive canopy", desc: "Grows tall or spreads wide quickly, forming a leaf canopy that shades out shorter neighbors." },
  { key: "Allelopathy", short: "Allelopathy", desc: "Releases biochemicals from roots, leaves, or decaying tissue that suppress germination and growth of nearby plants." },
  { key: "Deep/wide roots", short: "Deep / wide roots", desc: "Roots reach far below the surface or spread laterally to tap water and nutrients other plants can't reach — and to regrow after damage." },
  { key: "Physical defense", short: "Physical defense", desc: "Spines, thorns, stiff hairs, or burs that make the plant hard to eat, hard to pull, and easy to disperse." },
  { key: "Chemical defense", short: "Chemical defense", desc: "Toxic or foul-tasting compounds in leaves and stems that discourage animals (and people) from eating the plant." },
  { key: "Seed dormancy", short: "Seed dormancy", desc: "Seeds can pause and wait in the soil for years until conditions are right, refilling the seed bank between control attempts." },
  { key: "High seed output", short: "High seed output", desc: "A single plant produces thousands — sometimes hundreds of thousands — of seeds, overwhelming any control program." },
  { key: "Seed dispersal", short: "Seed dispersal", desc: "Seeds travel — by wind, water, animals, burs, or machinery — spreading the species to new fields and habitats." },
];

export const COMPETITION_TRAITS: Record<string, CompetitionTrait[]> = {
  "annual-ryegrass": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Asian_copperleaf": ["Fast germination", "Seed dormancy", "High seed output"],
  "Asiatic_dayflower": ["Fast germination", "Seed dormancy", "High seed output"],
  "barnyardgrass": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  "Buffalobur": ["Fast germination", "Physical defense", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Burcucumber": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "canada-thistle": ["Fast germination", "Aggressive canopy", "Deep/wide roots", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "caraway": ["Deep/wide roots", "Seed dormancy", "High seed output"],
  "Catchweed_bedstraw": ["Fast germination", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "CommonChickweed": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "commonPokeweed": ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Common_Burdock": ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  "common_Cocklebur": ["Fast germination", "Aggressive canopy", "Allelopathy", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Common_Mallow": ["Fast germination", "Deep/wide roots", "Seed dormancy", "High seed output"],
  "common_Milkweed": ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "common-ragweed": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Common_teasel": ["Aggressive canopy", "Deep/wide roots", "Physical defense", "Seed dormancy", "High seed output"],
  "Corn_speedwell": ["Fast germination", "Seed dormancy", "High seed output"],
  "Curly_dock": ["Deep/wide roots", "Seed dormancy", "High seed output"],
  "Dandelion": ["Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Downy_brome": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Eastern_black_nightshade": ["Fast germination", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "False_London-rocket": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Field_bindweed": ["Aggressive canopy", "Deep/wide roots", "Allelopathy", "Seed dormancy", "High seed output"],
  "Field_Horsetail": ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dispersal"],
  "Field_Pennycress": ["Fast germination", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Foxtail_barley": ["Fast germination", "Aggressive canopy", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Garlic_mustard": ["Fast germination", "Aggressive canopy", "Allelopathy", "Chemical defense", "Seed dormancy", "High seed output"],
  "giant-foxtail": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  "giant-ragweed": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "golden-alexanders": ["Deep/wide roots", "Seed dormancy", "High seed output"],
  "Goosegrass": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "green-foxtail": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Ground_ivy": ["Fast germination", "Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Hedge_bindweed": ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output"],
  "Hemp_dogbane": ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Henbit_deadnettle": ["Fast germination", "Seed dormancy", "High seed output"],
  "Honey-vine_climbing_milkweed": ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Horsenettle": ["Deep/wide roots", "Physical defense", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Horseweed": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Jimsonweed": ["Fast germination", "Aggressive canopy", "Chemical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "johnsongrass": ["Fast germination", "Aggressive canopy", "Deep/wide roots", "Allelopathy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "kochia": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Ladysthumb": ["Fast germination", "Seed dormancy", "High seed output"],
  "lambsquarters": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "large-crabgrass": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Longspine_sandbur": ["Fast germination", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Marijuana": ["Fast germination", "Aggressive canopy", "Chemical defense", "Seed dormancy", "High seed output"],
  "Mouseear_chickweed": ["Fast germination", "Seed dormancy", "High seed output"],
  "Musk_thistle": ["Aggressive canopy", "Physical defense", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Nimblewill": ["Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output"],
  "palmer-amaranth": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "pennsylvania-smartweed": ["Fast germination", "Seed dormancy", "High seed output"],
  "Pinnate_tansymustard": ["Fast germination", "Seed dormancy", "High seed output"],
  "poison-hemlock": ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output"],
  "Prickly_lettuce": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Prickly_sida": ["Fast germination", "Physical defense", "Seed dormancy", "High seed output"],
  "Quackgrass": ["Fast germination", "Aggressive canopy", "Deep/wide roots", "Allelopathy", "Seed dormancy", "High seed output"],
  "Redroot_pigweed": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Russian_thistle": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Scouringrush": ["Aggressive canopy", "Deep/wide roots", "Chemical defense"],
  "Shattercane_Sorghums": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Shepherds_Purse": ["Fast germination", "Seed dormancy", "High seed output"],
  "Smooth_Groundcherry": ["Fast germination", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Smooth_Witchgrass": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Spotted_spurge": ["Fast germination", "Aggressive canopy", "Allelopathy", "Chemical defense", "Seed dormancy", "High seed output"],
  "Star_of_Bethlehem": ["Deep/wide roots", "Chemical defense", "Seed dormancy"],
  "Tall_morningglory": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Toothed_spurge": ["Fast germination", "Chemical defense", "Seed dormancy", "High seed output"],
  "velvetleaf": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Venice_mallow": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "volunteer-sunflower": ["Fast germination", "Aggressive canopy", "Allelopathy", "Seed dormancy", "High seed output"],
  "waterhemp": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Water_smartweed": ["Fast germination", "Seed dormancy", "High seed output"],
  "White_campion": ["Seed dormancy", "High seed output", "Seed dispersal"],
  "Wild_buckwheat": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Wild_Carrot": ["Deep/wide roots", "Seed dormancy", "High seed output", "Seed dispersal"],
  "Wild_Four-o'clock": ["Deep/wide roots", "Seed dormancy", "High seed output"],
  "Wild_mustard": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "wild-oat": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "wild-parsnip": ["Aggressive canopy", "Deep/wide roots", "Chemical defense", "Seed dormancy", "High seed output"],
  "Witchgrass": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "Woolly_cupgrass": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "yellow-foxtail": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
  "yellow-nutsedge": ["Fast germination", "Aggressive canopy", "Deep/wide roots", "Seed dormancy", "High seed output"],
  "yellow_Rocket": ["Fast germination", "Aggressive canopy", "Seed dormancy", "High seed output"],
};
