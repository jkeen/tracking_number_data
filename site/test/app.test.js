// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import App from "../src/App.svelte"

afterEach(() => {
  cleanup()
  // The route is module state, so a test that navigates would start the next one
  // wherever it finished.
  history.replaceState({}, "", "/")
})

const type = async (value) => {
  const input = screen.getByLabelText(/Decode a tracking number/)
  await fireEvent.input(input, { target: { value } })
  return input
}

describe("the app boots and decodes", () => {
  it("renders the search field and examples", () => {
    render(App)

    expect(screen.getByLabelText(/Decode a tracking number/)).toBeTruthy()
    expect(screen.getByText("1Z879E930346834440")).toBeTruthy()
  })

  it("decodes as the number is typed", async () => {
    render(App)
    await type("1Z879E930346834440")

    expect(screen.getByText("UPS United States Ground")).toBeTruthy()
    expect(screen.getByText("Check digit verified")).toBeTruthy()
  })

  it("says where each part's meaning came from", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    const rows = [...container.querySelectorAll(".groups tr")]
    const serviceType = rows.find((row) => row.textContent.includes("Service Type"))
    const checkDigit = rows.find((row) => row.textContent.includes("Check Digit"))

    expect(serviceType.querySelector(".note").textContent).toBe("UPS United States Ground")
    expect(checkDigit.querySelector(".note").textContent).toMatch(/Verified with\s+Mod 10\s+checksum \(/)
    expect(checkDigit.querySelector(".note a").getAttribute("href")).toBe("/algorithm/mod10/1Z879E930346834440")
    expect(serviceType.querySelector(".term").dataset.term).toMatch(/delivery service/)
  })

  it("works the check digit out in place, under the row it belongs to", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    const working = container.querySelector(".mod-verify")

    expect([...working.querySelectorAll(".tape-digit")].map((cell) => cell.textContent.trim()).join("")).toBe(
      "1Z879E930346834440"
    )
    expect(working.querySelector(".tape-total").textContent).toContain("= 110")
    expect(working.querySelector(".tape-answer.is-ok").textContent.trim()).toBe("0")
  })

  it("names the pattern the number was matched with", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    expect(container.querySelector(".badge.mod-hinted .hint").textContent).toContain("?<CheckDigit>")
  })

  it("remembers the theme you chose", async () => {
    render(App)

    const toggle = screen.getByLabelText("Dark mode")
    const was = document.documentElement.dataset.theme

    await fireEvent.click(toggle)

    expect(document.documentElement.dataset.theme).not.toBe(was)
    expect(localStorage.getItem("theme")).toBe(document.documentElement.dataset.theme)
    expect(toggle.getAttribute("aria-pressed")).toBe(String(document.documentElement.dataset.theme === "dark"))
  })

  it("puts the number in the address bar so it can be shared", async () => {
    render(App)
    await type("1Z879E930346834440")

    expect(location.pathname).toBe("/1Z879E930346834440")
  })

  it("explains a wrong check digit rather than calling it unknown", async () => {
    render(App)
    await type("1Z879E930346834441")

    expect(screen.getByText("Check digit failed")).toBeTruthy()
    expect(screen.getByText(/the check digit does not/)).toBeTruthy()
  })

  it("folds away the formats that match the shape but reject the number", async () => {
    const { container } = render(App)
    await type("07209562763")

    const cards = [...container.querySelectorAll(".card")]
    expect(cards.filter((card) => !card.closest(".near-misses"))).toHaveLength(1)

    const folded = container.querySelector(".near-misses")
    expect(folded).toBeTruthy()
    expect(folded.open).toBe(false)
    expect(folded.querySelectorAll(".card.near-miss").length).toBeGreaterThan(0)
    expect(folded.querySelector("summary").textContent).toMatch(/reject/)
  })

  it("leaves a near miss in plain sight when nothing matched", async () => {
    const { container } = render(App)
    await type("1Z879E930346834441")

    expect(container.querySelector(".near-misses")).toBeNull()
    expect(container.querySelectorAll(".card.near-miss").length).toBeGreaterThan(0)
  })

  it("says so when nothing matches", async () => {
    render(App)
    await type("TOTALLYMADEUP123")

    expect(screen.getByText("Not recognized")).toBeTruthy()
  })

  it("joins the halves of a partnership into one shipment", async () => {
    const { container } = render(App)
    await type("420112139261290983497923666238")

    const shipments = container.querySelectorAll(".shipment")
    expect(shipments).toHaveLength(1)

    const shipment = shipments[0]
    expect(shipment.querySelector(".join")).toBeTruthy()
    expect(shipment.textContent).toContain("Shipped by")
    expect(shipment.textContent).toContain("Delivered by")
    expect(shipment.textContent).toContain("FedEx SmartPost")
    expect(shipment.textContent).toContain("USPS 91")
    expect(shipment.querySelectorAll(".pane").length).toBeGreaterThanOrEqual(2)

    // The shared rows read a note out of the same helper the parts table uses, which
    // returns a hash rather than a string.
    expect(shipment.textContent).not.toContain("[object Object]")
    expect(shipment.querySelector(".shared .note").textContent).toBe("Brooklyn, NY")

    // The shared rows label their parts the same way a single result does, definition
    // and all, rather than printing a bare name.
    const zip = [...shipment.querySelectorAll(".shared tr")].find((row) =>
      row.textContent.includes("Destination ZIP")
    )
    expect(zip.querySelector(".term").dataset.term).toMatch(/postal code/)
  })

  it("annotates the field with a rule and label per named part", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    const labels = [...container.querySelectorAll(".breakdown .tag")].map((tag) => tag.textContent)
    expect(labels).toEqual(["Shipper ID", "Service Type", "Package ID", "Check Digit"])
    expect(container.querySelectorAll(".breakdown .rule")).toHaveLength(labels.length)

    const wrapping = [...container.querySelectorAll(".breakdown .span-label")].map((span) => span.textContent)
    expect(wrapping).toEqual(["Serial Number"])
  })

  it("lights the matching part of the number when a field is hovered", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    const row = [...container.querySelectorAll(".groups tr")].find((tr) => tr.textContent.includes("Shipper ID"))
    await fireEvent.mouseEnter(row)

    const lit = [...container.querySelectorAll(".breakdown .rule")].filter((rule) => !rule.classList.contains("dim"))
    expect(lit).toHaveLength(1)
    expect(row.classList.contains("lit")).toBe(true)

    await fireEvent.mouseLeave(row)
    expect(container.querySelectorAll(".breakdown .rule.dim")).toHaveLength(0)
  })

  it("annotates a number typed with spaces in the right places", async () => {
    const { container } = render(App)
    const input = await type("1Z 879E 9303 4683 4440")

    expect(screen.getByText("UPS United States Ground")).toBeTruthy()
    expect(input.value).toBe("1Z 879E 9303 4683 4440")
    expect(location.pathname).toBe("/1Z879E930346834440")

    const labels = [...container.querySelectorAll(".breakdown .tag")].map((tag) => tag.textContent)
    expect(labels).toEqual(["Shipper ID", "Service Type", "Package ID", "Check Digit"])
  })

  it("annotates the best interpretation only", async () => {
    const { container } = render(App)
    await type("420112139261290983497923666238")

    expect(container.querySelectorAll(".breakdown")).toHaveLength(1)
  })

  it("leaves an unpartnered number as a single card", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    expect(container.querySelectorAll(".shipment")).toHaveLength(0)
    expect(container.querySelectorAll(".card")).toHaveLength(1)
  })

  it("shows the country and reference links an S10 number carries", async () => {
    const { container } = render(App)
    await type("RB123456785GB")

    expect(screen.getByText("Great Britain")).toBeTruthy()
    expect(screen.getByText("GB")).toBeTruthy()

    const links = [...container.querySelectorAll(".card footer a")].map((link) => link.textContent.trim())
    expect(links).toContain("Courier website")
    expect(links).not.toContain("UPU reference")
  })

  it("shows a service description where the dataset has one", async () => {
    render(App)
    await type("008182709980000020033350276C")

    expect(screen.getByText("AM0")).toBeTruthy()
    expect(screen.getByText("DPD 8:30")).toBeTruthy()
  })

  it("says what it is part of", async () => {
    const { container } = render(App)
    const colophon = container.querySelector(".colophon")

    expect(colophon.textContent).toContain("since 2010")
    expect([...colophon.querySelectorAll("a")].map((link) => link.textContent)).toEqual(
      expect.arrayContaining([
        "tracking_number_data",
        "Ruby",
        "Javascript",
        "Java",
        "Python",
        "Go",
        "Sponsor the project",
      ])
    )
  })

  it("offers an example of every format to explore", async () => {
    const { container } = render(App)
    const links = [...container.querySelectorAll(".explore li a")].map((link) => link.getAttribute("href"))

    expect(links.filter((href) => href.startsWith("/") && !href.startsWith("/format/")).length).toBeGreaterThan(25)
    expect(links.filter((href) => href.startsWith("/format/")).length).toBeGreaterThan(25)
  })

  it("decodes an explored number without leaving the page", async () => {
    const { container } = render(App)
    const link = [...container.querySelectorAll(".explore li a")].find((anchor) => anchor.textContent.trim() === "RB123456785GB")

    await fireEvent.click(link)

    expect(screen.getByRole("heading", { name: "Royal Mail Group plc" })).toBeTruthy()
    expect(location.pathname).toBe("/RB123456785GB")
  })

  it("explains the check digit rule of the format it matched", async () => {
    render(App)
    await type("1Z879E930346834440")

    expect(screen.getByText(/checksum \(even positions ×1, odd positions ×2\)/)).toBeTruthy()
    expect(screen.getByText(/couriers\/ups\.json/)).toBeTruthy()
  })

  it("pushes a history entry when a link is followed, but not while typing", async () => {
    const pushed = vi.spyOn(history, "pushState")
    const replaced = vi.spyOn(history, "replaceState")

    const { container } = render(App)
    await type("1Z879E930346834440")

    expect(pushed).not.toHaveBeenCalled()
    expect(replaced).toHaveBeenCalled()

    await fireEvent.click([...container.querySelectorAll(".explore li a")][0])
    expect(pushed).toHaveBeenCalledTimes(1)

    await fireEvent.click(container.querySelector(".card .type a"))
    expect(pushed).toHaveBeenCalledTimes(2)

    pushed.mockRestore()
    replaced.mockRestore()
  })

  it("comes back to where you were", async () => {
    const { container } = render(App)
    await type("1Z879E930346834440")

    const link = [...container.querySelectorAll(".explore li a")].find((a) => a.textContent.trim() === "RB123456785GB")
    await fireEvent.click(link)
    expect(location.pathname).toBe("/RB123456785GB")

    history.back()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(location.pathname).toBe("/1Z879E930346834440")
  })

  it("starts from a number already in the path", async () => {
    history.replaceState({}, "", "/RB123456785GB")
    render(App)

    expect(screen.getByRole("heading", { name: "Royal Mail Group plc" })).toBeTruthy()
  })
})
