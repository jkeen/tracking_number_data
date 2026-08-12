import glossary from "../../../glossary.json"
import { describeChecksum, describeSerialRule } from "./format.js"

/**
 * What a part name means, wherever it appears. The dataset carries this rather than the
 * site, so every implementation reading couriers/*.json can say the same thing about a
 * SerialNumber. A definition's own glossary still wins where it has something more exact
 * to say about its own.
 */
export const describe = (name) => glossary[name]?.description ?? null

export const documented = (name) => name in glossary

export const labelIn = (name) => glossary[name]?.label ?? null

// What a format says about one of its own parts. Only descriptions so far, but a format
// that uses a group differently to everyone else can name it differently too.
const said = (definition, name) => definition?.spec?.glossary?.[name]

export const describePart = (definition, name) => said(definition, name)?.description ?? describe(name)

export const labelPart = (definition, name) => said(definition, name)?.label ?? labelIn(name)

/** What the name means generally, plus whatever this format adds about its own part. */
export const describeField = (definition, name) => {
  const validation = definition?.spec?.validation

  const added =
    name === "SerialNumber"
      ? describeSerialRule(validation)
      : name === "CheckDigit"
        ? describeChecksum(validation?.checksum)
        : null

  return [describePart(definition, name), added].filter(Boolean).join(" ")
}
