import { definitions, definitionByKey } from "$lib/dataset.js"

// Every format in the dataset gets a page of its own. An address that names one that is
// not there still has to open, and the page says so itself.
export const prerender = "auto"

export const entries = () =>
  definitions.map((definition) => {
    const [courier, key] = definition.key.split("/")

    return { courier, key }
  })

export const load = ({ params }) => {
  const definitionKey = `${params.courier}/${params.key}`

  return { definitionKey, definition: definitionByKey(definitionKey) }
}
