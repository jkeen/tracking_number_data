/** @import { Match } from "./shapes.js" */

/**
 * Collects matches that describe the same shipment. Two definitions belong together
 * when either names the other as its partner — the naming is not always mutual, since
 * a carrier declaring several possible shippers reports only the first that fits.
 *
 * @param {Match[]} matches
 * @returns {{ partnership: boolean, shippers: Match[], carriers: Match[], matches: Match[] }[]}
 */
export const group = (matches) => {
  const byKey = new Map(matches.map((match) => [match.definition.key, match]))
  const claimed = new Set()
  const shipments = []

  const linkedTo = (match) => {
    const partner = match.partner && byKey.get(match.partner.key)
    const namers = matches.filter((other) => other.partner?.key === match.definition.key)

    return [partner, ...namers].filter((linked) => linked && !claimed.has(linked.definition.key))
  }

  for (const match of matches) {
    if (claimed.has(match.definition.key)) continue

    claimed.add(match.definition.key)

    if (!match.role) {
      shipments.push({ partnership: false, shippers: [], carriers: [], matches: [match] })
      continue
    }

    const members = [match]
    const pending = linkedTo(match)

    while (pending.length) {
      const next = pending.shift()
      if (claimed.has(next.definition.key)) continue

      claimed.add(next.definition.key)
      members.push(next)
      pending.push(...linkedTo(next))
    }

    shipments.push({
      partnership: true,
      shippers: members.filter((member) => member.role === "shipper"),
      carriers: members.filter((member) => member.role === "carrier"),
      matches: members,
    })
  }

  return shipments
}
