const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")
const FORMAT = "/format/"
const ALGORITHM = "/algorithm/"
const LEGACY = /^\/decode\//

const settingsIn = (search) => Object.fromEntries(new URLSearchParams(search))

const read = () => {
  const path = decodeURIComponent(location.pathname).slice(BASE.length) || "/"

  if (path.startsWith(FORMAT)) return { view: "format", key: path.slice(FORMAT.length), number: "" }
  if (path.startsWith(ALGORITHM)) {
    const [name, ...rest] = path.slice(ALGORITHM.length).split("/")
    return { view: "algorithm", key: name, number: rest.join("/") }
  }

  return { view: "decode", number: path.replace(LEGACY, "").replace(/^\//, ""), key: null }
}

export const pathFor = {
  // The spaces a number is written with are the typist's, not the number's, so they stay
  // in the field and out of the address.
  decode: (number) => {
    const bare = number.replace(/\s+/g, "")

    return bare ? `${BASE}/${encodeURIComponent(bare)}` : BASE || "/"
  },
  format: (key) => `${BASE}${FORMAT}${key}`,
  // The bench a page is set to is worth pasting to someone, so it travels in the query.
  algorithm: (name, number = "", settings = {}) => {
    const query = new URLSearchParams(settings).toString()

    return `${BASE}${ALGORITHM}${name}${number ? `/${encodeURIComponent(number)}` : ""}${query ? `?${query}` : ""}`
  },
}

const createRoute = () => {
  let current = $state(read())

  addEventListener("popstate", () => (current = read()))

  // Typing replaces: an eighteen character number should not leave eighteen entries in
  // the back button. Following a link pushes, because going back should return you.
  const go = (next, path, { push = false } = {}) => {
    current = next
    history[push ? "pushState" : "replaceState"](history.state, "", path)
  }

  return {
    // Read again on mount, since anything that changed the URL first — a test, a link
    // followed into the app — happened before this module ran.
    sync() {
      current = read()
      const canonical =
        current.view === "format"
          ? pathFor.format(current.key)
          : current.view === "algorithm"
            ? pathFor.algorithm(current.key, current.number, settingsIn(location.search))
            : pathFor.decode(current.number)
      if (location.pathname + location.search !== canonical) history.replaceState(history.state, "", canonical)
    },
    get view() {
      return current.view
    },
    get key() {
      return current.key
    },
    get number() {
      return current.number
    },
    // The address bar is the record of what the bench is set to. Reading it back here
    // rather than keeping a copy is what stops a page from opening on the last one.
    get settings() {
      return current.view === "algorithm" ? settingsIn(location.search) : {}
    },
    set number(value) {
      go({ view: "decode", number: value, key: null }, pathFor.decode(value))
    },
    // Following a link lands where reloading its address would, spaces and all, so the
    // field and the address bar never disagree about what was clicked.
    visit(number) {
      const bare = number.replace(/\s+/g, "")

      go({ view: "decode", number: bare, key: null }, pathFor.decode(bare), { push: true })
      scrollTo({ top: 0, behavior: "smooth" })
    },
    show(key) {
      go({ view: "format", number: "", key }, pathFor.format(key), { push: true })
      scrollTo({ top: 0, behavior: "smooth" })
    },
    explain(name, number = "", settings = {}) {
      go({ view: "algorithm", number, key: name }, pathFor.algorithm(name, number, settings), { push: true })
      scrollTo({ top: 0, behavior: "smooth" })
    },

    // Setting a constant only rewrites the address, and replaces rather than pushes, so a
    // session at the bench neither rebuilds the page nor fills the back button.
    tune(settings) {
      const query = new URLSearchParams(settings).toString()
      const path = `${location.pathname}${query ? `?${query}` : ""}`

      if (path !== location.pathname + location.search) history.replaceState(history.state, "", path)
    },
  }
}

export const route = createRoute()
