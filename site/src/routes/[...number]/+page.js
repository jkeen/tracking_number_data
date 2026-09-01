export const prerender = "auto"

export const entries = () => [{ number: "" }]

const LEGACY = /^decode\//

export const load = ({ params }) => ({ number: decodeURIComponent(params.number).replace(LEGACY, "") })
