// Static metadata about the datasets and pathogens shown on the site.

export const PATHOGENS = {
  ecoli: {
    short: "E. coli",
    name: "Escherichia coli",
    drug: "3rd-gen cephalosporins",
    label: "E. coli · cephalosporin-resistant",
    color: "--s-ecoli",
  },
  mrsa: {
    short: "MRSA",
    name: "Staphylococcus aureus",
    drug: "methicillin",
    label: "S. aureus · methicillin-resistant (MRSA)",
    color: "--s-mrsa",
  },
  kpn: {
    short: "K. pneumoniae",
    name: "Klebsiella pneumoniae",
    drug: "3rd-gen cephalosporins",
    label: "K. pneumoniae · cephalosporin-resistant",
    color: "--s-kpn",
  },
};

export const SOURCES = {
  glass: {
    short: "Global · WHO",
    name: "WHO GLASS",
    pathogens: ["ecoli", "mrsa"],
    measure: "% of bloodstream infections resistant",
    defaultCountry: "GBR",
  },
  ecdc: {
    short: "Europe · ECDC",
    name: "ECDC EARS-Net",
    pathogens: ["ecoli", "mrsa", "kpn"],
    measure: "% of invasive isolates resistant",
    defaultCountry: "ITA",
  },
};

// Class breaks for the sequential resistance scale (%, upper bounds exclusive).
export const BREAKS = [5, 10, 25, 40, 60];
export const RAMP_VARS = ["--q0", "--q1", "--q2", "--q3", "--q4", "--q5"];
export const BIN_LABELS = ["<5", "5–10", "10–25", "25–40", "40–60", "60+"];
