import { describe, expect, it } from "vitest"
import { candidates } from "../src/lib/engine.js"
import { group } from "../src/lib/shipments.js"

describe("grouping matches into shipments", () => {
  it("pairs the two halves that chose each other", () => {
    const [shipment] = group(candidates("420112139261290983497923666238"))

    expect(shipment.partnership).toBe(true)
    expect(shipment.carriers.map((match) => match.definition.key)).toEqual(["usps/usps_91"])
    expect(shipment.shippers.map((match) => match.definition.key)).toEqual(["fedex/fedex_smartpost"])
  })

  // Both read the same digits as a handoff to USPS, and USPS names FedEx first, so DHL is
  // a rival reading of the number rather than a second shipper of the same parcel.
  it("leaves a shipper the carrier did not choose out of the shipment", () => {
    const shipments = group(candidates("420112139261290983497923666238"))
    const rival = shipments.find((shipment) => !shipment.partnership)

    expect(shipments).toHaveLength(2)
    expect(rival.matches.map((match) => match.definition.key)).toEqual(["dhl/dhl_ecommerce_30"])
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
