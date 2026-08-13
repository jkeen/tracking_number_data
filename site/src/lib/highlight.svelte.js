// Hovering a field in a result lights up the part of the number it came from.
export const highlight = $state({ name: null })

export const light = (name) => (highlight.name = name)
export const clear = () => (highlight.name = null)
