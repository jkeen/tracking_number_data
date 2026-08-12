import { ALGORITHMS } from "./checksum.js"
import { labelFor } from "./names.js"
import { definitions } from "./dataset.js"
import { decode } from "./decode.js"

// How each one works, in words. Presentation rather than spec. The dataset carries the
// constants and this says what is done with them.
const STEPS = {
  mod10: [
    "Take the serial one character at a time. A digit counts as itself. A letter counts as its position in the alphabet, offset by three and wrapped at ten.",
    "Multiply each one by the multiplier for its position. Even positions get one multiplier and odd positions get another.",
    "Add the results. The check digit is whatever brings that total up to a multiple of ten.",
  ],
  mod7: [
    "Read the serial as one whole number.",
    "Divide it by seven. The remainder is the check digit.",
  ],
  s10: [
    "Multiply the serial's eight digits by 8, 6, 4, 2, 3, 5, 9 and 7 in turn, and add the results.",
    "Take the remainder after dividing by eleven.",
    "A remainder of 1 means a check digit of 0, and a remainder of 0 means 5. Otherwise the check digit is eleven minus the remainder.",
  ],
  luhn: [
    "Working right to left along the serial, double every second digit, taking nine off anything that goes above nine.",
    "Add the results. The check digit is whatever brings that total up to a multiple of ten.",
  ],
  mod_37_36: [
    "Start a running value at 36.",
    "For each character add its value, counting digits as themselves and letters as 10 to 35. Wrap back if it passes 36, double it, then wrap again. The doubling is why the row below jumps around instead of climbing.",
    "The check character is 37 minus the final value, read back through the same alphabet, so it can be a letter as well as a digit.",
  ],
  sum_product_with_weightings_and_modulo: [
    "Multiply each digit of the serial by its weighting and add the results.",
    "Take the remainder after dividing by the first modulo, then the remainder of that after dividing by the second.",
    "What is left is the check digit.",
  ],
}

export { labelFor } from "./names.js"

export const isAlgorithm = (name) => ALGORITHMS.includes(name)

export const stepsFor = (name) => STEPS[name] ?? []

export const usedBy = (name) =>
  definitions.filter((definition) => definition.spec.validation?.checksum?.name === name)

/** A number the dataset documents, worked through so the algorithm is not just prose. */
export const workedExample = (name) => {
  for (const definition of usedBy(name)) {
    for (const number of definition.spec.test_numbers?.valid ?? []) {
      const match = decode(definition, number)
      if (match?.valid && match.expectedCheckDigit) return { definition, match }
    }
  }

  return null
}

export const inUse = () => ALGORITHMS.filter((name) => usedBy(name).length)
