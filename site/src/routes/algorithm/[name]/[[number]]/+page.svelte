<script>
  import { untrack } from "svelte"
  import { browser } from "$app/environment"
  import { page } from "$app/state"
  import { labelFor, usedBy } from "$lib/algorithms.js"
  import Algorithm from "$lib/components/Algorithm.svelte"

  let { data } = $props()

  // The calculator writes to the address, so reading it back as it changes would loop.
  const settings = $derived.by(() => {
    data.name
    data.number
    return browser ? untrack(() => Object.fromEntries(page.url.searchParams)) : {}
  })

  const label = $derived(labelFor(data.name))
  const summary = $derived(
    `How the ${label} check digit is worked out, step by step, on a calculator you can change — and the ${usedBy(data.name).length} tracking formats that use it.`
  )
</script>

<svelte:head>
  <title>{label} — trackingnumber.fyi</title>
  <meta name="description" content={summary} />
  <meta property="og:title" content="How {label} works" />
  <meta property="og:description" content={summary} />
  <meta property="og:type" content="article" />
</svelte:head>

{#key `${data.name}/${data.number}`}
  <Algorithm name={data.name} number={data.number} {settings} />
{/key}
