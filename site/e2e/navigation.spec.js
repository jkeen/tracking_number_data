import { expect, test } from "@playwright/test"

const field = (page) => page.getByLabel(/Decode a tracking number/)

test.describe("moving around", () => {
  test("decodes an explored number without reloading the page", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => (window.__stayed = true))

    await page.getByRole("link", { name: "RB123456785GB", exact: true }).click()

    await expect(page.getByRole("heading", { name: "Royal Mail Group plc" })).toBeVisible()
    await expect(page).toHaveURL("/RB123456785GB")
    expect(await page.evaluate(() => window.__stayed)).toBe(true)
  })

  test("typing does not fill the back button, but following a link does", async ({ page }) => {
    await page.goto("/")
    await field(page).fill("1Z879E930346834440")
    await expect(page).toHaveURL("/1Z879E930346834440")

    await page.getByRole("link", { name: "RB123456785GB", exact: true }).click()
    await expect(page).toHaveURL("/RB123456785GB")

    await page.goBack()
    await expect(page).toHaveURL("/1Z879E930346834440")
    await expect(page.locator(".note", { hasText: "UPS United States Ground" })).toBeVisible()
  })

  test("the back button comes back to where you were", async ({ page }) => {
    await page.goto("/1Z879E930346834440")
    await page.locator(".card .type a").click()

    await expect(page).toHaveURL("/format/ups/ups")

    await page.goBack()
    await expect(page).toHaveURL("/1Z879E930346834440")
    await expect(field(page)).toHaveValue("1Z879E930346834440")
  })

  test("offers an example of every format to explore", async ({ page }) => {
    await page.goto("/")

    const hrefs = await page.locator(".explore li a").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href"))
    )

    expect(hrefs.filter((href) => href.startsWith("/format/")).length).toBeGreaterThan(25)
    expect(hrefs.filter((href) => !href.startsWith("/format/")).length).toBeGreaterThan(25)
  })

  test("the menu leads to a format page", async ({ page }) => {
    await page.goto("/")
    await page.getByLabel("Formats").selectOption("ups/ups")

    await expect(page).toHaveURL("/format/ups/ups")
    await expect(page.locator("h1")).toHaveText("UPS")
  })

  test("the wordmark goes home", async ({ page }) => {
    await page.goto("/format/ups/ups")
    await page.locator(".wordmark").click()

    await expect(page).toHaveURL("/")
    await expect(field(page)).toHaveValue("")
  })

  test("remembers the theme you chose", async ({ page }) => {
    await page.goto("/")

    const toggle = page.getByLabel("Dark mode")
    const was = await page.evaluate(() => document.documentElement.dataset.theme)

    await toggle.click()
    const now = await page.evaluate(() => document.documentElement.dataset.theme)

    expect(now).not.toBe(was)
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(now)

    await page.reload()
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(now)
  })

  test("says what it is part of", async ({ page }) => {
    await page.goto("/")

    const colophon = page.locator(".colophon")
    await expect(colophon).toContainText("since 2010")

    const links = await colophon.locator("a").allTextContents()
    expect(links).toEqual(expect.arrayContaining(["tracking_number_data", "Ruby", "Go", "Sponsor the project"]))
  })
})
