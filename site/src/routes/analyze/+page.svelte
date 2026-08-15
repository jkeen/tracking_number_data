<script>
  import { labelFor } from "$lib/algorithms.js"
  import { describeVariant } from "$lib/format.js"
  import Annotated from "$lib/components/Annotated.svelte"
  import Ledger from "$lib/components/Ledger.svelte"
  import { definitions } from "$lib/dataset.js"
  import { decode } from "$lib/decode.js"
  import { columnsOf, findCheckDigit, findNested, numbersIn } from "$lib/discover.js"
  import { pathFor } from "$lib/paths.js"

  const SUMMARY =
    "Paste tracking numbers of a format nobody has written down, and see where a check digit could be hiding and which arithmetic would produce it."

  let pasted = $state("")

  const numbers = $derived(numbersIn(pasted))
  const columns = $derived(columnsOf(numbers))
  const roles = $derived(columns.map((column) => (column.constant ? "fixed" : "varies")))

  const nested = $derived(numbers.length > 1 ? findNested(numbers, definitions, decode) : [])
  // Two orders of magnitude dearer than the search above, so with a known number found it
  // waits to be asked. With nothing found there is nothing else to go on, so it runs.
  let opened = $state(false)
  const sweeping = $derived(numbers.length > 1 && (opened || nested.length === 0))
  const found = $derived(sweeping ? findCheckDigit(numbers) : null)
  const lengths = $derived([...new Set(numbers.map((number) => number.length))])
  const ragged = $derived(numbers.length > 1 && lengths.length > 1)

  // Fits are only worth reading against how many the same search would turn up on numbers
  // with no check digit at all.
  const telling = $derived(found && found.expected > 0 ? found.fits.length / found.expected : 0)

  // What a validating window shows is the run the sum read and the character it checked
  // against. The format's own fields inside that run are the guess, not the finding.
  const CERTAIN = ["SerialNumber", "CheckDigit"]

  const checksumOf = (hit) => hit.definition.spec.validation.checksum

  const inPlace = (hit) =>
    hit.matches[0].parts
      .filter((part) => CERTAIN.includes(part.name))
      .map((part) => ({
        ...part,
        start: part.start + hit.from,
        end: part.end + hit.from,
        wraps: false,
        depth: 0,
      }))

  const constantsOf = ({ name, weightings, ...rest }) => ({
    ...rest,
    ...(weightings ? { weights: weightings.join(",") } : {}),
  })

  const linkTo = (place, config) =>
    pathFor.algorithm(config.name, "", {
      serial: place.parts[0].serial,
      check: place.parts[0].check,
      ...Object.fromEntries(
        Object.entries(constantsOf(config)).map(([key, value]) => [
          { evens_multiplier: "evens", odds_multiplier: "odds" }[key] ?? key,
          String(value),
        ])
      ),
    })
</script>

<svelte:head>
  <title>Analyze an unknown format — trackingnumber.fyi</title>
  <meta name="description" content={SUMMARY} />
  <meta property="og:title" content="Analyze an unknown format" />
  <meta property="og:description" content={SUMMARY} />
</svelte:head>

<section class="analyze">
  <h1>Analyze an unknown format</h1>
  <p class="deck">
    For an unknown format. Paste a few you know are good, and we'll try to figure out their deal.
  </p>

  <label class="analyze-ask" for="numbers">Numbers of the same format, one per line:</label>
  <textarea
    id="numbers"
    class="analyze-numbers"
    rows="6"
    spellcheck="false"
    placeholder={"32971514560102447849175802862014\n32971510360102447848540980802018\n32971508360102447847941133172013"}
    bind:value={pasted}
  ></textarea>

  {#if numbers.length === 1}
    <p class="empty">One number proves nothing. Add more.</p>
  {:else if ragged}
    <p class="empty">
      These are {lengths.sort((one, other) => one - other).join(" and ")} characters long. Paste one format at a time.
    </p>
  {:else if numbers.length > 1}
    <h2>What holds still</h2>
    <p class="legend">
      A character that never changes is a fixed field, not something the check digit reads.
    </p>
    <Ledger characters={columns.map((column) => column.shown)} {roles} columns={columns.length} />

    {#if nested.length}
      <h2>Numbers we already know, inside these</h2>
      <p class="legend">
        Each of these contains a shorter number this site already knows. Only its serial and check digit are marked. Whether the rest of that format fits is still a guess.
      </p>

      <ul class="analyze-nested">
        {#each nested as hit (`${hit.definition.key}:${hit.from}`)}
          <li>
            <p class="analyze-nested-name">
              <a href={pathFor.format(hit.definition.key)}>{hit.definition.spec.name}</a>
              at positions {hit.from + 1}&ndash;{hit.through}
            </p>

            <p class="analyze-nested-check">
              Checked by
              <a href={pathFor.algorithm(checksumOf(hit).name, hit.matches[0].number)}
                >{labelFor(checksumOf(hit).name)}</a
              >{#if describeVariant(checksumOf(hit))}, {describeVariant(checksumOf(hit))}{/if}
            </p>

            {#each numbers as number (number)}
              <Annotated text={number} parts={inPlace(hit)} />
            {/each}
          </li>
        {/each}
      </ul>
    {/if}

    <details class="analyze-sweep" open={nested.length === 0} ontoggle={(event) => (opened = event.currentTarget.open)}>
      <summary>Try every algorithm against every position</summary>

    {#if found}
    <p class="legend">
      {found.fits.length}
      {found.fits.length === 1 ? "combination explains" : "combinations explain"} all
      {numbers.length} numbers, out of {found.tried.toLocaleString()} tried.
      {#if telling < 3}
        Numbers with no check digit at all would turn up about {Math.round(found.expected)} on their own, so
        this is not yet worth believing. Add more numbers.
      {:else}
        About {Math.round(found.expected)} would turn up by chance, so there is something here — though more
        numbers would settle it.
      {/if}
    </p>

    {#if found.placements.length}
      <table class="analyze-placements">
        <thead>
          <tr>
            <th>Check digit</th>
            <th>Worked out from</th>
            <th>Reads as</th>
            <th>Algorithms that agree</th>
          </tr>
        </thead>
        <tbody>
          {#each found.placements as place (place.at)}
            <tr>
              <td>position {place.at + 1}</td>
              <td class="analyze-span">{place.best.shape}</td>
              <td>
                <code>{place.best.parts[0].serial}</code>
                <span class="analyze-check">{place.best.parts[0].check}</span>
              </td>
              <td>
                {#each [...new Map(place.spans.flatMap((span) => span.configs).map((config) => [labelFor(config.name), config])).values()] as config, index}
                  {index ? ", " : ""}<a href={linkTo(place.best, config)}>{labelFor(config.name)}</a>
                {/each}
                <span class="analyze-count">{place.settings} of {place.spans.length > 1 ? `${place.spans.length} spans` : "1 span"}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="empty">
        Nothing here works out. The check digit may read the number in a way this page does not try, or there
        may not be one.
      </p>
    {/if}
    {/if}
    </details>
  {/if}
</section>

<style>
  .analyze {
    margin-bottom: var(--system-space-7);
  }

  .analyze-ask {
    display: block;
    margin-bottom: var(--system-space-1);
    font-size: var(--system-text-md);
    color: var(--system-color-muted);
  }

  .analyze-numbers {
    width: 100%;
    padding: var(--system-space-3);
    border: var(--system-border);
    background: var(--system-color-fade);
    color: var(--system-color-ink);
    font-family: var(--system-font-mono);
    font-size: var(--system-text-md);
    line-height: 1.6;
    resize: vertical;
  }

  .analyze-numbers:focus {
    outline: none;
    border-color: var(--system-color-accent);
    background: var(--system-color-paper);
  }

  .analyze-sweep {
    margin-top: var(--system-space-6);
  }

  .analyze-sweep summary {
    font-size: var(--system-text-sm);
    color: var(--system-color-muted);
    cursor: pointer;
  }

  .analyze-nested {
    margin: var(--system-space-3) 0 var(--system-space-6);
    padding: 0;
    list-style: none;
  }

  .analyze-nested li {
    padding: var(--system-space-4) 0;
    border-bottom: var(--system-border);
  }

  /* The sweep below draws its own line, and two together read as a mistake. */
  .analyze-nested li:last-child {
    border-bottom: none;
  }

  .analyze-nested-name {
    margin: 0;
    font-size: var(--system-text-md);
  }

  .analyze-nested-check {
    margin: var(--system-space-1) 0 var(--system-space-5);
    font-size: var(--system-text-sm);
    color: var(--system-color-muted);
  }

  .analyze-nested :global(.annotated) {
    margin-bottom: var(--system-space-5);
  }

  .analyze-placements {
    margin-top: var(--system-space-3);
  }

  .analyze-span {
    color: var(--system-color-muted);
  }

  .analyze-check {
    padding: 0 var(--system-space-1);
    border-radius: var(--system-radius-sm);
    background: var(--system-color-good-fade);
    color: var(--system-color-good);
    font-family: var(--system-font-mono);
  }

  .analyze-count {
    margin-left: var(--system-space-2);
    font-size: var(--system-text-xs);
    color: var(--system-color-muted);
  }

  @media (max-width: 32rem) {
    .analyze-placements :global(th:nth-child(2)),
    .analyze-placements :global(td:nth-child(2)) {
      display: none;
    }
  }
</style>
