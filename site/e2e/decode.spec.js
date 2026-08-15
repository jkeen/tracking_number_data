import { expect, test } from "@playwright/test"

const field = (page) => page.getByLabel(/Decode a tracking number/)

test.describe("decoding a number", () => {
  test("decodes as the number is typed", async ({ page }) => {
    await page.goto("/")
    await field(page).fill("1Z879E930346834440")

    await expect(page.locator(".note", { hasText: "UPS United States Ground" })).toBeVisible()
    await expect(page.getByText("Check digit verified")).toBeVisible()
  })

  test("puts the number in the address bar so it can be shared", async ({ page }) => {
    await page.goto("/")
    await field(page).fill("1Z879E930346834440")

    await expect(page).toHaveURL("/1Z879E930346834440")
  })

  test("starts from a number already in the path", async ({ page }) => {
    await page.goto("/RB123456785GB")

    await expect(page.getByRole("heading", { name: "Royal Mail Group plc" })).toBeVisible()
    await expect(field(page)).toHaveValue("RB123456785GB")
  })

  test("still answers the address numbers used to be shared at", async ({ page }) => {
    await page.goto("/decode/1Z879E930346834440")

    await expect(page.locator(".note", { hasText: "UPS United States Ground" })).toBeVisible()
  })

  test("says where each part's meaning came from", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    const serviceType = page.locator(".groups tr", { hasText: "Service Type" })
    const checkDigit = page.locator(".groups tr", { hasText: "Check Digit" })

    await expect(serviceType.locator(".note")).toHaveText("UPS United States Ground")
    await expect(checkDigit.locator(".note")).toContainText("Verified with")
    await expect(checkDigit.locator(".note a")).toHaveAttribute("href", "/algorithm/mod10/1Z879E930346834440")
    await expect(serviceType.locator(".term")).toHaveAttribute("data-term", /delivery service/)
  })

  test("works the check digit out in place, under the row it belongs to", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    const working = page.locator(".mod-verify")

    await expect
      .poll(async () => (await working.locator(".ledger-digit").allTextContents()).join("").trim())
      .toBe("1Z879E930346834440")
    await expect(working.locator(".ledger-total")).toContainText("= 110")
    await expect(working.locator(".ledger-answer.is-ok")).toHaveText("0")
  })

  test("explains a wrong check digit rather than calling it unknown", async ({ page }) => {
    await page.goto("/1Z879E930346834441")

    await expect(page.getByText("Check digit failed")).toBeVisible()
    await expect(page.getByText(/the check digit does not/)).toBeVisible()
  })

  test("folds away the formats that match the shape but reject the number", async ({ page }) => {
    await page.goto("/07209562763")

    await expect
      .poll(() =>
        page.locator(".card").evaluateAll((cards) => cards.filter((card) => !card.closest(".near-misses")).length)
      )
      .toBe(1)

    const folded = page.locator(".near-misses")
    await expect(folded).toHaveJSProperty("open", false)
    await expect(folded.locator(".card.near-miss").first()).toBeAttached()
    await expect(folded.locator("> summary")).toContainText(/reject/)
  })

  test("leaves a near miss in plain sight when nothing matched", async ({ page }) => {
    await page.goto("/1Z879E930346834441")

    await expect(page.locator(".near-misses")).toHaveCount(0)
    await expect(page.locator(".card.near-miss").first()).toBeVisible()
  })

  test("says so when nothing matches", async ({ page }) => {
    await page.goto("/TOTALLYMADEUP123")

    await expect(page.getByText("Not recognized")).toBeVisible()
  })

  test("joins the halves of a partnership into one shipment", async ({ page }) => {
    await page.goto("/420112139261290983497923666238")

    const shipment = page.locator(".shipment")
    await expect(shipment).toHaveCount(1)
    await expect(shipment.locator(".shipment-join")).toBeAttached()
    await expect(shipment).toContainText("Shipped by")
    await expect(shipment).toContainText("Delivered by")
    await expect(shipment).toContainText("FedEx SmartPost")
    await expect(shipment).toContainText("USPS 91")
    await expect(shipment).not.toContainText("[object Object]")
    await expect(shipment.locator(".shipment-shared .note").first()).toHaveText("Brooklyn, NY")

    const zip = shipment.locator(".shipment-shared tr", { hasText: "Destination ZIP" })
    await expect(zip.locator(".term")).toHaveAttribute("data-term", /postal code/)
  })

  test("annotates the field with a rule and label per named part", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    const labels = ["Shipper ID", "Service Type", "Package ID", "Check Digit"]
    await expect(page.locator(".breakdown-tag")).toHaveText(labels)
    await expect(page.locator(".breakdown-rule")).toHaveCount(labels.length)
    await expect(page.locator(".breakdown-span-label")).toHaveText(["Serial Number"])
  })

  test("annotates the best interpretation only", async ({ page }) => {
    await page.goto("/420112139261290983497923666238")

    await expect(page.locator(".breakdown")).toHaveCount(1)
  })

  test("lights the matching part of the number when a field is hovered", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    const row = page.locator(".groups tr", { hasText: "Shipper ID" })
    await row.hover()

    await expect(page.locator(".breakdown-rule:not(.mod-dim)")).toHaveCount(1)
    await expect(row).toHaveClass(/lit/)
  })

  test("annotates a number typed with spaces in the right places", async ({ page }) => {
    await page.goto("/")
    await field(page).fill("1Z 879E 9303 4683 4440")

    await expect(page.locator(".note", { hasText: "UPS United States Ground" })).toBeVisible()
    await expect(field(page)).toHaveValue("1Z 879E 9303 4683 4440")
    await expect(page).toHaveURL("/1Z879E930346834440")
    await expect(page.locator(".breakdown-tag")).toHaveText([
      "Shipper ID",
      "Service Type",
      "Package ID",
      "Check Digit",
    ])
  })

  test("leaves an unpartnered number as a single card", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    await expect(page.locator(".shipment")).toHaveCount(0)
    await expect(page.locator(".card")).toHaveCount(1)
  })

  test("shows the country and reference links an S10 number carries", async ({ page }) => {
    await page.goto("/RB123456785GB")

    await expect(page.locator(".note", { hasText: "Great Britain" })).toBeVisible()

    const links = await page.locator(".card footer a").allTextContents()
    expect(links.map((text) => text.trim())).toContain("Courier website")
    expect(links.map((text) => text.trim())).not.toContain("UPU reference")
  })

  test("shows a service description where the dataset has one", async ({ page }) => {
    await page.goto("/008182709980000020033350276C")

    await expect(page.locator(".detail", { hasText: "DPD 8:30" })).toBeVisible()
  })

  test("explains the check digit rule of the format it matched", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    await expect(page.getByText(/checksum \(even positions ×1, odd positions ×2\)/)).toBeVisible()
    await expect(page.getByText(/couriers\/ups\.json/)).toBeVisible()
  })
})
