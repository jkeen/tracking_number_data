import { expect, test } from "@playwright/test"

const WIDTHS = [320, 360, 390, 414, 430, 540, 704, 768, 1024, 1440]

const ROUTES = [
  "/",
  "/1Z879E930346834440",
  "/420112139261290983497923666238",
  "/format/usps/usps_91",
  "/algorithm/mod10",
  "/analyze",
]

const overflowIn = (page) =>
  page.evaluate(() => {
    const room = document.documentElement.clientWidth
    const past = []

    for (const element of document.querySelectorAll("*")) {
      const box = element.getBoundingClientRect()
      if (box.right > room + 1 && element.scrollWidth <= element.clientWidth + 1) {
        past.push(`${element.tagName.toLowerCase()}.${element.getAttribute("class") ?? ""}`)
      }
    }

    return { room, page: document.documentElement.scrollWidth, past: past.slice(0, 5) }
  })

test.describe("nothing runs off the side", () => {
  for (const route of ROUTES) {
    test(`${route} fits every width`, async ({ page }) => {
      const tooWide = []

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(route)
        await expect(page.locator(".masthead")).toBeVisible()

        const { room, page: measured, past } = await overflowIn(page)
        if (measured > room) tooWide.push({ width, over: measured - room, past })
      }

      expect(tooWide).toEqual([])
    })
  }
})

test.describe("the layout answers the width it is given", () => {
  test("the shipment stacks its halves on a phone and sets them side by side on a desktop", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto("/420112139261290983497923666238")

    const stacked = await page.locator(".shipment").evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    expect(stacked.split(" ")).toHaveLength(1)

    await page.setViewportSize({ width: 1024, height: 900 })
    const abreast = await page.locator(".shipment").evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    expect(abreast.split(" ").length).toBeGreaterThan(1)
  })

  test("the menu drops below the wordmark on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto("/")

    const wordmark = await page.locator(".wordmark").boundingBox()
    const menu = await page.locator(".menu").boundingBox()
    expect(menu.y).toBeGreaterThan(wordmark.y + wordmark.height - 1)

    await page.setViewportSize({ width: 1024, height: 900 })
    const wide = await page.locator(".menu").boundingBox()
    const beside = await page.locator(".wordmark").boundingBox()
    expect(wide.y).toBeLessThan(beside.y + beside.height)
  })

  test("the part labels stay small capitals, not the size of the number", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto("/420112139261290983497923666238")

    const type = await page.locator(".breakdown-tag").first().evaluate((el) => ({
      size: parseFloat(getComputedStyle(el).fontSize),
      transform: getComputedStyle(el).textTransform,
    }))
    const number = await page
      .locator("#number")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))

    expect(type.transform).toBe("uppercase")
    expect(type.size).toBeLessThan(number / 2)
    expect(await page.locator(".breakdown-span-label").first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize)
    )).toBe(type.size)
  })

  test("the whole number fits the field at every width", async ({ page }) => {
    for (const width of [320, 390, 430, 1024]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/420112139261290983497923666238")

      const spill = await page.locator("#number").evaluate((el) => el.scrollWidth - el.clientWidth)
      expect(spill, `at ${width}px`).toBeLessThanOrEqual(2)
    }
  })
})
