import { base } from "$app/paths"

let scriptLoaded

const whenScriptLoaded = () => {
  scriptLoaded ??=
    document.readyState === "loading"
      ? new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }))
      : Promise.resolve()

  return scriptLoaded
}

export const reportablePath = (pathname) => {
  const section = pathname.slice(base.length)
  const algorithm = section.match(/^\/algorithm\/([^/]+)/)

  if (algorithm) return `${base}/algorithm/${algorithm[1]}`
  if (section.startsWith("/format/") || section === "/analyze") return pathname

  return `${base}/decode`
}

export const trackPageview = async (url) => {
  await whenScriptLoaded()
  window.fathom?.trackPageview({ url })
}
