import { alphabetFor, validates } from "./checksum.js"

const MODULOS = [7, 9, 10, 11, 36, 37]
const MULTIPLIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const UNWEIGHTED = MODULOS.flatMap((modulo) => [
  ...MULTIPLIERS.flatMap((evens_multiplier) =>
    MULTIPLIERS.map((odds_multiplier) => ({ name: "mod10", evens_multiplier, odds_multiplier, modulo }))
  ),
  { name: "luhn", modulo },
  { name: "mod7", modulo },
  { name: "s10", modulo },
  { name: "mod_37_36", modulo },
])

// Weights repeat along the serial: FedEx runs 3, 1, 7 over eleven characters.
const PATTERNS = [
  [3, 1, 7],
  [1, 3, 7],
  [7, 3, 1],
  [1, 3],
  [3, 1],
  [2, 1],
  [1, 2],
  [8, 6, 4, 2, 3, 5, 9, 7],
]

const MODULO_PAIRS = [
  [11, 10],
  [10, 10],
  [11, 11],
  [7, 10],
  [36, 10],
]

const repeated = (pattern, size) => Array.from({ length: size }, (_, index) => pattern[index % pattern.length])

export const configsFor = (size) => [
  ...UNWEIGHTED,
  ...PATTERNS.flatMap((pattern) =>
    MODULO_PAIRS.map(([modulo1, modulo2]) => ({
      name: "sum_product_with_weightings_and_modulo",
      weightings: repeated(pattern, size),
      modulo1,
      modulo2,
    }))
  ),
]

export const numbersIn = (text) =>
  text
    .split(/[\s,;]+/)
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean)

const SHORTEST_NESTED = 8

/**
 * A barcode is often a known number with fields wrapped around it, so the first thing
 * worth asking is whether one is already in here. Formats with no check digit are left
 * out: they match anything of the right length and so are evidence of nothing.
 */
export const findNested = (numbers, definitions, decode) => {
  const lengths = new Set(numbers.map((number) => number.length))
  if (numbers.length < 2 || lengths.size !== 1) return []

  const checked = definitions.filter((definition) => definition.spec.validation?.checksum)
  const found = new Map()

  for (const [index, number] of numbers.entries()) {
    for (let from = 0; from < number.length; from++) {
      for (let through = from + SHORTEST_NESTED; through <= number.length; through++) {
        if (from === 0 && through === number.length) continue

        for (const definition of checked) {
          const match = decode(definition, number.slice(from, through))
          if (!match?.valid) continue

          const key = `${definition.key}:${from}:${through}`
          const seen = found.get(key) ?? { definition, from, through, matches: [] }
          seen.matches[index] = match
          found.set(key, seen)
        }
      }
    }
  }

  return [...found.values()]
    .filter((hit) => hit.matches.filter(Boolean).length === numbers.length)
    .sort((one, other) => other.through - other.from - (one.through - one.from))
}

const SHORTEST_SERIAL = 4
const LONGEST_SERIAL = 22

/**
 * A check digit usually follows the run it was worked out from, and that run is often a
 * field inside a longer barcode rather than the whole of what comes before it.
 */
const splitsFor = (length) =>
  Array.from({ length }, (_, at) => at).flatMap((at) => {
    const runs = []

    for (let size = SHORTEST_SERIAL; size <= Math.min(at, LONGEST_SERIAL); size++) {
      const from = at - size
      runs.push({
        at,
        from,
        through: at,
        shape: from === 0 ? "everything before it" : `the ${size} characters before it`,
        of: (number) => number.slice(from, at),
      })
    }

    return [
      ...runs,
      { at, from: at + 1, through: length, shape: "everything after it", of: (number) => number.slice(at + 1) },
      {
        at,
        from: 0,
        through: length,
        shape: "every other character",
        of: (number) => number.slice(0, at) + number.slice(at + 1),
      },
    ]
  })

const same = (values) => new Set(values).size === 1

/** Which positions hold the same character in every number, and which move. */
export const columnsOf = (numbers) => {
  if (!numbers.length) return []

  return Array.from({ length: numbers[0].length }, (_, at) => {
    const values = numbers.map((number) => number[at])

    return { at, values, constant: same(values), shown: same(values) ? values[0] : "·" }
  })
}

/**
 * Every place a check digit could sit, against every algorithm and set of constants, kept
 * only where it explains all the numbers. A split whose check digit never changes is
 * dropped: the numbers are not testing it.
 */
export const findCheckDigit = (numbers) => {
  const lengths = new Set(numbers.map((number) => number.length))
  if (numbers.length < 2 || lengths.size !== 1) {
    return { fits: [], tried: 0, expected: 0, lengths: [...lengths] }
  }

  const fits = []
  let tried = 0
  let expected = 0

  for (const split of splitsFor(numbers[0].length)) {
    const parts = numbers.map((number) => ({ serial: split.of(number), check: number[split.at] }))
    if (parts.some(({ serial }) => serial.length < SHORTEST_SERIAL)) continue
    if (same(parts.map(({ check }) => check))) continue
    if (same(parts.map(({ serial }) => serial))) continue

    for (const config of configsFor(parts[0].serial.length)) {
      tried += 1
      expected += (1 / alphabetFor(config.name).length) ** numbers.length

      if (parts.every(({ serial, check }) => validates(config, serial, check))) {
        fits.push({ at: split.at, from: split.from, through: split.through, shape: split.shape, config, parts })
      }
    }
  }

  return { fits, tried, expected, lengths: [...lengths], placements: placementsOf(fits) }
}

/**
 * Where the check digit sits is the finding. What it reads and which arithmetic agrees
 * hang off it. Ordered by position, which says nothing about which is likeliest, because
 * with a handful of numbers nothing here does.
 */
const placementsOf = (fits) => {
  const byPosition = new Map()

  for (const fit of fits) {
    const spans = byPosition.get(fit.at) ?? new Map()
    const key = `${fit.from}:${fit.through}`
    const span = spans.get(key) ?? { ...fit, configs: [] }
    span.configs.push(fit.config)
    spans.set(key, span)
    byPosition.set(fit.at, spans)
  }

  return [...byPosition.entries()]
    .map(([at, spans]) => {
      const ranked = [...spans.values()].sort((one, other) => one.configs.length - other.configs.length)

      return { at, best: ranked[0], spans: ranked, settings: ranked.reduce((count, span) => count + span.configs.length, 0) }
    })
    .sort((one, other) => one.at - other.at)
}
