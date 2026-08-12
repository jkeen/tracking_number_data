<script>
  import Result from "./Result.svelte"
  import PartLabel from "./PartLabel.svelte"
  import { clear, highlight, light } from "../lib/highlight.svelte.js"
  import { noteFor } from "../lib/annotations.js"

  /** @type {{ shipment: { shippers: import("../lib/shapes.js").Match[], carriers: import("../lib/shapes.js").Match[], matches: import("../lib/shapes.js").Match[] } }} */
  let { shipment } = $props()

  const legs = $derived(
    [
      { label: "Shipped by", matches: shipment.shippers },
      { label: "Delivered by", matches: shipment.carriers },
    ].filter((leg) => leg.matches.length)
  )

  // Both halves read the same number, so most of their parts agree. Listing them per
  // side duplicated nearly everything; the rows are merged and only genuine
  // disagreements are split, which is where the two definitions get interesting.
  const rows = $derived.by(() => {
    const names = [...new Set(shipment.matches.flatMap((match) => match.parts.map((field) => field.name)))]

    return names
      .map((name) => {
        const readings = shipment.matches.map((match) => ({
          match,
          field: match.parts.find((field) => field.name === name),
        }))
        const values = [...new Set(readings.map(({ field }) => field?.text))]

        const first = readings.find(({ field }) => field).field

        return {
          name,
          label: first.label,
          note: values.length === 1 ? noteFor({ name, text: values[0] }, readings[0].match) : null,
          start: Math.min(...readings.filter(({ field }) => field).map(({ field }) => field.start)),
          depth: first.depth,
          agreed: values.length === 1,
          value: values[0],
          readings,
        }
      })
      .sort((a, b) => a.start - b.start || a.depth - b.depth)
  })
</script>

<section class="shipment" class:single={legs.length === 1}>
  {#each legs as leg, index}
    {#if index > 0}
      <div class="join" aria-hidden="true"><span>→</span></div>
    {/if}

    <div class="leg">
      <p class="leg-label">{leg.label}</p>
      {#each leg.matches as match (match.definition.key)}
        <Result {match} joined showFields={false} />
      {/each}
    </div>
  {/each}

  <div class="shared">
    <table class="groups">
      <tbody>
        {#each rows as row (row.name)}
          <tr
            class:lit={highlight.name === row.name}
            onmouseenter={() => light(row.name)}
            onmouseleave={clear}
          >
            <th>
              <PartLabel definition={row.readings[0].match.definition} name={row.name} label={row.label} />
            </th>
            <td>
              {#if row.agreed}
                <code>{row.value}</code>{#if row.note}<span class="note">{row.note.text}</span
                  >{#if row.note.detail}<span class="detail">{row.note.detail}</span>{/if}{/if}
              {:else}
                {#each row.readings as reading}
                  <span class="reading">
                    <code>{reading.field?.text ?? "—"}</code>
                    <span class="whose">{reading.match.definition.name}</span>
                  </span>
                {/each}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
