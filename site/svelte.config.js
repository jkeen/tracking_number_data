import adapter from "@sveltejs/adapter-static"

export default {
  kit: {
    adapter: adapter({ fallback: "404.html", strict: false }),
    paths: { base: (process.env.SITE_BASE ?? "").replace(/\/$/, ""), relative: false },
    prerender: { crawl: false, handleHttpError: "warn" },
  },
}
