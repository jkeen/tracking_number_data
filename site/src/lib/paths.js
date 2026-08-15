import { base } from "$app/paths"

export const pathFor = {
  // The spaces a number is written with are the typist's, not the number's, so they stay
  // in the field and out of the address.
  decode: (number) => {
    const bare = number.replace(/\s+/g, "")

    return bare ? `${base}/${encodeURIComponent(bare)}` : base || "/"
  },
  format: (key) => `${base}/format/${key}`,
  // What the calculator is set to is worth pasting to someone, so it travels in the query.
  algorithm: (name, number = "", settings = {}) => {
    const query = new URLSearchParams(settings).toString()

    return `${base}/algorithm/${name}${number ? `/${encodeURIComponent(number)}` : ""}${query ? `?${query}` : ""}`
  },
}
