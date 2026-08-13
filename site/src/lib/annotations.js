import { areaFor } from "./places.js"

// A part that feeds a lookup is worth reading back as the thing it looked up.
const lookedUp = (field, match) => {
  const additional = (match?.definition.spec.additional ?? []).find(
    (entry) => entry.regex_group_name === field.name
  )

  return additional ? (match.sections[additional.name] ?? null) : null
}

/** A part said in words as well as characters. @returns {{text: string, detail?: string}|null} */
export const noteFor = (field, match) => {
  if (field.name === "DestinationZip") {
    const area = areaFor(field.text)
    return area ? { text: area } : null
  }

  if (field.name === "CountryCode") {
    const country = match?.sections["Courier"]?.country ?? match?.sections["Country Code"]?.country
    return country ? { text: country } : null
  }

  const section = lookedUp(field, match)
  const text = section?.name ?? section?.courier
  if (!text) return null

  return section.description ? { text, detail: section.description } : { text }
}
