import { colorFor } from "./palette.js"

/**
 * Positions each part against the characters above it. `positions` maps a character of
 * the normalized number to where it sits in the text as written, so a number typed with
 * spaces is annotated in the right places.
 */
export const place = (parts, { advance, gap, positions }) =>
  parts.map((part) => {
    const columnOf = (index) => positions?.[index] ?? index
    const from = columnOf(part.start)
    const through = columnOf(part.end - 1) + 1

    return { ...part, left: from * advance, width: (through - from) * advance - gap, color: colorFor(part.name) }
  })
