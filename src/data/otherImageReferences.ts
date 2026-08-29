/**
 * Citations for non-weed images: control methods, botany terms,
 * crop images, and herbicide injury photos.
 * Any image without a listed citation defaults to iNaturalist.
 */

import { INATURALIST_DEFAULT_CITATION } from './imageReferences';

export interface CitedImage {
  label: string;
  image: string;
  citation: string;
}

const INAT = INATURALIST_DEFAULT_CITATION;

/* ------------------------- Control method images ------------------------- */

export const CONTROL_METHOD_REFS: CitedImage[] = [
  { label: 'Hand Weeding', image: 'handweeding_1.jpg', citation: 'Victory Lawnscape. (n.d.). Weekly bed weeding. https://victorylawn.com/services/weekly-bed-weeding/' },
  { label: 'Cover Crops', image: 'covercrops_1.jpg', citation: 'Carroll County Grown. (n.d.). What is a cover crop? https://carrollgrown.org/what-is-a-cover-crop/' },
  { label: 'Tillage', image: 'tillage_1.jpg', citation: 'Richmond Brothers Equipment. (2024). The benefits of deep tillage for soil health. Richmond Brothers Equipment' },
  { label: 'Chemical Methods (Herbicides)', image: 'chemicalmethods_1.jpg', citation: 'Jones, E., Rozeboom, P., Vos, D., & Alms, J. (2024, April 29). Preemergence herbicide application considerations for 2024. SDSU Extension. https://extension.sdstate.edu/preemergence-herbicide-application-considerations-2024' },
  { label: 'Cultural Control', image: 'culturalcontrol_1.jpg', citation: 'Moore, M. (2020, August 3). The benefits of crop rotation and diversity. U.S. Farmers & Ranchers in Action. https://usfarmersandranchers.org/stories/sustainable-food-production/the-benefits-of-crop-rotation-and-diversity/' },
  { label: 'Biological Control', image: 'biologicalcontrol_1.jpg', citation: 'Curran, W. (n.d.). Biological control of weeds. GROW—Getting Rid of Weeds. https://growiwm.org/biological-control/' },
  { label: 'Chemical Control (Herbicides)', image: 'chemicalcontrol_1.jpg', citation: 'Vogt, W. (2023, February 23). Free report targets farm sprayer prep. Farm Progress. https://www.farmprogress.com/farming-equipment/free-report-targets-farm-sprayer-prepc' },
  { label: 'Integrated Approach', image: 'integratedapproach_1.jpg', citation: 'Kansas Department of Agriculture. (n.d.). Integrated weed management. https://www.agriculture.ks.gov/divisions-programs/plant-protection-weed-control/noxious-weed-control-program/integrated-weed-management' },
  { label: 'Mechanical Control', image: 'mechanicalcontrol_1.jpg', citation: 'Boak, A. (2024, August 27). Salford introduces revolutionary precision row crop cultivator at Farm Progress Show. Salford Group Inc. https://salfordgroup.com/blog/salford-introduces-revolutionary-precision-row-crop-cultivator-at-farm-progress-show/' },
];

/* -------------------------- Botany term images --------------------------- */

export const BOTANY_TERM_REFS: CitedImage[] = [
  { label: 'Petiole', image: 'petiole_.jpg', citation: 'Iowa State University Plant & Insect Diagnostic Clinic. (n.d.). Oak wilt sampling guidelines. Iowa State University Extension and Outreach. https://yardandgarden.extension.iastate.edu/pidc/oak-wilt-sampling' },
  { label: 'Blade', image: 'blade_.jpg', citation: 'LawnVista. (2026). What is a broadleaf weed? Identification, life cycle and lawn control. https://lawnvista.com/blog/weeds-weed-control/what-is-a-broadleaf-weed/' },
  { label: 'Lobes', image: 'lobes_.jpg', citation: 'Florida Native Plant Society. (n.d.). Lobe. https://flnps.org/buttermilk/documents/glossary/lobe.htm' },
  { label: 'Node', image: 'node_.jpg', citation: 'Reicher, Z., Bigelow, C., Patton, A., & Voigt, T. (n.d.). Control of broadleaf weeds in home lawns. Purdue University Extension. https://ag.purdue.edu/department/hla/extension/extension-publications-library/ext-pubs/ay-9-w.html' },
  { label: 'Whorled', image: 'whorled_.jpg', citation: 'Hartzler, B. (2018, May 25). Catchweed bedstraw. Iowa State University Extension and Outreach. https://crops.extension.iastate.edu/encyclopedia/catchweed-bedstraw' },
  { label: 'Sheath', image: 'sheath_.jpg', citation: 'Mangold, J., Orloff, N., & Lavin, M. (2025). Grass identification basics (MT201402AG). Montana State University Extension. https://extension-store.montana.edu/montguides/grass-identification-basics' },
  { label: 'Ligule', image: 'ligule_.jpg', citation: 'Ibrahim, K. M., & Peterson, P. M. (2014). Ligule types, shapes, and margins [Figure 4]. ResearchGate. https://www.researchgate.net/figure/Ligule-types-shapes-and-margins_fig4_274665562' },
  { label: 'Auricles', image: 'auricles_.jpg', citation: 'Mangold, J., Orloff, N., & Lavin, M. (2025). Grass identification basics (MT201402AG). Montana State University Extension. https://extension-store.montana.edu/montguides/grass-identification-basics' },
  { label: 'Culm', image: 'culm_.jpg', citation: 'Master Gardeners of Northern Virginia. (2021). Culm. https://mgnv.org/plants/glossary/culm/' },
  { label: 'Bracts', image: 'bracts_.jpg', citation: 'Authentic Wisconsin. (n.d.). Musk thistle. https://authenticwisconsin.com/musk_thistle.html' },
  { label: 'Raceme', image: 'raceme_.jpg', citation: 'Crosby Holme Grown. (n.d.). Botany five – Inflorescences. https://crosbyholmegrown.uk/resources/description-classification-botany/botany/botany-five-inflorescences/' },
  { label: 'Umbel', image: 'umbel_.jpg', citation: 'Crosby Holme Grown. (n.d.). Botany five – Inflorescences. https://crosbyholmegrown.uk/resources/description-classification-botany/botany/botany-five-inflorescences/' },
  { label: 'Panicle', image: 'panicle_.jpg', citation: 'Crosby Holme Grown. (n.d.). Botany five – Inflorescences. https://crosbyholmegrown.uk/resources/description-classification-botany/botany/botany-five-inflorescences/' },
  { label: 'Pappus', image: 'pappus_.jpg', citation: 'Cactus Art. (n.d.). Pappus. https://www.cactus-art.biz/note-book/Dictionary/Dictionary_P/dictionary_pappus.htm' },
  { label: 'Ocrea', image: 'ocrea_.jpg', citation: 'Native Plant Trust. (2026). Persicaria setacea (bristly smartweed). Go Botany. https://gobotany.nativeplanttrust.org/species/persicaria/setacea/' },
  { label: 'Bolting', image: 'bolting_.jpg', citation: INAT },
  { label: 'Achene', image: 'ahcene_.jpg', citation: 'Ohio Plants. (2026). Fruits—achene. Ohio Plants. https://ohioplants.org/fruits-achene/' },
  { label: 'Nutlet', image: 'nutlet_.jpg', citation: 'Natural Resources Conservation Service. (2026). PLANTS Database. U.S. Department of Agriculture. Retrieved August 24, 2026, from https://plants.sc.egov.usda.gov/plant-profile/GLHE2' },
  { label: 'Capsule', image: 'capsule_.jpg', citation: INAT },
  { label: 'Tuber', image: 'tuber_.jpg', citation: 'Purdue University. (2024, July 19). Weed spotlight: Yellow nutsedge. Facts for Fancy Fruit. https://fff.hort.purdue.edu/article/weed-spotlight-yellow-nutsedge/' },
  { label: 'Rhizome', image: 'rhizome_.jpg', citation: 'Cornell University College of Agriculture and Life Sciences. (n.d.). Quackgrass. Cornell University. https://cals.cornell.edu/weed-science/weed-profiles/quackgrass' },
  { label: 'Stolon', image: 'stolon_.jpg', citation: 'Chandran, R. (2018, August 21). Ground ivy—Weed of the week. West Virginia University Extension. https://extension.wvu.edu/lawn-gardening-pests/news/2018/08/21/ground-ivy-weed-of-the-week' },
  { label: 'Taproot', image: 'taproot_.jpg', citation: 'Blackburn, J. (2019, June 27). Weed of the month: Curly dock. Brooklyn Botanic Garden. https://www.bbg.org/article/weed_of_the_month_curly_dock' },
  { label: 'Dioecious', image: 'dioecious_.jpg', citation: 'University of California Agriculture and Natural Resources. (2019, January 21). Sixty second science snippet: January 2019. Notes in the Margins: Agronomy and Weed Science Musings. https://ucanr.edu/blog/notes-margins-agronomy-and-weed-science-musings/article/sixty-second-science-snippet-january' },
  { label: 'Monoecious', image: 'monoecious_.jpg', citation: INAT },
  { label: 'Perfect Flower', image: 'perfectflower_.jpg', citation: 'Gneet. (n.d.). Biology. https://www.gneet.com/biology/b22/64.html' },
];

/* ------------------------------ Crop images ------------------------------ */

export interface CropRefGroup {
  crop: string;
  images: CitedImage[];
}

const CROPLINKS: Record<string, [string, string]> = {
  Alfalfa: [
    'https://lgpress.clemson.edu/publication/alfalfa-establishment-and-management/',
    'https://gardenerspath.com/plants/vegetables/grow-alfalfa/',
  ],
  Barley: [
    'https://www.britannica.com/plant/barley-cereal',
    'https://www.plantgoodseed.com/products/robust-barley-seeds-hordeum-vulgare?variant=45006011302140',
  ],
  Canola: [
    'https://www.canolacouncil.org/canola-watch/2018/09/12/when-is-canola-ready-to-straight-combine/',
    'https://www.producer.com/news/canola-growing-season-in-review/',
  ],
  Corn: ['iNaturalist', 'https://nefb.wordpress.com/tag/field-corn/'],
  Cotton: ['iNaturalist', 'iNaturalist'],
  'Field Peas': [
    'https://www.ndsu.edu/agriculture/ag-hub/ag-topics/crop-production/crops/field-pea',
    'https://stock.adobe.com/search?k=field+peas',
  ],
  Millet: ['iNaturalist', 'iNaturalist'],
  Mungbean: ['iNaturalist', 'https://www.epicgardening.com/mung-bean-plant/'],
  Oats: [
    'https://www.istockphoto.com/search/2/image-film?phrase=green+oat+field',
    'https://practicalfarmers.org/research/oat-variety-trial-2024/',
  ],
  Potatoes: [
    'https://extension.sdstate.edu/potatoes-how-grow-it',
    'https://fryd.app/en/magazine/harvesting-potatoes-this-is-the-right-time',
  ],
  Pumpkins: [
    'https://californiagrown.org/blog/how-pumpkins-are-grown/',
    'https://www.mazezilla.com/pumpkin-patch',
  ],
  Rice: ['iNaturalist', 'iNaturalist'],
  Sorghum: ['iNaturalist', 'iNaturalist'],
  Soybean: ['iNaturalist', 'iNaturalist'],
  Sugarcane: ['iNaturalist', 'iNaturalist'],
  Wheat: ['iNaturalist', 'iNaturalist'],
};

export const CROP_REFS: CropRefGroup[] = Object.entries(CROPLINKS).map(([crop, links]) => ({
  crop,
  images: links.map((link, i) => ({
    label: crop,
    image: `crop_${i + 1}.jpg`,
    citation: link === 'iNaturalist' ? INAT : link,
  })),
}));

/* ----------------------- Weed herbicide injury photos -------------------- */

export const WEED_INJURY_REFS: CitedImage[] = [
  { label: 'ACCase inhibitors', image: 'G1_gr.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/accase-hg-1-herbicide-injury-in-corn' },
  { label: 'ALS inhibitors', image: 'G2_gr.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/als-hg-2-herbicide-injury-in-corn' },
  { label: 'HPPD inhibitors', image: 'G27_gr.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/hppd-hg-27-inhibitor-herbicide-injury-in-corn' },
  { label: 'Microtubule inhibitors (VLCFA-independent)', image: 'G26_gr.jpg', citation: 'https://content.ces.ncsu.edu/vlcfa-inhibiting-herbicide-injury-on-soybean' },
  { label: 'ALS inhibitors', image: 'G2_br.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/acetolactate-synthase-als-inhibitor-hg-2-herbicide-injury-in-soybean' },
  { label: 'Synthetic auxins', image: 'G4_br.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/plant-growth-regulator-hg-4-herbicide-injury-in-soybean' },
  { label: 'PSII inhibitors — serine binding', image: 'G6_br.jpg', citation: 'https://www.corn-states.com/app/uploads/2020/08/5017_S4_BA_Soybean-Herbicide-Injury.pdf' },
  { label: 'EPSPS inhibitors', image: 'G9_br.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/epsps-inhibitor-hg-9-herbicide-injury-in-soybean' },
  { label: 'Glutamine synthetase inhibitors', image: 'G10_br.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/glutamine-synthetase-inhibitor-hg-10-herbicide-injury-in-soybean' },
  { label: 'PPO inhibitors (POST)', image: 'G14_br.jpg', citation: 'https://crops.extension.iastate.edu/cropnews/2017/05/evaluating-herbicide-injury-soybean' },
  { label: 'Auxin transport inhibitors', image: 'G19_br.jpg', citation: 'https://www.agriculture.com/crops/pesticides/what-causes-cupped-leaves-other-than-dicamba' },
  { label: 'PSI electron diverters', image: 'G22_br.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/photosystem-i-electron-diverter-hg-22-herbicide-injury-in-soybean' },
  { label: 'PSI electron diverters', image: 'G22_gr.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/photosystem-i-electron-diverter-hg-22-herbicide-injury-in-corn' },
  { label: 'Microtubule assembly inhibitors', image: 'G3_gr.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/root-inhibitor-hg-3-herbicide-injury-in-corn' },
  { label: 'Lipid synthesis inhibitors — not ACCase', image: 'G8_gr.jpg', citation: 'https://extension.sdstate.edu/sites/default/files/2019-09/S-0003-42-Corn.pdf' },
  { label: 'VLCFA inhibitors (chloroacetamides)', image: 'G15_gr.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/seedling-shoot-growth-inhibitor-hg-15-herbicide-injury-in-corn' },
  { label: 'VLCFA inhibitors (oxyacetamides/isoxazolines)', image: 'G23_gr.jpg', citation: 'https://btny.purdue.edu/Extension/Weeds/HerbInj2/InjuryMOA3.html' },
  { label: 'PSII inhibitors — urea/amide binding', image: 'G5_br.jpg', citation: 'https://cropprotectionnetwork.org/encyclopedia/photosystem-ii-inhibitor-hg-5-herbicide-injury-in-soybean' },
  { label: 'DXP synthase inhibitors (carotenoid — MEP pathway)', image: 'G13_gr.jpg', citation: 'https://fieldcropnews.com/2012/07/herbicide-injury-scenarios-in-corn-diagnostic-day-plots/' },
  { label: 'DXP synthase inhibitors (carotenoid — MEP pathway)', image: 'G13_br.jpg', citation: 'https://blogs.cornell.edu/s1084hemp/resources/images/herbicide-damage/' },
];

/* ----------------------- Crop herbicide injury photos -------------------- */

export interface CropInjuryRef {
  herbicide: string;
  crop: string;
  activeIngredient: string;
  citation: string;
}

export const CROP_INJURY_REFS: CropInjuryRef[] = [
  { herbicide: 'Growth regulator (Group 4)', crop: 'Corn', activeIngredient: '2,4-D', citation: 'https://cropprotectionnetwork.org/encyclopedia/plant-growth-regulator-hg-4-herbicide-injury-in-corn' },
  { herbicide: 'Growth regulator (Group 4)', crop: 'Corn', activeIngredient: 'Dicamba (Clarity/Status)', citation: 'https://www.goldenharvestseeds.com/agronomy/articles/abnormal-ear-development-corn' },
  { herbicide: 'Growth regulator (Group 4)', crop: 'Soybean', activeIngredient: 'Dicamba (XtendiMax, Engenia)', citation: 'https://www.dtnpf.com/agriculture/web/ag/news/article/2018/06/28/distinguish-dicamba-injury-problems' },
  { herbicide: 'Growth regulator (Group 4)', crop: 'Soybean', activeIngredient: '2,4-D (Enlist One)', citation: 'https://fieldcropnews.com/2011/07/herbicide-injury-scenarios-in-soybeans-and-edible-beans-2011/' },
  { herbicide: 'HPPD inhibitor (Group 27)', crop: 'Corn', activeIngredient: 'Mesotrione (Callisto)', citation: 'https://www.redpowermagazine.com/forums/topic/114989-chemical-damage-to-corn-callisto/' },
  { herbicide: 'HPPD inhibitor (Group 27)', crop: 'Corn', activeIngredient: 'Isoxaflutole (Balance Flexx)', citation: 'https://fieldcropnews.com/2012/07/herbicide-injury-scenarios-in-corn-diagnostic-day-plots/' },
  { herbicide: 'HPPD inhibitor (Group 27)', crop: 'Soybean', activeIngredient: 'Mesotrione (Callisto)', citation: 'https://www.country-guide.ca/crops/pest-patrol-crop-injury-from-herbicide-residues-more-common-in-2020/' },
  { herbicide: 'Long-chain fatty acid inhibitor (Group 15)', crop: 'Corn', activeIngredient: 'S-metolachlor (Dual II Magnum)', citation: 'https://ipm.missouri.edu/croppest/2019/5/uglyCorn/' },
  { herbicide: 'Long-chain fatty acid inhibitor (Group 15)', crop: 'Corn', activeIngredient: 'Acetochlor (Harness)', citation: 'https://osunpk.com/2019/05/20/recent-weather-causing-corn-and-sorghum-injury-from-pre-emerge-herbicides-2/' },
  { herbicide: 'Long-chain fatty acid inhibitor (Group 15)', crop: 'Soybean', activeIngredient: 'S-metolachlor (Dual II Magnum)', citation: 'https://drybeanagronomy.ca/group-15-dual-frontier-injury/' },
  { herbicide: 'Microtubule inhibitor (Group 3)', crop: 'Corn', activeIngredient: 'Pendimethalin (Prowl)', citation: 'https://cropipm.omafra.gov.on.ca/en-ca/crops/field-corn/disorders/918954c2-0367-4983-93cf-e32bfec8c4b3' },
  { herbicide: 'Photosystem I electron diverter (Group 22)', crop: 'Soybean', activeIngredient: 'Paraquat (Gramoxone)', citation: 'https://www.cropscience.bayer.us/articles/bayer/soybean-herbicide-injury' },
  { herbicide: 'Photosystem II inhibitor (Group 5)', crop: 'Soybean', activeIngredient: 'Atrazine (Aatrex)', citation: 'https://extensionpubs.unl.edu/publication/g1891/na/html/view' },
  { herbicide: 'PPO inhibitor (Group 14)', crop: 'Soybean', activeIngredient: 'Fomesafen (Flexstar)', citation: 'https://btny.purdue.edu/Extension/Weeds/HerbInj2/InjuryHerb1.html' },
  { herbicide: 'PPO inhibitor (Group 14)', crop: 'Soybean', activeIngredient: 'Flumioxazin (Valor)', citation: 'https://blog-crop-news.extension.umn.edu/2020/05/preemergence-herbicide-injury-on.html' },
];
