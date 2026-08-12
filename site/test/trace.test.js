import { describe, expect, it } from "vitest"
import { expectedCheckDigit, trace } from "../src/lib/checksum.js"
import { definitions } from "../src/lib/dataset.js"
import { decode } from "../src/lib/decode.js"

describe("showing the working", () => {
  it("agrees with the answer for every documented number", () => {
    for (const definition of definitions) {
      const checksum = definition.spec.validation?.checksum
      if (!checksum) continue

      for (const number of definition.spec.test_numbers?.valid ?? []) {
        const match = decode(definition, number)
        const shown = trace(checksum, match.serialNumber)

        expect(shown.expected, `${definition.key} ${number}`).toBe(expectedCheckDigit(checksum, match.serialNumber))
        expect(shown.expected, `${definition.key} ${number}`).toBe(match.checkDigit)
      }
    }
  })

  it("shows a cell per character, with the multiplier applied", () => {
    const shown = trace({ name: "mod10", evens_multiplier: 1, odds_multiplier: 2 }, "879E93034683444")

    expect(shown.cells).toHaveLength(15)
    expect(shown.cells[0]).toMatchObject({ character: "8", value: 8, multiplier: 1, product: 8 })
    expect(shown.cells[1].multiplier).toBe(2)
    expect(shown.total).toBe(shown.cells.reduce((sum, cell) => sum + cell.product, 0))
  })

  it("weights the S10 digits from the dataset", () => {
    const shown = trace({ name: "s10", weightings: [8, 6, 4, 2, 3, 5, 9, 7], modulo: 11 }, "12345678")

    expect(shown.cells.map((cell) => cell.multiplier)).toEqual([8, 6, 4, 2, 3, 5, 9, 7])
    expect(shown.expected).toBe("5")
  })

  const written = (step) => `${step.parts.map((part) => part.text).join(" ")} ${step.joiner ?? "="} ${step.value}`

  it("writes each step out as an equation", () => {
    const mod10 = trace({ name: "mod10", evens_multiplier: 1, odds_multiplier: 2 }, "879E93034683444")
    expect(mod10.steps.map(written)).toEqual(["110 − 110 = 0"])

    const s10 = trace({ name: "s10", weightings: [8, 6, 4, 2, 3, 5, 9, 7], modulo: 11 }, "12345678")
    expect(s10.steps.map(written)).toEqual(["204 mod 11 = 6", "11 − 6 = 5"])

    const mod7 = trace({ name: "mod7", modulo: 7 }, "331881002")
    expect(mod7.steps.map(written)).toEqual(["331881002 mod 7 = 5"])
  })

  it("says what every number in a step is", () => {
    const shown = trace({ name: "s10", weightings: [8, 6, 4, 2, 3, 5, 9, 7], modulo: 11 }, "12345678")
    const [sum, modulo] = shown.steps[0].parts.filter((part) => part.meaning)

    expect(sum.meaning).toMatch(/added together/)
    expect(modulo.meaning).toMatch(/modulo/)
    expect(shown.steps[1].meaning).toMatch(/check digit/)
  })

  it("shows the letter a position reads back to", () => {
    const shown = trace({ name: "mod_37_36", modulo: 36 }, "00998000002003335027")
    const [step] = shown.steps

    expect(step.value).toBe(shown.expected)
    expect(step.parts[0].text).toBe("37")
    if (step.joiner === "→") expect(step.parts.at(-1).meaning).toMatch(/alphabet/)
  })

  it("has no cells for an algorithm that works on the whole number", () => {
    const shown = trace({ name: "mod7", modulo: 7 }, "331881002")

    expect(shown.shape).toBe("whole")
    expect(shown.expected).toBe("5")
  })

  it("tracks the running value of mod 37,36", () => {
    const shown = trace({ name: "mod_37_36", modulo: 36 }, "00998000002003335027")

    expect(shown.shape).toBe("running")
    expect(shown.cells.every((cell) => typeof cell.running === "number")).toBe(true)
  })
})
