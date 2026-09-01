import { colorFor } from "./palette.js"

/** `positions` maps a character of the normalized number to its column in the text as written. */
export const place = (parts, { advance, gap, positions }) =>
  parts.map((part) => {
    const columnOf = (index) => positions?.[index] ?? index
    const from = columnOf(part.start)
    const through = columnOf(part.end - 1) + 1

    return { ...part, left: from * advance, width: (through - from) * advance - gap, color: colorFor(part.name) }
  })
