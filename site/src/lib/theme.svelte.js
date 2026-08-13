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

// The document is already themed by the time this runs: index.html sets the attribute
// before the first paint so the page does not start in the wrong one and switch.
export const theme = $state({ name: document.documentElement.dataset.theme ?? stored() ?? preferred() })

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
