<script>
  import { REFERENCE, SAMPLE } from "$lib/measure.svelte.js"

  /** @type {{ element?: HTMLElement | null }} */
  let { element = $bindable(null) } = $props()
</script>

<span class="rulers" aria-hidden="true">
  <span class="ruler" bind:this={element} style="font-size: {REFERENCE}px">{SAMPLE}</span>
</span>
