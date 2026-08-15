import { redirect } from "@sveltejs/kit"
import { definitions, definitionByKey, renamedFrom } from "$lib/dataset.js"
import { pathFor } from "$lib/paths.js"

// An address naming a format that is not in the dataset still has to open.
export const prerender = "auto"

export const entries = () => {
  const current = definitions.map((definition) => definition.key)

  return [...current, ...Object.keys(renamedFrom)].map((key) => {
    const [courier, format] = key.split("/")

    return { courier, key: format }
  })
}

export const load = ({ params }) => {
  const definitionKey = `${params.courier}/${params.key}`
  const renamed = renamedFrom[definitionKey]

  if (renamed) redirect(308, pathFor.format(renamed))

  return { definitionKey, definition: definitionByKey(definitionKey) }
}
