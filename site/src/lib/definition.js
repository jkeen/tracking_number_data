/** @import { Courier, Definition, Spec } from "./shapes.js" */

const parameterize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/** @param {Spec} spec */
export const patternOf = (spec) => (Array.isArray(spec.regex) ? spec.regex.join("") : spec.regex)

export const namedGroups = (pattern) =>
  Array.from(pattern.matchAll(/\(\?<([A-Za-z][A-Za-z0-9]*)>/g), (found) => found[1])

/**
 * @param {Courier[]} couriers
 * @returns {Definition[]}
 */
export const build = (couriers) => {
  const siblings = new Map()

  const definitions = couriers.flatMap((courier) =>
    courier.tracking_numbers.map((spec) => {
      const pattern = patternOf(spec)

      return {
        key: `${courier.courier_code}/${spec.id ?? parameterize(spec.name)}`,
        id: spec.id,
        name: spec.name,
        courier: { name: courier.name, code: courier.courier_code },
        pattern,
        verify: new RegExp(`^${pattern}$`, "d"),
        search: new RegExp(`\\b${pattern}\\b`, "g"),
        groupNames: namedGroups(pattern),
        spec,
        siblings,
      }
    })
  )

  for (const definition of definitions) {
    if (definition.id) siblings.set(definition.id, definition)
  }

  return definitions
}
