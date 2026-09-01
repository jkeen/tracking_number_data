<script>
  import Breakdown from "$lib/components/Breakdown.svelte"
  import Ruler from "$lib/components/Ruler.svelte"
  import Sizer from "$lib/components/Sizer.svelte"
  import { highlight } from "$lib/highlight.svelte.js"
  import { measure } from "$lib/measure.svelte.js"
  import { place } from "$lib/layout.js"
  import { positionsIn } from "$lib/segments.js"

  /** @type {{ value: string, parts?: import("../lib/shapes.js").Match["parts"] }} */
  let { value = $bindable(), parts = [] } = $props()

  const MIN = 10
  const MAX = 76
  const PLACEHOLDER = "1Z879E930346834440"

  const characters = $derived((value.trim() || PLACEHOLDER).length)

  const type = measure(() => ({ characters, min: MIN, max: MAX }))

  const placed = $derived(place(parts, { advance: type.advance, gap: type.gap, positions: positionsIn(value) }))

  const lit = $derived(placed.find((field) => field.name === highlight.name))
</script>

<div class="field" style="--characters: {characters}; {type.size ? `--field-size: ${type.size}px` : ''}">
  <label class="field-ask" for="number">Decode a tracking number:</label>

  <Sizer bind:element={type.sizer} />

  <div class="field-frame" bind:this={type.frame}>
    <Ruler bind:advance={type.advance} bind:gap={type.gap} />

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
    <Breakdown {placed} ready={type.advance > 0} />
  {/if}
</div>

<style>
  .field {
    position: sticky;
    top: 0;
    z-index: 3;
    margin-top: var(--system-space-5);
    padding-bottom: var(--system-space-3);
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
    container-type: inline-size;
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
    color: var(--system-color-muted);
  }

  input::selection {
    background: color-mix(in oklab, var(--system-color-accent) 35%, transparent);
  }
</style>
