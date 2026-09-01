export const highlight = $state({ name: null })

export const light = (name) => (highlight.name = name)
export const clear = () => (highlight.name = null)
