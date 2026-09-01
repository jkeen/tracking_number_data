<script>
  import Working from "$lib/components/Working.svelte"

  /** @type {{ characters: string[], roles: string[], offset?: number, shown: any,
   *   marks?: {role: string, start: number, length: number}[], labels?: Record<string, string>,
   *   outcome?: string, columns: number, entry?: import("svelte").Snippet }} */
  let {
    characters = [],
    roles = [],
    offset = 0,
    shown,
    marks = [],
    labels = {},
    outcome = "",
    columns,
    trailing = false,
    entry,
  } = $props()

  const LEGIBLE = 15
  const SUM = 112

  let width = $state(0)

  const leadingIgnored = $derived.by(() => {
    let count = 0
    while (roles[count] === "ignored") count += 1
    return count
  })

  const folded = $derived.by(() => {
    if (entry || !width || leadingIgnored < 4) return 0

    const affordable = Math.floor((width - SUM) / LEGIBLE)
    if (columns <= affordable) return 0

    return Math.min(columns - affordable, leadingIgnored - 1)
  })

  const shift = $derived(folded ? folded - 1 : 0)
  const gridColumn = (at) => at - shift + 1
</script>

<div class="ledger" class:mod-trailing={trailing} bind:clientWidth={width}>
  <div class="ledger-grid" style="--columns: {columns - shift}">
    {#if marks.length}
      <div class="ledger-row mod-marks">
        {#each marks as span (span.start)}
          <span
            class="ledger-mark"
            style="grid-column: {span.column ??
              `${Math.max(1, gridColumn(span.start))} / span ${span.length}`}"
          >
            {labels[span.role]}
          </span>
        {/each}
      </div>
    {/if}

    {#if entry}
      {@render entry()}
    {:else}
      <div class="ledger-row mod-entry">
        {#if folded}
          <span class="ledger-digit mod-folded" style="grid-column: 1" title="{folded} more characters the check does not read">…</span>
        {/if}

        {#each characters.slice(folded) as character, index (index)}
          {@const at = index + folded}
          <span
            class="ledger-digit mod-{roles[at] ?? 'spare'} {roles[at] === 'check' ? outcome : ''}"
            class:is-striped={at % 2 === 1}
            style="grid-column: {gridColumn(at)}"
          >
            {character}
          </span>
        {/each}
      </div>
    {/if}

    <Working {shown} offset={offset - shift} {outcome} {trailing} />
  </div>
</div>
