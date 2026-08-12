<script>
  import { colorFor } from "../lib/palette.js"

  /** The colour a part keeps across every number it appears in.
   * @type {{ name: string }} */
  let { name } = $props()
</script>

<span class="swatch" style="background: {colorFor(name)}"></span>

<style>
  .swatch {
    display: inline-block;
    width: 0.6rem;
    height: 0.6rem;
    margin-right: var(--system-space-2);
    border-radius: var(--system-radius-sm);
  }
</style>
