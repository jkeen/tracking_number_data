<script>
  import { clear, highlight, light } from "../lib/highlight.svelte.js"

  /** @type {{ placed: (import("../lib/shapes.js").Match["parts"][number] & {left: number, width: number, color: string})[] }} */
  let { placed } = $props()

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


  // Leaf parts tile the number left to right; each label drops to the first row it
  // fits on, which relies on them being packed in that order.
  const leaves = $derived.by(() => {
    const ends = []

    return placed
      .filter((field) => !field.wraps)
      .sort((a, b) => a.start - b.start)
      .map((field) => {
        const needed = widthOf(field.label) + LABEL_GAP
        const free = ends.findIndex((end) => field.left >= end)
        const row = free === -1 ? ends.length : free

        ends[row] = field.left + needed
        return { ...field, row }
      })
  })

  const wrappers = $derived(placed.filter((field) => field.wraps).sort((a, b) => b.depth - a.depth))
  const rows = $derived(Math.max(1, ...leaves.map((field) => field.row + 1)))
  const dimmed = (name) => highlight.name !== null && highlight.name !== name
</script>

<div class="breakdown" style="--rows: {rows}; --tiers: {wrappers.length}">
  {#each leaves as field (field.name)}
    <span
      class="rule"
      class:dim={dimmed(field.name)}
      class:variable={field.variable}
      style="left: {field.left}px; width: {field.width}px; background: {field.color}; color: {field.color}"
    ></span>
    <span
      class="tag"
      class:dim={dimmed(field.name)}
      style="left: {field.left}px; --row: {field.row}; color: {field.color}"
      bind:this={tags[field.label]}
      onmouseenter={() => light(field.name)}
      onmouseleave={clear}
      role="presentation"
    >{field.label}{#if field.min}<span class="range">{field.variable ? `${field.min}–${field.max}` : field.min}</span>{/if}</span>
  {/each}

  {#each wrappers as field, index (field.name)}
    <span
      class="span"
      class:dim={dimmed(field.name)}
      style="left: {field.left}px; width: {field.width}px; --tier: {index}; border-color: {field.color}"
      onmouseenter={() => light(field.name)}
      onmouseleave={clear}
      role="presentation"
    >
      <span class="span-label" style="color: {field.color}">{field.label}</span>
    </span>
  {/each}
</div>
