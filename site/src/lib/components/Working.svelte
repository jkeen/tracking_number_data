<script>
  import Term from "$lib/components/Term.svelte"

  /** The arithmetic, in columns continuing down from the characters it ran over.
   * @type {{ shown: any, offset?: number, outcome?: string, trailing?: boolean }} */
  let { shown, offset = 0, outcome = "", trailing = false } = $props()

  const weighted = $derived(shown?.shape === "weighted")
  const columnFor = (index) => `grid-column: ${offset + index + 1}`
  const striped = (index) => (offset + index) % 2 === 1
  const isLast = (index) => index === shown.cells.length - 1
  // Straight after the last product rather than after the last column, so the totals stay
  // against the sum they belong to. A ledger that keeps a field at its far end stops short
  // of that one.
  const endColumn = $derived(
    `grid-column: ${offset + (shown?.cells?.length ?? 0) + 1} / ${trailing ? -2 : -1}`
  )

  // Digits count as themselves, so a row of them under themselves says nothing.
  const converted = $derived(shown?.cells?.some((cell) => String(cell.value) !== cell.character))
</script>

{#if shown?.cells}
  {#if converted}
    <div class="ledger-row mod-values">
      {#each shown.cells as cell, index (index)}
        <span
          class="ledger-cell mod-value"
          class:is-striped={striped(index)}
          class:is-last={isLast(index)}
          style={columnFor(index)}
        >
          {cell.value}
        </span>
      {/each}

      <span class="ledger-legend" style={endColumn}>value</span>
    </div>
  {/if}

  {#if weighted}
    <div class="ledger-row mod-multipliers">
      {#each shown.cells as cell, index (index)}
        <span
          class="ledger-cell mod-multiplier"
          class:is-striped={striped(index)}
          class:is-last={isLast(index)}
          style={columnFor(index)}
        >
          {cell.multiplier}
        </span>
      {/each}

      <span class="ledger-legend" style={endColumn}>{shown.factor}</span>
    </div>
  {/if}

  <div class="ledger-row mod-products">
    {#each shown.cells as cell, index (index)}
      <span
        class="ledger-cell mod-product"
        class:mod-added={weighted}
        class:is-striped={striped(index)}
        class:is-last={isLast(index)}
        style={columnFor(index)}
      >
        {weighted ? cell.product : cell.running}
      </span>
    {/each}

    {#if weighted}
      <span class="ledger-total" style={endColumn}>
        =
        <Term meaning="Everything in this row, added together.">{shown.total}</Term>
      </span>
    {:else}
      <span class="ledger-legend" style={endColumn}>running value</span>
    {/if}
  </div>
{/if}

{#if shown}
  {#each shown.steps as step, index (index)}
    <div class="ledger-row mod-step">
      <span class="ledger-step" style={endColumn}>
        {#each step.parts as part}
          {#if part.meaning}
            <Term meaning={part.meaning}>{part.text}</Term>
          {:else}
            <span class="ledger-sign">{part.text}</span>
          {/if}
        {/each}
        <span class="ledger-sign">{step.joiner ?? "="}</span>
        <Term meaning={step.meaning} class="ledger-answer {index === shown.steps.length - 1 ? outcome : ''}">
          {step.value}
        </Term>
      </span>
    </div>
  {/each}
{/if}
