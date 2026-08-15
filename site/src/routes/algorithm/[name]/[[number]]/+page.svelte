<script>
  import { untrack } from "svelte"
  import { page } from "$app/state"
  import { labelFor, usedBy } from "$lib/algorithms.js"
  import Algorithm from "$lib/components/Algorithm.svelte"

  let { data } = $props()

  // The address is where the calculator writes what it is set to, so reading it back as it
  // changes would feed the page its own output. Read once per algorithm opened.
  let settings = $state({})

  $effect(() => {
    data.name
    data.number
    settings = untrack(() => Object.fromEntries(page.url.searchParams))
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

<Algorithm name={data.name} number={data.number} {settings} />
