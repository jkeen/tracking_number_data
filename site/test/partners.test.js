import { describe, expect, it } from "vitest"
import { build } from "../src/lib/definition.js"
import { candidates } from "../src/lib/engine.js"
import { group } from "../src/lib/shipments.js"

// No definition currently declares `partners`, so the mechanism is exercised on invented ones.
const handoff = (overrides = {}) => [
  {
    name: "Test Shipper",
    courier_code: "test_shipper",
    tracking_numbers: [
      {
        name: "Test Shipper Handoff",
        id: "test_shipper_handoff",
        regex: ["\\s*(?<ApplicationIdentifier>H\\s*)(?<SerialNumber>([0-9]\\s*){8})"],
        partners: [{ partner_id: "test_carrier_last_mile", partner_type: "carrier" }],
        test_numbers: { valid: ["H12345678"] },
        ...overrides.shipper,
      },
    ],
  },
  {
    name: "Test Carrier",
    courier_code: "test_carrier",
    tracking_numbers: [
      {
        name: "Test Carrier Last Mile",
        id: "test_carrier_last_mile",
        regex: ["\\s*(?<ApplicationIdentifier>H\\s*)(?<SerialNumber>([0-9]\\s*){8})"],
        partners: [{ partner_id: "test_shipper_handoff", partner_type: "shipper" }],
        test_numbers: { valid: ["H12345678"] },
        ...overrides.carrier,
      },
    ],
  },
]

describe("a format that declares partners", () => {
  it("reads both roles off one number", () => {
    const matches = candidates("H12345678", build(handoff()))
    const shipper = matches.find((match) => match.definition.id === "test_shipper_handoff")
    const carrier = matches.find((match) => match.definition.id === "test_carrier_last_mile")

    expect(shipper.role).toBe("shipper")
    expect(shipper.partner.id).toBe("test_carrier_last_mile")
    expect(carrier.role).toBe("carrier")
    expect(carrier.partner.id).toBe("test_shipper_handoff")
  })

  it("collects the pair into one shipment the site can draw", () => {
    const shipments = group(candidates("H12345678", build(handoff())))

    expect(shipments).toHaveLength(1)
    expect(shipments[0].partnership).toBe(true)
    expect(shipments[0].shippers.map((match) => match.definition.id)).toEqual(["test_shipper_handoff"])
    expect(shipments[0].carriers.map((match) => match.definition.id)).toEqual(["test_carrier_last_mile"])
  })

  it("claims no partnership when only one side names the other", () => {
    const shipments = group(candidates("H12345678", build(handoff({ carrier: { partners: undefined } }))))

    expect(shipments.every((shipment) => shipment.partnership)).toBe(false)
  })

  it("honours a validation block that does not hold", () => {
    const conditional = {
      shipper: {
        partners: [
          {
            partner_id: "test_carrier_last_mile",
            partner_type: "carrier",
            validation: { matches_all: [{ regex_group_name: "ApplicationIdentifier", matches: "X" }] },
          },
        ],
      },
    }
    const shipments = group(candidates("H12345678", build(handoff(conditional))))

    expect(shipments.every((shipment) => shipment.partnership)).toBe(false)
  })
})
