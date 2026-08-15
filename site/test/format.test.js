import { describe, expect, it } from "vitest"
import { describeChecksum, describeRequirements, describeSerialRule } from "../src/lib/format.js"
import { definitions, definitionByKey } from "../src/lib/dataset.js"
import { validates } from "../src/lib/checksum.js"

describe("describing what a definition does", () => {
  it("spells out a mod 10 and its multipliers", () => {
    expect(describeChecksum({ name: "mod10", evens_multiplier: 1, odds_multiplier: 2 })).toBe(
      "Mod 10 (even positions ×1, odd positions ×2)"
    )
    expect(describeChecksum({ name: "mod10", evens_multiplier: 3, odds_multiplier: 1, reverse: true })).toContain(
      "counted from the right"
    )
  })

  it("spells out a weighted sum" , () => {
    expect(describeChecksum({ name: "sum_product_with_weightings_and_modulo", weightings: [3, 1, 7], modulo1: 11, modulo2: 10 })).toBe(
      "Weighted sum (digits × 3 1 7, mod 11 then mod 10)"
    )
  })

  it("says when there is no checksum at all", () => {
    expect(describeChecksum(undefined)).toBe("This format defines no checksum, so the pattern alone decides.")
  })

  it("describes every algorithm the dataset uses", () => {
    const described = definitions
      .map((definition) => definition.spec.validation?.checksum)
      .filter(Boolean)
      .map((checksum) => ({ checksum, text: describeChecksum(checksum) }))

    expect(described.length).toBeGreaterThan(0)
    expect(described.every(({ checksum, text }) => text && text !== checksum.name)).toBe(true)
  })

  it("explains a serial that is rewritten before checking", () => {
    const usps = definitionByKey("usps/usps_legacy")

    expect(describeSerialRule(usps.spec.validation)).toMatch(/^91 is prepended before the check runs, because/)
    expect(describeSerialRule(definitionByKey("ups/ups").spec.validation)).toBeNull()
  })

  it("mentions a lookup a definition insists on", () => {
    expect(describeRequirements(definitionByKey("s10/s10").spec.validation)).toMatch(/Courier/)
    expect(describeRequirements(definitionByKey("ups/ups").spec.validation)).toBeNull()
  })
})

describe("checksum constants that now live in the data", () => {
  const checksumOf = (key) => definitionByKey(key).spec.validation.checksum

  it("carries the S10 weighting and modulo", () => {
    expect(checksumOf("s10/s10")).toMatchObject({ weightings: [8, 6, 4, 2, 3, 5, 9, 7], modulo: 11 })
  })

  it("carries the moduli the other algorithms use", () => {
    expect(checksumOf("dhl/dhl_express").modulo).toBe(7)
    expect(checksumOf("old_dominion/old-dominion").modulo).toBe(10)
    expect(checksumOf("dpd/dpd")).toMatchObject({ modulo: 36, alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" })
  })

  it("still validates when a definition gives no constants, as older data does not", () => {
    const bare = { name: "s10" }
    const carried = { name: "s10", weightings: [8, 6, 4, 2, 3, 5, 9, 7], modulo: 11 }

    expect(validates(bare, "12345678", "5")).toBe(true)
    expect(validates(carried, "12345678", "5")).toBe(true)
    expect(validates(bare, "12345678", "4")).toBe(false)
  })
})
