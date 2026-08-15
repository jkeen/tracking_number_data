<script>
  import { describeField } from "$lib/glossary.js"
  import Swatch from "$lib/components/Swatch.svelte"
  import Term from "$lib/components/Term.svelte"

  /** @type {{ definition: import("../lib/shapes.js").Definition, name: string, label: string }} */
  let { definition, name, label } = $props()

  const meaning = $derived(describeField(definition, name))
</script>

<Swatch {name} />
{#if meaning}
  <Term {meaning}>{label}</Term>
{:else}
  {label}
{/if}
