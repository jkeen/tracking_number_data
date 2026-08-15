import { describe, expect, it } from "vitest"
import { columnsOf, findCheckDigit, findNested, numbersIn } from "../src/lib/discover.js"
import { definitions } from "../src/lib/dataset.js"
import { decode } from "../src/lib/decode.js"
import { expectedCheckDigit } from "../src/lib/checksum.js"

const ASTRA = [
  "32971514560102447849175802862014",
  "32971510360102447848540980802018",
  "32971508360102447847941133172013",
  "33810799560000004380417923803212",
]

describe("reading a list of numbers", () => {
  it("takes them however they are pasted", () => {
    expect(numbersIn("1Z1, 1Z2\n1Z3  1Z4;1Z5")).toEqual(["1Z1", "1Z2", "1Z3", "1Z4", "1Z5"])
  })

  it("ignores the spaces a number is written with between the entries", () => {
    expect(numbersIn("  \n abc \n\n def  ")).toEqual(["ABC", "DEF"])
  })
})

describe("the column map", () => {
  it("says which positions never change", () => {
    const columns = columnsOf(["1234", "1294"])

    expect(columns.map((column) => column.constant)).toEqual([true, true, false, true])
    expect(columns.map((column) => column.shown).join("")).toBe("12·4")
  })
})

describe("finding the check digit", () => {
  it("finds the one the ASTRA barcode carries, where the serial is a field inside it", () => {
    const { fits } = findCheckDigit(ASTRA)
    const found = fits.filter((fit) => fit.at === 27 && fit.parts[0].serial === "78491758028")

    expect(found.length).toBeGreaterThan(0)
  })

  it("will not accept a split whose check digit never varies", () => {
    const sharingAPrefix = ASTRA.slice(0, 3)
    const constant = columnsOf(sharingAPrefix).filter((column) => column.constant).map((column) => column.at)
    const { fits } = findCheckDigit(sharingAPrefix)

    expect(constant).toContain(4)
    expect(fits.some((fit) => constant.includes(fit.at))).toBe(false)
  })

  it("says how many fits chance alone would produce", () => {
    const { tried, expected } = findCheckDigit(ASTRA)

    expect(tried).toBeGreaterThan(1000)
    expect(expected).toBeGreaterThan(0)
    expect(expected).toBeLessThan(tried)
  })

  it("has nothing to say about a single number", () => {
    expect(findCheckDigit([ASTRA[0]]).tried).toBe(0)
  })

  it("has nothing to say when the numbers are different lengths", () => {
    const { tried, lengths } = findCheckDigit(["12345678", "123456789"])

    expect(tried).toBe(0)
    expect(lengths).toHaveLength(2)
  })

  it("finds a check digit it was given on purpose", () => {
    const config = { name: "mod10", evens_multiplier: 3, odds_multiplier: 1, modulo: 10 }
    const serials = ["4917580286", "8540980801", "7941133172", "3804179238"]
    const made = serials.map((serial) => serial + expectedCheckDigit(config, serial))

    const { fits } = findCheckDigit(made)
    const found = fits.filter((fit) => fit.at === 10 && fit.parts[0].serial === serials[0])

    expect(found.some((fit) => fit.config.name === "mod10" && fit.config.modulo === 10)).toBe(true)
  })
})

describe("finding a known format nested inside an unknown one", () => {
  const withoutAstra = definitions.filter((definition) => !definition.key.includes("astra"))

  it("finds the tracking number the ASTRA barcode wraps, without being told where", () => {
    const found = findNested(ASTRA, withoutAstra, decode)

    expect(found).toHaveLength(1)
    expect(found[0].definition.spec.name).toBe("FedEx Express (12)")
    expect([found[0].from, found[0].through]).toEqual([16, 28])
  })

  it("ignores formats with no check digit, which match any digits of the right length", () => {
    const loose = definitions.filter((definition) => !definition.spec.validation?.checksum)
    const found = findNested(ASTRA, loose, decode)

    expect(found).toEqual([])
  })

  it("has nothing to say about a single number", () => {
    expect(findNested([ASTRA[0]], withoutAstra, decode)).toEqual([])
  })
})
