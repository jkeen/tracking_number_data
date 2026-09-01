const variableFor = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

export const colorFor = (name) => `var(--system-part-${variableFor(name)}, var(--system-part-other))`
