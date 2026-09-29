// Everything the app knows lives here: the organisms, the identification
// key that walks between them, and the bench tests used along the way.
//
// Results are the textbook "typical" reactions taught on UK/US clinical
// microbiology courses. Real isolates vary, so treat this as a study aid,
// not a lab SOP.

export const organisms = [
  // ---------- Gram-positive cocci ----------
  {
    id: "saureus", name: "Staphylococcus aureus", genus: "Staphylococcus",
    gram: "pos", shape: "cocci", morph: "clusters", arrangement: "Grape-like clusters",
    tests: { Catalase: "+", Coagulase: "+", Haemolysis: "β", "Mannitol salt": "Yellow (ferments)", DNase: "+" },
    colony: "Creamy golden colonies, often β-haemolytic.",
    clinical: "Boils, cellulitis, osteomyelitis, endocarditis and toxic shock. MRSA carries the mecA gene.",
    tip: "The only common staph that clots plasma: coagulase is the one-step answer.",
  },
  {
    id: "sepidermidis", name: "Staphylococcus epidermidis", genus: "Staphylococcus",
    gram: "pos", shape: "cocci", morph: "clusters", arrangement: "Clusters",
    tests: { Catalase: "+", Coagulase: "−", Novobiocin: "Sensitive", Haemolysis: "γ" },
    colony: "Small white, non-haemolytic colonies.",
    clinical: "Biofilms on prosthetic joints, heart valves and IV lines. A frequent blood culture contaminant.",
    tip: "Coagulase-negative and novobiocin-Sensitive: \"Epi is Sensitive\".",
  },
  {
    id: "ssaprophyticus", name: "Staphylococcus saprophyticus", genus: "Staphylococcus",
    gram: "pos", shape: "cocci", morph: "clusters", arrangement: "Clusters",
    tests: { Catalase: "+", Coagulase: "−", Novobiocin: "Resistant", Urease: "+" },
    colony: "White, non-haemolytic colonies.",
    clinical: "Second most common cause of uncomplicated UTI in young, sexually active women.",
    tip: "\"Sapro is Resistant\": no zone around the novobiocin disc.",
  },
  {
    id: "spyogenes", name: "Streptococcus pyogenes", genus: "Streptococcus", alias: "Group A strep",
    gram: "pos", shape: "cocci", morph: "chains", arrangement: "Chains",
    tests: { Catalase: "−", Haemolysis: "β", Bacitracin: "Sensitive", PYR: "+" },
    colony: "Small grey colonies with a wide zone of clear haemolysis.",
    clinical: "Strep throat, impetigo, scarlet fever and necrotising fasciitis; later rheumatic fever and glomerulonephritis.",
    tip: "Bacitracin sensitive → group A. \"B-BRAS\": Bacitracin — group B Resistant, group A Sensitive.",
  },
  {
    id: "sagalactiae", name: "Streptococcus agalactiae", genus: "Streptococcus", alias: "Group B strep",
    gram: "pos", shape: "cocci", morph: "chains", arrangement: "Chains",
    tests: { Catalase: "−", Haemolysis: "β (narrow)", Bacitracin: "Resistant", CAMP: "+", Hippurate: "+" },
    colony: "Larger, buttery colonies with a narrow β zone.",
    clinical: "Neonatal sepsis, pneumonia and meningitis. Carriage is screened for in pregnancy.",
    tip: "CAMP positive: an arrowhead of haemolysis next to a streak of S. aureus.",
  },
  {
    id: "spneumoniae", name: "Streptococcus pneumoniae", genus: "Streptococcus", alias: "Pneumococcus",
    gram: "pos", shape: "cocci", morph: "pairs", arrangement: "Lancet-shaped diplococci",
    tests: { Catalase: "−", Haemolysis: "α", Optochin: "Sensitive", "Bile solubility": "Soluble" },
    colony: "\"Draughtsman\" colonies with a sunken centre, green α zone.",
    clinical: "Community-acquired pneumonia, otitis media, sinusitis and meningitis.",
    tip: "\"OVRPS\": Optochin — Viridans Resistant, Pneumo Sensitive.",
  },
  {
    id: "viridans", name: "Viridans streptococci", genus: "Streptococcus", alias: "e.g. S. mutans, S. sanguinis",
    gram: "pos", shape: "cocci", morph: "chains", arrangement: "Chains",
    tests: { Catalase: "−", Haemolysis: "α", Optochin: "Resistant", "Bile solubility": "Insoluble" },
    colony: "Tiny colonies with green α haemolysis.",
    clinical: "Dental caries (S. mutans) and subacute endocarditis on damaged valves.",
    tip: "Looks like pneumococcus on the plate: optochin tells them apart.",
  },
  {
    id: "efaecalis", name: "Enterococcus faecalis", genus: "Enterococcus",
    gram: "pos", shape: "cocci", morph: "pairs", arrangement: "Pairs and short chains",
    tests: { Catalase: "−", Haemolysis: "γ (usually)", "Bile esculin": "+", "6.5% NaCl": "Grows", PYR: "+" },
    colony: "Grey, non-haemolytic colonies; blackens bile esculin agar.",
    clinical: "UTIs, biliary infection, endocarditis and hospital infections. VRE is a growing problem.",
    tip: "Tough bug: grows in bile and 6.5% salt, which strep can't.",
  },

  // ---------- Gram-positive bacilli ----------
  {
    id: "banthracis", name: "Bacillus anthracis", genus: "Bacillus",
    gram: "pos", shape: "bacilli", morph: "boxcars", arrangement: "Large rods in long \"boxcar\" chains",
    tests: { Spores: "Central", Oxygen: "Aerobic", Catalase: "+", Motility: "Non-motile", Haemolysis: "None" },
    colony: "Rough grey \"Medusa head\" colonies.",
    clinical: "Anthrax: cutaneous (black eschar), inhalational and gastrointestinal forms.",
    tip: "The only non-motile, non-haemolytic Bacillus you need to remember.",
  },
  {
    id: "bcereus", name: "Bacillus cereus", genus: "Bacillus",
    gram: "pos", shape: "bacilli", morph: "boxcars", arrangement: "Large rods in chains",
    tests: { Spores: "Central", Oxygen: "Aerobic", Catalase: "+", Motility: "Motile", Haemolysis: "β" },
    colony: "Large, flat, frosted-glass colonies with β haemolysis.",
    clinical: "Food poisoning from reheated fried rice (emetic toxin) or meat dishes (diarrhoeal toxin).",
    tip: "\"Reheated rice syndrome\". Motile and β-haemolytic, unlike anthracis.",
  },
  {
    id: "cperfringens", name: "Clostridium perfringens", genus: "Clostridium",
    gram: "pos", shape: "bacilli", morph: "boxcars", arrangement: "Stubby, boxcar-shaped rods",
    tests: { Spores: "Rarely seen", Oxygen: "Anaerobic", Haemolysis: "Double zone", Lecithinase: "+ (Nagler)", Motility: "Non-motile" },
    colony: "Double zone of haemolysis on blood agar.",
    clinical: "Gas gangrene (myonecrosis) and a common type of food poisoning.",
    tip: "Double-zone haemolysis is almost diagnostic.",
  },
  {
    id: "cdifficile", name: "Clostridioides difficile", genus: "Clostridioides",
    gram: "pos", shape: "bacilli", morph: "rods", arrangement: "Rods with subterminal spores",
    tests: { Spores: "Subterminal", Oxygen: "Anaerobic", Haemolysis: "None", Motility: "Motile", "Toxin A/B": "+" },
    colony: "Ground-glass colonies, yellow-green fluorescence on CCFA, \"horse stable\" smell.",
    clinical: "Antibiotic-associated diarrhoea and pseudomembranous colitis.",
    tip: "Diagnosed from stool: GDH antigen screen, then toxin A/B.",
  },
  {
    id: "listeria", name: "Listeria monocytogenes", genus: "Listeria",
    gram: "pos", shape: "bacilli", morph: "rods", arrangement: "Short rods, sometimes in pairs",
    tests: { Spores: "None", Catalase: "+", Motility: "Tumbling (25 °C)", Haemolysis: "β (narrow)", CAMP: "+" },
    colony: "Small colonies with a narrow β zone; grows at fridge temperature (4 °C).",
    clinical: "Meningitis and sepsis in neonates, pregnancy, the elderly and the immunocompromised. Soft cheese and deli meats.",
    tip: "Tumbling motility at 25 °C, umbrella growth in semi-solid agar.",
  },
  {
    id: "cdiphtheriae", name: "Corynebacterium diphtheriae", genus: "Corynebacterium",
    gram: "pos", shape: "bacilli", morph: "clubs", arrangement: "Club-shaped rods in \"Chinese letters\"",
    tests: { Spores: "None", Catalase: "+", Motility: "Non-motile", Tellurite: "Black colonies", "Elek test": "Toxin +" },
    colony: "Black colonies on tellurite agar; metachromatic granules on Albert's stain.",
    clinical: "Diphtheria: grey pseudomembrane in the throat and toxin-mediated myocarditis.",
    tip: "Palisades and V/L shapes on the slide; Elek confirms the toxin.",
  },

  // ---------- Gram-negative cocci ----------
  {
    id: "nmeningitidis", name: "Neisseria meningitidis", genus: "Neisseria", alias: "Meningococcus",
    gram: "neg", shape: "cocci", morph: "kidneys", arrangement: "Kidney-bean diplococci",
    tests: { Oxidase: "+", Glucose: "+", Maltose: "+", Catalase: "+" },
    colony: "Grey, glistening colonies on chocolate agar.",
    clinical: "Meningitis and septicaemia with a non-blanching purpuric rash.",
    tip: "\"MeninGococcus = Maltose + Glucose\".",
  },
  {
    id: "ngonorrhoeae", name: "Neisseria gonorrhoeae", genus: "Neisseria", alias: "Gonococcus",
    gram: "neg", shape: "cocci", morph: "kidneys", arrangement: "Kidney-bean diplococci, often inside neutrophils",
    tests: { Oxidase: "+", Glucose: "+", Maltose: "−", Media: "Thayer–Martin / GC agar" },
    colony: "Small colonies on selective GC agar in CO₂.",
    clinical: "Gonorrhoea, pelvic inflammatory disease, septic arthritis and neonatal conjunctivitis.",
    tip: "\"GonoCoccus = Glucose only\".",
  },
  {
    id: "mcatarrhalis", name: "Moraxella catarrhalis", genus: "Moraxella",
    gram: "neg", shape: "cocci", morph: "kidneys", arrangement: "Diplococci",
    tests: { Oxidase: "+", Sugars: "None fermented", DNase: "+", "Butyrate esterase": "+" },
    colony: "\"Hockey puck\" colonies that slide intact across the agar.",
    clinical: "Otitis media, sinusitis and exacerbations of COPD.",
    tip: "Asaccharolytic: every sugar stays negative.",
  },

  // ---------- Gram-negative bacilli ----------
  {
    id: "ecoli", name: "Escherichia coli", genus: "Escherichia",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Straight rods",
    tests: { Oxidase: "−", Lactose: "+ (fast)", Indole: "+", Motility: "Motile", Citrate: "−", "H₂S": "−", Urease: "−" },
    colony: "Dry pink colonies on MacConkey; green metallic sheen on EMB.",
    clinical: "The number one cause of UTI. Also neonatal meningitis, traveller's diarrhoea and EHEC O157 (HUS).",
    tip: "IMViC ++−−: Indole +, Methyl red +, VP −, Citrate −.",
  },
  {
    id: "kpneumoniae", name: "Klebsiella pneumoniae", genus: "Klebsiella",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Plump rods with a capsule",
    tests: { Oxidase: "−", Lactose: "+", Indole: "−", Motility: "Non-motile", Citrate: "+", Urease: "+ (slow)", VP: "+" },
    colony: "Very mucoid pink colonies that string on a loop.",
    clinical: "Hospital pneumonia, UTI and bacteraemia. KPC and NDM carbapenemase producers.",
    tip: "Mucoid and non-motile. IMViC −−++.",
  },
  {
    id: "ecloacae", name: "Enterobacter cloacae", genus: "Enterobacter",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Straight rods",
    tests: { Oxidase: "−", Lactose: "+", Indole: "−", Motility: "Motile", Citrate: "+", VP: "+" },
    colony: "Pink, slightly mucoid colonies on MacConkey.",
    clinical: "Hospital UTI, bacteraemia and wound infections. Chromosomal AmpC β-lactamase.",
    tip: "Klebsiella's motile cousin.",
  },
  {
    id: "pmirabilis", name: "Proteus mirabilis", genus: "Proteus",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Rods",
    tests: { Oxidase: "−", Lactose: "−", "H₂S": "+", Urease: "+ (strong)", Indole: "−", Motility: "Swarming" },
    colony: "Swarms across blood agar in waves; fishy smell.",
    clinical: "UTIs and struvite (staghorn) kidney stones, because urease makes the urine alkaline.",
    tip: "Swarming + urease + H₂S.",
  },
  {
    id: "salmonella", name: "Salmonella enterica", genus: "Salmonella",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Rods",
    tests: { Oxidase: "−", Lactose: "−", "H₂S": "+", Urease: "−", Motility: "Motile", Indole: "−" },
    colony: "Red colonies with black centres on XLD.",
    clinical: "Gastroenteritis from poultry and eggs. Serovar Typhi causes enteric fever.",
    tip: "Non-lactose fermenter + H₂S + urease negative.",
  },
  {
    id: "shigella", name: "Shigella spp.", genus: "Shigella",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Rods",
    tests: { Oxidase: "−", Lactose: "−", "H₂S": "−", Urease: "−", Motility: "Non-motile" },
    colony: "Red colonies without black centres on XLD.",
    clinical: "Bacillary dysentery. As few as 10 organisms can cause infection.",
    tip: "Non-motile and no H₂S, unlike Salmonella.",
  },
  {
    id: "paeruginosa", name: "Pseudomonas aeruginosa", genus: "Pseudomonas",
    gram: "neg", shape: "bacilli", morph: "rods", arrangement: "Slender rods",
    tests: { Oxidase: "+", Lactose: "− (non-fermenter)", Motility: "Motile", Pigment: "Pyocyanin (green-blue)", "42 °C": "Grows" },
    colony: "Flat, spreading, metallic colonies with a grape or corn-tortilla smell.",
    clinical: "Cystic fibrosis lungs, burns, ventilator pneumonia and hot-tub folliculitis. Intrinsically resistant to many drugs.",
    tip: "Oxidase-positive, green pigment, grape smell.",
  },
  {
    id: "abaumannii", name: "Acinetobacter baumannii", genus: "Acinetobacter",
    gram: "neg", shape: "coccobacilli", morph: "coccobacilli", arrangement: "Plump coccobacilli, often in pairs",
    tests: { Oxidase: "−", Catalase: "+", Lactose: "− (non-fermenter)", Motility: "Non-motile", MacConkey: "Grows" },
    colony: "Smooth, slightly pink-to-pale colonies on MacConkey.",
    clinical: "ICU ventilator pneumonia, wound and line infections; often carbapenem-resistant.",
    tip: "Oxidase-negative non-fermenter: the odd one out.",
  },
  {
    id: "hinfluenzae", name: "Haemophilus influenzae", genus: "Haemophilus",
    gram: "neg", shape: "coccobacilli", morph: "coccobacilli", arrangement: "Tiny pleomorphic coccobacilli",
    tests: { Oxidase: "+", "X factor": "Required", "V factor": "Required", Satellitism: "+ (around S. aureus)", MacConkey: "No growth" },
    colony: "Grows on chocolate agar; satellite colonies on blood agar around S. aureus.",
    clinical: "Epiglottitis and meningitis (type b), otitis media, sinusitis and COPD exacerbations.",
    tip: "Needs both X (haemin) and V (NAD): the classic factor-disc test.",
  },
  {
    id: "vcholerae", name: "Vibrio cholerae", genus: "Vibrio",
    gram: "neg", shape: "curved", morph: "commas", arrangement: "Comma-shaped rods",
    tests: { Oxidase: "+", TCBS: "Yellow colonies", Motility: "Darting", "String test": "+" },
    colony: "Yellow colonies on TCBS (sucrose fermenter).",
    clinical: "Cholera: profuse \"rice-water\" diarrhoea and dehydration.",
    tip: "Oxidase + and grows in alkaline conditions, unlike Enterobacterales.",
  },
  {
    id: "cjejuni", name: "Campylobacter jejuni", genus: "Campylobacter",
    gram: "neg", shape: "curved", morph: "spirals", arrangement: "Seagull or S-shaped rods",
    tests: { Oxidase: "+", Catalase: "+", Oxygen: "Microaerophilic", "42 °C": "Grows", Hippurate: "+", Urease: "−" },
    colony: "Grey, watery, spreading colonies on selective media at 42 °C.",
    clinical: "The commonest bacterial gastroenteritis in the UK; linked to Guillain–Barré syndrome.",
    tip: "Undercooked chicken. Hippurate + separates jejuni from coli.",
  },
  {
    id: "hpylori", name: "Helicobacter pylori", genus: "Helicobacter",
    gram: "neg", shape: "curved", morph: "spirals", arrangement: "Spiral rods",
    tests: { Oxidase: "+", Catalase: "+", Urease: "+ (rapid, strong)", Oxygen: "Microaerophilic" },
    colony: "Slow-growing tiny colonies (3–7 days).",
    clinical: "Gastritis, peptic ulcers, gastric adenocarcinoma and MALT lymphoma.",
    tip: "Urease is the basis of the urea breath test and CLO test.",
  },
];

export const byId = Object.fromEntries(organisms.map((o) => [o.id, o]));

// The identification key. Each node asks one question. An option leads
// either to another node (`next`) or to an organism (`id`). `fact` is the
// phrase the quiz and flashcards borrow to describe a profile.
export const key = {
  id: "gram",
  step: "Gram stain",
  question: "What colour are the cells after Gram staining?",
  how: "Crystal violet, iodine, alcohol decolouriser, then safranin. A thick peptidoglycan wall holds on to the violet.",
  options: [
    {
      label: "Purple", sub: "Gram-positive", fact: "Gram-positive", swatch: "var(--gram-pos)",
      next: {
        id: "gp-shape",
        step: "Morphology",
        question: "What shape are the purple cells?",
        how: "Look under oil immersion (×1000). Note the arrangement too; it hints at the genus.",
        options: [
          {
            label: "Cocci", sub: "Round cells", fact: "cocci", icon: "cocci",
            next: {
              id: "gpc-catalase",
              step: "Catalase",
              question: "Do bubbles form when a colony meets 3% hydrogen peroxide?",
              how: "Pick the colony carefully. Red cells in blood agar are catalase-positive and can give a false result.",
              options: [
                {
                  label: "Bubbles", sub: "Catalase positive", fact: "catalase positive", icon: "bubbles",
                  next: {
                    id: "staph-coag",
                    step: "Coagulase",
                    question: "Does the organism clot rabbit plasma?",
                    how: "The slide test detects bound coagulase (clumping factor); the tube test detects free coagulase after 4–24 h at 37 °C.",
                    options: [
                      { label: "Clots", sub: "Coagulase positive", fact: "coagulase positive", icon: "clot", id: "saureus" },
                      {
                        label: "No clot", sub: "Coagulase negative", fact: "coagulase negative", icon: "liquid",
                        next: {
                          id: "cons-novo",
                          step: "Novobiocin",
                          question: "Is there a zone around the 5 µg novobiocin disc?",
                          how: "A zone of 16 mm or more counts as sensitive. Most useful for staphylococci from urine.",
                          options: [
                            { label: "Zone", sub: "Sensitive", fact: "novobiocin sensitive", icon: "zone", id: "sepidermidis" },
                            { label: "No zone", sub: "Resistant", fact: "novobiocin resistant", icon: "nozone", id: "ssaprophyticus" },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  label: "No bubbles", sub: "Catalase negative", fact: "catalase negative", icon: "flat",
                  next: {
                    id: "strep-haem",
                    step: "Haemolysis",
                    question: "What does the blood agar look like around the colonies?",
                    how: "Hold the plate up to the light. Green is partial (α), clear is complete (β), no change is γ.",
                    options: [
                      {
                        label: "Green", sub: "α-haemolysis", fact: "α-haemolytic", swatch: "var(--alpha)",
                        next: {
                          id: "alpha-opto",
                          step: "Optochin",
                          question: "Is there a zone around the optochin (P) disc?",
                          how: "Incubate in CO₂. A zone of 14 mm or more means sensitive.",
                          options: [
                            { label: "Zone", sub: "Sensitive", fact: "optochin sensitive", icon: "zone", id: "spneumoniae" },
                            { label: "No zone", sub: "Resistant", fact: "optochin resistant", icon: "nozone", id: "viridans" },
                          ],
                        },
                      },
                      {
                        label: "Clear", sub: "β-haemolysis", fact: "β-haemolytic", swatch: "var(--beta)",
                        next: {
                          id: "beta-bac",
                          step: "Bacitracin",
                          question: "Is there a zone around the bacitracin (A) disc?",
                          how: "Any zone of inhibition counts as sensitive. Lancefield grouping confirms.",
                          options: [
                            { label: "Zone", sub: "Sensitive", fact: "bacitracin sensitive", icon: "zone", id: "spyogenes" },
                            { label: "No zone", sub: "Resistant, CAMP +", fact: "bacitracin resistant", icon: "nozone", id: "sagalactiae" },
                          ],
                        },
                      },
                      {
                        label: "No change", sub: "γ-haemolysis", fact: "non-haemolytic, grows on bile esculin", swatch: "var(--gamma)",
                        id: "efaecalis",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            label: "Bacilli", sub: "Rod-shaped cells", fact: "bacilli", icon: "rods",
            next: {
              id: "gpb-spore",
              step: "Spores",
              question: "Are there endospores?",
              how: "Spores show as unstained gaps on a Gram stain; a malachite green spore stain confirms them.",
              options: [
                {
                  label: "Spores", sub: "Spore-forming", fact: "spore-forming", icon: "spore",
                  next: {
                    id: "spore-o2",
                    step: "Oxygen",
                    question: "Does it grow in air, or only anaerobically?",
                    how: "Set up paired aerobic and anaerobic plates and compare growth after 48 h.",
                    options: [
                      {
                        label: "Aerobic", sub: "Bacillus", fact: "aerobic", icon: "air",
                        next: {
                          id: "bacillus",
                          step: "Motility & haemolysis",
                          question: "Is it motile and β-haemolytic?",
                          how: "Check a hanging drop or semi-solid agar, and look at the blood agar plate.",
                          options: [
                            { label: "Neither", sub: "Non-motile, non-haemolytic", fact: "non-motile and non-haemolytic", icon: "stab", id: "banthracis" },
                            { label: "Both", sub: "Motile, β-haemolytic", fact: "motile and β-haemolytic", icon: "diffuse", id: "bcereus" },
                          ],
                        },
                      },
                      {
                        label: "Anaerobic", sub: "Clostridium", fact: "anaerobic", icon: "noair",
                        next: {
                          id: "clostridia",
                          step: "Haemolysis & lecithinase",
                          question: "What does blood agar and egg-yolk agar show?",
                          how: "The Nagler test: half the egg-yolk plate carries antitoxin, which blocks lecithinase.",
                          options: [
                            { label: "Double zone", sub: "Lecithinase +", fact: "double-zone haemolysis, lecithinase positive", swatch: "var(--beta)", id: "cperfringens" },
                            { label: "Ground glass", sub: "No haemolysis", fact: "non-haemolytic with ground-glass colonies", icon: "flat", id: "cdifficile" },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  label: "No spores", sub: "Non-spore-forming", fact: "non-spore-forming", icon: "rods",
                  next: {
                    id: "gpb-motility",
                    step: "Motility",
                    question: "Is it motile at room temperature (25 °C)?",
                    how: "Stab semi-solid agar and incubate at 25 °C. Look for an umbrella of growth below the surface.",
                    options: [
                      { label: "Tumbling", sub: "Motile at 25 °C", fact: "tumbling motility", icon: "diffuse", id: "listeria" },
                      { label: "Non-motile", sub: "Club-shaped", fact: "non-motile, club-shaped", icon: "stab", id: "cdiphtheriae" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      label: "Pink", sub: "Gram-negative", fact: "Gram-negative", swatch: "var(--gram-neg)",
      next: {
        id: "gn-shape",
        step: "Morphology",
        question: "What shape are the pink cells?",
        how: "Gram-negative rods are the biggest group, so spot the unusual shapes first.",
        options: [
          {
            label: "Diplococci", sub: "Paired cocci", fact: "diplococci", icon: "diplo",
            next: {
              id: "gnc-sugar",
              step: "Sugars",
              question: "Which sugars does it use?",
              how: "CTA sugars or a rapid carbohydrate kit: yellow means acid from that sugar. All three are oxidase-positive.",
              options: [
                { label: "Glucose + maltose", sub: "Both yellow", fact: "oxidase positive, uses glucose and maltose", icon: "sugar2", id: "nmeningitidis" },
                { label: "Glucose only", sub: "Maltose red", fact: "oxidase positive, uses glucose only", icon: "sugar1", id: "ngonorrhoeae" },
                { label: "None", sub: "DNase +", fact: "oxidase positive, uses no sugars", icon: "sugar0", id: "mcatarrhalis" },
              ],
            },
          },
          {
            label: "Bacilli", sub: "Straight rods", fact: "bacilli", icon: "rods",
            next: {
              id: "gnb-oxidase",
              step: "Oxidase",
              question: "Does the colony turn purple on oxidase reagent?",
              how: "Rub a colony onto the strip with a plastic loop or a wooden stick; nichrome gives false positives. Read within 10 s.",
              options: [
                { label: "Purple", sub: "Oxidase positive", fact: "oxidase positive", swatch: "var(--oxidase)", id: "paeruginosa" },
                {
                  label: "Colourless", sub: "Oxidase negative", fact: "oxidase negative", swatch: "var(--neutral)",
                  next: {
                    id: "gnb-lactose",
                    step: "Lactose",
                    question: "What colour are the colonies on MacConkey agar?",
                    how: "Lactose fermentation drops the pH and turns the neutral red indicator pink.",
                    options: [
                      {
                        label: "Pink", sub: "Lactose fermenter", fact: "lactose fermenter", swatch: "var(--lf)",
                        next: {
                          id: "lf-indole",
                          step: "Indole",
                          question: "Does a red ring form after adding Kovac's reagent?",
                          how: "Grow overnight in tryptone water, then layer on Kovac's. Red = indole from tryptophan.",
                          options: [
                            { label: "Red ring", sub: "Indole positive", fact: "indole positive", swatch: "var(--indole)", id: "ecoli" },
                            {
                              label: "Yellow ring", sub: "Indole negative", fact: "indole negative", swatch: "var(--yellow)",
                              next: {
                                id: "lf-motility",
                                step: "Motility",
                                question: "Is it motile?",
                                how: "Motility agar: growth spreading away from the stab line means motile.",
                                options: [
                                  { label: "Non-motile", sub: "Very mucoid", fact: "non-motile and mucoid", icon: "stab", id: "kpneumoniae" },
                                  { label: "Motile", sub: "Spreads from stab", fact: "motile", icon: "diffuse", id: "ecloacae" },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        label: "Pale", sub: "Non-lactose fermenter", fact: "non-lactose fermenter", swatch: "var(--nlf)",
                        next: {
                          id: "nlf-h2s",
                          step: "H₂S",
                          question: "Is there black precipitate in TSI, or black-centred colonies on XLD?",
                          how: "Hydrogen sulphide reacts with iron salts in the medium to form black ferrous sulphide.",
                          options: [
                            {
                              label: "Black", sub: "H₂S positive", fact: "H₂S positive", swatch: "var(--black)",
                              next: {
                                id: "h2s-urease",
                                step: "Urease",
                                question: "Does Christensen's urea turn pink?",
                                how: "Urease splits urea into ammonia, which raises the pH. Proteus does it within hours.",
                                options: [
                                  { label: "Pink", sub: "Urease positive", fact: "urease positive, swarms", swatch: "var(--urease)", id: "pmirabilis" },
                                  { label: "Yellow", sub: "Urease negative", fact: "urease negative, motile", swatch: "var(--orange)", id: "salmonella" },
                                ],
                              },
                            },
                            { label: "No black", sub: "H₂S negative", fact: "H₂S negative, non-motile", swatch: "var(--red)", id: "shigella" },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            label: "Coccobacilli", sub: "Short, plump rods", fact: "coccobacilli", icon: "cocco",
            next: {
              id: "gncb-growth",
              step: "Growth",
              question: "Where does it grow?",
              how: "Plate on blood, chocolate and MacConkey agar side by side.",
              options: [
                { label: "MacConkey too", sub: "Oxidase negative", fact: "oxidase negative, grows on MacConkey", icon: "plate", id: "abaumannii" },
                { label: "Chocolate only", sub: "Needs X + V", fact: "needs X and V factors", icon: "choc", id: "hinfluenzae" },
              ],
            },
          },
          {
            label: "Curved", sub: "Comma or spiral", fact: "curved", icon: "curved",
            next: {
              id: "curved-o2",
              step: "Atmosphere",
              question: "What conditions does it need?",
              how: "Curved Gram-negatives are all oxidase-positive; atmosphere and selective media split them.",
              options: [
                { label: "Air, TCBS", sub: "Yellow colonies", fact: "yellow on TCBS", swatch: "var(--yellow)", id: "vcholerae" },
                {
                  label: "Microaerophilic", sub: "5% O₂", fact: "microaerophilic", icon: "noair",
                  next: {
                    id: "micro-urease",
                    step: "Urease",
                    question: "Is it rapidly urease-positive?",
                    how: "A gastric biopsy in the CLO test turns pink within an hour if urease is present.",
                    options: [
                      { label: "Pink fast", sub: "Strong urease", fact: "strongly urease positive", swatch: "var(--urease)", id: "hpylori" },
                      { label: "No change", sub: "Hippurate +, 42 °C", fact: "urease negative, grows at 42 °C", swatch: "var(--orange)", id: "cjejuni" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

/** Every organism reachable below a node. */
export function leavesOf(node) {
  const out = [];
  (function walk(n) {
    for (const opt of n.options) opt.id ? out.push(opt.id) : walk(opt.next);
  })(node);
  return out;
}

/** The route to each organism: the step names and the answers given. */
export const routes = (() => {
  const map = {};
  (function walk(n, trail) {
    for (const opt of n.options) {
      const t = [...trail, { step: n.step, fact: opt.fact, label: opt.label, node: n, opt }];
      opt.id ? (map[opt.id] = t) : walk(opt.next, t);
    }
  })(key, []);
  return map;
})();

// Bench tests for the reference section. `look` picks the illustration:
// tube, plate or disc. Colours come from CSS variables in styles.css.
export const tests = [
  {
    name: "Gram stain", look: "slide", tag: "Stain",
    what: "Sorts bacteria by cell wall. Thick peptidoglycan keeps the crystal violet; thin walls lose it and take up safranin.",
    results: [
      { sign: "+", label: "Purple", color: "var(--gram-pos)" },
      { sign: "−", label: "Pink", color: "var(--gram-neg)" },
    ],
    used: "The first step for every isolate.",
  },
  {
    name: "Catalase", look: "slide", tag: "Enzyme",
    what: "Catalase breaks down hydrogen peroxide into water and oxygen gas.",
    results: [
      { sign: "+", label: "Bubbles", color: "var(--neutral)", fx: "bubbles" },
      { sign: "−", label: "No bubbles", color: "var(--neutral)" },
    ],
    used: "Staphylococcus (+) vs Streptococcus and Enterococcus (−).",
  },
  {
    name: "Coagulase", look: "tube", tag: "Enzyme",
    what: "Coagulase converts fibrinogen in plasma into a fibrin clot.",
    results: [
      { sign: "+", label: "Clot", color: "var(--plasma)", fx: "clot" },
      { sign: "−", label: "Liquid", color: "var(--plasma)" },
    ],
    used: "S. aureus (+) vs coagulase-negative staphylococci.",
  },
  {
    name: "Oxidase", look: "slide", tag: "Enzyme",
    what: "Detects cytochrome c oxidase. The reagent is oxidised to a purple compound.",
    results: [
      { sign: "+", label: "Purple in 10 s", color: "var(--oxidase)" },
      { sign: "−", label: "Colourless", color: "var(--neutral)" },
    ],
    used: "Pseudomonas, Neisseria, Vibrio, Campylobacter (+) vs Enterobacterales (−).",
  },
  {
    name: "Indole", look: "tube", tag: "Biochemical",
    what: "Tryptophanase splits tryptophan into indole, which turns Kovac's reagent red.",
    results: [
      { sign: "+", label: "Red ring", color: "var(--broth)", ring: "var(--indole)" },
      { sign: "−", label: "Yellow ring", color: "var(--broth)", ring: "var(--yellow)" },
    ],
    used: "E. coli (+) vs Klebsiella and Enterobacter (−).",
  },
  {
    name: "Urease", look: "tube", tag: "Biochemical",
    what: "Urease splits urea into ammonia; the rising pH turns phenol red pink.",
    results: [
      { sign: "+", label: "Pink", color: "var(--urease)", slant: true },
      { sign: "−", label: "Yellow-orange", color: "var(--orange)", slant: true },
    ],
    used: "Proteus and H. pylori (strong +), Klebsiella (slow +).",
  },
  {
    name: "Citrate", look: "tube", tag: "Biochemical",
    what: "Can the organism live on citrate as its only carbon source? Growth turns bromothymol blue.",
    results: [
      { sign: "+", label: "Blue", color: "var(--citrate-pos)", slant: true },
      { sign: "−", label: "Green", color: "var(--citrate-neg)", slant: true },
    ],
    used: "Klebsiella and Enterobacter (+) vs E. coli (−).",
  },
  {
    name: "H₂S (TSI)", look: "tube", tag: "Biochemical",
    what: "Thiosulphate is reduced to H₂S, which forms black iron sulphide in triple sugar iron agar.",
    results: [
      { sign: "+", label: "Black butt", color: "var(--red)", butt: "var(--black)", slant: true },
      { sign: "−", label: "No black", color: "var(--red)", butt: "var(--yellow)", slant: true },
    ],
    used: "Salmonella and Proteus (+) vs Shigella (−).",
  },
  {
    name: "Motility", look: "tube", tag: "Physiology",
    what: "Semi-solid agar is stabbed once. Motile bacteria swim away from the line.",
    results: [
      { sign: "+", label: "Cloudy spread", color: "var(--agar)", fx: "diffuse" },
      { sign: "−", label: "Stab line only", color: "var(--agar)", fx: "stab" },
    ],
    used: "Separates Klebsiella and Shigella (non-motile) from their motile relatives.",
  },
  {
    name: "Lactose (MacConkey)", look: "plate", tag: "Culture",
    what: "Bile salts select for Gram-negatives; lactose fermenters turn the neutral red indicator pink.",
    results: [
      { sign: "+", label: "Pink colonies", color: "var(--mac)", colony: "var(--lf)" },
      { sign: "−", label: "Pale colonies", color: "var(--mac)", colony: "var(--nlf)" },
    ],
    used: "The main split within Enterobacterales.",
  },
  {
    name: "Haemolysis", look: "plate", tag: "Culture",
    what: "How red cells in blood agar are destroyed around the colonies.",
    results: [
      { sign: "α", label: "Green, partial", color: "var(--blood)", colony: "var(--neutral)", halo: "var(--alpha)" },
      { sign: "β", label: "Clear, complete", color: "var(--blood)", colony: "var(--neutral)", halo: "var(--beta)" },
      { sign: "γ", label: "None", color: "var(--blood)", colony: "var(--neutral)" },
    ],
    used: "The first split within the streptococci.",
  },
  {
    name: "Optochin", look: "disc", tag: "Disc",
    what: "Ethylhydrocupreine kills pneumococci but not viridans streptococci.",
    results: [
      { sign: "S", label: "Zone ≥ 14 mm", color: "var(--blood)", halo: "var(--alpha)", zone: true },
      { sign: "R", label: "No zone", color: "var(--blood)", halo: "var(--alpha)" },
    ],
    used: "S. pneumoniae (S) vs viridans streptococci (R).",
  },
  {
    name: "Bacitracin", look: "disc", tag: "Disc",
    what: "A 0.04 U disc inhibits group A streptococci only.",
    results: [
      { sign: "S", label: "Any zone", color: "var(--blood)", halo: "var(--beta)", zone: true },
      { sign: "R", label: "No zone", color: "var(--blood)", halo: "var(--beta)" },
    ],
    used: "S. pyogenes (S) vs S. agalactiae (R).",
  },
  {
    name: "Novobiocin", look: "disc", tag: "Disc",
    what: "A 5 µg disc tested on Mueller–Hinton agar.",
    results: [
      { sign: "S", label: "Zone ≥ 16 mm", color: "var(--agar-mh)", zone: true },
      { sign: "R", label: "No zone", color: "var(--agar-mh)" },
    ],
    used: "S. epidermidis (S) vs S. saprophyticus (R).",
  },
  {
    name: "Bile esculin", look: "tube", tag: "Biochemical",
    what: "Growth in 40% bile plus hydrolysis of esculin turns the medium black.",
    results: [
      { sign: "+", label: "Blackened", color: "var(--black)", slant: true },
      { sign: "−", label: "No change", color: "var(--esculin)", slant: true },
    ],
    used: "Enterococcus (+) vs most streptococci (−).",
  },
  {
    name: "CAMP", look: "plate", tag: "Culture",
    what: "CAMP factor boosts the β-haemolysin of a S. aureus streak into an arrowhead shape.",
    results: [
      { sign: "+", label: "Arrowhead", color: "var(--blood)", fx: "arrow" },
      { sign: "−", label: "No arrowhead", color: "var(--blood)", fx: "streak" },
    ],
    used: "S. agalactiae and Listeria (+).",
  },
];
