<script>
  import { onMount } from "svelte"
  import { candidates } from "./lib/engine.js"
  import { definitions } from "./lib/dataset.js"
  import { group } from "./lib/shipments.js"
  import { pathFor, route } from "./lib/router.svelte.js"
  import { follow } from "./lib/links.js"
  import Field from "./components/Field.svelte"
  import Theme from "./components/Theme.svelte"
  import Result from "./components/Result.svelte"
  import Shipment from "./components/Shipment.svelte"
  import Definition from "./components/Definition.svelte"
  import Algorithm from "./components/Algorithm.svelte"
  import Explore from "./components/Explore.svelte"
  import Colophon from "./components/Colophon.svelte"

  const results = $derived(route.number.trim() ? candidates(route.number) : [])
  const shipments = $derived(group(results))
  const accepted = $derived(shipments.filter((shipment) => shipment.matches.some((match) => match.valid)))
  // Only worth folding away once something has actually been identified; when nothing
  // matches, a near miss is the most useful thing on the page.
  const rejected = $derived(accepted.length ? shipments.filter((shipment) => !accepted.includes(shipment)) : [])
  const shown = $derived(accepted.length ? accepted : shipments)
  const best = $derived(results[0])

  onMount(() => route.sync())

  const examples = ["1Z879E930346834440", "RB123456785US", "420112139261290983497923666238"]

  // Formats under the courier that carries them, which is how anyone looking for one
  // would think of it.
  const couriers = $derived.by(() => {
    const carried = new Map()

    for (const definition of definitions) {
      const name = definition.courier.name
      carried.set(name, [...(carried.get(name) ?? []), definition])
    }

    return [...carried].map(([name, formats]) => ({ name, formats }))
  })

  // The page names the format it is showing, so the menu stays a way in rather than a
  // record of where you are.
  const visit = (event) => {
    const key = event.currentTarget.value
    event.currentTarget.value = ""
    if (key) route.show(key)
  }
</script>

<header class="masthead">
  <div>
    <a
      class="wordmark"
      href={import.meta.env.BASE_URL}
      onclick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return
        event.preventDefault()
        route.visit("")
      }}
    ><span class="tracking">tracking</span><span class="number">number</span><span class="tld">.fyi</span></a>
    <p class="lede">
      Decoded in your browser using <a href="https://github.com/jkeen/tracking_number_data">tracking number data</a>. Nothing you type leaves the page. 
    </p>
  </div>

  <div class="masthead-end">
    <nav class="menu">
    <a
      class="menu-link"
      class:is-current={route.view === "decode"}
      href={pathFor.decode("")}
      onclick={follow(() => route.visit(""))}
    >Decode</a> 
    <select class="menu-select" aria-label="Formats" value="" onchange={visit}>
      <option value="">Formats</option>
      {#each couriers as courier (courier.name)}
        <optgroup label={courier.name}>
          {#each courier.formats as definition (definition.key)}
            <option value={definition.key}>{definition.name}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
        <a
      class="menu-link"
      class:is-current={route.view === "algorithm"}
      href={pathFor.algorithm("mod10")}
      onclick={follow(() => route.explain("mod10"))}
    >Algorithms</a>
  </nav>
    <Theme />
  </div>
</header>


{#if route.view === "format"}
  <Definition definitionKey={route.key} />
{:else if route.view === "algorithm"}
  <Algorithm name={route.key} number={route.number} settings={route.settings} />
{:else}
  <Field bind:value={route.number} parts={best?.parts} />

  {#if !route.number.trim()}
    <p class="empty">
      Try
      {#each examples as example, index}
        <button type="button" class="link tracking-number" onclick={() => route.visit(example)}>{example}</button
        >{index < examples.length - 2 ? ", " : index === examples.length - 2 ? ", or " : "."}
      {/each}
    </p>
  {:else if results.length === 0}
    <div class="card unknown">
      <h2>Not recognized</h2>
      <p>No definition matches <code>{route.number}</code>.</p>
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
{/if}

<Explore current={best?.number} />

<Colophon />
