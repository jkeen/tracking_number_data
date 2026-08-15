import { expect, test } from "@playwright/test"

// What a link preview reads: the HTML as served, before any script has run.
const served = async (request, path) => {
  const answer = await request.get(path)
  expect(answer.status()).toBe(200)
  return answer.text()
}

const tag = (html, property) =>
  html.match(new RegExp(`<meta[^>]*(?:property|name)="${property}"[^>]*content="([^"]*)"`))?.[1] ??
  html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:property|name)="${property}"`))?.[1]

test.describe("what a link preview sees", () => {
  test("a format page names itself without running any script", async ({ request }) => {
    const html = await served(request, "/format/usps/usps_impb_c")

    expect(html).toContain("<title>USPS IMpb C — United States Postal Service — trackingnumber.fyi</title>")
    expect(tag(html, "og:title")).toBe("USPS IMpb C — United States Postal Service")
    expect(tag(html, "og:description")).toContain("what each part of it means")
    expect(tag(html, "description")).toContain("USPS IMpb C")
  })

  test("an algorithm page names itself without running any script", async ({ request }) => {
    const html = await served(request, "/algorithm/mod10")

    expect(html).toContain("<title>Mod 10 — trackingnumber.fyi</title>")
    expect(tag(html, "og:title")).toBe("How Mod 10 works")
    expect(tag(html, "og:description")).toContain("check digit is worked out")
  })

  test("format pages carry their content, not just a shell", async ({ request }) => {
    const html = await served(request, "/format/ups/ups")

    expect(html).toContain("Should be accepted")
    expect(html).toContain("Check Digit")
  })

  test("every format and algorithm is served as its own page", async ({ request }) => {
    for (const path of ["/format/ups/ups", "/format/dhl/dhl_express", "/algorithm/s10", "/algorithm/luhn"]) {
      const answer = await request.get(path)
      expect(answer.status(), path).toBe(200)
      expect(await answer.text(), path).not.toContain("<title>trackingnumber.fyi</title>")
    }
  })

  test("a number is not prerendered, and is decoded in the browser instead", async ({ page }) => {
    await page.goto("/1Z879E930346834440")

    await expect(page.locator(".note", { hasText: "UPS United States Ground" })).toBeVisible()
  })
})
