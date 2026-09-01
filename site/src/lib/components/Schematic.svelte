<script>
  import Annotated from "$lib/components/Annotated.svelte"

  /** @type {{ template: { text: string, parts: any[] } }} */
  let { template } = $props()
</script>

<div class="schematic">
  <Annotated text={template.text} parts={template.parts} muted />
</div>

<p class="schematic-legend">
  Fixed characters are shown as they are. <code>#</code> stands for any digit, <code>A</code> for any letter and <code>X</code> for either. 
</p>

<style>
  .schematic {
    margin: 0 0 var(--system-space-6);
  }
</style>
