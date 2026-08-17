// Seed production and dispersal facts used by the Seeds & Seed Banks learning
// modules. Values are typical published ranges (university extension / WSSA).

export interface SeedFact {
  production: string;
  dispersal: string;
}

const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '');

const CURATED: Record<string, SeedFact> = {
  waterhemp: { production: 'Up to 250,000 seeds per female plant', dispersal: 'Water, combines and tillage equipment; tiny seeds move easily in mud' },
  palmeramaranth: { production: '100,000-500,000 seeds per female plant', dispersal: 'Machinery, manure, contaminated crop seed and irrigation water' },
  redrootpigweed: { production: '100,000-200,000 seeds per plant', dispersal: 'Machinery, birds and livestock manure' },
  commonragweed: { production: '3,000-4,000 seeds per plant', dispersal: 'Gravity and machinery; seeds also move in mud and crop seed lots' },
  giantragweed: { production: '1,000-5,000 seeds per plant', dispersal: 'Gravity, water and equipment; large seeds cached by rodents' },
  dandelion: { production: '2,000-15,000 seeds per plant', dispersal: 'Wind (anemochory) on a feathery pappus' },
  horseweed: { production: '100,000-200,000 seeds per plant', dispersal: 'Wind; seeds can travel more than a half mile in air currents' },
  canadathistle: { production: '1,500-5,000 seeds per plant', dispersal: 'Wind by pappus, plus aggressive spread by creeping roots' },
  muskthistle: { production: '10,000-20,000 seeds per plant', dispersal: 'Wind by pappus; also on machinery and hay' },
  velvetleaf: { production: '2,000-17,000 seeds per plant', dispersal: 'Gravity and machinery; hard seed coat survives years in soil' },
  commoncocklebur: { production: '400-1,000 burs per plant (2 seeds each)', dispersal: 'Hooked burs cling to fur, clothing and equipment; also float in water' },
  commonburdock: { production: '6,000-16,000 seeds per plant', dispersal: 'Hooked burs on animal fur and clothing' },
  kochia: { production: '10,000-30,000 seeds per plant', dispersal: 'Tumbling whole plant scatters seed across long distances' },
  russianthistle: { production: '20,000-250,000 seeds per plant', dispersal: 'Tumbleweed dispersal; the plant breaks off and rolls with the wind' },
  giantfoxtail: { production: 'Up to 10,000 seeds per plant', dispersal: 'Bristly seedheads catch on fur, clothing and machinery' },
  greenfoxtail: { production: '5,000-10,000 seeds per plant', dispersal: 'Bristles catch on animals and equipment' },
  yellowfoxtail: { production: '2,000-8,000 seeds per plant', dispersal: 'Bristles catch on animals and equipment' },
  largecrabgrass: { production: 'Up to 150,000 seeds per plant', dispersal: 'Gravity, mowers, water and foot traffic' },
  barnyardgrass: { production: 'Up to 40,000 seeds per plant', dispersal: 'Water, waterfowl, and harvest equipment' },
  johnsongrass: { production: '20,000-80,000 seeds per plant', dispersal: 'Machinery, water and contaminated hay; also spreads by rhizomes' },
  yellownutsedge: { production: 'Few viable seeds; up to 5,000 tubers per plant', dispersal: 'Tubers moved by tillage, water and soil transport' },
  commonmilkweed: { production: '200-400 seeds per pod cluster', dispersal: 'Wind, on silky floss (coma)' },
  hempdogbane: { production: '1,000-3,000 seeds per plant', dispersal: 'Wind on tufted seeds; also spreads by creeping roots' },
  commonpokeweed: { production: '1,500-7,000 seeds per plant', dispersal: 'Birds eat the berries and deposit seeds far from the parent plant' },
  easternblacknightshade: { production: '2,000-8,000 seeds per plant', dispersal: 'Birds and mammals eat the berries; also moves with harvest equipment' },
  jimsonweed: { production: '500-30,000 seeds per plant', dispersal: 'Capsules split and drop seed; soil, manure and machinery move it further' },
  fieldbindweed: { production: '25-500 seeds per plant', dispersal: 'Seed in crop lots and manure; hard seed lasts decades, roots spread locally' },
  hedgebindweed: { production: '100-500 seeds per plant', dispersal: 'Gravity and machinery; deep rhizomes drive local spread' },
  wildbuckwheat: { production: '1,000-30,000 seeds per plant', dispersal: 'Harvest equipment and contaminated grain' },
  commonchickweed: { production: '2,500-15,000 seeds per plant', dispersal: 'Gravity, mud on tires and boots, and mowing' },
  shepherdspurse: { production: '4,000-40,000 seeds per plant', dispersal: 'Gravity and mud; sticky wet seeds hitchhike on equipment' },
  curlydock: { production: '3,000-40,000 seeds per plant', dispersal: 'Water (winged fruits float), wind, and livestock' },
  poisonhemlock: { production: '30,000-40,000 seeds per plant', dispersal: 'Water, mud, machinery and animals' },
  wildcarrot: { production: '1,000-40,000 seeds per plant', dispersal: 'Barbed fruits cling to animals and clothing' },
  wildparsnip: { production: '500-2,500 seeds per plant', dispersal: 'Wind over short distances, water, and mowing equipment' },
  garlicmustard: { production: '350-8,000 seeds per plant', dispersal: 'Water, footwear, wildlife and vehicles' },
  quackgrass: { production: '25-400 seeds per plant', dispersal: 'Mostly rhizome fragments moved by tillage; some seed in hay' },
  downybrome: { production: '100-5,000 seeds per plant', dispersal: 'Awns catch on fur and clothing; also in hay and machinery' },
  prickylettuce: { production: '10,000-50,000 seeds per plant', dispersal: 'Wind on a feathery pappus' },
  pricklylettuce: { production: '10,000-50,000 seeds per plant', dispersal: 'Wind on a feathery pappus' },
  commonlambsquarters: { production: '30,000-176,000 seeds per plant', dispersal: 'Gravity, machinery and manure; seeds stay viable for decades' },
  burcucumber: { production: '20-500 seeds per plant', dispersal: 'Water and machinery; spiny bur clusters cling to equipment' },
  longspinesandbur: { production: '1,000-2,000 seeds per plant', dispersal: 'Spiny burs cling to tires, fur and footwear' },
  witchgrass: { production: 'Up to 50,000 seeds per plant', dispersal: 'Whole seedhead breaks off and tumbles with the wind' },
  fallpanicum: { production: 'Up to 30,000 seeds per plant', dispersal: 'Machinery, water and gravity' },
  buffalobur: { production: '2,000-8,000 seeds per plant', dispersal: 'Spiny burs cling to livestock and equipment; plant also tumbles' },
  horsenettle: { production: '2,000-5,000 seeds per plant', dispersal: 'Birds and mammals eat the berries; roots spread locally' },
  hemp: { production: '1,000-3,000 seeds per plant', dispersal: 'Birds, water and machinery' },
};

const FAMILY_FALLBACK: Record<string, SeedFact> = {
  Asteraceae: { production: 'Several thousand seeds per plant', dispersal: 'Wind, on a feathery pappus attached to each seed' },
  Poaceae: { production: 'Thousands of seeds per seedhead', dispersal: 'Machinery, animals and gravity; awns and bristles aid attachment' },
  Amaranthaceae: { production: 'Tens of thousands of very small seeds per plant', dispersal: 'Machinery, water, manure and contaminated crop seed' },
  Brassicaceae: { production: 'Thousands of seeds per plant in pods', dispersal: 'Pods split and drop seed; mud and equipment spread it further' },
  Polygonaceae: { production: 'Hundreds to thousands of hard-coated seeds', dispersal: 'Water, machinery and grain lots' },
  Solanaceae: { production: 'Thousands of seeds carried in berries', dispersal: 'Birds and mammals that eat the fruit' },
  Convolvulaceae: { production: 'Dozens to hundreds of long-lived hard seeds', dispersal: 'Crop seed lots, manure and equipment' },
  Fabaceae: { production: 'Hundreds of hard-coated seeds in pods', dispersal: 'Pod shatter, livestock and machinery' },
  Malvaceae: { production: 'Thousands of hard-coated seeds per plant', dispersal: 'Gravity and harvest equipment' },
  Euphorbiaceae: { production: 'Hundreds to thousands of seeds per plant', dispersal: 'Explosive capsule release, ants, and machinery' },
  Apiaceae: { production: 'Thousands of seeds per umbel-bearing plant', dispersal: 'Water, animals and mowing equipment' },
  Cyperaceae: { production: 'Limited viable seed; spreads mostly by tubers', dispersal: 'Tubers and rhizomes moved by tillage and water' },
};

export function getSeedFact(commonName: string, family: string, plantType: string): SeedFact {
  const curated = CURATED[norm(commonName)];
  if (curated) return curated;
  const fam = FAMILY_FALLBACK[family];
  if (fam) return fam;
  return {
    production: plantType === 'Monocot' ? 'Thousands of seeds per seedhead' : 'Hundreds to thousands of seeds per plant',
    dispersal: 'Gravity near the parent plant, plus movement on machinery, animals and water',
  };
}
