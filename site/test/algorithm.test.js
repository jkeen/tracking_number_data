// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import App from "../src/App.svelte"
import { ALGORITHMS, trace } from "../src/lib/checksum.js"
import { inUse, usedBy, workedExample } from "../src/lib/algorithms.js"

afterEach(() => {
  cleanup()
  history.replaceState({}, "", "/")
})

const show = (name) => {
  history.replaceState({}, "", `/algorithm/${name}`)
  return render(App)
}

const boxes = (container) => [...container.querySelectorAll(".tape-digit")].filter((box) => !box.classList.contains("mod-check"))

const serialIn = (container) =>
  boxes(container)
    .map((box) => box.value)
    .join("")

const checkIn = (container) => container.querySelector(".tape-digit.mod-check").value

describe("a page for each check digit algorithm", () => {
  it("explains how it works and who uses it", () => {
    const { container } = show("s10")

    expect(container.querySelector(".choice.is-current").textContent.trim()).toBe("S10")
    expect(container.querySelectorAll(".steps li").length).toBeGreaterThan(1)
    expect(container.textContent).toMatch(/8, 6, 4, 2, 3, 5, 9 and 7/)

    const listed = [...container.querySelectorAll(".parts-list tbody tr th a")]
    expect(listed).toHaveLength(usedBy("s10").length)
  })

  it("starts from a documented number and shows the arithmetic", () => {
    const { container } = show("mod10")
    const example = workedExample("mod10")

    expect(serialIn(container)).toBe(example.match.serialNumber)
    expect(checkIn(container)).toBe(example.match.checkDigit)

    const products = [...container.querySelectorAll(".tape-cell.mod-product")]
    const working = trace(example.definition.spec.validation.checksum, example.match.serialNumber)

    expect(products).toHaveLength(example.match.serialNumber.length)
    expect(products.map((cell) => cell.textContent.trim())).toEqual(working.cells.map((cell) => String(cell.product)))
    expect(container.querySelector(".tape-total").textContent).toContain(`${working.total}`)
    expect(container.querySelector(".verdict.is-ok").textContent).toMatch(/checks out/)
  })

  it("keeps the serial and the check digit in fields of their own", () => {
    const { container } = show("mod10")

    expect([...container.querySelectorAll(".tape-mark")].map((mark) => mark.textContent.trim())).toEqual([
      "serial",
      "check digit",
    ])
    expect(container.querySelector(".tape-digit.mod-check").getAttribute("aria-label")).toBe("Check digit")
  })

  it("says what the algorithm gives when the check digit is cleared", async () => {
    const { container } = show("mod10")
    const expected = checkIn(container)

    await fireEvent.input(container.querySelector(".tape-digit.mod-check"), { target: { value: "" } })

    expect(container.querySelector(".verdict").textContent.trim()).toBe(`The arithmetic asks for ${expected}.`)
    expect(container.querySelector(".verdict.is-ok")).toBeNull()
    expect(container.querySelector(".verdict.is-bad")).toBeNull()
  })

  it("colours the check digit and the digit the arithmetic lands on together", async () => {
    const { container } = show("mod10")
    const check = () => container.querySelector(".tape-digit.mod-check")
    const answer = () => [...container.querySelectorAll(".tape-answer")].pop()

    expect(check().classList.contains("is-ok")).toBe(true)
    expect(answer().classList.contains("is-ok")).toBe(true)

    await fireEvent.input(check(), { target: { value: "1" } })

    expect(check().classList.contains("is-bad")).toBe(true)
    expect(answer().classList.contains("is-bad")).toBe(true)
  })

  it("works through whatever serial is typed into it", async () => {
    const { container } = show("mod10")

    await fireEvent.input(boxes(container)[0], { target: { value: "879E93034683444" } })
    await fireEvent.input(container.querySelector(".tape-digit.mod-check"), { target: { value: "1" } })

    expect(serialIn(container)).toBe("879E93034683444")
    expect(container.querySelector(".verdict.is-bad").textContent).toMatch(/does not check out/)
  })

  it("types a character at a time, and takes them back", async () => {
    const { container } = show("mod10")

    await fireEvent.input(boxes(container)[0], { target: { value: "9" } })
    await fireEvent.input(boxes(container)[1], { target: { value: "6" } })
    expect(serialIn(container)).toMatch(/^96/)

    await fireEvent.keyDown(boxes(container)[1], { key: "Backspace" })
    expect(serialIn(container)).toMatch(/^9/)
    expect(boxes(container)[1].value).not.toBe("6")
  })

  it("carries the number over from the format that sent you", async () => {
    history.replaceState({}, "", "/format/ups/ups")
    const { container } = render(App)

    await fireEvent.click(container.querySelector(".algorithm-link"))

    expect(location.pathname).toMatch(/^\/algorithm\/mod10\/1Z/)
    expect(serialIn(container) + checkIn(container)).toBe("5R89390357567127")
  })

  it("runs the sum again when a constant is changed", async () => {
    const { container } = show("s10")
    const [modulo] = [...container.querySelectorAll(".setting-value")]

    expect(container.querySelector(".verdict.is-ok")).toBeTruthy()

    await fireEvent.input(modulo, { target: { value: "7" } })

    expect(container.querySelector(".verdict.is-bad")).toBeTruthy()
    expect(container.querySelector(".parts-list tbody").textContent).toContain("None that we know of")
  })

  it("counts the modulo when grouping the formats that share the constants", async () => {
    const { container } = show("mod10")
    const modulo = [...container.querySelectorAll(".setting-value")][2]
    const sharing = () => {
      const rows = [...container.querySelectorAll(".parts-list tbody tr")]
      const start = rows.findIndex((row) => row.textContent.includes("With these constants"))
      const end = rows.findIndex((row) => row.textContent.includes("With other constants"))

      return rows.slice(start + 1, end).map((row) => row.textContent)
    }

    expect(sharing().join(" ")).toContain("Canada Post (16)")

    await fireEvent.input(modulo, { target: { value: "9" } })

    expect(sharing().join(" ")).toContain("None that we know of")
  })

  it("loads a format's constants from the dropdown", async () => {
    const { container } = show("mod10")
    const preset = container.querySelector(".mod-preset")
    const evens = () => [...container.querySelectorAll(".setting-value")][0]

    await fireEvent.change(preset, { target: { value: "ontrac/ontrac_c" } })
    expect(evens().value).toBe("1")

    await fireEvent.change(preset, { target: { value: "canada_post/canada_post" } })
    expect(evens().value).toBe("3")
  })

  it("switches algorithm when the format picked uses another one", async () => {
    const { container } = show("mod10")

    await fireEvent.change(container.querySelector(".mod-preset"), { target: { value: "s10/s10" } })

    expect(location.pathname).toBe("/algorithm/s10")
    expect(container.querySelector(".choice.is-current").textContent.trim()).toBe("S10")
  })

  it("keeps the bench in the address bar, and opens on what it finds there", async () => {
    const { container, unmount } = show("mod10")
    const [evens] = [...container.querySelectorAll(".setting-value")]

    await fireEvent.input(evens, { target: { value: "7" } })

    expect(location.search).toContain("evens=7")
    expect(location.search).toContain("serial=")
    unmount()

    history.replaceState({}, "", "/algorithm/mod10?serial=12345678&check=5&evens=7&odds=1&modulo=11")
    const opened = render(App)
    const settings = [...opened.container.querySelectorAll(".setting-value")].map((field) => field.value)

    expect(serialIn(opened.container)).toBe("12345678")
    expect(checkIn(opened.container)).toBe("5")
    expect(settings).toEqual(["7", "1", "11"])
  })

  it("switches algorithm from the row of choices", async () => {
    const { container } = show("mod10")
    const choices = [...container.querySelectorAll(".choice")]

    expect(container.querySelector(".choice.is-current").textContent.trim()).toBe("Mod 10")

    await fireEvent.click(choices.find((choice) => choice.textContent.trim() === "Luhn"))

    expect(location.pathname).toBe("/algorithm/luhn")
    expect(container.querySelector(".choice.is-current").textContent.trim()).toBe("Luhn")
  })

  it("names the constants each format sets", () => {
    const { container } = show("mod10")

    expect(container.textContent).toMatch(/even positions/)
    expect(container.textContent).toMatch(/odd positions/)
  })

  it("covers every algorithm the dataset uses", () => {
    for (const name of inUse()) {
      const { container, unmount } = show(name)
      expect(container.querySelectorAll(".steps li").length, name).toBeGreaterThan(0)
      expect(container.querySelectorAll(".parts-list tbody tr").length, name).toBeGreaterThan(0)
      unmount()
    }

    expect(inUse().length).toBe(ALGORITHMS.length)
  })

  it("is reachable from the format that uses it", async () => {
    const { container } = render(App)
    history.replaceState({}, "", "/format/ups/ups")
    cleanup()

    const page = render(App)
    const link = page.container.querySelector(".algorithm-link")

    expect(link.textContent).toMatch(/How Mod 10 works/)
    await fireEvent.click(link)

    expect(location.pathname).toMatch(/^\/algorithm\/mod10/)
    expect(page.container.querySelector(".choice.is-current").textContent.trim()).toBe("Mod 10")
  })

  it("says so when there is no such algorithm", () => {
    show("nonsense")

    expect(screen.getByText(/No check digit algorithm called/)).toBeTruthy()
  })
})
