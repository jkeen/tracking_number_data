import prefixes from "../data/zip3.json"

// data/zip3.json is generated from the GeoNames US postal export (CC BY 4.0) by taking
// the place holding the most ZIP codes in each three digit prefix. See site/README.md.

// The first three digits of a US ZIP name the sectional center facility that serves it,
// so this is the right area rather than the exact town — 912 entries instead of 41,000.
export const areaFor = (zip) => (/^\d{5}$/.test(zip ?? "") ? (prefixes[zip.slice(0, 3)] ?? null) : null)
