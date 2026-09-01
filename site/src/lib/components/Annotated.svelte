<script>
  import Breakdown from "$lib/components/Breakdown.svelte"
  import Ruler from "$lib/components/Ruler.svelte"
  import Sizer from "$lib/components/Sizer.svelte"
  import { measure } from "$lib/measure.svelte.js"
  import { place } from "$lib/layout.js"
  import { positionsIn } from "$lib/segments.js"

  /** @type {{ text: string, parts?: any[], min?: number, max?: number, muted?: boolean }} */
  let { text, parts = [], min = 10, max = 44, muted = false } = $props()

  const type = measure(() => ({ characters: text.length, min, max }))

  const placed = $derived(place(parts, { advance: type.advance, gap: type.gap, positions: positionsIn(text) }))
</script>

<div class="annotated" style="--characters: {text.length}; {type.size ? `--field-size: ${type.size}px` : ''}">
  <Sizer bind:element={type.sizer} />

  <div class="annotated-frame" bind:this={type.frame}>
    <Ruler bind:advance={type.advance} bind:gap={type.gap} />
    <p class="annotated-text" class:mod-muted={muted}>{text}</p>
  </div>

  {#if placed.length}
    <Breakdown {placed} ready={type.advance > 0} />
  {/if}
</div>

<style>
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
