import adapter from "@sveltejs/adapter-static"

export default {
  kit: {
    adapter: adapter({ fallback: "404.html", strict: false }),
    // Absolute: the shell is served for addresses at any depth, and a relative asset
    // path resolves against whichever one it was served for.
    paths: { base: (process.env.SITE_BASE ?? "").replace(/\/$/, ""), relative: false },
    // A tracking number is not an address with an end to its list.
    prerender: { crawl: false, handleHttpError: "warn" },
  },
}
