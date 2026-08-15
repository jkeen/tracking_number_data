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
    const usps = definitionByKey("usps/usps_legacy")

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

  it("reads a number the courier-specific formats used to claim as USPS", () => {
    const smartpost = matches("9261292700768711948021")
    const ecommerce = matches("420902459261290336128704042634")

    expect(smartpost.map((match) => match.definition.key)).toEqual(["usps/usps_impb_c"])
    expect(ecommerce.map((match) => match.definition.key)).toEqual(["usps/usps_impb_c"])
  })

  it("names one courier for a number three formats used to claim", () => {
    const parcelSelect = matches("420112139261290983497923666238")

    expect(parcelSelect.map((match) => match.definition.key)).toEqual(["usps/usps_impb_c"])
    expect(parcelSelect[0].courierName).toBe("United States Postal Service")
  })

  it("says a commercial mailer's number may have been carried by someone else", () => {
    const commercial = detect("420112139261290983497923666238")
    const online = detect("9400111206206406260787")

    expect(commercial.sections["Application Identifier"].name).toBe("Commercial mailer")
    expect(commercial.sections["Application Identifier"].description).toMatch(/carried by another company/)
    expect(online.sections["Application Identifier"].name).toBe("Online or vendor label")
    expect(online.sections["Application Identifier"].description).not.toMatch(/carried by another company/)
  })

  it("returns nothing for unrecognizable input", () => {
    expect(detect("NOT A TRACKING NUMBER")).toBeNull()
  })
})
