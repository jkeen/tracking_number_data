import { expectedCheckDigit, validates } from "./checksum.js"
import { partsFrom, segmentsFrom } from "./segments.js"

/** @import { Definition, Lookup, Match } from "./shapes.js" */

const CHECKSUM_WEIGHT = 5.0
const LENGTH_WEIGHT = 0.1

export const normalize = (input) => String(input ?? "").replace(/\s+/g, "").toUpperCase()

const withoutWhitespace = (value) => value.replace(/\s/g, "")

/** @param {Lookup[]} lookups */
const lookupFor = (lookups, value) =>
  lookups.find((entry) =>
    entry.matches !== undefined
      ? value === entry.matches
      : entry.matches_regex !== undefined && new RegExp(entry.matches_regex).test(value)
  )

const additionalSections = (definition, groups) => {
  const sections = {}

  for (const additional of definition.spec.additional ?? []) {
    const value = groups[additional.regex_group_name]
    if (value === undefined || !additional.lookup) continue

    const found = lookupFor(additional.lookup, value)
    if (found) sections[additional.name] = found
  }

  return sections
}

const serialNumberFor = (definition, groups) => {
  const raw = groups.SerialNumber ?? ""
  const prepend = definition.spec.validation?.serial_number_format?.prepend_if
  if (!prepend) return raw

  return new RegExp(prepend.matches_regex).test(raw) ? `${prepend.content}${raw}` : raw
}

const conditionsMet = (conditions, groups, every) => {
  const met = (condition) => {
    const value = groups[condition.regex_group_name]
    if (value === undefined) return false
    if (condition.matches !== undefined) return value === condition.matches
    if (condition.matches_regex !== undefined) return new RegExp(condition.matches_regex).test(value)
    return false
  }

  return every ? conditions.every(met) : conditions.some(met)
}

const read = (definition, input) => {
  const number = normalize(input)
  const found = number.match(definition.verify)
  if (!found) return null

  const groups = {}
  for (const [name, value] of Object.entries(found.groups ?? {})) {
    if (value !== undefined) groups[name] = withoutWhitespace(value)
  }

  const checksum = definition.spec.validation?.checksum
  const serialNumber = serialNumberFor(definition, groups)
  const checkDigit = groups.CheckDigit ?? null
  const sections = additionalSections(definition, groups)
  const courier = sections["Courier"]

  const checksumValid = validates(checksum, serialNumber, checkDigit)
  const optionalChecksValid = (definition.spec.validation?.additional?.exists ?? []).every(
    (name) => sections[name] !== undefined
  )
  const trackingUrl = courier?.tracking_url ?? definition.spec.tracking_url

  return {
    definition,
    number,
    groups,
    sections,
    segments: segmentsFrom(number, found.indices?.groups, definition),
    parts: partsFrom(number, found.indices?.groups, definition),
    courierName: courier?.courier ?? definition.courier.name,
    serialNumber,
    checkDigit,
    expectedCheckDigit: expectedCheckDigit(checksum, serialNumber),
    checksumValid,
    optionalChecksValid,
    serviceType: sections["Service Type"]?.name,
    serviceDescription: sections["Service Type"]?.description,
    packageType: sections["Container Type"]?.name,
    destinationZip: groups.DestinationZip,
    shipperId: groups.ShipperId,
    trackingUrl: trackingUrl?.replace("%s", number),
    confidence: (checksum ? CHECKSUM_WEIGHT : 0) + number.length * LENGTH_WEIGHT,
    valid: (checksum ? checksumValid === true : checksumValid !== false) && optionalChecksValid,
  }
}

const findPartner = (definition, reading, wanted) => {
  const entries = (definition.spec.partners ?? []).filter((entry) => !wanted || entry.partner_id === wanted)

  for (const entry of entries) {
    const candidate = definition.siblings.get(entry.partner_id)
    if (!candidate) return null

    if (!read(candidate, reading.number)?.valid) continue

    const { matches_all: all, matches_any: any } = entry.validation ?? {}
    if (all && !conditionsMet(all, reading.groups, true)) continue
    if (any && !conditionsMet(any, reading.groups, false)) continue

    return { definition: candidate, entry }
  }

  return null
}

// A partnership only holds if both definitions name each other for this number.
const partnership = (definition, reading) => {
  const hit = findPartner(definition, reading)
  if (!hit) return null

  const theirs = read(hit.definition, reading.number)
  if (!theirs) return null

  const twin = findPartner(hit.definition, theirs, definition.id)
  if (twin?.definition !== definition) return null

  return { role: twin.entry.partner_type, partner: hit.definition }
}

/**
 * @param {Definition} definition
 * @returns {Match|null}
 */
export const decode = (definition, input) => {
  const reading = read(definition, input)
  if (!reading) return null

  const partners = partnership(definition, reading)

  return { ...reading, role: partners?.role, partner: partners?.partner }
}
