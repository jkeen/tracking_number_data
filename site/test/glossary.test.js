import { describe, expect, it } from "vitest"
import { definitions } from "../src/lib/dataset.js"
import glossary from "../../glossary.json"

describe("the glossary and the patterns agree", () => {
  it("keeps the glossary to names the patterns use", () => {
    const named = new Set(definitions.flatMap((definition) => definition.groupNames))
    const stray = Object.keys(glossary).filter((name) => !named.has(name))

    expect(stray).toEqual([])
  })

  it("only describes parts a pattern actually names", () => {
    for (const definition of definitions) {
      const described = Object.keys(definition.spec.glossary ?? {})
      const unknown = described.filter((name) => !definition.groupNames.includes(name))

      expect(unknown, definition.key).toEqual([])
    }
  })

  it("lists every part the pattern names", () => {
    const usps = definitions.find((definition) => definition.key === "usps/usps_impb_c")

    expect(usps.groupNames).toEqual(
      expect.arrayContaining(["RoutingApplicationId", "DestinationZip", "SerialNumber"])
    )
  })
})
