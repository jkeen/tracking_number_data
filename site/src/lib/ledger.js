const within = (part, index) => part && index >= part.start && index < part.end

/** What each character is doing, so the sum can be shown passing over the rest. */
export const rolesIn = (match, serial, length) => {
  const partNamed = (name) => match?.parts.find((part) => part.name === name) ?? null
  // A serial the format rewrites before checking is nowhere in the number as typed.
  const writtenSerial = partNamed("SerialNumber")
  const alignedSerial = writtenSerial?.text === serial ? writtenSerial : null
  const checkDigit = partNamed("CheckDigit")

  const roles = Array.from({ length }, (_, index) => {
    if (!match) return "serial"
    if (within(alignedSerial, index)) return "serial"
    if (within(checkDigit, index)) return "check"
    return "ignored"
  })

  return { roles, offset: alignedSerial ? alignedSerial.start : 0 }
}

/** The runs of one role, for labelling a stretch of columns rather than each of them. */
export const spansIn = (roles, labelled) => {
  const spans = []

  roles.forEach((role, index) => {
    const open = spans[spans.length - 1]
    if (open?.role === role) open.length += 1
    else spans.push({ role, start: index, length: 1 })
  })

  return spans.filter((span) => labelled[span.role])
}
