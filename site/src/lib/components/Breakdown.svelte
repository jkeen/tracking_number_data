<script>
  import { clear, highlight, light } from "$lib/highlight.svelte.js"

  /** @type {{ placed: (import("../lib/shapes.js").Match["parts"][number] & {left: number, width: number, color: string})[] }} */
  let { placed, ready = true } = $props()

  const LABEL_GAP = 12
  const ESTIMATE = 8

  // Guessing label widths packed them into rows they did not fit in, so they are
  // measured once rendered and the packing settles on the second pass.
  let tags = $state({})
  let measured = $state({})

  $effect(() => {
    const widths = Object.fromEntries(
      Object.entries(tags).filter(([, element]) => element).map(([label, element]) => [label, element.offsetWidth])
    )

    if (Object.entries(widths).some(([label, width]) => measured[label] !== width)) measured = widths
  })

  const widthOf = (label) => measured[label] ?? label.length * ESTIMATE

  let width = $state(0)

  // A label is wider than the part it names, so one anchored near the end of the number
  // would sit off the edge. It slides back to the last place it fits and the tick that
  // joins it to its characters takes up the difference.
  const fitted = (left, label) => Math.max(0, Math.min(left, (width || Infinity) - widthOf(label)))

  // Leaf parts tile the number left to right; each label drops to the first row it
  // fits on, which relies on them being packed in that order.
  const leaves = $derived.by(() => {
    const ends = []

    return placed
      .filter((field) => !field.wraps)
      .sort((a, b) => a.start - b.start)
      .map((field) => {
        const at = fitted(field.left, field.label)
        const free = ends.findIndex((end) => at >= end)
        const row = free === -1 ? ends.length : free

        ends[row] = at + widthOf(field.label) + LABEL_GAP
        return { ...field, row, labelLeft: at, tick: field.left - at }
      })
  })

  const wrappers = $derived(
    placed
      .filter((field) => field.wraps)
      .sort((a, b) => b.depth - a.depth)
      .map((field) => {
        const centred = field.left + field.width / 2 - widthOf(field.label) / 2

        return { ...field, labelLeft: fitted(centred, field.label) - field.left }
      })
  )
  const rows = $derived(Math.max(1, ...leaves.map((field) => field.row + 1)))
  const dimmed = (name) => highlight.name !== null && highlight.name !== name
</script>

<div
  class="breakdown"
  class:mod-measuring={!ready}
  bind:clientWidth={width}
  style="--rows: {rows}; --tiers: {wrappers.length}"
>
  {#each leaves as field (field.name)}
    <span
      class="breakdown-rule"
      class:mod-dim={dimmed(field.name)}
      class:mod-variable={field.variable}
      style="left: {field.left}px; width: {field.width}px; background: {field.color}; color: {field.color}"
    ></span>
    <span
      class="breakdown-tag"
      class:mod-dim={dimmed(field.name)}
      style="left: {field.labelLeft}px; --row: {field.row}; --tick: {field.tick}px; color: {field.color}"
      bind:this={tags[field.label]}
      onmouseenter={() => light(field.name)}
      onmouseleave={clear}
      role="presentation"
    >{field.label}{#if field.min}<span class="breakdown-tag-range">{field.variable ? `${field.min}–${field.max}` : field.min}</span>{/if}</span>
  {/each}

  {#each wrappers as field, index (field.name)}
    <span
      class="breakdown-span"
      class:mod-dim={dimmed(field.name)}
      style="left: {field.left}px; width: {field.width}px; --tier: {index}; border-color: {field.color}"
      onmouseenter={() => light(field.name)}
      onmouseleave={clear}
      role="presentation"
    >
      <span
        class="breakdown-span-label"
        style="left: {field.labelLeft}px; color: {field.color}"
        bind:this={tags[field.label]}
      >{field.label}</span>
    </span>
  {/each}
</div>

<style>

  /* Held back until the type has been measured: the rules are placed by character, and
     before that they would all be drawn on top of each other at the left edge. */
  .breakdown.mod-measuring {
    visibility: hidden;
  }

  .breakdown {
    position: relative;
    overflow-x: clip;
    margin: 0 calc(var(--system-field-pad) + 1px);
    height: calc(var(--system-space-4) + var(--rows) * var(--system-breakdown-row-height) + var(--tiers) * var(--system-breakdown-tier-height));
    font-family: var(--system-font-mono);
    font-size: var(--field-size);
    letter-spacing: var(--system-field-space);
  }

  .breakdown-rule {
    position: absolute;
    top: 0;
    height: 3px;
    transition: opacity var(--system-transition-quick);
  }

  /* A part whose width the format lets vary trails off rather than stopping. */
  .breakdown-rule.mod-variable::after {
    content: "";
    position: absolute;
    left: 100%;
    top: 0;
    width: 1.4em;
    height: 100%;
    background: repeating-linear-gradient(to right, currentColor 0 3px, transparent 3px 7px);
    opacity: 0.55;
  }

  .breakdown-tag {
    position: absolute;
    top: calc(0.55rem + var(--row) * var(--system-breakdown-row-height));
    font-family: inherit;
    white-space: nowrap;
    cursor: default;
    transition: opacity var(--system-transition-quick);
  }

  .breakdown-tag::before {
    content: "";
    position: absolute;
    left: var(--tick, 0);
    bottom: 100%;
    height: 0.8rem;
    border-left: 1px solid currentColor;
    opacity: 0.45;
  }

  .breakdown-tag-range {
    margin-left: var(--system-space-1);
    font-size: 0.92em; /* relative to the label it trails */
    opacity: 0.65;
  }

  /* A part that wraps other parts gets a span of its own beneath them. */
  .breakdown-span {
    position: absolute;
    top: calc(var(--system-space-4) + var(--rows) * var(--system-breakdown-row-height) + var(--tier) * var(--system-breakdown-tier-height));
    height: var(--system-space-2);
    border: 2px solid;
    border-top: none;
    opacity: 0.85;
    cursor: default;
    transition: opacity var(--system-transition-quick);
  }

  /* Centred under its span by the measurement that also keeps it inside the number's
     width, so there is nothing left here to centre. */
  .breakdown-span-label {
    position: absolute;
    top: calc(100% + var(--system-space-1));
    font-family: var(--system-font-mono);
    white-space: nowrap;
  }

  .mod-dim {
    opacity: 0.75;
  }
</style>
