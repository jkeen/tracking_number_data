import { describe, expect, it } from "vitest"
import { definitions, definitionByKey } from "../src/lib/dataset.js"
import { decode } from "../src/lib/decode.js"
import { detect, matches, search } from "../src/lib/engine.js"

describe("every definition agrees with its own documented numbers", () => {
  for (const definition of definitions) {
    const { valid = [], invalid = [] } = definition.spec.test_numbers ?? {}

    it.skipIf(valid.length === 0)(`${definition.key} accepts its valid numbers`, () => {
      for (const number of valid) {
        expect(decode(definition, number)?.valid, `${number} should be valid`).toBe(true)
      }
    })

    it.skipIf(invalid.length === 0)(`${definition.key} rejects its invalid numbers`, () => {
      for (const number of invalid) {
        expect(decode(definition, number)?.valid ?? false, `${number} should be invalid`).toBe(false)
      }
    })
  }
})

describe("decoding", () => {
  it("reads the parts of a UPS number", () => {
    const match = detect("1Z879E930346834440")

    expect(match.definition.key).toBe("ups/ups")
    expect(match.serviceType).toBe("UPS United States Ground")
    expect(match.groups.ShipperId).toBe("879E93")
    expect(match.checkDigit).toBe("0")
  })

  it("normalizes spacing and case", () => {
    expect(detect(" 1z 879e 9303 4683 4440 ").number).toBe("1Z879E930346834440")
  })

  it("names the courier of an S10 number from its country code", () => {
    expect(detect("RB123456785GB").courierName).toBe("Royal Mail Group plc")
    expect(detect("RB123456785US").courierName).toBe("United States Postal Service")
  })

  it("keeps a wrong check digit as a near miss carrying the expected digit", () => {
    expect(matches("1Z879E930346834441")).toHaveLength(0)

    const near = decode(definitionByKey("ups/ups"), "1Z879E930346834441")
    expect(near.valid).toBe(false)
    expect(near.checksumValid).toBe(false)
    expect(near.expectedCheckDigit).toBe("0")
  })

  it("prepends to the serial only when the definition says to", () => {
    const usps = definitionByKey("usps/usps_91")

    const prepended = decode(usps, "71969010756003077385")
    expect(prepended.groups.SerialNumber.startsWith("91")).toBe(false)
    expect(prepended.serialNumber.startsWith("91")).toBe(true)
    expect(prepended.valid).toBe(true)

    const untouched = decode(usps, "9101123456789000000013")
    expect(untouched.serialNumber).toBe(untouched.groups.SerialNumber)
  })

  it("finds numbers embedded in prose", () => {
    const found = search("shipped 1Z879E930346834440 and 9611020987654312345672 today")

    expect(found.map((match) => match.number).sort()).toEqual(["1Z879E930346834440", "9611020987654312345672"])
  })

  it("recognizes both halves of a partnership", () => {
    const smartpost = matches("420112139261290983497923666238")
    const carrier = smartpost.find((match) => match.role === "carrier")
    const shipper = smartpost.find((match) => match.definition.key === "fedex/fedex_smartpost")

    expect(carrier.definition.key).toBe("usps/usps_91")
    expect(carrier.partner.key).toBe("fedex/fedex_smartpost")
    expect(shipper.role).toBe("shipper")
    expect(shipper.partner.key).toBe("usps/usps_91")
    expect(smartpost[0].role).toBe("carrier")
  })

  it("leaves an ordinary number without a partnership", () => {
    expect(detect("1Z879E930346834440").role).toBeUndefined()
  })

  it("returns nothing for unrecognizable input", () => {
    expect(detect("NOT A TRACKING NUMBER")).toBeNull()
  })
})
