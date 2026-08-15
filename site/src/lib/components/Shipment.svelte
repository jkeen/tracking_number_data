<script>
  import Result from "$lib/components/Result.svelte"
  import CheckDigitRow from "$lib/components/CheckDigitRow.svelte"
  import PartLabel from "$lib/components/PartLabel.svelte"
  import { describeChecksum } from "$lib/format.js"
  import { clear, highlight, light } from "$lib/highlight.svelte.js"
  import { noteFor } from "$lib/annotations.js"

  /** @type {{ shipment: { shippers: import("../lib/shapes.js").Match[], carriers: import("../lib/shapes.js").Match[], matches: import("../lib/shapes.js").Match[] } }} */
  let { shipment } = $props()

  const legs = $derived(
    [
      { label: "Shipped by", matches: shipment.shippers },
      { label: "Delivered by", matches: shipment.carriers },
    ].filter((leg) => leg.matches.length)
  )

  // Both halves check the same digits, and usually the same way, so the arithmetic is
  // worth showing once. Where they differ it is worth showing whose is whose.
  const workings = $derived.by(() => {
    const byWorking = new Map()

    for (const match of shipment.matches) {
      const checksum = match.definition.spec.validation?.checksum
      if (!checksum) continue

      const key = `${describeChecksum(checksum)}::${match.serialNumber}`
      byWorking.set(key, [...(byWorking.get(key) ?? []), match])
    }

    return [...byWorking.values()].map((matches) => ({
      match: matches[0],
      whose: byWorking.size > 1 ? matches.map((match) => match.definition.name).join(" and ") : "",
    }))
  })

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

<section class="shipment" class:mod-single={legs.length === 1}>
  {#each legs as leg, index}
    {#if index > 0}
      <div class="shipment-join" aria-hidden="true"><span>→</span></div>
    {/if}

    <div class="shipment-leg">
      <p class="shipment-leg-label">{leg.label}</p>
      {#each leg.matches as match (match.definition.key)}
        <Result {match} joined showFields={false} />
      {/each}
    </div>
  {/each}

  <div class="shipment-shared">
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
                  <span class="shipment-reading">
                    <code>{reading.field?.text ?? "—"}</code>
                    <span class="whose">{reading.match.definition.name}</span>
                  </span>
                {/each}
              {/if}
            </td>
          </tr>
        {/each}

        {#each workings as working (working.match.definition.key)}
          <CheckDigitRow match={working.match} whose={working.whose} />
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>

  /* A partnership is one shipment, so its halves share a single card. Not clipped: every
     part in the table below names itself in a tooltip that has to open past the edge. */
  .shipment {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: stretch;
    margin: var(--system-space-6) 0;
    border: var(--system-border);
  }

  .shipment.mod-single {
    grid-template-columns: 1fr;
  }

  .shipment-leg {
    padding: var(--system-space-5);
    min-width: 0;
  }

  .shipment-leg-label {
    margin: 0 0 var(--system-space-3);
  }

  .shipment-shared {
    grid-column: 1 / -1;
    min-width: 0;
    padding: 0 var(--system-space-5) var(--system-space-5);
  }

  .shipment-join {
    position: relative;
    width: 1px;
    background: var(--system-color-line);
  }

  .shipment-join span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    border: var(--system-border);
    border-radius: var(--system-radius-pill);
    background: var(--system-color-paper);
    color: var(--system-color-muted);
    font-size: var(--system-text-sm);
  }

  /* Where two definitions read the same number differently. */
  .shipment-reading {
    display: inline-flex;
    align-items: baseline;
    gap: var(--system-space-1);
    margin-right: var(--system-space-5);
  }

  @media (max-width: 44rem) {
    .shipment {
      grid-template-columns: 1fr;
    }

    .shipment-leg {
      padding: var(--system-space-4);
    }

    .shipment-shared {
      padding: 0 var(--system-space-4) var(--system-space-4);
    }

    .shipment-join {
      width: auto;
      height: 1px;
      margin: 0 var(--system-space-5);
    }
  }
</style>
