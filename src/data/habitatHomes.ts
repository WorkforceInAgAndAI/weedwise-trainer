// Habitat preference + first-person characteristics for the "Pick a House"
// habitat games (6-8, 9-12 and collegiate). Keyed by normalized common name.

export type HabitatId = 'cropland' | 'pasture' | 'roadside' | 'woodland' | 'wetland' | 'wet' | 'dry';

export interface HabitatHome {
  name: string;
  habitats: HabitatId[];
  traits: string[];
}

export const HABITAT_HOMES: HabitatHome[] = [
  {
    name: "Annual ryegrass",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I sprout fast on bare soil",
      "my shallow, fibrous roots grab hold of freshly turned ground",
      "I pump out seed even when the earth keeps getting churned up"
    ]
  },
  {
    name: "Asian copperleaf",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My seedlings shrug off heat and scarce moisture",
      "my foliage handles baking sun",
      "I germinate readily once the ground has been turned"
    ]
  },
  {
    name: "Asiatic dayflower",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My succulent stems hold their own water reserve",
      "I root wherever a stem node touches packed-down earth",
      "I keep growing even in soggy, heavy ground"
    ]
  },
  {
    name: "Barnyardgrass",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "I run C4 photosynthesis built for warm, soggy conditions",
      "I tolerate flooding and low-oxygen soil",
      "my roots sprout from stem nodes to anchor in hard-packed earth"
    ]
  },
  {
    name: "Buffalobur",
    habitats: [
      "dry"
    ],
    traits: [
      "My deep taproot reaches moisture far below a parched surface",
      "my spines keep grazers off open bare ground",
      "my foliage takes the heat without wilting"
    ]
  },
  {
    name: "Burcucumber",
    habitats: [
      "woodland",
      "wet"
    ],
    traits: [
      "My vigorous vine chases light gaps along the tree line",
      "I handle heavy, soggy soil without trouble",
      "my tendrils grip whatever's nearby to climb toward the sun"
    ]
  },
  {
    name: "Canada thistle",
    habitats: [
      "pasture",
      "dry"
    ],
    traits: [
      "My creeping underground roots outlast grazing and mowing",
      "I dig deep for moisture when the surface turns parched",
      "I resprout no matter how much the ground gets torn up"
    ]
  },
  {
    name: "Caraway",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My taproot is built for gravelly, packed-in soil",
      "my biennial habit shrugs off regular mowing",
      "once established, I barely need any water"
    ]
  },
  {
    name: "Catchweed bedstraw",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My weak, sprawling stems do fine in heavy, waterlogged soil",
      "my hooked bristles hitch a ride through freshly worked fields",
      "my shallow roots don't mind trampled ground"
    ]
  },
  {
    name: "Common burdock",
    habitats: [
      "dry"
    ],
    traits: [
      "My deep taproot carries me through drought",
      "as a rosette I settle happily into bare, exposed soil",
      "my burred seeds hitch a ride whenever the ground gets stirred up"
    ]
  },
  {
    name: "Common chickweed",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My shallow, fibrous roots are at home in packed soil",
      "I thrive when things turn cool and soggy",
      "my low, sprawling habit shakes off foot and equipment traffic"
    ]
  },
  {
    name: "Common cocklebur",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "I tolerate saturated, heavy ground without flinching",
      "my oversized cotyledons carry enough stored energy to push through a crusted surface",
      "my spiny burs travel easily through churned-up fields"
    ]
  },
  {
    name: "Common copperleaf",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I germinate quickly on bare, freshly tilled earth",
      "my foliage handles heat and low moisture",
      "my short life cycle fits right into a field that keeps getting turned over"
    ]
  },
  {
    name: "Common mallow",
    habitats: [
      "dry"
    ],
    traits: [
      "My deep taproot keeps me going through drought",
      "my low rosette shrugs off mowing and trampling",
      "I make do with poor, packed-in soil"
    ]
  },
  {
    name: "Common milkweed",
    habitats: [
      "pasture",
      "dry"
    ],
    traits: [
      "My spreading underground roots let me come back after grazing or mowing",
      "I dig deep for moisture when things turn parched",
      "my milky sap keeps browsers away"
    ]
  },
  {
    name: "Common Morningglory",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My hard seed coat survives being tilled under or stored in bare soil for years",
      "my twining vine climbs whatever structure is nearby to reach light",
      "once rooted, I barely need rain"
    ]
  },
  {
    name: "Common mullein",
    habitats: [
      "dry"
    ],
    traits: [
      "My deep taproot pulls me through drought",
      "my woolly leaves cut down on water loss",
      "as a rosette I settle easily into bare, open earth"
    ]
  },
  {
    name: "Common pokeweed",
    habitats: [
      "woodland",
      "dry"
    ],
    traits: [
      "My large taproot stores reserves I can spend colonizing freshly cleared ground",
      "I tolerate the dappled shade along a tree line",
      "birds carry my seed straight to the edge habitats I like"
    ]
  },
  {
    name: "Common ragweed",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My taproot digs in fast on bare soil",
      "I handle low moisture without slowing down",
      "my wind-borne seed spreads easily across open, freshly worked ground"
    ]
  },
  {
    name: "Common sunflower",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through dry spells",
      "I grow fast early on to outcompete neighbors on bare soil",
      "my leaves handle high heat"
    ]
  },
  {
    name: "Common teasel",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "My deep taproot tolerates soil that's saturated part of the year",
      "as a rosette I hold on in heavy, packed ground",
      "my tall stalk takes advantage of open, soggy sites"
    ]
  },
  {
    name: "Corn speedwell",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My shallow, spreading roots are built for packed-down soil",
      "my low growth shrugs off traffic",
      "I thrive when conditions turn cool and soggy"
    ]
  },
  {
    name: "Curly dock",
    habitats: [
      "pasture",
      "wet"
    ],
    traits: [
      "My deep taproot handles heavy, poorly drained ground",
      "I resprout from root fragments after grazing or mowing",
      "I tolerate standing water just fine"
    ]
  },
  {
    name: "Dandelion",
    habitats: [
      "pasture",
      "wet"
    ],
    traits: [
      "My deep taproot survives trampling and mowing",
      "my rosette habit shrugs off grazing pressure",
      "I do fine in moist, heavy soil"
    ]
  },
  {
    name: "Downy brome",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My shallow, fibrous roots take advantage of early-season moisture",
      "I germinate fast on bare ground",
      "I finish my life cycle before the worst of a dry spell hits"
    ]
  },
  {
    name: "Eastern black nightshade",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I germinate quickly in freshly worked soil",
      "my foliage tolerates low moisture",
      "my short life cycle keeps pace with a field that's regularly turned over"
    ]
  },
  {
    name: "Fall panicum",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis suited to hot, low-moisture fields",
      "my shallow roots establish quickly on bare ground",
      "I produce seed prolifically"
    ]
  },
  {
    name: "Field bindweed",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep, far-reaching root system taps subsoil moisture",
      "I regrow from root fragments left behind after tillage",
      "I hold up well through dry spells"
    ]
  },
  {
    name: "Field horsetail",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "My deep underground stems tolerate saturated, heavy ground",
      "my hollow stems are built for low-oxygen soil",
      "I spread vegetatively through soggy, freshly opened ground"
    ]
  },
  {
    name: "Field pennycress",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My winter-annual habit lets me take advantage of bare soil in fall and spring",
      "my shallow roots suit freshly worked ground",
      "my rosette handles cold and low moisture"
    ]
  },
  {
    name: "Foxtail barley",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "I tolerate salty, packed-in roadside soil",
      "my fibrous roots suit ground that's been recently scraped or graded",
      "my bunchgrass habit shrugs off dry conditions"
    ]
  },
  {
    name: "Garlic mustard",
    habitats: [
      "woodland",
      "dry"
    ],
    traits: [
      "As a rosette I tolerate shaded, freshly opened soil along a tree line",
      "my shallow roots colonize bare ground quickly",
      "my seedlings establish even in low light"
    ]
  },
  {
    name: "Giant foxtail",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 metabolism suited to hot, low-moisture fields",
      "I emerge quickly on bare ground",
      "my fibrous roots handle swings in moisture"
    ]
  },
  {
    name: "Giant ragweed",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My rapid, tall growth takes advantage of open, soggy fields",
      "my taproot tolerates heavy ground that floods seasonally",
      "my oversized cotyledons push right through a crusted surface"
    ]
  },
  {
    name: "Golden alexanders",
    habitats: [
      "pasture",
      "wet"
    ],
    traits: [
      "My fibrous roots tolerate moist, packed-in pasture soil",
      "I handle seasonal saturation without trouble",
      "my low-key growth habit suits ground that's grazed"
    ]
  },
  {
    name: "Goosegrass",
    habitats: [
      "dry"
    ],
    traits: [
      "I'm famous for tolerating hard, trampled soil",
      "my fibrous, shallow roots suit ground that's been walked or driven over",
      "I take heat and low moisture in stride"
    ]
  },
  {
    name: "Green foxtail",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis for hot fields",
      "I germinate fast on bare soil",
      "my fibrous roots tolerate low moisture"
    ]
  },
  {
    name: "Ground ivy",
    habitats: [
      "woodland",
      "wet"
    ],
    traits: [
      "My creeping stems root at every node, letting me hold on in packed, moist soil",
      "I tolerate the shade along a tree line",
      "my low mat resists being walked over"
    ]
  },
  {
    name: "Hedge bindweed",
    habitats: [
      "woodland",
      "dry"
    ],
    traits: [
      "My twining vine climbs neighboring plants to reach light at the tree line",
      "my deep underground stems tolerate freshly opened soil",
      "once established, I barely need rain"
    ]
  },
  {
    name: "Hemp",
    habitats: [
      "dry"
    ],
    traits: [
      "My deep taproot carries me through dry spells",
      "I grow fast to colonize bare, open soil",
      "I adapt easily to poor ground"
    ]
  },
  {
    name: "Hemp dogbane",
    habitats: [
      "pasture",
      "dry"
    ],
    traits: [
      "My deep, spreading underground roots let me survive grazing and mowing",
      "I hold up well through dry conditions",
      "my milky sap discourages browsers"
    ]
  },
  {
    name: "Henbit",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "As a winter annual I take advantage of bare fall soil",
      "my shallow roots suit freshly worked ground",
      "my low growth handles cold"
    ]
  },
  {
    name: "Honeyvine milkweed",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep perennial roots tolerate dry spells",
      "my twining habit lets me climb through a crop canopy for light",
      "I regrow from root buds after tillage"
    ]
  },
  {
    name: "Horsenettle",
    habitats: [
      "pasture",
      "dry"
    ],
    traits: [
      "My deep, spreading underground roots survive grazing and mowing",
      "my spines keep browsers away",
      "my taproot holds up through low moisture"
    ]
  },
  {
    name: "Horseweed",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My windblown seed colonizes bare, open ground easily",
      "my taproot tolerates low moisture",
      "my rosette adapts to whatever conditions a field throws at it"
    ]
  },
  {
    name: "Ivyleaf morningglory",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My hard seed coat survives being tilled under",
      "my twining vine climbs whatever crop structure is nearby",
      "once rooted, I handle low moisture just fine"
    ]
  },
  {
    name: "Jimsonweed",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My taproot grows fast in bare, freshly worked soil",
      "my broad leaves tolerate low moisture",
      "my toxic compounds keep grazers away in open fields"
    ]
  },
  {
    name: "Johnsongrass",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My underground stems let me regrow after tillage",
      "I run C4 metabolism suited to hot fields",
      "my root system tolerates low moisture"
    ]
  },
  {
    name: "Kochia",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep taproot gives me extreme tolerance for low moisture",
      "I break off and roll to spread seed across open ground",
      "I handle salty, hot conditions"
    ]
  },
  {
    name: "Lady's Thumb",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My shallow, fibrous roots tolerate packed-in soil",
      "I thrive in low-lying, moist spots",
      "I grow rapidly on soggy, freshly worked ground"
    ]
  },
  {
    name: "Lambsquarters",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep taproot tolerates low moisture",
      "I emerge quickly on bare, freshly tilled ground",
      "I adapt to a wide range of soils"
    ]
  },
  {
    name: "Large crabgrass",
    habitats: [
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis suited to hot, hard-packed soil",
      "my low, sprawling habit tolerates being walked on",
      "my fibrous roots colonize bare ground quickly"
    ]
  },
  {
    name: "Longspine sandbur",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "I'm well suited to sandy, low-moisture soil",
      "my spiny burs hitch rides along roadside corridors",
      "my low growth shrugs off mowing"
    ]
  },
  {
    name: "Mouseear chickweed",
    habitats: [
      "pasture",
      "wet"
    ],
    traits: [
      "My mat-forming, shallow roots tolerate packed, moist pasture soil",
      "my low growth resists grazing and trampling",
      "I spread by creeping stems"
    ]
  },
  {
    name: "Musk thistle",
    habitats: [
      "pasture",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through low moisture",
      "my spiny rosette resists grazing",
      "I colonize bare ground in pastures readily"
    ]
  },
  {
    name: "Nimblewill",
    habitats: [
      "woodland",
      "wet"
    ],
    traits: [
      "My shallow, spreading stems tolerate packed, moist, shaded soil",
      "my low mat suits ground that gets walked over near the tree line",
      "I handle shade well"
    ]
  },
  {
    name: "Palmer amaranth",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis and grow fast on bare, freshly tilled soil",
      "my deep taproot tolerates low moisture",
      "my seed bank has varied dormancy that keeps me coming back"
    ]
  },
  {
    name: "Pennsylvania smartweed",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "I tolerate saturated, low-oxygen soil",
      "my roots sprout from stem nodes to anchor in heavy, packed ground",
      "my jointed stems handle flooding"
    ]
  },
  {
    name: "Pinnate tansymustard",
    habitats: [
      "dry"
    ],
    traits: [
      "My taproot suits arid, freshly opened soil",
      "my quick winter-annual life cycle helps me dodge the worst of a dry spell",
      "my low rosette settles into bare ground easily"
    ]
  },
  {
    name: "Poison hemlock",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "I tolerate moist, low-lying, packed ground",
      "my deep taproot reaches subsurface water",
      "my toxic compounds keep grazers off soggy margins"
    ]
  },
  {
    name: "Prickly lettuce",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through low moisture",
      "my spiny leaf margins deter herbivory along exposed roadsides",
      "I colonize bare ground readily"
    ]
  },
  {
    name: "Prickly sida",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep taproot tolerates low moisture in tilled fields",
      "my spiny fruit holds up through field work",
      "my foliage takes the heat"
    ]
  },
  {
    name: "Quackgrass",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My extensive underground stems let me regrow after tillage",
      "my fibrous roots tolerate swings in moisture",
      "I adapt to a wide range of soils"
    ]
  },
  {
    name: "Redroot pigweed",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis and send down a deep taproot to handle low moisture",
      "I emerge fast on bare, freshly tilled ground",
      "I produce seed prolifically"
    ]
  },
  {
    name: "Russian thistle",
    habitats: [
      "dry"
    ],
    traits: [
      "My deep taproot gives me extreme tolerance for low moisture",
      "I break off and tumble to spread seed across open ground",
      "I handle salty soil"
    ]
  },
  {
    name: "Scouring-rush",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "My deep underground stems tolerate saturated, packed wetland soil",
      "my hollow, silica-rich stems suit low-oxygen ground",
      "I spread vegetatively"
    ]
  },
  {
    name: "Shattercane/Sorghums",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 metabolism suited to hot fields",
      "my deep roots tolerate low moisture",
      "I grow rapidly on freshly worked ground"
    ]
  },
  {
    name: "Shepherd's Purse",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My quick winter-annual life cycle takes advantage of bare, freshly worked soil",
      "my shallow roots handle swings in field moisture",
      "my rosette shrugs off cold"
    ]
  },
  {
    name: "Smooth groundcherry",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My underground roots regrow after tillage",
      "my foliage tolerates low moisture",
      "my husk-covered fruit protects my seed on freshly worked ground"
    ]
  },
  {
    name: "Spotted spurge",
    habitats: [
      "dry"
    ],
    traits: [
      "My prostrate mat shrugs off trampling and hard-packed soil",
      "my milky sap and low-moisture tolerance keep me going",
      "I thrive in bare, poor ground"
    ]
  },
  {
    name: "Star of Bethlehem",
    habitats: [
      "woodland",
      "wet"
    ],
    traits: [
      "My underground bulb stores reserves that carry me through seasonally soggy, packed soil",
      "I tolerate the shade at the tree line",
      "my early-season growth beats the competition to the punch"
    ]
  },
  {
    name: "Tall Hedge Mustard",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My taproot suits packed roadside soil",
      "I tolerate low moisture",
      "I colonize bare, open ground quickly"
    ]
  },
  {
    name: "Toothed spurge",
    habitats: [
      "dry"
    ],
    traits: [
      "My milky sap and low-moisture tolerance keep grazers away and keep me going",
      "my low, branching habit suits open, hard-packed ground",
      "I colonize bare soil fast"
    ]
  },
  {
    name: "Velvetleaf",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through low moisture",
      "my large, hairy leaves cut down on water loss",
      "I grow quickly on freshly tilled soil"
    ]
  },
  {
    name: "Venice mallow",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My taproot tolerates low moisture",
      "I germinate quickly on bare soil",
      "my hard seed coat survives field work and long dormancy"
    ]
  },
  {
    name: "Water smartweed",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "I tolerate fully saturated conditions, even standing water",
      "my roots sprout from nodes at or below the surface",
      "my internal air channels let me handle low-oxygen soil"
    ]
  },
  {
    name: "Waterhemp",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "I run C4 photosynthesis and tolerate heavy, soggy soil",
      "my lower stem nodes send out roots when conditions allow",
      "I produce seed prolifically on soggy, freshly worked ground"
    ]
  },
  {
    name: "White campion",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through low moisture",
      "my hairy leaves cut down on water loss along exposed roadsides",
      "I colonize bare ground easily"
    ]
  },
  {
    name: "Wild buckwheat",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My twining vine climbs crop structure to reach light",
      "once established, I tolerate low moisture",
      "my hard seed coat survives field work"
    ]
  },
  {
    name: "Wild carrot",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through low moisture",
      "my biennial rosette shrugs off regular mowing",
      "I colonize roadside soil readily"
    ]
  },
  {
    name: "Wild four-o'clock",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My deep, thickened taproot carries me through low moisture",
      "I tolerate packed roadside soil",
      "I regrow readily after mowing or field work"
    ]
  },
  {
    name: "Wild mustard",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I germinate quickly on bare, freshly tilled soil",
      "my shallow roots suit freshly worked ground",
      "my cool-season growth lets me dodge the worst of a dry spell"
    ]
  },
  {
    name: "Wild oat",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "My fibrous roots take advantage of early-season moisture",
      "I germinate fast on freshly worked soil",
      "my seed dormancy fits right into a field that's tilled regularly"
    ]
  },
  {
    name: "Wild parsnip",
    habitats: [
      "roadside",
      "dry"
    ],
    traits: [
      "My deep taproot carries me through low moisture",
      "my biennial rosette tolerates packed roadside soil",
      "my toxic sap keeps grazers away in exposed sites"
    ]
  },
  {
    name: "Witchgrass",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis suited to hot fields",
      "my fibrous roots establish quickly on bare soil",
      "I tolerate low moisture"
    ]
  },
  {
    name: "Woolly cupgrass",
    habitats: [
      "cropland",
      "wet"
    ],
    traits: [
      "My fibrous, shallow roots tolerate packed, moist soil",
      "I run C4 metabolism suited to warm-season, soggy fields",
      "I establish quickly on freshly worked ground"
    ]
  },
  {
    name: "Yellow foxtail",
    habitats: [
      "cropland",
      "dry"
    ],
    traits: [
      "I run C4 photosynthesis suited to hot fields",
      "I germinate fast on bare soil",
      "my fibrous roots tolerate low moisture"
    ]
  },
  {
    name: "Yellow nutsedge",
    habitats: [
      "wetland",
      "wet"
    ],
    traits: [
      "My underground tubers tolerate saturated, low-oxygen soil",
      "my extensive network of underground stems spreads through packed, soggy ground",
      "I run C4 metabolism suited to warm wetlands"
    ]
  },
  {
    name: "Yellow rocket",
    habitats: [
      "pasture",
      "wet"
    ],
    traits: [
      "My shallow, fibrous roots tolerate packed pasture soil",
      "I handle seasonal saturation without trouble",
      "my rosette resists grazing pressure"
    ]
  }
] as HabitatHome[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const BY_NAME = new Map<string, HabitatHome>(HABITAT_HOMES.map(h => [norm(h.name), h]));

export function getHabitatHome(commonName: string): HabitatHome | undefined {
  return BY_NAME.get(norm(commonName));
}

// Name aliases where the site's common name differs from the habitat list.
const ALIASES: Record<string, string> = {
  volunteersunflower: 'commonsunflower',
  henbitpurpledeadnettle: 'henbit',
  fallpanicumsmoothwitchgrass: 'fallpanicum',
  burcucumber: 'burcucumber',
};

export function resolveHabitatHome(commonName: string): HabitatHome | undefined {
  const key = norm(commonName);
  return BY_NAME.get(key) ?? BY_NAME.get(ALIASES[key] ?? '');
}

export const HABITAT_HOUSES: Array<{ id: HabitatId; label: string; blurb: string; shortBlurb: string }> = [
  { id: 'cropland', label: 'Cropland', blurb: 'Tilled crop fields that get worked and planted every year.', shortBlurb: 'Annually tilled, planted crop fields.' },
  { id: 'pasture', label: 'Pasture', blurb: 'Grazed and mowed grassland where livestock feed.', shortBlurb: 'Grazed, mowed grassland.' },
  { id: 'roadside', label: 'Roadside', blurb: 'Gravelly, salty, mowed strips along roads and ditches.', shortBlurb: 'Gravelly, mowed road margins.' },
  { id: 'woodland', label: 'Woodland Edge', blurb: 'Shady tree lines and fencerows with dappled light.', shortBlurb: 'Shaded tree lines and fencerows.' },
  { id: 'wetland', label: 'Wetland', blurb: 'Saturated, low-oxygen ground that floods for part of the year.', shortBlurb: 'Saturated, seasonally flooded ground.' },
  { id: 'wet', label: 'Wet & Compacted', blurb: 'Heavy, poorly drained soil that stays soggy and packed down.', shortBlurb: 'Heavy, soggy, packed soil.' },
  { id: 'dry', label: 'Dry & Disturbed', blurb: 'Bare, hot, hard-packed ground that keeps getting torn up.', shortBlurb: 'Bare, hot, disturbed ground.' },
];
