<script>
  import Breakdown from "$lib/components/Breakdown.svelte"
  import Ruler from "$lib/components/Ruler.svelte"
  import { highlight } from "$lib/highlight.svelte.js"
  import { fitSize } from "$lib/fit.js"
  import { place } from "$lib/layout.js"
  import { positionsIn } from "$lib/segments.js"

  /** @type {{ value: string, parts?: import("../lib/shapes.js").Match["parts"] }} */
  let { value = $bindable(), parts = [] } = $props()

  const REFERENCE = 100
  const SAMPLE = "0000000000"
  const MIN = 10
  const MAX = 76
  const PLACEHOLDER = "1Z879E930346834440"

  let frame = $state(null)
  let sizer = $state(null)

  let size = $state(null)
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

<div class="field" style="--characters: {characters}; {size ? `--field-size: ${size}px` : ''}">
  <label class="field-ask" for="number">Decode a tracking number:</label>

  <span class="rulers" aria-hidden="true">
    <span class="ruler" bind:this={sizer} style="font-size: {REFERENCE}px">{SAMPLE}</span>
  </span>

  <div class="field-frame" bind:this={frame}>
    <Ruler bind:advance bind:gap />

    {#if lit}
      <span
        class="field-glow"
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
    <Breakdown {placed} ready={advance > 0} />
  {/if}
</div>

<style>

  /* The number stays put while you read what was read out of it. */
  .field {
    position: sticky;
    top: 0;
    z-index: 3;
    margin-top: var(--system-space-5);
    padding-bottom: var(--system-space-3);
    /* border-bottom: var(--system-border); */
    background: var(--system-color-paper);
  }

  .field-ask {
    display: block;
    margin-bottom: var(--system-space-1);
    font-size: var(--system-text-md);
    color: var(--system-color-muted);
  }

  .field-frame {
    position: relative;
    padding: var(--system-space-2) var(--system-field-pad);
    border: var(--system-border);
    background: var(--system-color-fade);
    transition: border-color var(--system-transition-quick), background var(--system-transition-quick);
  }

  .field-frame:focus-within {
    border-color: var(--system-color-accent);
    background: var(--system-color-paper);
  }

  .field-glow {
    position: absolute;
    top: 0;
    bottom: 0;
    opacity: 0.3;
    pointer-events: none;
  }

  /* Sized from the room and the count before any of it is measured, so the number is
     set right in the first frame the server's HTML paints rather than after. */
  .field-frame {
    container-type: inline-size;
  }

  input {
    width: 100%;
    padding: var(--system-space-2) 0;
    border: none;
    background: none;
    color: var(--system-color-ink);
    font-family: var(--system-font-mono);
    font-size: var(--field-size, clamp(10px, calc(100cqi / (var(--characters) * 0.82)), 76px));
    line-height: 1.2;
    letter-spacing: var(--system-field-space);
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: var(--system-color-line);
  }

  input::selection {
    background: color-mix(in oklab, var(--system-color-accent) 35%, transparent);
  }
</style>
