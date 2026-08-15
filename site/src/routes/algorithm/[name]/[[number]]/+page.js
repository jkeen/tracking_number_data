import { inUse } from "$lib/algorithms.js"

export const prerender = "auto"

export const entries = () => inUse().map((name) => ({ name }))

export const load = ({ params }) => ({
  name: params.name,
  number: params.number ? decodeURIComponent(params.number) : "",
})
