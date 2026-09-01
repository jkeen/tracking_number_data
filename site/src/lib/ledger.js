const within = (part, index) => part && index >= part.start && index < part.end

export const rolesIn = (match, serial, length) => {
  const partNamed = (name) => match?.parts.find((part) => part.name === name) ?? null
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
