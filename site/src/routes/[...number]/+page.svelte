<script>
  import { untrack } from "svelte"
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import { candidates } from "$lib/engine.js"
  import { group } from "$lib/shipments.js"
  import { pathFor } from "$lib/paths.js"
  import Field from "$lib/components/Field.svelte"
  import Result from "$lib/components/Result.svelte"
  import Shipment from "$lib/components/Shipment.svelte"

  let { data } = $props()

  let number = $state(data.number)

  // Only what the path says is worth reacting to, so the field is left alone while it is
  // being typed into. The spaces a number is written with are the typist's, not the
  // number's, so a path that matches the field is not the same as one equal to it.
  const takeNumberFromPath = () => {
    const written = untrack(() => number)

    if (pathFor.decode(data.number) !== pathFor.decode(written)) number = data.number
  }

  // Replacing rather than pushing: an eighteen character number should not leave
  // eighteen entries in the back button. Going through the router rather than the
  // history API, so that coming back to one of these addresses reads the number out of
  // it again instead of restoring an entry that never held one.
  const putNumberInPath = () => {
    const path = pathFor.decode(number)

    if (page.url.pathname !== path) {
      goto(path, { replaceState: true, keepFocus: true, noScroll: true })
    }
  }

  $effect(takeNumberFromPath)
  $effect(putNumberInPath)

  const results = $derived(number.trim() ? candidates(number) : [])
  const shipments = $derived(group(results))
  const accepted = $derived(shipments.filter((shipment) => shipment.matches.some((match) => match.valid)))
  // Only worth folding away once something has actually been identified; when nothing
  // matches, a near miss is the most useful thing on the page.
  const rejected = $derived(accepted.length ? shipments.filter((shipment) => !accepted.includes(shipment)) : [])
  const shown = $derived(accepted.length ? accepted : shipments)
  const best = $derived(results[0])

  const examples = ["1Z879E930346834440", "RB123456785US", "420112139261290983497923666238"]
</script>

<svelte:head>
  <title>{best ? `${best.number} — ${best.courierName}` : "trackingnumber.fyi"}</title>
  <meta
    name="description"
    content="Paste a tracking number and see what every part of it means, decoded in your browser."
  />
</svelte:head>

<Field bind:value={number} parts={best?.parts} />

{#if !number.trim()}
  <p class="empty">
    Try
    {#each examples as example, index}
      <a class="tracking-number" href={pathFor.decode(example)}>{example}</a
      >{index < examples.length - 2 ? ", " : index === examples.length - 2 ? ", or " : "."}
    {/each}
  </p>
{:else if results.length === 0}
  <div class="card unknown">
    <h2>Not recognized</h2>
    <p>No definition matches <code>{number}</code>.</p>
  </div>
{:else}
  {#snippet card(shipment)}
    {#if shipment.partnership}
      <Shipment {shipment} />
    {:else}
      <Result match={shipment.matches[0]} />
    {/if}
  {/snippet}

  {@render card(shown[0])}

  {#if shown.length > 1}
    <section class="alternates">
      <h2>Also matches</h2>
      <p>
        {shown.length === 2 ? "Another format describes" : `${shown.length - 1} other formats describe`}
        these same digits and {shown.length === 2 ? "passes" : "pass"} the same check digit. Nothing in the
        number says which one shipped the package.
      </p>

      {#each shown.slice(1) as shipment (shipment.matches[0].definition.key)}
        {@render card(shipment)}
      {/each}
    </section>
  {/if}

  {#if rejected.length}
    <details class="near-misses">
      <summary>
        {rejected.length}
        {rejected.length === 1 ? "other format matches" : "other formats match"} this shape but
        {rejected.length === 1 ? "rejects" : "reject"} the check digit
      </summary>

      {#each rejected as shipment (shipment.matches[0].definition.key)}
        <Result match={shipment.matches[0]} />
      {/each}
    </details>
  {/if}
{/if}
