import { decode } from "./decode.js"

const DIGIT = "#"
const LETTER = "A"
const ANY = "X"

const DIGITS = "0123456789".split("")
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const substitute = (sample, index, character) => sample.slice(0, index) + character + sample.slice(index + 1)

/** Fixed positions are asked of the pattern: S10's documented numbers all share one serial. */
export const templateFor = (definition) => {
  const samples = (definition.spec.test_numbers?.valid ?? []).map((number) => number.replace(/\s+/g, "").toUpperCase())
  if (!samples.length) return null

  const counts = samples.map((sample) => sample.length)
  const common = counts.slice().sort((a, b) => counts.filter((c) => c === b).length - counts.filter((c) => c === a).length)[0]
  const sample = samples.find((candidate) => candidate.length === common)

  const text = [...sample]
    .map((character, index) => {
      const accepts = (alternatives) =>
        alternatives.some((alternative) => definition.verify.test(substitute(sample, index, alternative)))

      const digits = accepts(DIGITS.filter((digit) => digit !== character))
      const letters = accepts(LETTERS.filter((letter) => letter !== character))

      if (digits && letters) return ANY
      if (digits) return DIGIT
      if (letters) return LETTER

      return character
    })
    .join("")

  const match = decode(definition, sample)
  if (!match) return null

  return { text, parts: match.parts.map((part) => ({ ...part, ...widthOf(definition, samples, part.name) })) }
}

const LONGEST = 16

const stretch = (sample, field, by) => {
  const body = sample.slice(field.start, field.end)
  const grown = by >= 0 ? body + body.at(-1).repeat(by) : body.slice(0, by)

  return sample.slice(0, field.start) + grown + sample.slice(field.end)
}

/** Every sample is stretched: a mailer ID starting 9 is nine digits where one starting 0-8 is six. */
const widthOf = (definition, samples, name) => {
  const widths = new Set()

  for (const sample of samples) {
    const field = decode(definition, sample)?.parts.find((part) => part.name === name)
    if (!field) continue

    const length = field.end - field.start
    if (length === 0) continue

    for (let by = 1 - length; by <= LONGEST; by += 1) {
      const parsed = stretch(sample, field, by).match(definition.verify)
      const range = parsed?.indices?.groups?.[name]

      if (range && range[1] - range[0] === length + by) widths.add(length + by)
    }
  }

  if (!widths.size) return {}

  return { min: Math.min(...widths), max: Math.max(...widths), variable: widths.size > 1 }
}