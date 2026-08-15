<script>
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import { base } from "$app/paths"
  import { definitions } from "$lib/dataset.js"
  import { pathFor } from "$lib/paths.js"
  import Theme from "$lib/components/Theme.svelte"
  import Repository from "$lib/components/Repository.svelte"
  import Explore from "$lib/components/Explore.svelte"
  import Colophon from "$lib/components/Colophon.svelte"
  import "../app.css"

  let { children } = $props()

  const section = $derived(page.url.pathname.slice(base.length))
  const decoding = $derived(!section.startsWith("/format/") && !section.startsWith("/algorithm/"))

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
    if (key) goto(pathFor.format(key))
  }
</script>

<header class="masthead">
  <a class="wordmark" href={base || "/"}
    ><span class="wordmark-tracking">tracking</span><span class="wordmark-number">number</span><span class="wordmark-tld">.fyi</span></a
  >

  <nav class="menu">
    <a class="menu-link" class:is-current={decoding} href={pathFor.decode("")}>Decode</a>
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
      class:is-current={section.startsWith("/algorithm/")}
      href={pathFor.algorithm("mod10")}>Algorithms</a
    >
  </nav>

  <div class="masthead-tools">
    <Repository />
    <Theme />
  </div>

  <p class="lede">
    Decoded in your browser using <a href="https://github.com/jkeen/tracking_number_data">tracking number data</a>. Nothing you type leaves the page.
  </p>
</header>

{@render children()}

<Explore />

<Colophon />

<style>
  /* Columns rather than a wrapping row, so the toggles keep the top right corner at every
     width and only the wordmark gives up room. The menu and the toggles share the
     wordmark's line; the lede has the row below. */
  .masthead {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    column-gap: var(--system-space-4);
    margin-bottom: var(--system-space-7);
  }

  /* Eighteen characters set solid: at a fixed size this is what decides how narrow the
     masthead can get, and it is wider than a phone. It gives up size rather than room. */
  .wordmark {
    grid-column: 1;
    grid-row: 1;
    display: inline-block;
    justify-self: start;
    min-width: 0;
    margin: 0;
    font-size: clamp(1.25rem, 6.6vw, var(--system-text-2xl));
    letter-spacing: 0.02em;
    text-transform: lowercase;
    text-decoration: none;
  }

  .wordmark-tracking,
  .wordmark-number {
    font-weight: 600;
  }

  .wordmark-tracking,
  .wordmark-tld {
    color: var(--system-color-ink);
  }

  .wordmark-number {
    color: var(--system-color-muted);
  }

  .masthead-tools {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: var(--system-space-3);
  }

  .masthead :global(.lede) {
    grid-column: 1 / -1;
    grid-row: 2;
    margin: var(--system-space-1) 0 0;
  }

  .menu {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: var(--system-space-4);
  }

  .menu-link {
    color: var(--system-color-muted);
    font-size: var(--system-text-md);
    text-decoration: none;
  }

  .menu-link:hover {
    color: var(--system-color-accent);
  }

  .menu-link.is-current {
    color: var(--system-color-ink);
    font-weight: 500;
  }

  /* Sized to its placeholder rather than to the longest courier in the list. */
  .menu-select {
    width: 5.5rem;
    padding: 0;
    border: none;
    background: none;
    color: var(--system-color-muted);
    font: inherit;
    font-size: var(--system-text-md);
    cursor: pointer;
  }

  .menu-select:hover {
    color: var(--system-color-accent);
  }

  .menu-select:focus-visible {
    outline: 2px solid var(--system-color-accent);
    outline-offset: 2px;
  }

  /* A select is as wide as its widest option unless the browser is asked to fit the text,
     so the fixed width above is what everywhere else falls back to. */
  @supports (field-sizing: content) {
    .menu-select {
      width: auto;
      field-sizing: content;
    }
  }

  @media (max-width: 44rem) {
    .menu {
      grid-column: 1 / -1;
      grid-row: 3;
      justify-content: space-between;
      margin-top: var(--system-space-3);
      padding-top: var(--system-space-3);
      border-top: var(--system-border);
    }
  }
</style>
