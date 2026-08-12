// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import App from "../src/App.svelte"
import { definitions } from "../src/lib/dataset.js"
import glossary from "../../glossary.json"

afterEach(() => {
  cleanup()
  // The route is module state, so a test that navigates would start the next one
  // wherever it finished.
  history.replaceState({}, "", "/")
})

const show = (key) => {
  history.replaceState({}, "", `/format/${key}`)
  return render(App)
}

describe("a page for each format", () => {
  it("lists every documented number and what it should do", () => {
    const { container } = show("ups/ups")
    const ups = definitions.find((definition) => definition.key === "ups/ups")
    const { valid, invalid } = ups.spec.test_numbers

    expect(screen.getByRole("heading", { name: "UPS", level: 1 })).toBeTruthy()

    expect(screen.getByText("Should be accepted")).toBeTruthy()
    expect(screen.getByText("Should be rejected")).toBeTruthy()

    const rows = [...container.querySelectorAll(".examples tbody tr:not(.section)")]
    expect(rows).toHaveLength(valid.length + invalid.length)
  })

  it("agrees with the dataset about all of them", () => {
    const { container } = show("ups/ups")

    expect(container.querySelectorAll(".examples tbody tr.bad")).toHaveLength(0)
    expect(screen.getByText(/behave as documented/)).toBeTruthy()
  })

  it("says why a number fails, not just that it does", () => {
    const { container } = show("ups/ups")
    const reasons = [...container.querySelectorAll(".examples .why")].map((cell) => cell.textContent.trim())

    expect(reasons).toContain("matches, and the check digit is right")
    expect(reasons.some((reason) => /expected/.test(reason) || /no match/.test(reason))).toBe(true)
  })

  it("describes the check digit rule on the check digit itself", () => {
    const { container } = show("ups/ups")
    const rows = [...container.querySelectorAll(".parts-list tbody tr")]
    const check = rows.find((row) => row.textContent.includes("Check Digit"))

    const meaning = check.querySelector(".meaning").textContent
    expect(meaning).toMatch(/A digit derived from the serial number/)
    expect(meaning).toMatch(/Mod 10 — even positions ×1/)
    expect(container.querySelector(".pattern").textContent).toContain("SerialNumber")
  })

  it("describes a rewritten serial on the serial itself", () => {
    const { container } = show("usps/usps_91")
    const rows = [...container.querySelectorAll(".parts-list tbody tr")]
    const serial = rows.find((row) => row.textContent.includes("Serial Number"))
    const meaning = serial.querySelector(".meaning").textContent

    expect(meaning).toMatch(/The part of the number the check digit is calculated from/)
    expect(meaning).toMatch(/91 is prepended before the check runs/)
  })

  it("draws the shape of the format, without a number in it", () => {
    const { container } = show("ups/ups")
    const shape = container.querySelector(".schematic .shape").textContent.trim()

    expect(shape).toHaveLength(18)
    expect(shape.startsWith("1Z")).toBe(true)
    expect(shape).toMatch(/^[0-9A-Z#]+$/)
    expect(shape).not.toBe("1Z879E930346834440")

    const tags = [...container.querySelectorAll(".schematic .tag")]
    const labels = tags.map((tag) => tag.textContent.replace(tag.querySelector(".range")?.textContent ?? "", ""))
    expect(labels).toEqual(["Shipper ID", "Service Type", "Package ID", "Check Digit"])

    const widths = tags.map((tag) => tag.querySelector(".range").textContent)
    expect(widths).toEqual(["6", "2", "7", "1"])
    expect(container.querySelector(".schematic .span-label").textContent).toBe("Serial Number")
  })

  it("decodes one of its examples when picked", async () => {
    const { container } = show("ups/ups")
    const link = [...container.querySelectorAll(".examples a")][0]

    await fireEvent.click(link)

    expect(screen.getByRole("heading", { name: "UPS", level: 2 })).toBeTruthy()
  })

  it("holds every format in the dataset to its own documentation", () => {
    for (const definition of definitions) {
      const { container, unmount } = show(definition.key)
      expect(container.querySelectorAll(".examples tbody tr.bad"), definition.key).toHaveLength(0)
      unmount()
    }
  })

  it("reads a part's meaning from the dataset, and lets a format override it", () => {
    const { container, unmount } = show("ups/ups")
    const meaning = (page, label) =>
      [...page.querySelectorAll(".parts-list tbody tr")]
        .find((row) => row.textContent.includes(label))
        .querySelector(".meaning").textContent

    expect(meaning(container, "Service Type")).toContain(glossary.ServiceType.description)
    unmount()

    const s10 = show("s10/s10")
    const spec = definitions.find((definition) => definition.key === "s10/s10").spec

    expect(meaning(s10.container, "Service Type")).toContain(spec.glossary.ServiceType.description)
    expect(meaning(s10.container, "Service Type")).not.toContain(glossary.ServiceType.description)
  })

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

  it("points out a number the dataset lists twice", () => {
    show("lasership/lasership_lx")

    expect(screen.getByText(/LH13820881 appears twice in the file/)).toBeTruthy()
  })

  it("lists every part the pattern names, including ones the example lacks", () => {
    const { container } = show("usps/usps_91")
    const parts = [...container.querySelectorAll(".parts-list tbody tr")].map((row) => row.children[0].textContent.trim())

    expect(parts).toEqual(expect.arrayContaining(["Routing Application ID", "Destination ZIP", "Serial Number"]))
    expect(parts).toHaveLength(definitions.find((d) => d.key === "usps/usps_91").groupNames.length)
  })

  it("prefers what a definition says about its own parts", () => {
    const { container } = show("s10/s10")
    const rows = [...container.querySelectorAll(".parts-list tbody tr")]

    const country = rows.find((row) => row.textContent.includes("Country Code"))
    expect(country.querySelector(".meaning").textContent).toMatch(/following ISO 3166/)

    const serial = rows.find((row) => row.textContent.includes("Serial Number"))
    expect(serial.querySelector(".meaning").textContent).toMatch(/Eight digits assigned by the issuing postal service/)
  })

  it("says what a part means where the dataset describes it, and admits when it does not", () => {
    const { container } = show("usps/usps_91")
    const rows = [...container.querySelectorAll(".parts-list tbody tr")]

    const serial = rows.find((row) => row.textContent.includes("Serial Number"))
    expect(serial.querySelector(".meaning").textContent).toMatch(/check digit is calculated from/)
    expect(serial.querySelector(".undocumented")).toBeNull()

    // Nobody has sourced what Canada Post's leading seven digits are for, which the page
    // says rather than filling in with something plausible.
    const origin = [...show("canada_post/canada_post").container.querySelectorAll(".parts-list tbody tr")].find(
      (row) => row.textContent.includes("Origin")
    )
    expect(origin.querySelector(".undocumented")).toBeTruthy()
  })

  it("says a format has no checksum where it has none", () => {
    const { container } = show("amazon/amazon_logistics")
    const rows = [...container.querySelectorAll(".parts-list tbody tr")]
    const check = rows.find((row) => row.textContent.includes("Check Digit"))

    if (check) expect(check.querySelector(".meaning").textContent).toMatch(/defines no checksum/)
    expect(container.querySelector(".format-facts").textContent).toMatch(/No check digit/)
    expect(screen.getByRole("heading", { name: "Amazon Logistics", level: 1 })).toBeTruthy()
  })

  it("marks a part whose width the format lets vary", () => {
    const { container } = show("dhl/dhl_express")

    const serial = [...container.querySelectorAll(".schematic .tag")].find((tag) => tag.textContent.includes("Serial"))
    expect(serial.querySelector(".range").textContent).toBe("9–10")

    expect(container.querySelectorAll(".schematic .rule.variable")).toHaveLength(1)
  })

  it("shows the description the dataset gives a format", () => {
    show("usps/usps_91")

    expect(screen.getByText("USPS now calls this the IMpd barcode format")).toBeTruthy()
  })

  it("says so when there is no such format", () => {
    show("nope/nope")

    expect(screen.getByText(/No format called/)).toBeTruthy()
  })

  it("lands on the number without the spaces it is written with", async () => {
    const { container } = show("ups/ups")
    const spaced = [...container.querySelectorAll(".examples .tracking-number")].find((link) =>
      link.textContent.includes(" ")
    )

    expect(spaced).toBeTruthy()
    await fireEvent.click(spaced)

    expect(location.pathname).toBe("/1Z8V92A70367203024")
    expect(screen.getByLabelText(/Decode a tracking number/).value).toBe("1Z8V92A70367203024")
  })
})
