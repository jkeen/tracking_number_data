<script>
  import Breakdown from "$lib/components/Breakdown.svelte"
  import Ruler from "$lib/components/Ruler.svelte"
  import { fitSize } from "$lib/fit.js"
  import { place } from "$lib/layout.js"
  import { positionsIn } from "$lib/segments.js"

  /** A run of characters with its named parts ruled and labelled underneath.
   * @type {{ text: string, parts?: any[], min?: number, max?: number, muted?: boolean }} */
  let { text, parts = [], min = 10, max = 44, muted = false } = $props()

  const REFERENCE = 100
  const SAMPLE = "0000000000"

  let frame = $state(null)
  let sizer = $state(null)
  let size = $state(null)
  let advance = $state(0)
  let gap = $state(0)

  $effect(() => {
    if (!frame || !sizer) return

    const fit = () => {
      size = fitSize({ frame, sizer, characters: text.length, reference: REFERENCE, sample: SAMPLE, min, max })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => observer.disconnect()
  })

  const placed = $derived(place(parts, { advance, gap, positions: positionsIn(text) }))
</script>

<div class="annotated" style="--characters: {text.length}; {size ? `--field-size: ${size}px` : ''}">
  <span class="rulers" aria-hidden="true">
    <span class="ruler" bind:this={sizer} style="font-size: {REFERENCE}px">{SAMPLE}</span>
  </span>

  <div class="annotated-frame" bind:this={frame}>
    <Ruler bind:advance bind:gap />
    <p class="annotated-text" class:mod-muted={muted}>{text}</p>
  </div>

  {#if placed.length}
    <Breakdown {placed} ready={advance > 0} />
  {/if}
</div>

<style>
  /* Positioned so that it is the rulers' containing block. With no field around it there
     is nothing to inset from, so it starts where the text does. */
  .annotated {
    --system-field-pad: 0px;
    position: relative;
    container-type: inline-size;
  }

  .annotated-frame {
    position: relative;
    padding-inline: var(--system-field-pad);
  }

  .annotated-text {
    margin: 0;
    font-family: var(--system-font-mono);
    font-size: var(--field-size, clamp(10px, calc(100cqi / (var(--characters) * 0.82)), 44px));
    letter-spacing: var(--system-field-space);
    overflow-wrap: anywhere;
  }

  .annotated-text.mod-muted {
    color: var(--system-color-muted);
  }
</style>
