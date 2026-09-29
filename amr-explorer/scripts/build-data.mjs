// Builds the two files the site loads from the raw surveillance CSVs:
//   data/amr.json        – resistance + consumption, keyed by ISO-3 code
//   data/world.topo.json – simplified country shapes, ids re-keyed to ISO-3
// Run with `npm install && npm run build:data`.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { csvParse } from "d3";
import { feature, quantize } from "topojson-client";
import { topology } from "topojson-server";
import { presimplify, quantile, simplify } from "topojson-simplify";
import countries from "i18n-iso-countries";

const require = createRequire(import.meta.url);
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const round = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

// ---------- WHO GLASS (via Our World in Data) ----------
const glassRows = csvParse(read("data/raw/who_glass_owid_2016_2022.csv"));
const GLASS_PATHOGEN = { "E. coli": "ecoli", "S. aureus": "mrsa" };
const glass = { countries: {}, resistance: { ecoli: {}, mrsa: {} }, consumption: {} };
for (const r of glassRows) {
  const iso = r.Code;
  const year = +r.Year;
  glass.countries[iso] = r.Country;
  const key = GLASS_PATHOGEN[r.Pathogen];
  (glass.resistance[key][iso] ??= {})[year] = round(+r.Resistance_Rate);
  if (r.Consumption !== "") (glass.consumption[iso] ??= {})[year] = round(+r.Consumption, 2);
}

// ---------- ECDC EARS-Net resistance + ESAC-Net consumption ----------
const ecdcRows = csvParse(read("data/raw/ecdc_earsnet_esacnet_2013_2022.csv"));
const ECDC_ISO2 = { EL: "GR", UK: "GB" }; // ECDC uses EU country codes
const ECDC_PATHOGEN = {
  "Escherichia coli": "ecoli",
  "Klebsiella pneumoniae": "kpn",
  "Staphylococcus aureus": "mrsa",
};
const ecdc = {
  countries: {},
  resistance: { ecoli: {}, kpn: {}, mrsa: {} },
  consumption: {},
  consumptionSplit: {},
};
for (const r of ecdcRows) {
  const iso = countries.alpha2ToAlpha3(ECDC_ISO2[r.CountryCode] ?? r.CountryCode);
  if (!iso) throw new Error(`Unknown ECDC code ${r.CountryCode}`);
  const year = +r.Year;
  ecdc.countries[iso] = r.Country;
  (ecdc.resistance[ECDC_PATHOGEN[r.Bacteria]][iso] ??= {})[year] = round(+r.Resistance_pct);
  (ecdc.consumption[iso] ??= {})[year] = round(+r.Total_J01_DDD_per_1000, 2);
  (ecdc.consumptionSplit[iso] ??= {})[year] = [
    round(+r.Community_J01_DDD_per_1000, 2),
    round(+r.Hospital_J01_DDD_per_1000, 2),
  ];
}

const yearsOf = (src) =>
  [...new Set(Object.values(src.resistance).flatMap((byIso) =>
    Object.values(byIso).flatMap((byYear) => Object.keys(byYear).map(Number))))].sort();

const out = {
  generated: new Date().toISOString().slice(0, 10),
  sources: {
    glass: { ...glass, years: yearsOf(glass) },
    ecdc: { ...ecdc, years: yearsOf(ecdc) },
  },
};
writeFileSync(new URL("../data/amr.json", import.meta.url), JSON.stringify(out));

// ---------- Map geometry ----------
const world = require("world-atlas/countries-50m.json");
const fc = feature(world, world.objects.countries);
const features = fc.features
  .map((f) => {
    const iso = countries.numericToAlpha3(f.id);
    return iso ? { type: "Feature", id: iso, properties: { name: f.properties.name }, geometry: f.geometry } : null;
  })
  .filter((f) => f && f.id !== "ATA"); // Antarctica only wastes vertical space
let topo = topology({ countries: { type: "FeatureCollection", features } }, 1e5);
topo = presimplify(topo);
topo = quantize(simplify(topo, quantile(topo, 0.12)), 1e4);
writeFileSync(new URL("../data/world.topo.json", import.meta.url), JSON.stringify(topo));

const missing = (src) => Object.keys(src.countries).filter((iso) => !features.some((f) => f.id === iso));
console.log("GLASS countries:", Object.keys(glass.countries).length, "missing shapes:", missing(glass));
console.log("ECDC countries:", Object.keys(ecdc.countries).length, "missing shapes:", missing(ecdc));
