import { labelPart } from "./glossary.js"

const namedSpans = (indices) =>
  Object.entries(indices ?? {})
    .filter(([, range]) => range)
    .map(([name, [start, end]]) => ({ name, start, end }))

export const labelFor = (name, definition) =>
  labelPart(definition, name) ?? name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\bId\b/, "ID").replace(/\bZip\b/, "ZIP")

/** Leaves only: UPS wraps shipper, service and package inside SerialNumber. */
export const segmentsFrom = (number, indices, definition) => {
  const spans = namedSpans(indices)

  const leaves = spans
    .filter(
      (span) =>
        !spans.some(
          (other) =>
            other !== span &&
            other.start >= span.start &&
            other.end <= span.end &&
            other.end - other.start < span.end - span.start
        )
    )
    .sort((a, b) => a.start - b.start)

  const segments = []
  let cursor = 0

  for (const leaf of leaves) {
    if (leaf.start < cursor) continue
    if (leaf.start > cursor) segments.push({ text: number.slice(cursor, leaf.start) })

    segments.push({ text: number.slice(leaf.start, leaf.end), name: leaf.name, label: labelFor(leaf.name, definition) })
    cursor = leaf.end
  }

  if (cursor < number.length) segments.push({ text: number.slice(cursor) })

  return segments.filter((segment) => segment.text.length)
}

/** Every named group, wrappers included. */
export const partsFrom = (number, indices, definition) => {
  const spans = namedSpans(indices)

  const contains = (outer, inner) =>
    outer !== inner &&
    outer.start <= inner.start &&
    outer.end >= inner.end &&
    outer.end - outer.start > inner.end - inner.start

  return spans
    .map((span) => ({
      name: span.name,
      label: labelFor(span.name, definition),
      text: number.slice(span.start, span.end),
      start: span.start,
      end: span.end,
      depth: spans.filter((other) => contains(other, span)).length,
      wraps: spans.some((other) => contains(span, other)),
    }))
    .sort((a, b) => a.depth - b.depth || a.start - b.start)
}

export const positionsIn = (value) =>
  [...String(value)].reduce((positions, character, index) => {
    if (!/\s/.test(character)) positions.push(index)
    return positions
  }, [])
