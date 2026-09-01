import { base } from "$app/paths"

export const pathFor = {
  decode: (number) => {
    const bare = number.replace(/\s+/g, "")

    return bare ? `${base}/${encodeURIComponent(bare)}` : base || "/"
  },
  format: (key) => `${base}/format/${key}`,
  algorithm: (name, number = "", settings = {}) => {
    const query = new URLSearchParams(settings).toString()

    return `${base}/algorithm/${name}${number ? `/${encodeURIComponent(number)}` : ""}${query ? `?${query}` : ""}`
  },
}
