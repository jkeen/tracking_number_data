<script>
  import Breakdown from "./Breakdown.svelte"
  import Ruler from "./Ruler.svelte"
  import { highlight } from "../lib/highlight.svelte.js"
  import { fitSize } from "../lib/fit.js"
  import { place } from "../lib/layout.js"
  import { positionsIn } from "../lib/segments.js"

  /** @type {{ value: string, parts?: import("../lib/shapes.js").Match["parts"] }} */
  let { value = $bindable(), parts = [] } = $props()

  const REFERENCE = 100
  const SAMPLE = "0000000000"
  const MIN = 18
  const MAX = 76
  const PLACEHOLDER = "1Z879E930346834440"

  let frame = $state(null)
  let sizer = $state(null)

  let size = $state(32)
  let advance = $state(0)
  let gap = $state(0)

  const characters = $derived((value.trim() || PLACEHOLDER).length)

  $effect(() => {
    if (!frame || !sizer) return

    const fit = () => {
      size = fitSize({ frame, sizer, characters, reference: REFERENCE, sample: SAMPLE, min: MIN, max: MAX })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => observer.disconnect()
  })

  const placed = $derived(place(parts, { advance, gap, positions: positionsIn(value) }))

  const lit = $derived(placed.find((field) => field.name === highlight.name))
</script>

<div class="field" style="--field-size: {size}px">
  <label class="ask" for="number">Decode a tracking number:</label>

  <span class="ruler" bind:this={sizer} aria-hidden="true" style="font-size: {REFERENCE}px">{SAMPLE}</span>

  <div class="frame" bind:this={frame}>
    <Ruler bind:advance bind:gap />

    {#if lit}
      <span
        class="glow"
        style="left: calc(var(--system-field-pad) + {lit.left}px); width: {lit.width}px; background: {lit.color}"
      ></span>
    {/if}

    <input
      id="number"
      bind:value
      placeholder={PLACEHOLDER}
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
    />
  </div>

  {#if placed.length}
    <Breakdown {placed} />
  {/if}
</div>
