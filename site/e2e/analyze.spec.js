import { expect, test } from "@playwright/test"

const ASTRA = [
  "32971514560102447849175802862014",
  "32971510360102447848540980802018",
  "32971508360102447847941133172013",
  "33810799560000004380417923803212",
].join("\n")

const paste = async (page, text) => {
  await page.goto("/analyze")
  await page.getByLabel(/Numbers of the same format/).fill(text)
}

test.describe("analyzing an unknown format", () => {
  test("asks for more than one number", async ({ page }) => {
    await paste(page, "32971514560102447849175802862014")

    await expect(page.getByText(/One number proves nothing/)).toBeVisible()
  })

  test("will not read numbers of different lengths as one format", async ({ page }) => {
    await paste(page, "12345678\n123456789")

    await expect(page.getByText(/characters long/)).toBeVisible()
  })

  test("shows which characters never change", async ({ page }) => {
    await paste(page, ASTRA)

    const map = page.locator(".ledger").first()
    await expect(map.locator(".ledger-digit")).toHaveCount(32)
    await expect(map.locator(".ledger-digit.mod-fixed").first()).toHaveText("3")
    await expect(map.locator(".ledger-digit.mod-varies").first()).toHaveText("·")
  })

  test("finds the known tracking number nested inside, unaided", async ({ page }) => {
    await paste(page, ASTRA)

    await expect(page.locator(".analyze-nested li")).toHaveCount(1)
    await expect(page.locator(".analyze-nested-name")).toContainText("FedEx Express (12) at positions 17–28")
  })

  test("names the algorithm that checked it, linked to its own page", async ({ page }) => {
    await paste(page, ASTRA)

    const checked = page.locator(".analyze-nested-check").first()
    await expect(checked).toContainText("Checked by Weighted sum")
    await expect(checked).toContainText("mod 11 then mod 10")
    await expect(checked.getByRole("link")).toHaveAttribute(
      "href",
      "/algorithm/sum_product_with_weightings_and_modulo/784917580286"
    )
  })

  test("marks only the run the sum read and the character it checked", async ({ page }) => {
    await paste(page, ASTRA)

    await expect(page.locator(".analyze-nested .breakdown-tag")).toHaveText([
      "Serial Number",
      "Check Digit",
      "Serial Number",
      "Check Digit",
      "Serial Number",
      "Check Digit",
      "Serial Number",
      "Check Digit",
    ])
  })

  test("leaves the sweep folded away when a known number is found", async ({ page }) => {
    await paste(page, ASTRA)

    await expect(page.locator(".analyze-sweep")).not.toHaveAttribute("open", "")
  })

  test("drops the section and runs the sweep when nothing known is inside", async ({ page }) => {
    await paste(page, "AB1234567890X\nAB2345678901Y\nAB3456789012Z\nAB4567890123Q")

    await expect(page.getByRole("heading", { name: /already know/ })).toHaveCount(0)
    await expect(page.locator(".analyze-sweep")).toHaveAttribute("open", "")
    await expect(page.locator(".analyze-placements tbody tr").first()).toBeVisible()
  })

  test("finds where the ASTRA check digit sits", async ({ page }) => {
    await paste(page, ASTRA)
    await page.getByText("Try every algorithm against every position").click()

    const row = page.locator(".analyze-placements tbody tr", { hasText: "position 28" })
    await expect(row).toContainText("78491758028")
    await expect(row).toContainText("Weighted sum")
  })

  test("says how many fits chance alone would give", async ({ page }) => {
    await paste(page, ASTRA)
    await page.getByText("Try every algorithm against every position").click()

    await expect(page.getByText(/turn up by chance/)).toBeVisible()
    await expect(page.getByText(/out of [\d,]+ tried/)).toBeVisible()
  })

  test("a candidate opens in the calculator, set up as found", async ({ page }) => {
    await paste(page, ASTRA)
    await page.getByText("Try every algorithm against every position").click()

    await page.locator(".analyze-placements tbody tr", { hasText: "position 28" }).getByRole("link").first().click()

    await expect(page).toHaveURL(/\/algorithm\/sum_product_with_weightings_and_modulo/)
    await expect(page).toHaveURL(/serial=78491758028/)
  })
})
