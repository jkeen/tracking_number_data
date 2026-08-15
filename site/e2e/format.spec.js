import { expect, test } from "@playwright/test"

const rowFor = (page, label) =>
  page.locator(".parts-list tbody tr").filter({ has: page.locator("th", { hasText: label }) })

const meaningOf = (page, label) => rowFor(page, label).locator(".meaning")

test.describe("a page for each format", () => {
  test("lists every documented number and what it should do", async ({ page }) => {
    await page.goto("/format/ups/ups")

    await expect(page.getByRole("heading", { name: "UPS", level: 1 })).toBeVisible()
    await expect(page.getByText("Should be accepted")).toBeVisible()
    await expect(page.getByText("Should be rejected")).toBeVisible()
  })

  test("agrees with the dataset about all of them", async ({ page }) => {
    await page.goto("/format/ups/ups")

    await expect(page.locator(".examples tbody tr.bad")).toHaveCount(0)
    await expect(page.getByText(/behave as documented/)).toBeVisible()
  })

  test("says why a number fails, not just that it does", async ({ page }) => {
    await page.goto("/format/ups/ups")

    const reasons = (await page.locator(".examples .why").allTextContents()).map((text) => text.trim())

    expect(reasons).toContain("matches, and the check digit is right")
    expect(reasons.some((reason) => /expected|no match/.test(reason))).toBe(true)
  })

  test("describes the check digit rule on the check digit itself", async ({ page }) => {
    await page.goto("/format/ups/ups")

    await expect(meaningOf(page, "Check Digit")).toContainText("A digit derived from the serial number")
    await expect(meaningOf(page, "Check Digit")).toContainText("Mod 10 (even positions ×1")
    await expect(page.locator(".pattern")).toContainText("SerialNumber")
  })

  test("describes a rewritten serial on the serial itself", async ({ page }) => {
    await page.goto("/format/usps/usps_legacy")

    await expect(meaningOf(page, "Serial Number")).toContainText(
      "The part of the number the check digit is calculated from"
    )
    await expect(meaningOf(page, "Serial Number")).toContainText("91 is prepended before the check runs")
  })

  test("draws the shape of the format, without a number in it", async ({ page }) => {
    await page.goto("/format/ups/ups")

    const shape = (await page.locator(".schematic .annotated-text").textContent()).trim()

    expect(shape).toHaveLength(18)
    expect(shape.startsWith("1Z")).toBe(true)
    expect(shape).toMatch(/^[0-9A-Z#]+$/)
    expect(shape).not.toBe("1Z879E930346834440")

    await expect(page.locator(".breakdown-tag-range")).toHaveText(["6", "2", "7", "1"])
    await expect(page.locator(".breakdown-span-label")).toHaveText("Serial Number")
  })

  test("reads a part's meaning from the dataset, and lets a format override it", async ({ page }) => {
    await page.goto("/format/ups/ups")
    await expect(meaningOf(page, "Service Type")).toContainText("A code for the delivery service used")

    await page.goto("/format/s10/s10")
    await expect(meaningOf(page, "Service Type")).not.toContainText("A code for the delivery service used")
  })

  test("points out a number the dataset lists twice", async ({ page }) => {
    await page.goto("/format/lasership/lasership_lx")

    await expect(page.getByText(/LH13820881 appears twice in the file/)).toBeVisible()
  })

  test("lists every part the pattern names, including ones the example lacks", async ({ page }) => {
    await page.goto("/format/usps/usps_impb_c")

    const parts = await page.locator(".parts-list tbody tr th").allTextContents()
    const named = parts.map((text) => text.trim())

    expect(named).toEqual(
      expect.arrayContaining(["Routing Application ID", "Destination ZIP", "Serial Number"])
    )
  })

  test("prefers what a definition says about its own parts", async ({ page }) => {
    await page.goto("/format/s10/s10")

    await expect(meaningOf(page, "Country Code")).toContainText("following ISO 3166")
    await expect(meaningOf(page, "Serial Number")).toContainText(
      "Eight digits assigned by the issuing postal service"
    )
  })

  test("admits when nobody has sourced what a part is for", async ({ page }) => {
    await page.goto("/format/canada_post/canada_post")

    await expect(rowFor(page, "Origin").locator(".undocumented")).toBeVisible()
  })

  test("says a format has no checksum where it has none", async ({ page }) => {
    await page.goto("/format/amazon/amazon_logistics")

    await expect(page.locator(".format-facts")).toContainText("No Check Digit!")
    await expect(page.getByRole("heading", { name: "Amazon Logistics", level: 1 })).toBeVisible()
  })

  test("marks a part whose width the format lets vary", async ({ page }) => {
    await page.goto("/format/dhl/dhl_express")

    const serial = page.locator(".breakdown-tag", { hasText: "Serial" })
    await expect(serial.locator(".breakdown-tag-range")).toHaveText("9–10")
    await expect(page.locator(".breakdown-rule.mod-variable")).toHaveCount(1)
  })

  test("shows the description the dataset gives a format", async ({ page }) => {
    await page.goto("/format/usps/usps_impb_c")

    await expect(page.locator(".says")).toHaveText("IMpb constructs C01 through C10, plus USPS retail")
  })

  test("still answers the addresses renamed formats used to be shared at", async ({ page }) => {
    for (const old of ["/format/usps/usps_91", "/format/usps/usps_22", "/format/fedex/fedex_smartpost"]) {
      await page.goto(old)
      await expect(page).toHaveURL(/\/format\/usps\/usps_impb_[cn]$/)
    }
  })

  test("says so when there is no such format", async ({ page }) => {
    await page.goto("/format/nope/nope")

    await expect(page.getByText(/No format called/)).toBeVisible()
  })

  test("lands on the number without the spaces it is written with", async ({ page }) => {
    await page.goto("/format/ups/ups")

    const spaced = page.locator(".examples .tracking-number", { hasText: / / }).first()
    const written = (await spaced.textContent()).trim()
    expect(written).toContain(" ")

    await spaced.click()

    const bare = written.replace(/\s+/g, "")
    await expect(page).toHaveURL(`/${bare}`)
    await expect(page.getByLabel(/Decode a tracking number/)).toHaveValue(bare)
  })
})
