import { describe, expect, it } from "vitest"
import { definitionByKey } from "../src/lib/dataset.js"
import { decode, normalize } from "../src/lib/decode.js"
import { definitions } from "../src/lib/dataset.js"
import { colorFor } from "../src/lib/palette.js"
import { labelFor, positionsIn } from "../src/lib/segments.js"

const segmentsOf = (key, number) => decode(definitionByKey(key), number).segments

describe("breaking a number into its parts", () => {
  it("skips groups that only wrap other groups", () => {
    const segments = segmentsOf("ups/ups", "1Z879E930346834440")

    expect(segments.map((segment) => segment.label)).toEqual([undefined, "Shipper ID", "Service Type", "Package ID", "Check Digit"])
    expect(segments.map((segment) => segment.text)).toEqual(["1Z", "879E93", "03", "4683444", "0"])
  })

  it("labels a serial that wraps nothing", () => {
    const segments = segmentsOf("ups/ups-waybill", "K1506235620")

    expect(segments.map((segment) => segment.label)).toEqual(["Service Type", "Serial Number", "Check Digit"])
  })

  it("names the destination of a number that carries one", () => {
    const carrying = definitions.flatMap((definition) =>
      (definition.spec.test_numbers?.valid ?? [])
        .map((number) => decode(definition, number))
        .filter((match) => match?.destinationZip)
    )

    expect(carrying.length).toBeGreaterThan(0)

    for (const match of carrying) {
      const destination = match.segments.find((segment) => segment.label === "Destination ZIP")
      expect(destination?.text, match.definition.key).toBe(match.destinationZip)
    }
  })

  it("always reassembles into the original number", () => {
    for (const definition of definitions) {
      for (const number of definition.spec.test_numbers?.valid ?? []) {
        const match = decode(definition, number)
        expect(match.segments.map((segment) => segment.text).join(""), definition.key).toBe(match.number)
      }
    }
  })
})

describe("parts, including the ones that wrap others", () => {
  const partsOf = (key, number) => decode(definitionByKey(key), number).parts

  it("marks a serial that wraps its parts", () => {
    const parts = partsOf("ups/ups", "1Z879E930346834440")
    const serial = parts.find((field) => field.name === "SerialNumber")

    expect(serial.wraps).toBe(true)
    expect(serial.text).toBe("879E93034683444")
    expect(parts.filter((field) => field.wraps).map((field) => field.name)).toEqual(["SerialNumber"])
    expect(parts.filter((field) => !field.wraps).map((field) => field.name).sort()).toEqual([
      "CheckDigit",
      "PackageId",
      "ServiceType",
      "ShipperId",
    ])
  })

  it("wraps nothing when the parts are not nested", () => {
    expect(partsOf("ups/ups-waybill", "K1506235620").some((field) => field.wraps)).toBe(false)
  })

  it("gives no format two parts of the same colour", () => {
    for (const definition of definitions) {
      const colors = definition.groupNames.map(colorFor)
      expect(new Set(colors).size, definition.key).toBe(colors.length)
    }
  })

  it("gives every field a colour that does not change between numbers", () => {
    const first = partsOf("ups/ups", "1Z879E930346834440").find((field) => field.name === "ServiceType")
    const second = partsOf("ups/ups-waybill", "K1506235620").find((field) => field.name === "ServiceType")

    expect(colorFor(first.name)).toBe(colorFor(second.name))
    expect(colorFor("ServiceType")).not.toBe(colorFor("CheckDigit"))
  })

  it("lets a format rename a part it uses differently", () => {
    const definition = {
      spec: { glossary: { ShipperId: { label: "Mailer ID", description: "The company that produced the mailing." } } },
    }

    expect(labelFor("ShipperId")).toBe("Shipper ID")
    expect(labelFor("ShipperId", definition)).toBe("Mailer ID")
    expect(labelFor("PackageId", definition)).toBe("Package ID")
  })
})

describe("numbers written with spaces", () => {
  it("decodes the same as the number without them", () => {
    const spaced = decode(definitionByKey("ups/ups"), "1Z 879E 9303 4683 4440")
    const bare = decode(definitionByKey("ups/ups"), "1Z879E930346834440")

    expect(spaced.number).toBe(bare.number)
    expect(spaced.valid).toBe(true)
    expect(spaced.parts).toEqual(bare.parts)
  })

  it("maps each character back to where it was typed", () => {
    expect(positionsIn("1Z 87")).toEqual([0, 1, 3, 4])
    expect(positionsIn("  1Z")).toEqual([2, 3])
    expect(positionsIn("1Z87")).toEqual([0, 1, 2, 3])
    expect(positionsIn("")).toEqual([])
  })

  it("keeps the mapping and the normalized number the same length", () => {
    const typed = " 1 Z 8 V 9 2 A 7 0 3 6 7 2 0 3 0 2 4 "

    expect(positionsIn(typed)).toHaveLength(normalize(typed).length)
  })
})
