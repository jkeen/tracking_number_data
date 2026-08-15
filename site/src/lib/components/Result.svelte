<script>
  import Badge from "$lib/components/Badge.svelte"
  import PartsTable from "$lib/components/PartsTable.svelte"
  import Source from "$lib/components/Source.svelte"
  import { describeMissingChecksum, describeRequirements } from "$lib/format.js"
  import { pathFor } from "$lib/paths.js"

  /** @type {{ match: import("../lib/shapes.js").Match, joined?: boolean }} */
  let { match, joined = false, showFields = true } = $props()

  const courier = $derived(match.sections["Courier"])

  // Most formats carry the check digit last, but not all: an ASTRA barcode keeps four
  // more characters after it, so a near miss there has to say where the digit sits
  // rather than claim the number ends in it.
  const checkDigit = $derived(match.parts.find((part) => part.name === "CheckDigit"))
  const checkDigitIsLast = $derived(!checkDigit || checkDigit.end === match.number.length)

  const elsewhere = $derived(
    [
      ["Track this package", match.trackingUrl],
      ["Courier website", courier?.courier_url],
    ].filter(([, href]) => href)
  )
</script>

<article
  class:card={!joined}
  class:pane={joined}
  class:valid={match.valid}
  class:near-miss={!match.valid}
>
  <header>
    <div>
      <h2>{match.courierName}</h2>
      <p class="type">
        <a href={pathFor.format(match.definition.key)}>{match.definition.name}</a>
      </p>
    </div>
    <p class="badges">
      <Badge tone={match.valid ? "good" : ""}>
        Pattern matched
        {#snippet evidence()}<code>{match.definition.pattern}</code>{/snippet}
      </Badge>

      {#if match.checksumValid === true}
        <Badge tone="good">Check digit verified</Badge>
      {:else if match.checksumValid === false}
        <Badge tone="bad">Check digit failed</Badge>
      {:else}
        <Badge tone="warn" hint={describeMissingChecksum(match.definition)}>No check digit</Badge>
      {/if}
    </p>
  </header>

  {#if describeRequirements(match.definition.spec.validation)}
    <p class="matched"><span class="also">{describeRequirements(match.definition.spec.validation)}</span></p>
  {/if}

  {#if match.checksumValid === false}
    <p class="explain">
      The pattern fits, but the check digit does not:
      {#if checkDigitIsLast}the number ends in{:else}position {checkDigit.start + 1} holds{/if}
      <code>{match.checkDigit}</code>
      where the check over its serial comes to <code>{match.expectedCheckDigit}</code>.
    </p>
  {/if}

  {#if showFields}
    <PartsTable {match} />
  {/if}

  <Source definition={match.definition} />

  {#if elsewhere.length}
    <footer>
      {#each elsewhere as [label, href], index}
        <a class:button={index === 0} href={href} rel="noopener">{label}</a>
      {/each}
    </footer>
  {/if}
</article>
