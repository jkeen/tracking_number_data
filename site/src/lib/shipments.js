/** @import { Match } from "./shapes.js" */

/**
 * Collects matches that describe the same shipment. A definition listing several possible
 * partners takes the first whose conditions hold, so the pairing is whichever one both
 * halves chose. Another format claiming the same partner is a rival reading of the same
 * digits rather than a third leg of the journey, and is left to stand on its own.
 *
 * @param {Match[]} matches
 * @returns {{ partnership: boolean, shippers: Match[], carriers: Match[], matches: Match[] }[]}
 */
export const group = (matches) => {
  const byKey = new Map(matches.map((match) => [match.definition.key, match]))
  const claimed = new Set()
  const shipments = []

  const linkedTo = (match) => {
    const chosen = match.partner && byKey.get(match.partner.key)
    const agreed = chosen?.partner?.key === match.definition.key ? chosen : null

    return [agreed].filter((linked) => linked && !claimed.has(linked.definition.key))
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

    // A shipper whose partner went to someone else is just a match, not half a journey.
    shipments.push({
      partnership: members.length > 1,
      shippers: members.filter((member) => member.role === "shipper"),
      carriers: members.filter((member) => member.role === "carrier"),
      matches: members,
    })
  }

  return shipments
}
