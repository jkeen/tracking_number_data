import { labelFor } from "./names.js"

const S10_WEIGHTS = [8, 6, 4, 2, 3, 5, 9, 7]

const describeMod10 = (config) => {
  const evens = config.evens_multiplier ?? 1
  const odds = config.odds_multiplier ?? 1
  const direction = config.reverse ? ", counted from the right" : ""
  const modulo = (config.modulo ?? 10) === 10 ? "" : `, modulo ${config.modulo}`

  return `even positions ×${evens}, odd positions ×${odds}${direction}${modulo}`
}

const describeWeighted = (config) => {
  const weights = (config.weightings ?? []).join(" ")
  const moduli = config.modulo1 === config.modulo2 ? `mod ${config.modulo1}` : `mod ${config.modulo1} then mod ${config.modulo2}`

  return `digits × ${weights}, ${moduli}`
}

// Read back from the constants in hand rather than the ones the standard publishes, so
// the sentence still describes the sum after someone has changed them.

/** How one format sets an algorithm up, without naming the algorithm again. */
export const describeVariant = (config) => {
  switch (config?.name) {
    case "mod10":
      return describeMod10(config)
    case "mod7":
      return `the serial as a number, modulo ${config.modulo ?? 7}`
    case "s10":
      return `digits × ${(config.weightings ?? S10_WEIGHTS).join(" ")}, modulo ${config.modulo ?? 11}`
    case "luhn":
      return `every second digit doubled, modulo ${config.modulo ?? 10}`
    case "mod_37_36":
      return `the alphanumeric scheme used by DPD, modulo ${config.modulo ?? 36}`
    case "sum_product_with_weightings_and_modulo":
      return describeWeighted(config)
    default:
      return null
  }
}

export const describeChecksum = (config) => {
  if (!config) return "This format defines no checksum, so the pattern alone decides."

  const variant = describeVariant(config)

  return variant ? `${labelFor(config.name)} (${variant})` : config.name
}

// Only shown when the rule actually fired, so "because" is the accurate word: the
// serial is rewritten when it matches, not when it fails to.
export const describeSerialRule = (validation) => {
  const prepend = validation?.serial_number_format?.prepend_if
  if (!prepend) return null

  return `${prepend.content} is prepended before the check runs, because the serial matches ${prepend.matches_regex}`
}

/**
 * Formats with no checksum can only ever be pattern-matched, so a mistyped one still
 * reads as a tracking number. Said in both places a format is shown, hence once here.
 */
export const describeMissingChecksum = (definition) =>
  definition?.spec?.validation?.checksum
    ? null
    : `Nothing inside the number can catch a mistyped digit, and picking one out of a block of text comes down to a weak pattern match alone, making detection collisions more likely.`

export const describeRequirements = (validation) => {
  const required = validation?.additional?.exists ?? []

  return required.length ? `Only valid when the number resolves a ${required.join(" and ")}` : null
}
