// Organisms, biochemical tests and the identification key.
// Results are the textbook/typical reactions used in UK clinical labs;
// real isolates vary, so this is a study aid, not a diagnostic tool.

export const ORGANISMS = [
  // ---------- Gram-positive cocci ----------
  {
    id: "saur", name: "Staphylococcus aureus", gram: "+", shape: "cocci", layout: "clusters",
    morph: "Gram-positive cocci in grape-like clusters",
    tests: [["Catalase", "+"], ["Coagulase", "+"], ["DNase", "+"], ["Mannitol salt agar", "Yellow (ferments mannitol)"], ["Blood agar", "β-haemolytic, golden colonies"]],
    clues: ["Catalase +", "Tube coagulase +", "Yellow on mannitol salt agar"],
    note: "Skin and soft-tissue infections, bacteraemia, endocarditis, food poisoning (preformed toxin). MRSA screening lives on this organism.",
    tip: "Coagulase is the split: positive means aureus, full stop.",
  },
  {
    id: "sepi", name: "Staphylococcus epidermidis", gram: "+", shape: "cocci", layout: "clusters",
    morph: "Gram-positive cocci in grape-like clusters",
    tests: [["Catalase", "+"], ["Coagulase", "−"], ["Novobiocin", "Sensitive"], ["Blood agar", "White, non-haemolytic"]],
    clues: ["Catalase +", "Coagulase −", "Novobiocin sensitive"],
    note: "Skin commensal. Forms biofilm on lines, prosthetic joints and valves, so it is a frequent blood-culture contaminant and a genuine device pathogen.",
    tip: "One positive bottle out of four? Think contaminant before endocarditis.",
  },
  {
    id: "ssap", name: "Staphylococcus saprophyticus", gram: "+", shape: "cocci", layout: "clusters",
    morph: "Gram-positive cocci in grape-like clusters",
    tests: [["Catalase", "+"], ["Coagulase", "−"], ["Novobiocin", "Resistant"], ["Urease", "+"]],
    clues: ["Catalase +", "Coagulase −", "Novobiocin resistant"],
    note: "Second commonest cause of uncomplicated UTI in young, sexually active women after E. coli.",
    tip: "No-vo-bio-cin Resistant: \"No StRES for saprophyticus\".",
  },
  {
    id: "spyo", name: "Streptococcus pyogenes", gram: "+", shape: "cocci", layout: "chains",
    morph: "Gram-positive cocci in chains",
    tests: [["Catalase", "−"], ["Blood agar", "β-haemolytic"], ["Bacitracin", "Sensitive"], ["PYR", "+"], ["Lancefield group", "A"]],
    clues: ["Catalase −", "β-haemolytic", "Bacitracin sensitive"],
    note: "Group A strep: pharyngitis, cellulitis, necrotising fasciitis, scarlet fever; later rheumatic fever and post-streptococcal glomerulonephritis.",
    tip: "B-BRAS: Bacitracin — group B Resistant, group A Sensitive.",
  },
  {
    id: "saga", name: "Streptococcus agalactiae", gram: "+", shape: "cocci", layout: "chains",
    morph: "Gram-positive cocci in chains",
    tests: [["Catalase", "−"], ["Blood agar", "β-haemolytic (narrow zone)"], ["Bacitracin", "Resistant"], ["CAMP", "+"], ["Hippurate", "+"], ["Lancefield group", "B"]],
    clues: ["Catalase −", "β-haemolytic", "CAMP test +"],
    note: "Group B strep colonises the vagina; the big one for neonatal sepsis and meningitis.",
    tip: "CAMP's arrowhead points at group B.",
  },
  {
    id: "spne", name: "Streptococcus pneumoniae", gram: "+", shape: "cocci", layout: "lancet",
    morph: "Gram-positive lancet-shaped diplococci",
    tests: [["Catalase", "−"], ["Blood agar", "α-haemolytic, 'draughtsman' colonies"], ["Optochin", "Sensitive"], ["Bile solubility", "Soluble"], ["Capsule", "Quellung +"]],
    clues: ["α-haemolytic", "Optochin sensitive", "Bile soluble"],
    note: "Community-acquired pneumonia, otitis media, meningitis. The polysaccharide capsule is the vaccine target.",
    tip: "Colonies dip in the middle as they autolyse, like a draughts piece.",
  },
  {
    id: "svir", name: "Viridans streptococci", gram: "+", shape: "cocci", layout: "chains",
    morph: "Gram-positive cocci in chains",
    tests: [["Catalase", "−"], ["Blood agar", "α-haemolytic"], ["Optochin", "Resistant"], ["Bile solubility", "Insoluble"]],
    clues: ["α-haemolytic", "Optochin resistant", "Bile insoluble"],
    note: "Mouth flora (S. mitis, S. sanguinis, S. mutans). Dental caries and subacute endocarditis on damaged valves.",
    tip: "Same green haemolysis as pneumococcus: optochin tells them apart.",
  },
  {
    id: "efae", name: "Enterococcus faecalis", gram: "+", shape: "cocci", layout: "pairs",
    morph: "Gram-positive cocci in pairs and short chains",
    tests: [["Catalase", "−"], ["Blood agar", "Usually γ (non-haemolytic)"], ["Bile aesculin", "+ (black)"], ["6.5% NaCl", "Grows"], ["PYR", "+"]],
    clues: ["Catalase −", "Bile aesculin +", "Grows in 6.5% NaCl"],
    note: "UTI, biliary and wound infections, endocarditis. Intrinsically resistant to cephalosporins; watch for VRE.",
    tip: "Tough bug: survives bile and salt, and shrugs off cephalosporins.",
  },
  {
    id: "sgal", name: "Streptococcus gallolyticus", gram: "+", shape: "cocci", layout: "chains",
    morph: "Gram-positive cocci in chains",
    tests: [["Catalase", "−"], ["Blood agar", "γ or α"], ["Bile aesculin", "+ (black)"], ["6.5% NaCl", "No growth"], ["PYR", "−"]],
    clues: ["Bile aesculin +", "No growth in 6.5% NaCl", "PYR −"],
    note: "Formerly S. bovis (group D, non-enterococcal). Bacteraemia or endocarditis should prompt a colonoscopy: strong link with colorectal cancer.",
    tip: "Bovis in the blood, cancer in the colon.",
  },

  // ---------- Gram-positive rods ----------
  {
    id: "bcer", name: "Bacillus cereus", gram: "+", shape: "rods", layout: "boxcar",
    morph: "Large Gram-positive rods in chains, with spores",
    tests: [["Spores", "Central/subterminal"], ["Oxygen", "Aerobic / facultative"], ["Catalase", "+"], ["Motility", "Motile"], ["Blood agar", "β-haemolytic"], ["Lecithinase", "+"]],
    clues: ["Spore-forming", "Grows aerobically", "Motile, β-haemolytic"],
    note: "Reheated fried rice: emetic toxin (1–6 h) or diarrhoeal toxin (8–16 h). Also eye infections after trauma.",
    tip: "B. anthracis is the non-motile, non-haemolytic cousin with 'Medusa head' colonies.",
  },
  {
    id: "cper", name: "Clostridium perfringens", gram: "+", shape: "rods", layout: "boxcar-plain",
    morph: "Large, box-shaped Gram-positive rods (spores rarely seen)",
    tests: [["Spores", "Rarely seen in culture"], ["Oxygen", "Anaerobic"], ["Blood agar", "Double-zone β-haemolysis"], ["Nagler (lecithinase)", "+"], ["Motility", "Non-motile"]],
    clues: ["Strict anaerobe", "Double-zone haemolysis", "Nagler test +"],
    note: "Gas gangrene (α-toxin) and a common cause of food poisoning from slow-cooled meat stews.",
    tip: "Two rings of haemolysis on blood agar = perfringens.",
  },
  {
    id: "lmon", name: "Listeria monocytogenes", gram: "+", shape: "rods", layout: "short-rods",
    morph: "Short Gram-positive rods, singly or in V shapes",
    tests: [["Spores", "None"], ["Catalase", "+"], ["Motility", "Tumbling at 25 °C (umbrella in semi-solid agar)"], ["Blood agar", "Narrow β-haemolysis"], ["CAMP", "+"], ["Aesculin", "+"]],
    clues: ["Non-spore-forming", "Catalase +", "Tumbling motility at 25 °C"],
    note: "Soft cheese, pâté, deli meat. Grows in the fridge. Meningitis in neonates, the elderly and immunocompromised; miscarriage in pregnancy.",
    tip: "The only one here that swims better cold: motile at 25 °C, not at 37 °C.",
  },
  {
    id: "cdip", name: "Corynebacterium diphtheriae", gram: "+", shape: "rods", layout: "palisade",
    morph: "Club-shaped Gram-positive rods in 'Chinese letter' arrangements",
    tests: [["Spores", "None"], ["Catalase", "+"], ["Motility", "Non-motile"], ["Tellurite agar", "Black colonies"], ["Albert stain", "Metachromatic (volutin) granules"], ["Elek test", "Toxin +"]],
    clues: ["Non-spore-forming", "Non-motile", "Black colonies on tellurite"],
    note: "Diphtheria: grey pseudomembrane in the throat, myocarditis and neuropathy from exotoxin. The Elek test confirms toxin production.",
    tip: "Cells snap apart at angles, so they lie like letters: V, L, Y.",
  },

  // ---------- Gram-negative cocci ----------
  {
    id: "nmen", name: "Neisseria meningitidis", gram: "−", shape: "cocci", layout: "kidney",
    morph: "Gram-negative kidney-shaped diplococci",
    tests: [["Oxidase", "+"], ["Glucose", "+"], ["Maltose", "+"], ["Growth", "Chocolate / blood agar, CO₂"]],
    clues: ["Oxidase +", "Ferments glucose", "Ferments maltose"],
    note: "Meningococcal meningitis and septicaemia, with the non-blanching purpuric rash. Notifiable; contacts get prophylaxis.",
    tip: "MeninGococcus: Maltose and Glucose.",
  },
  {
    id: "ngon", name: "Neisseria gonorrhoeae", gram: "−", shape: "cocci", layout: "kidney",
    morph: "Gram-negative kidney-shaped diplococci (often inside neutrophils)",
    tests: [["Oxidase", "+"], ["Glucose", "+"], ["Maltose", "−"], ["Growth", "Selective media (e.g. modified Thayer-Martin / GC agar)"]],
    clues: ["Oxidase +", "Ferments glucose", "Does not ferment maltose"],
    note: "Gonorrhoea: urethritis, cervicitis, PID; ophthalmia neonatorum. Resistance to ceftriaxone is rising.",
    tip: "Gonococcus: Glucose only.",
  },
  {
    id: "mcat", name: "Moraxella catarrhalis", gram: "−", shape: "cocci", layout: "kidney",
    morph: "Gram-negative diplococci",
    tests: [["Oxidase", "+"], ["Glucose", "−"], ["Maltose", "−"], ["DNase", "+"], ["Butyrate esterase", "+"]],
    clues: ["Oxidase +", "Ferments no sugars", "DNase +"],
    note: "Otitis media and sinusitis in children; exacerbations of COPD. Colonies slide across the agar like a hockey puck.",
    tip: "Looks like Neisseria, but ferments nothing.",
  },

  // ---------- Gram-negative rods: oxidase negative ----------
  {
    id: "ecol", name: "Escherichia coli", gram: "−", shape: "rods", layout: "rods",
    morph: "Gram-negative rods",
    tests: [["Oxidase", "−"], ["MacConkey", "Lactose fermenter (pink)"], ["Indole", "+"], ["Citrate", "−"], ["Motility", "Motile"], ["Urease", "−"]],
    clues: ["Oxidase −", "Pink on MacConkey", "Indole +"],
    note: "The commonest cause of UTI and Gram-negative bacteraemia. Also gastroenteritis (EHEC O157 → HUS) and neonatal meningitis.",
    tip: "Pink, indole-positive, citrate-negative: the classic IMViC ++−−.",
  },
  {
    id: "kpne", name: "Klebsiella pneumoniae", gram: "−", shape: "rods", layout: "rods-capsule",
    morph: "Gram-negative rods with a thick capsule",
    tests: [["Oxidase", "−"], ["MacConkey", "Lactose fermenter, mucoid"], ["Indole", "−"], ["Citrate", "+"], ["Motility", "Non-motile"], ["Urease", "+ (slow)"]],
    clues: ["Pink, mucoid on MacConkey", "Indole −", "Non-motile"],
    note: "Hospital UTI and pneumonia; 'redcurrant jelly' sputum in alcohol-related lobar pneumonia. Major carrier of ESBL and carbapenemase genes.",
    tip: "Colonies so mucoid they string up on a loop.",
  },
  {
    id: "pmir", name: "Proteus mirabilis", gram: "−", shape: "rods", layout: "rods",
    morph: "Gram-negative rods",
    tests: [["Oxidase", "−"], ["MacConkey", "Non-lactose fermenter"], ["H₂S", "+"], ["Urease", "+ (rapid)"], ["Indole", "−"], ["Motility", "Swarms on blood agar"]],
    clues: ["Non-lactose fermenter", "H₂S +", "Urease +"],
    note: "UTI and struvite (staghorn) stones, because urease makes the urine alkaline. Fishy smell.",
    tip: "Waves of swarming across the blood plate give it away.",
  },
  {
    id: "salm", name: "Salmonella enterica", gram: "−", shape: "rods", layout: "rods",
    morph: "Gram-negative rods",
    tests: [["Oxidase", "−"], ["MacConkey", "Non-lactose fermenter"], ["H₂S", "+ (black centres on XLD)"], ["Urease", "−"], ["Indole", "−"], ["Motility", "Motile"]],
    clues: ["Non-lactose fermenter", "H₂S +", "Urease −"],
    note: "Gastroenteritis from eggs and poultry; S. Typhi causes enteric fever. Confirmed with serotyping.",
    tip: "Red colonies with black centres on XLD.",
  },
  {
    id: "shig", name: "Shigella spp.", gram: "−", shape: "rods", layout: "rods",
    morph: "Gram-negative rods",
    tests: [["Oxidase", "−"], ["MacConkey", "Non-lactose fermenter"], ["H₂S", "−"], ["Motility", "Non-motile"], ["Urease", "−"]],
    clues: ["Non-lactose fermenter", "H₂S −", "Non-motile"],
    note: "Bacillary dysentery: bloody diarrhoea from a very low infectious dose (10–100 organisms). S. dysenteriae type 1 makes Shiga toxin.",
    tip: "Salmonella's twin on MacConkey, but no black and no swimming.",
  },

  // ---------- Gram-negative rods: oxidase positive ----------
  {
    id: "paer", name: "Pseudomonas aeruginosa", gram: "−", shape: "rods", layout: "slender-rods",
    morph: "Slender Gram-negative rods",
    tests: [["Oxidase", "+"], ["MacConkey", "Non-lactose fermenter"], ["Metabolism", "Non-fermenter (strict aerobe)"], ["Pigment", "Blue-green (pyocyanin)"], ["Growth at 42 °C", "+"]],
    clues: ["Oxidase +", "Non-fermenter", "Blue-green pigment, grape-like smell"],
    note: "Burns, cystic fibrosis lungs, ventilator pneumonia, hot-tub folliculitis. Intrinsically resistant to many antibiotics.",
    tip: "Open the plate: the sweet grape (or corn-tortilla) smell is hard to forget.",
  },
  {
    id: "hinf", name: "Haemophilus influenzae", gram: "−", shape: "coccobacilli", layout: "coccobacilli",
    morph: "Small, pleomorphic Gram-negative coccobacilli",
    tests: [["Growth factors", "Needs X (haemin) and V (NAD)"], ["Chocolate agar", "Grows"], ["Blood agar", "Satellites around S. aureus"], ["Oxidase", "+"]],
    clues: ["Tiny coccobacilli", "Needs X + V factors", "Satellitism around S. aureus"],
    note: "Otitis media, sinusitis, COPD exacerbations. Type b (Hib) caused meningitis and epiglottitis before the vaccine.",
    tip: "It borrows NAD from lysed red cells, hence chocolate agar.",
  },
  {
    id: "bper", name: "Bordetella pertussis", gram: "−", shape: "coccobacilli", layout: "coccobacilli",
    morph: "Small Gram-negative coccobacilli",
    tests: [["Growth", "Regan-Lowe / Bordet-Gengou agar"], ["Colonies", "'Mercury drop', after 3–5 days"], ["Oxidase", "+"], ["Urease", "−"]],
    clues: ["Tiny coccobacilli", "Needs charcoal / Bordet-Gengou media", "Mercury-drop colonies"],
    note: "Whooping cough. PCR on a nasopharyngeal swab is now the usual test; culture is slow.",
    tip: "Shiny, domed colonies like drops of mercury.",
  },

  // ---------- Curved Gram-negative rods ----------
  {
    id: "vcho", name: "Vibrio cholerae", gram: "−", shape: "curved", layout: "comma",
    morph: "Comma-shaped Gram-negative rods",
    tests: [["Oxidase", "+"], ["TCBS agar", "Yellow colonies (sucrose)"], ["String test", "+"], ["Enrichment", "Alkaline peptone water"]],
    clues: ["Comma-shaped", "Oxidase +", "Yellow on TCBS"],
    note: "Cholera: profuse 'rice-water' diarrhoea from cholera toxin. Rehydration saves lives.",
    tip: "Loves alkaline, salty conditions: TCBS is built around it.",
  },
  {
    id: "cjej", name: "Campylobacter jejuni", gram: "−", shape: "curved", layout: "gullwing",
    morph: "Curved and S-shaped ('gull-wing') Gram-negative rods",
    tests: [["Oxidase", "+"], ["Catalase", "+"], ["Growth", "Microaerophilic, 42 °C"], ["Hippurate", "+"]],
    clues: ["Gull-wing shapes", "Oxidase +", "Grows at 42 °C, microaerophilic"],
    note: "The commonest bacterial cause of gastroenteritis in the UK (undercooked chicken). Can trigger Guillain-Barré syndrome.",
    tip: "It is a thermophile: incubate hot, at 42 °C.",
  },
  {
    id: "hpyl", name: "Helicobacter pylori", gram: "−", shape: "curved", layout: "spiral",
    morph: "Curved to spiral Gram-negative rods",
    tests: [["Urease", "Strongly + (rapid CLO test)"], ["Oxidase", "+"], ["Catalase", "+"], ["Diagnosis", "Urea breath test / stool antigen"]],
    clues: ["Spiral shape", "Rapid urease +", "Found in gastric biopsy"],
    note: "Gastritis, peptic ulcers, gastric adenocarcinoma and MALT lymphoma. Urease makes an ammonia cloud against stomach acid.",
    tip: "Urease is its umbrella in the acid rain.",
  },
];

export const byId = Object.fromEntries(ORGANISMS.map((o) => [o.id, o]));

// Identification key. Each node asks one question; an option either goes
// to another node (`to`) or ends at an organism (`org`).
export const KEY = {
  start: {
    step: "Gram stain",
    q: "What colour are the cells under oil immersion?",
    help: "Crystal violet held after decolourising means a thick peptidoglycan wall.",
    options: [
      { label: "Purple / blue-black", sub: "Gram-positive", swatch: "gpos", to: "gpShape" },
      { label: "Pink / red", sub: "Gram-negative", swatch: "gneg", to: "gnShape" },
    ],
  },

  gpShape: {
    step: "Shape",
    q: "Are they round or rod-shaped?",
    help: "Look at single, well-separated cells, not clumps.",
    options: [
      { label: "Cocci", sub: "Round cells", glyph: "coccus", to: "gpcCat" },
      { label: "Bacilli", sub: "Rods", glyph: "rod", to: "gprSpore" },
    ],
  },
  gpcCat: {
    step: "Catalase",
    q: "Drop 3% hydrogen peroxide on a colony. Bubbles?",
    help: "Pick from a non-blood plate if you can: red cells have their own catalase.",
    options: [
      { label: "Vigorous bubbling", sub: "Catalase + → Staphylococcus (clusters)", swatch: "bubbles", to: "staphCoag" },
      { label: "No bubbles", sub: "Catalase − → Streptococcus / Enterococcus (chains, pairs)", swatch: "flat", to: "strepHaem" },
    ],
  },
  staphCoag: {
    step: "Coagulase",
    q: "Does the organism clot rabbit plasma?",
    help: "Tube coagulase, read at 4 h and again at 24 h.",
    options: [
      { label: "Clot forms", sub: "Coagulase +", swatch: "clot", org: "saur" },
      { label: "Stays liquid", sub: "Coagulase − (CoNS)", swatch: "liquid", to: "staphNovo" },
    ],
  },
  staphNovo: {
    step: "Novobiocin",
    q: "Zone around a 5 µg novobiocin disc?",
    help: "Useful for urinary isolates of coagulase-negative staphylococci.",
    options: [
      { label: "Clear zone", sub: "Sensitive", swatch: "zone", org: "sepi" },
      { label: "Growth up to the disc", sub: "Resistant", swatch: "nozone", org: "ssap" },
    ],
  },
  strepHaem: {
    step: "Haemolysis",
    q: "What does the blood agar around the colonies look like?",
    help: "Hold the plate up to the light.",
    options: [
      { label: "Clear, see-through zone", sub: "β-haemolysis", swatch: "beta", to: "betaBac" },
      { label: "Green-brown zone", sub: "α-haemolysis", swatch: "alpha", to: "alphaOpt" },
      { label: "No change", sub: "γ (non-haemolytic)", swatch: "gamma", to: "gammaBile" },
    ],
  },
  betaBac: {
    step: "Bacitracin",
    q: "Zone around a bacitracin (0.04 U) disc?",
    help: "Latex Lancefield grouping is quicker; this is the classic bench way.",
    options: [
      { label: "Clear zone", sub: "Sensitive → group A", swatch: "zone", org: "spyo" },
      { label: "No zone", sub: "Resistant, CAMP + → group B", swatch: "nozone", org: "saga" },
    ],
  },
  alphaOpt: {
    step: "Optochin",
    q: "Zone around an optochin disc?",
    help: "≥14 mm with a 6 mm disc counts as sensitive.",
    options: [
      { label: "Zone ≥ 14 mm", sub: "Sensitive (and bile soluble)", swatch: "zone", org: "spne" },
      { label: "No / small zone", sub: "Resistant (bile insoluble)", swatch: "nozone", org: "svir" },
    ],
  },
  gammaBile: {
    step: "Bile aesculin + NaCl",
    q: "Bile aesculin blackens. Does it grow in 6.5% NaCl?",
    help: "Both group D organisms blacken bile aesculin; salt tolerance splits them.",
    options: [
      { label: "Grows in salt", sub: "Enterococcus", swatch: "turbid", org: "efae" },
      { label: "No growth in salt", sub: "Non-enterococcal group D", swatch: "clear", org: "sgal" },
    ],
  },

  gprSpore: {
    step: "Spores",
    q: "Any spores (clear, unstained ovals) in the cells?",
    help: "Confirm with a malachite green spore stain.",
    options: [
      { label: "Spores present", sub: "Bacillus or Clostridium", swatch: "spore", to: "sporeO2" },
      { label: "No spores", sub: "Listeria, Corynebacterium…", swatch: "rodplain", to: "nsMotile" },
    ],
  },
  sporeO2: {
    step: "Oxygen",
    q: "Where does it grow?",
    help: "Set up aerobic and anaerobic plates side by side.",
    options: [
      { label: "In air", sub: "Aerobic / facultative → Bacillus", glyph: "air", org: "bcer" },
      { label: "Only in the anaerobe jar", sub: "Anaerobic → Clostridium", glyph: "jar", org: "cper" },
    ],
  },
  nsMotile: {
    step: "Motility & morphology",
    q: "How do they move and arrange?",
    help: "Hanging drop at room temperature, then check the Gram film arrangement.",
    options: [
      { label: "Tumbling motility at 25 °C", sub: "Short rods, narrow β-haemolysis", glyph: "tumble", org: "lmon" },
      { label: "Non-motile, 'Chinese letters'", sub: "Club-shaped, black on tellurite", glyph: "letters", org: "cdip" },
    ],
  },

  gnShape: {
    step: "Shape",
    q: "What shape are the pink cells?",
    help: "Coccobacilli are so short they can pass for cocci. Look closely.",
    options: [
      { label: "Diplococci", sub: "Kidney-bean pairs", glyph: "diplo", to: "gncSugar" },
      { label: "Straight rods", sub: "Bacilli", glyph: "rod", to: "gnrOx" },
      { label: "Coccobacilli", sub: "Tiny, short, pleomorphic", glyph: "cb", to: "cbGrowth" },
      { label: "Curved / spiral", sub: "Commas, gull wings, S-shapes", glyph: "curve", to: "curvedGrowth" },
    ],
  },
  gncSugar: {
    step: "Sugar utilisation",
    q: "All oxidase +. Which sugars are used?",
    help: "Rapid carbohydrate utilisation test (or MALDI-TOF in most labs now).",
    options: [
      { label: "Glucose + maltose", sub: "", swatch: "sugar2", org: "nmen" },
      { label: "Glucose only", sub: "", swatch: "sugar1", org: "ngon" },
      { label: "Neither", sub: "DNase +, butyrate esterase +", swatch: "sugar0", org: "mcat" },
    ],
  },
  gnrOx: {
    step: "Oxidase",
    q: "Rub a colony on oxidase paper. Purple within 10 seconds?",
    help: "Use a plastic or platinum loop; nichrome gives false positives.",
    options: [
      { label: "Deep purple", sub: "Oxidase +", swatch: "oxpos", org: "paer" },
      { label: "No colour change", sub: "Oxidase − → Enterobacterales", swatch: "oxneg", to: "lactose" },
    ],
  },
  lactose: {
    step: "Lactose",
    q: "Colony colour on MacConkey agar?",
    help: "Lactose fermentation drops the pH, turning neutral red pink.",
    options: [
      { label: "Pink", sub: "Lactose fermenter", swatch: "lf", to: "indole" },
      { label: "Pale / colourless", sub: "Non-lactose fermenter", swatch: "nlf", to: "h2s" },
    ],
  },
  indole: {
    step: "Indole",
    q: "Add Kovac's reagent to a peptone water culture. Red ring?",
    help: "Tryptophanase splits tryptophan to indole.",
    options: [
      { label: "Red ring", sub: "Indole +", swatch: "indpos", org: "ecol" },
      { label: "Yellow, no ring", sub: "Indole −, mucoid, non-motile", swatch: "indneg", org: "kpne" },
    ],
  },
  h2s: {
    step: "H₂S",
    q: "Black precipitate on TSI or XLD?",
    help: "Iron salts react with H₂S to form black ferrous sulphide.",
    options: [
      { label: "Blackening", sub: "H₂S +", swatch: "h2spos", to: "urease" },
      { label: "No blackening", sub: "H₂S −, non-motile", swatch: "h2sneg", org: "shig" },
    ],
  },
  urease: {
    step: "Urease",
    q: "Christensen's urea slope after a few hours?",
    help: "Ammonia from urea raises the pH and turns phenol red pink.",
    options: [
      { label: "Bright pink", sub: "Urease +, swarming", swatch: "ureapos", org: "pmir" },
      { label: "Stays yellow-orange", sub: "Urease −", swatch: "ureaneg", org: "salm" },
    ],
  },
  cbGrowth: {
    step: "Growth needs",
    q: "What does it need to grow?",
    help: "Both are fastidious. The medium is the clue.",
    options: [
      { label: "X + V factors", sub: "Chocolate agar; satellites near S. aureus", glyph: "xv", org: "hinf" },
      { label: "Charcoal / Bordet-Gengou", sub: "Slow, mercury-drop colonies", glyph: "drop", org: "bper" },
    ],
  },
  curvedGrowth: {
    step: "Source & growth",
    q: "Where did it come from, and how does it grow?",
    help: "All three are oxidase positive.",
    options: [
      { label: "Rice-water stool, yellow on TCBS", sub: "Comma-shaped", glyph: "comma", org: "vcho" },
      { label: "Stool, microaerophilic at 42 °C", sub: "Gull-wing shapes", glyph: "gull", org: "cjej" },
      { label: "Gastric biopsy, rapid urease +", sub: "Spiral", glyph: "spiral", org: "hpyl" },
    ],
  },
};

// Bench tests. `pos`/`neg` are the colours of a positive and negative result.
export const TESTS = [
  { id: "catalase", name: "Catalase", detects: "Catalase, which breaks H₂O₂ into water and oxygen.", how: "A colony into a drop of 3% H₂O₂ on a slide.", pos: ["Bubbles", "#f3efe6"], neg: ["No bubbles", "#e6e1d6"], posFx: "bubbles", split: "Staphylococcus (+) from Streptococcus and Enterococcus (−).", orgs: ["saur", "sepi", "ssap", "lmon", "cdip", "bcer", "cjej", "hpyl"] },
  { id: "coagulase", name: "Coagulase", detects: "Coagulase, which turns fibrinogen into fibrin.", how: "Tube test with rabbit plasma at 37 °C, or a slide test for clumping factor.", pos: ["Clot", "#b98b6b"], neg: ["Liquid", "#e2c9a4"], posFx: "clot", split: "S. aureus (+) from the coagulase-negative staphylococci.", orgs: ["saur"] },
  { id: "oxidase", name: "Oxidase", detects: "Cytochrome c oxidase in the respiratory chain.", how: "Smear a colony onto paper soaked in tetramethyl-p-phenylenediamine.", pos: ["Purple in 10 s", "#3b2a5c"], neg: ["No change", "#ece8df"], split: "Pseudomonas, Neisseria, Vibrio, Campylobacter (+) from the Enterobacterales (−).", orgs: ["nmen", "ngon", "mcat", "paer", "hinf", "bper", "vcho", "cjej", "hpyl"] },
  { id: "haemolysis", name: "Haemolysis", detects: "How toxins break down red cells in blood agar.", how: "Look at the zone around colonies with light behind the plate.", pos: ["β: clear", "#e9c6c0"], neg: ["α: green", "#6d7a4a"], split: "β, α and γ streptococci. The first split for catalase-negative cocci.", orgs: ["saur", "spyo", "saga", "bcer", "cper", "lmon", "spne", "svir"] },
  { id: "optochin", name: "Optochin", detects: "Sensitivity to ethylhydrocupreine.", how: "A disc on a lawn of α-haemolytic streptococci, incubated in CO₂.", pos: ["Zone ≥ 14 mm", "#d8cfbf"], neg: ["No zone", "#6d7a4a"], posFx: "zone", split: "S. pneumoniae (sensitive) from viridans streptococci.", orgs: ["spne"] },
  { id: "bacitracin", name: "Bacitracin", detects: "Sensitivity to a 0.04 U bacitracin disc.", how: "A disc on a lawn of β-haemolytic streptococci.", pos: ["Zone", "#e9c6c0"], neg: ["No zone", "#9b3b3b"], posFx: "zone", split: "Group A (sensitive) from group B (resistant).", orgs: ["spyo"] },
  { id: "novobiocin", name: "Novobiocin", detects: "Sensitivity to a 5 µg novobiocin disc.", how: "A disc on a lawn of a coagulase-negative staphylococcus.", pos: ["Zone (S)", "#e7e0d1"], neg: ["No zone (R)", "#cfc5b0"], posFx: "zone", split: "S. epidermidis (sensitive) from S. saprophyticus (resistant).", orgs: ["sepi"] },
  { id: "camp", name: "CAMP test", detects: "CAMP factor, which boosts the β-lysin of S. aureus.", how: "Streak the isolate at right angles to an S. aureus streak on blood agar.", pos: ["Arrowhead", "#e9c6c0"], neg: ["No arrow", "#9b3b3b"], posFx: "arrow", split: "Group B streptococcus and Listeria (+).", orgs: ["saga", "lmon"] },
  { id: "bile-sol", name: "Bile solubility", detects: "Autolysins triggered by bile salts.", how: "Add 10% sodium deoxycholate to a suspension or a colony.", pos: ["Clears / lyses", "#ece8df"], neg: ["Stays cloudy", "#bdb6a6"], split: "S. pneumoniae (soluble) from viridans streptococci.", orgs: ["spne"] },
  { id: "bile-aesc", name: "Bile aesculin", detects: "Growth in bile plus hydrolysis of aesculin.", how: "Inoculate a bile aesculin slope; incubate 24–48 h.", pos: ["Blackened", "#2a2522"], neg: ["No change", "#cbbd9a"], split: "Group D organisms (Enterococcus, S. gallolyticus), Listeria.", orgs: ["efae", "sgal", "lmon"] },
  { id: "nacl", name: "6.5% NaCl", detects: "Tolerance of high salt.", how: "Inoculate 6.5% NaCl broth with an indicator.", pos: ["Turbid / yellow", "#d9c46a"], neg: ["Clear / purple", "#6e5a8a"], split: "Enterococcus (grows) from S. gallolyticus.", orgs: ["efae"] },
  { id: "pyr", name: "PYR", detects: "Pyrrolidonyl arylamidase.", how: "A colony on a PYR disc, then add the developer.", pos: ["Cherry red", "#b3263a"], neg: ["No colour", "#efe6d2"], split: "Group A strep and Enterococcus (+).", orgs: ["spyo", "efae"] },
  { id: "lactose", name: "Lactose (MacConkey)", detects: "Lactose fermentation to acid.", how: "Look at colony colour on MacConkey agar with neutral red.", pos: ["Pink", "#c9587a"], neg: ["Pale", "#e8d9a8"], split: "E. coli and Klebsiella (LF) from Salmonella, Shigella, Proteus, Pseudomonas (NLF).", orgs: ["ecol", "kpne"] },
  { id: "indole", name: "Indole", detects: "Tryptophanase, which makes indole from tryptophan.", how: "Add Kovac's reagent to a peptone water culture.", pos: ["Red ring", "#b3263a"], neg: ["Yellow ring", "#e7cf6b"], posFx: "ring", split: "E. coli (+) from Klebsiella pneumoniae (−).", orgs: ["ecol"] },
  { id: "citrate", name: "Citrate", detects: "Using citrate as the only carbon source.", how: "Inoculate a Simmons citrate slope.", pos: ["Blue", "#2f5f9e"], neg: ["Green", "#4f7a4b"], split: "Klebsiella (+) from E. coli (−).", orgs: ["kpne"] },
  { id: "urease", name: "Urease", detects: "Urease, which splits urea into ammonia and CO₂.", how: "Christensen's urea slope, or a CLO test for gastric biopsies.", pos: ["Pink", "#d4508a"], neg: ["Yellow-orange", "#e6a45a"], split: "Proteus (rapid +) from Salmonella; H. pylori; S. saprophyticus.", orgs: ["pmir", "kpne", "hpyl", "ssap"] },
  { id: "h2s", name: "H₂S", detects: "Hydrogen sulphide from sulphur-containing amino acids.", how: "Black precipitate on TSI, XLD or SIM.", pos: ["Black", "#1e1a18"], neg: ["No black", "#c9453b"], split: "Salmonella and Proteus (+) from Shigella (−).", orgs: ["salm", "pmir"] },
  { id: "motility", name: "Motility", detects: "Flagella.", how: "Hanging drop, or stab into semi-solid agar (SIM).", pos: ["Spreads", "#d9d0bd"], neg: ["Along stab only", "#efe9dc"], posFx: "spread", split: "Shigella and Klebsiella (non-motile) from E. coli and Salmonella; Listeria tumbles at 25 °C.", orgs: ["ecol", "salm", "pmir", "lmon", "bcer"] },
  { id: "xv", name: "X and V factors", detects: "Whether haemin (X) and NAD (V) are needed.", how: "X, V and XV discs on nutrient agar.", pos: ["Grows around XV only", "#b98b6b"], neg: ["Grows everywhere", "#d7cdb8"], split: "H. influenzae (needs both) from other Haemophilus species.", orgs: ["hinf"] },
  { id: "sugars", name: "Sugar utilisation", detects: "Acid from glucose, maltose, lactose and sucrose.", how: "Rapid carbohydrate utilisation test, read at 4 h.", pos: ["Yellow", "#e2c24f"], neg: ["Red", "#c2453d"], split: "Meningococcus (glucose + maltose) from gonococcus (glucose) and Moraxella (none).", orgs: ["nmen", "ngon"] },
];
