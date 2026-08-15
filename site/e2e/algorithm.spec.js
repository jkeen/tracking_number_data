import { expect, test } from "@playwright/test"

const serialBoxes = (page) => page.locator(".ledger-digit:not(.mod-check)")
const checkBox = (page) => page.locator(".ledger-digit.mod-check")
const settings = (page) => page.locator(".setting-value")

const serialIn = async (page) => (await serialBoxes(page).evaluateAll((boxes) => boxes.map((box) => box.value))).join("")

test.describe("a page for each check digit algorithm", () => {
  test("explains how it works and who uses it", async ({ page }) => {
    await page.goto("/algorithm/s10")

    await expect(page.locator(".choice.is-current")).toHaveText("S10")
    await expect(page.locator(".steps li").first()).toBeVisible()
    await expect(page.locator("body")).toContainText("8, 6, 4, 2, 3, 5, 9 and 7")
  })

  test("starts from a documented number and shows the arithmetic", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await expect(page.locator(".ledger-total")).toBeVisible()
    await expect(page.locator(".verdict.is-ok")).toContainText(/checks out/)
    await expect(page.locator(".ledger-cell.mod-product").first()).toBeVisible()
  })

  test("keeps the serial and the check digit in fields of their own", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await expect(page.locator(".ledger-mark")).toHaveText(["serial", "check digit"])
    await expect(checkBox(page)).toHaveAttribute("aria-label", "Check digit")
  })

  test("says what the algorithm gives when the check digit is cleared", async ({ page }) => {
    await page.goto("/algorithm/mod10")
    await expect(checkBox(page)).not.toHaveValue("")
    const expected = await checkBox(page).inputValue()

    await checkBox(page).fill("")

    await expect(page.locator(".verdict")).toHaveText(`The arithmetic asks for ${expected}.`)
    await expect(page.locator(".verdict.is-ok")).toHaveCount(0)
    await expect(page.locator(".verdict.is-bad")).toHaveCount(0)
  })

  test("colours the check digit and the digit the arithmetic lands on together", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await expect(checkBox(page)).toHaveClass(/is-ok/)
    await expect(page.locator(".ledger-answer").last()).toHaveClass(/is-ok/)

    await checkBox(page).fill("1")

    await expect(checkBox(page)).toHaveClass(/is-bad/)
    await expect(page.locator(".ledger-answer").last()).toHaveClass(/is-bad/)
  })

  test("works through whatever serial is typed into it", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await serialBoxes(page).first().click()
    await expect(serialBoxes(page).first()).toBeFocused()
    await page.keyboard.type("879E93034683444", { delay: 100 })
    await checkBox(page).fill("1")

    expect(await serialIn(page)).toContain("879E93034683444")
    await expect(page.locator(".verdict.is-bad")).toContainText(/does not check out/)
  })

  test("carries the number over from the format that sent you", async ({ page }) => {
    await page.goto("/format/ups/ups")
    await page.locator(".algorithm-link").click()

    await expect(page).toHaveURL(/^.*\/algorithm\/mod10\/1Z/)
    expect((await serialIn(page)) + (await checkBox(page).inputValue())).toBe("5R89390357567127")
  })

  test("checks a number against the constants of the format that splits it", async ({ page }) => {
    await page.goto("/algorithm/mod10/9611020987654312345672")

    await expect.poll(() => serialIn(page)).toContain("98765431234567")
    await expect(settings(page).nth(0)).toHaveValue("1")
    await expect(settings(page).nth(1)).toHaveValue("3")
    await expect(page.locator(".verdict.is-ok")).toContainText(/checks out/)
  })

  test("splits a number longer than the serial the calculator holds", async ({ page }) => {
    await page.goto("/algorithm/sum_product_with_weightings_and_modulo/1001921334250001000300779017972697")

    await expect.poll(() => serialIn(page)).toBe("0077901797269")
    await expect(checkBox(page)).toHaveValue("7")
    await expect(page.locator(".verdict.is-ok")).toContainText(/checks out/)
  })

  test("runs the sum again when a constant is changed", async ({ page }) => {
    await page.goto("/algorithm/s10")
    await expect(page.locator(".verdict.is-ok")).toBeVisible()

    await settings(page).first().fill("7")

    await expect(page.locator(".verdict.is-bad")).toBeVisible()
    await expect(page.locator(".parts-list tbody")).toContainText("None that we know of")
  })

  test("loads a format's constants from the dropdown", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await page.locator(".mod-preset").selectOption("ontrac/ontrac_c")
    await expect(settings(page).first()).toHaveValue("1")

    await page.locator(".mod-preset").selectOption("canada_post/canada_post")
    await expect(settings(page).first()).toHaveValue("3")
  })

  test("switches algorithm when the format picked uses another one", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await page.locator(".mod-preset").selectOption("s10/s10")

    await expect(page).toHaveURL(/\/algorithm\/s10/)
    await expect(page.locator(".choice.is-current")).toHaveText("S10")
  })

  test("keeps the calculator in the address bar, and opens on what it finds there", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await settings(page).first().fill("7")
    await expect(page).toHaveURL(/evens=7/)

    await page.goto("/algorithm/mod10?serial=12345678&check=5&evens=7&odds=1&modulo=11")

    expect(await serialIn(page)).toBe("12345678")
    await expect(checkBox(page)).toHaveValue("5")
    expect(await settings(page).evaluateAll((fields) => fields.map((field) => field.value))).toEqual([
      "7",
      "1",
      "11",
    ])
  })

  test("switches algorithm from the row of choices", async ({ page }) => {
    await page.goto("/algorithm/mod10")
    await expect(page.locator(".choice.is-current")).toHaveText("Mod 10")

    await page.locator(".choice", { hasText: "Luhn" }).click()

    await expect(page).toHaveURL(/\/algorithm\/luhn/)
    await expect(page.locator(".choice.is-current")).toHaveText("Luhn")
  })

  test("names the constants each format sets", async ({ page }) => {
    await page.goto("/algorithm/mod10")

    await expect(page.locator("body")).toContainText("even positions")
    await expect(page.locator("body")).toContainText("odd positions")
  })

  test("says so when there is no such algorithm", async ({ page }) => {
    await page.goto("/algorithm/nonsense")

    await expect(page.getByText(/No check digit algorithm called/)).toBeVisible()
  })
})
