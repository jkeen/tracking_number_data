import { decode, normalize } from "./decode.js"
import { definitions } from "./dataset.js"

/** @import { Definition, Match } from "./shapes.js" */

/** @param {Match} match */
const rank = (match) => [match.valid ? 0 : 1, match.role === "shipper" ? 1 : 0, -match.confidence]

const byRank = (a, b) => {
  const left = rank(a)
  const right = rank(b)

  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) return left[index] - right[index]
  }

  return 0
}

/**
 * @param {Definition[]} [against]
 * @returns {Match[]}
 */
export const candidates = (input, against = definitions) =>
  against
    .map((definition) => decode(definition, input))
    .filter((match) => match !== null)
    .sort(byRank)

export const matches = (input, against) => candidates(input, against).filter((match) => match.valid)

export const nearMisses = (input, against) => candidates(input, against).filter((match) => !match.valid)

export const detect = (input, against) =>
  matches(input, against).reduce((best, match) => (!best || match.confidence > best.confidence ? match : best), null)

export const search = (body, against = definitions) => {
  const found = new Map()

  for (const definition of against) {
    for (const hit of body.toUpperCase().matchAll(definition.search)) {
      const match = decode(definition, hit[0])
      if (!match?.valid) continue

      const existing = found.get(match.number)
      if (!existing || match.confidence > existing.confidence) found.set(match.number, match)
    }
  }

  return Array.from(found.values())
}

export { normalize }
