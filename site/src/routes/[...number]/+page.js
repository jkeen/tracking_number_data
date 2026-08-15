export const prerender = "auto"

// A tracking number is not an address the build can know, so only the empty one — the
// front page — is written out.
export const entries = () => [{ number: "" }]

const LEGACY = /^decode\//

export const load = ({ params }) => ({ number: decodeURIComponent(params.number).replace(LEGACY, "") })
