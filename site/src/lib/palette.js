// A field keeps its colour across every courier, so the same part of two different
// numbers looks the same. The colours themselves are in app.css with the rest of the
// palette; a name with no colour of its own falls back to grey.
const variableFor = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

export const colorFor = (name) => `var(--system-part-${variableFor(name)}, var(--system-part-other))`
