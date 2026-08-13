export const ALGORITHMS = ["mod10", "mod7", "s10", "luhn", "mod_37_36", "sum_product_with_weightings_and_modulo"]

const DIGITS = "0123456789".split("")
const ALPHANUMERIC = DIGITS.concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))
// Defaults for datasets published before the constants moved into the definitions.
const S10_WEIGHTS = [8, 6, 4, 2, 3, 5, 9, 7]
const S10_MODULO = 11
const MOD_37_36 = 36
const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const leadingInteger = (value) => {
  const digits = String(value).match(/^\s*[+-]?\d+/)
  return digits ? parseInt(digits[0], 10) : 0
}

const characterValue = (character) =>
  /[0-9]/.test(character) ? Number(character) : (character.charCodeAt(0) - 3) % 10

const base36Value = (character) =>
  /[A-Za-z]/.test(character) ? character.toUpperCase().charCodeAt(0) - 55 : leadingInteger(character)

const complementOf = (total, modulo) => (total % modulo === 0 ? 0 : modulo - (total % modulo))

const weightedSum = (sequence, weights) =>
  sequence
    .split("")
    .reduce((total, character, index) => total + leadingInteger(character) * (weights[index] ?? 0), 0)

const mod10 = (sequence, checkDigit, config) => {
  const characters = config.reverse ? sequence.split("").reverse() : sequence.split("")

  const total = characters.reduce((sum, character, index) => {
    const value = characterValue(character)
    if (config.odds_multiplier !== undefined && index % 2 === 1) return sum + value * config.odds_multiplier
    if (config.evens_multiplier !== undefined && index % 2 === 0) return sum + value * config.evens_multiplier
    return sum + value
  }, 0)

  return complementOf(total, config.modulo ?? 10) === leadingInteger(checkDigit)
}

// Ruby's String#to_i is arbitrary precision and these sequences overflow a double.
const mod7 = (sequence, checkDigit, config) => {
  const digits = sequence.match(/^\s*(\d+)/)
  if (!digits) return false

  return BigInt(digits[1]) % BigInt(config.modulo ?? 7) === BigInt(leadingInteger(checkDigit))
}

const s10 = (sequence, checkDigit, config) => {
  const modulo = config.modulo ?? S10_MODULO
  const remainder = weightedSum(sequence, config.weightings ?? S10_WEIGHTS) % modulo
  const expected = remainder === 1 ? 0 : remainder === 0 ? 5 : modulo - remainder

  return expected === leadingInteger(checkDigit)
}

const luhn = (sequence, checkDigit, config) => {
  const total = sequence
    .split("")
    .reverse()
    .reduce((sum, character, index) => {
      const value = index % 2 === 0 ? leadingInteger(character) * 2 : leadingInteger(character)
      return sum + (value > 9 ? value - 9 : value)
    }, 0)

  return complementOf(total, config.modulo ?? 10) === leadingInteger(checkDigit)
}

const mod3736 = (sequence, checkDigit, config) => {
  const modulo = config.modulo ?? MOD_37_36
  const alphabet = config.alphabet ?? BASE36
  let running = modulo

  for (const character of sequence) {
    running += base36Value(character)
    if (running > modulo) running -= modulo
    running *= 2
    if (running > modulo) running -= modulo + 1
  }

  let expected = modulo + 1 - running
  if (expected === modulo) expected = 0

  return alphabet[expected] === checkDigit
}

const sumProduct = (sequence, checkDigit, config) =>
  ((weightedSum(sequence, config.weightings ?? []) % config.modulo1) % config.modulo2) === leadingInteger(checkDigit)

// What each algorithm reads off its config, and what it assumes when the format leaves
// one out. Two formats set the same sum when these agree, whatever the JSON spells out.
const DEFAULTS = {
  mod10: { evens_multiplier: 1, odds_multiplier: 1, modulo: 10, reverse: false },
  mod7: { modulo: 7 },
  s10: { weightings: S10_WEIGHTS, modulo: S10_MODULO },
  luhn: { modulo: 10 },
  mod_37_36: { modulo: MOD_37_36, alphabet: BASE36 },
  sum_product_with_weightings_and_modulo: { weightings: [], modulo1: null, modulo2: null },
}

export const settingsOf = (config) => {
  const defaults = DEFAULTS[config?.name]
  if (!defaults) return null

  return Object.fromEntries(Object.keys(defaults).map((key) => [key, config[key] ?? defaults[key]]))
}

export const sameSettings = (one, other) =>
  one?.name === other?.name && JSON.stringify(settingsOf(one)) === JSON.stringify(settingsOf(other))

export const isSupported = (algorithm) => ALGORITHMS.includes(algorithm)

export const alphabetFor = (algorithm) => (algorithm === "mod_37_36" ? ALPHANUMERIC : DIGITS)

/**
 * @param {import("./shapes.js").Checksum|undefined} config
 * @returns {boolean|null} null when the check could not be run, which is not the same
 *   as a wrong check digit — a half configured checksum in the lab reads as unknown.
 */
export const validates = (config, sequence, checkDigit) => {
  if (!config || !sequence || !checkDigit || !isSupported(config.name)) return null

  try {
    switch (config.name) {
      case "mod10":
        return mod10(sequence, checkDigit, config)
      case "mod7":
        return mod7(sequence, checkDigit, config)
      case "s10":
        return s10(sequence, checkDigit, config)
      case "luhn":
        return luhn(sequence, checkDigit, config)
      case "mod_37_36":
        return mod3736(sequence, checkDigit, config)
      case "sum_product_with_weightings_and_modulo":
        if (config.modulo1 === undefined || config.modulo2 === undefined) return null
        return sumProduct(sequence, checkDigit, config)
      default:
        return null
    }
  } catch {
    return null
  }
}

export const expectedCheckDigit = (config, sequence) => {
  if (!config || !sequence) return null

  return alphabetFor(config.name).find((candidate) => validates(config, sequence, candidate)) ?? null
}

const term = (text, meaning) => ({ text: String(text), meaning })
const operator = (text) => ({ text })

const CHECK_DIGIT = "The check digit this works out to."
const PRODUCTS = "Everything in the row above, added together."

// Past nine the answer is a letter, so the position it came from is worth showing too.
const alphabetStep = (modulo, running, alphabet, expected) => {
  const position = modulo + 1 - running === modulo ? 0 : modulo + 1 - running

  const parts = [
    term(modulo + 1, "One more than the modulo."),
    operator("−"),
    term(running, "The running value after the last character."),
  ]

  if (alphabet[position] === String(position)) return { parts, value: expected, meaning: CHECK_DIGIT }

  return {
    parts: [...parts, operator("="), term(position, "The position to read back through the alphabet.")],
    joiner: "→",
    value: expected,
    meaning: "The character at that position.",
  }
}

/**
 * The same arithmetic as above, kept rather than thrown away, so a page can show how a
 * check digit was arrived at. Tests hold every trace to the answer `validates` gives,
 * which is what stops the two drifting apart.
 */
export const trace = (config, sequence) => {
  if (!config || !sequence || !isSupported(config.name)) return null

  const characters = [...sequence]
  const expected = expectedCheckDigit(config, sequence)

  if (config.name === "mod7") {
    const digits = sequence.match(/^\s*(\d+)/)
    const modulo = config.modulo ?? 7

    return {
      shape: "whole",
      expected,
      steps: [
        {
          parts: [
            term(digits ? digits[1] : sequence, "The serial read as one whole number."),
            operator("mod"),
            term(modulo, "The modulo this format divides by."),
          ],
          value: expected,
          meaning: CHECK_DIGIT,
        },
      ],
    }
  }

  if (config.name === "mod_37_36") {
    const modulo = config.modulo ?? MOD_37_36
    let running = modulo

    const cells = characters.map((character) => {
      running += base36Value(character)
      if (running > modulo) running -= modulo
      running *= 2
      if (running > modulo) running -= modulo + 1

      return { character, value: base36Value(character), running }
    })

    return {
      shape: "running",
      cells,
      expected,
      steps: [alphabetStep(modulo, running, config.alphabet ?? BASE36, expected)],
    }
  }

  const weights =
    config.name === "s10"
      ? config.weightings ?? S10_WEIGHTS
      : config.name === "sum_product_with_weightings_and_modulo"
        ? config.weightings ?? []
        : null

  const cells = characters.map((character, index) => {
    if (weights) {
      const multiplier = weights[index] ?? 0
      return { character, value: leadingInteger(character), multiplier, product: leadingInteger(character) * multiplier }
    }

    if (config.name === "luhn") {
      const reversed = characters.length - 1 - index
      const doubles = reversed % 2 === 0
      const doubled = leadingInteger(character) * (doubles ? 2 : 1)

      return { character, value: leadingInteger(character), multiplier: doubles ? 2 : 1, product: doubled > 9 ? doubled - 9 : doubled }
    }

    const value = characterValue(character)
    const multiplier =
      config.odds_multiplier !== undefined && index % 2 === 1
        ? config.odds_multiplier
        : config.evens_multiplier !== undefined && index % 2 === 0
          ? config.evens_multiplier
          : 1

    return { character, value, multiplier, product: value * multiplier }
  })

  const total = cells.reduce((sum, cell) => sum + cell.product, 0)
  const steps = []

  if (config.name === "sum_product_with_weightings_and_modulo") {
    const first = total % config.modulo1
    const remainder = "What is left over after dividing."

    steps.push({
      parts: [term(total, PRODUCTS), operator("mod"), term(config.modulo1, "The first modulo.")],
      value: first,
      meaning: remainder,
    })
    steps.push({
      parts: [term(first, remainder), operator("mod"), term(config.modulo2, "The second modulo.")],
      value: expected,
      meaning: CHECK_DIGIT,
    })
  } else if (config.name === "s10") {
    const modulo = config.modulo ?? S10_MODULO
    const remainder = total % modulo
    const leftOver = "What is left over after dividing."

    steps.push({
      parts: [term(total, PRODUCTS), operator("mod"), term(modulo, "The modulo the S10 standard sets.")],
      value: remainder,
      meaning: leftOver,
    })

    // A remainder of 0 or 1 is answered by the standard rather than by arithmetic.
    steps.push(
      remainder > 1
        ? {
            parts: [term(modulo, "The modulo."), operator("−"), term(remainder, leftOver)],
            value: expected,
            meaning: CHECK_DIGIT,
          }
        : {
            parts: [operator("a remainder of"), term(remainder, leftOver)],
            joiner: "→",
            value: expected,
            meaning: "The digit the standard fixes for this remainder.",
          }
    )
  } else {
    const modulo = config.modulo ?? 10
    steps.push({
      parts: [
        term(total + complementOf(total, modulo), `The next multiple of ${modulo} at or above the total.`),
        operator("−"),
        term(total, PRODUCTS),
      ],
      value: expected,
      meaning: CHECK_DIGIT,
    })
  }

  return { shape: "weighted", cells, total, expected, steps, factor: weights ? "weighting" : "multiplier" }
}
