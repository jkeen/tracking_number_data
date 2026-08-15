import { build } from "./definition.js"

const files = import.meta.glob("../../../couriers/*.json", { eager: true, import: "default" })

export const couriers = Object.keys(files)
  .sort()
  .map((path) => files[path])
  .sort((a, b) => a.name.localeCompare(b.name))

export const definitions = build(couriers)

export const definitionByKey = (key) => definitions.find((definition) => definition.key === key)

// Format pages are addresses people have shared, so a renamed format answers at both.
export const renamedFrom = {
  "usps/usps_91": "usps/usps_impb_c",
  "usps/usps_22": "usps/usps_impb_n",
  "usps/usps_32V2": "usps/usps_impb_c",
  "fedex/fedex_smartpost": "usps/usps_impb_c",
  "dhl/dhl_ecommerce_30": "usps/usps_impb_c",
}
