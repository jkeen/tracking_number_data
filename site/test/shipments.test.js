import { describe, expect, it } from "vitest"
import { candidates } from "../src/lib/engine.js"
import { group } from "../src/lib/shipments.js"

describe("grouping matches into shipments", () => {
  it("collects every half of a partnership into one shipment", () => {
    const found = candidates("420112139261290983497923666238")
    const [shipment, ...rest] = group(found)

    expect(rest).toHaveLength(0)
    expect(shipment.partnership).toBe(true)
    expect(shipment.matches).toHaveLength(found.length)
    expect(shipment.carriers.map((match) => match.definition.key)).toEqual(["usps/usps_91"])
    expect(shipment.shippers.map((match) => match.definition.key)).toContain("fedex/fedex_smartpost")
  })

  it("keeps an ordinary number as its own shipment", () => {
    const shipments = group(candidates("1Z879E930346834440"))

    expect(shipments).toHaveLength(1)
    expect(shipments[0].partnership).toBe(false)
    expect(shipments[0].matches[0].definition.key).toBe("ups/ups")
  })

  it("never loses or repeats a match", () => {
    const matches = candidates("420112139261290983497923666238")
    const grouped = group(matches).flatMap((shipment) => shipment.matches)

    expect(grouped.map((match) => match.definition.key).sort()).toEqual(
      matches.map((match) => match.definition.key).sort()
    )
  })

  it("returns nothing for nothing", () => {
    expect(group([])).toEqual([])
  })
})
