import { build } from "./definition.js"

const files = import.meta.glob("../../../couriers/*.json", { eager: true, import: "default" })

export const couriers = Object.keys(files)
  .sort()
  .map((path) => files[path])
  .sort((a, b) => a.name.localeCompare(b.name))

export const definitions = build(couriers)

export const definitionByKey = (key) => definitions.find((definition) => definition.key === key)
