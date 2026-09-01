import prefixes from "../data/zip3.json"

// data/zip3.json is generated from the GeoNames US postal export (CC BY 4.0) by taking
// the place holding the most ZIP codes in each three digit prefix. See site/README.md.
export const areaFor = (zip) => (/^\d{5}$/.test(zip ?? "") ? (prefixes[zip.slice(0, 3)] ?? null) : null)
