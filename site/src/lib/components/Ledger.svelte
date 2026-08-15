<script>
  import Working from "$lib/components/Working.svelte"

  /** The number in columns, with the arithmetic continuing down from the characters it
   * ran over. Pass `entry` to make those characters editable.
   * @type {{ characters: string[], roles: string[], offset?: number, shown: any,
   *   marks?: {role: string, start: number, length: number}[], labels?: Record<string, string>,
   *   outcome?: string, columns: number, caption?: string, entry?: import("svelte").Snippet }} */
  let {
    characters = [],
    roles = [],
    offset = 0,
    shown,
    marks = [],
    labels = {},
    outcome = "",
    columns,
    caption = "",
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

  // The characters the sum passed over are worth showing, but not at the price of the
  // ones it added up. Past what fits, the run in front is folded into one cell.
  const folded = $derived.by(() => {
    if (entry || !width || leadingIgnored < 4) return 0

    const affordable = Math.floor((width - SUM) / LEGIBLE)
    if (columns <= affordable) return 0

    return Math.min(columns - affordable, leadingIgnored - 1)
  })

  const shownCharacters = $derived(characters.slice(folded))
  const shownRoles = $derived(roles.slice(folded))
  const columnOf = (index) => index + (folded ? 2 : 1)
</script>

<div class="ledger" class:mod-trailing={trailing} bind:clientWidth={width}>
  <div class="ledger-grid" style="--columns: {columns - folded + (folded ? 1 : 0)}">
    {#if marks.length}
      <div class="ledger-row mod-marks">
        {#each marks as span (span.start)}
          <span
            class="ledger-mark"
            style="grid-column: {span.column ??
              `${Math.max(1, span.start - folded + (folded ? 2 : 1))} / span ${span.length}`}"
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

        {#each shownCharacters as character, index (index)}
          <span
            class="ledger-digit mod-{shownRoles[index] ?? 'spare'} {shownRoles[index] === 'check' ? outcome : ''}"
            class:is-striped={(index + folded) % 2 === 1}
            style="grid-column: {columnOf(index)}"
          >
            {character}
          </span>
        {/each}
      </div>
    {/if}

    <Working {shown} offset={offset - folded + (folded ? 1 : 0)} {outcome} {trailing} />
  </div>
</div>

{#if caption}
  <p class="ledger-caption">{caption}</p>
{/if}
