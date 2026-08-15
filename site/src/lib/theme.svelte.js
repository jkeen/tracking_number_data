import { browser } from "$app/environment"

const KEY = "theme"

const stored = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

const preferred = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

// The document is already themed by the time this runs in a browser: app.html sets the
// attribute before the first paint so the page does not start in the wrong one and
// switch. Prerendering has no document to ask, and light is what the tokens default to.
export const theme = $state({
  name: browser ? document.documentElement.dataset.theme ?? stored() ?? preferred() : "light",
})

export const choose = (name) => {
  theme.name = name
  document.documentElement.dataset.theme = name

  try {
    localStorage.setItem(KEY, name)
  } catch {
    // A browser refusing storage is reason enough not to remember, not to stop working.
  }
}

export const toggle = () => choose(theme.name === "dark" ? "light" : "dark")
