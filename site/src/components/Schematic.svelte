<script>
  import Breakdown from "./Breakdown.svelte"
  import Ruler from "./Ruler.svelte"
  import { fitSize } from "../lib/fit.js"
  import { place } from "../lib/layout.js"

  /** @type {{ template: { text: string, parts: any[] } }} */
  let { template } = $props()

  const REFERENCE = 100
  const SAMPLE = "0000000000"
  const MIN = 14
  const MAX = 44

  let frame = $state(null)
  let sizer = $state(null)
  let size = $state(28)
  let advance = $state(0)
  let gap = $state(0)

  $effect(() => {
    if (!frame || !sizer) return

    const fit = () => {
      size = fitSize({
        frame, sizer, characters: template.text.length,
        reference: REFERENCE, sample: SAMPLE, min: MIN, max: MAX,
      })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => observer.disconnect()
  })

  const placed = $derived(place(template.parts, { advance, gap }))
</script>

<div class="schematic" style="--field-size: {size}px">
  <span class="ruler" bind:this={sizer} aria-hidden="true" style="font-size: {REFERENCE}px">{SAMPLE}</span>

  <div class="frame" bind:this={frame}>
    <Ruler bind:advance bind:gap />
    <p class="shape">{template.text}</p>
  </div>

  <Breakdown {placed} />
</div>

<p class="legend">
  Fixed characters are shown as they are. <code>#</code> stands for any digit,
  <code>A</code> for any letter and <code>X</code> for either. The number after each part is how
  many characters it takes, written as a range with a rule that trails off where the format
  allows more than one width.
</p>

<style>
  /* The format's shape, drawn like a decode but with no number in it. With no field
     around it there is nothing to inset from, so it starts where the text does. */
  .schematic {
    --system-field-pad: 0px;
    margin: 0 0 var(--system-space-6);
  }

  .schematic .frame {
    position: relative;
    padding-inline: var(--system-field-pad);
  }

  .schematic .shape {
    margin: 0;
    font-family: var(--system-font-mono);
    font-size: var(--field-size);
    letter-spacing: var(--system-field-space);
    color: var(--system-color-muted);
  }
</style>
