import { describe, expect, it } from "vitest"
import { areaFor } from "../src/lib/places.js"
import { noteFor } from "../src/lib/annotations.js"
import prefixes from "../src/data/zip3.json"

describe("naming the area a ZIP belongs to", () => {
  it("names the sectional centre for a five digit ZIP", () => {
    expect(areaFor("11213")).toBe("Brooklyn, NY")
    expect(areaFor("94117")).toBe("San Francisco, CA")
    expect(areaFor("78745")).toBe("Austin, TX")
  })

  it("covers every prefix in use", () => {
    expect(Object.keys(prefixes).length).toBeGreaterThan(900)
    expect(Object.values(prefixes).every((area) => /^.+, [A-Z]{2}$/.test(area))).toBe(true)
  })

  it("declines anything that is not a US ZIP", () => {
    expect(areaFor("0081827")).toBeNull()
    expect(areaFor("1234")).toBeNull()
    expect(areaFor("ABCDE")).toBeNull()
    expect(areaFor("")).toBeNull()
    expect(areaFor(undefined)).toBeNull()
  })

  it("annotates only the destination field" , () => {
    expect(noteFor({ name: "DestinationZip", text: "11213" })).toEqual({ text: "Brooklyn, NY" })
    expect(noteFor({ name: "PackageId", text: "11213" })).toBeNull()
  })
})
