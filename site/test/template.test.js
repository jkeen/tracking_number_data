import { describe, expect, it } from "vitest"
import { definitions, definitionByKey } from "../src/lib/dataset.js"
import { templateFor } from "../src/lib/template.js"
import { decode } from "../src/lib/decode.js"

describe("the shape of a format", () => {
  it("keeps the characters the pattern fixes and masks the rest", () => {
    const { text } = templateFor(definitionByKey("ups/ups"))

    expect(text.startsWith("1Z")).toBe(true)
    expect(text).toHaveLength(18)
    expect(text).not.toContain("879E93")
    expect(text.slice(2)).toMatch(/^[#AX]+$/)
  })

  it("does not mistake a serial the samples happen to share for a fixed one", () => {
    const { text } = templateFor(definitionByKey("s10/s10"))

    expect(text).not.toContain("123456785")
  })

  it("keeps a fixed prefix that runs longer", () => {
    expect(templateFor(definitionByKey("amazon/amazon_logistics")).text.startsWith("TB")).toBe(true)
    expect(templateFor(definitionByKey("landmark/landmark_global")).text.startsWith("LTN")).toBe(true)
  })

  it("marks digits and letters apart", () => {
    expect(templateFor(definitionByKey("s10/s10")).text).toMatch(/^A{2}#{9}A{2}$/)
  })

  it("gives every format a shape as long as its numbers, with parts that fit inside it", () => {
    for (const definition of definitions) {
      const template = templateFor(definition)
      expect(template, definition.key).toBeTruthy()

      const sample = definition.spec.test_numbers.valid.map((n) => n.replace(/\s+/g, "")).find((n) => n.length === template.text.length)
      expect(sample, definition.key).toBeTruthy()
      expect(template.parts.every((field) => field.end <= template.text.length), definition.key).toBe(true)
    }
  })
})

describe("how wide each part can be", () => {
  const partsOf = (key) => Object.fromEntries(templateFor(definitionByKey(key)).parts.map((part) => [part.name, part]))

  it("reports a fixed width as a single number", () => {
    const { ShipperId, CheckDigit } = partsOf("ups/ups")

    expect(ShipperId).toMatchObject({ min: 6, max: 6, variable: false })
    expect(CheckDigit).toMatchObject({ min: 1, max: 1, variable: false })
  })

  it("reports a range where the pattern allows one", () => {
    expect(partsOf("dhl/dhl_express").SerialNumber).toMatchObject({ min: 9, max: 10, variable: true })
    expect(partsOf("usps/usps_impb_c").SerialNumber).toMatchObject({ min: 21, max: 25, variable: true })
  })

  it("does not call a field variable because a neighbour can absorb a character", () => {
    expect(partsOf("dhl/dhl_express").CheckDigit.variable).toBe(false)
  })

  it("covers every width the documented numbers actually use", () => {
    for (const definition of definitions) {
      const template = templateFor(definition)
      const widths = {}

      for (const number of definition.spec.test_numbers?.valid ?? []) {
        for (const part of decode(definition, number)?.parts ?? []) {
          ;(widths[part.name] ??= []).push(part.text.length)
        }
      }

      for (const field of template.parts) {
        for (const width of widths[field.name] ?? []) {
          expect(width, `${definition.key} ${field.name}`).toBeGreaterThanOrEqual(field.min)
          expect(width, `${definition.key} ${field.name}`).toBeLessThanOrEqual(field.max)
        }
      }
    }
  })
})
