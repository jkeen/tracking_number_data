import glossary from "../../../glossary.json"
import { describeChecksum, describeSerialRule } from "./format.js"

/** Carried by the dataset, so every implementation reading couriers/*.json says the same thing. */
export const describe = (name) => glossary[name]?.description ?? null

export const labelIn = (name) => glossary[name]?.label ?? null

const said = (definition, name) => definition?.spec?.glossary?.[name]

export const describePart = (definition, name) => said(definition, name)?.description ?? describe(name)

export const labelPart = (definition, name) => said(definition, name)?.label ?? labelIn(name)

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
