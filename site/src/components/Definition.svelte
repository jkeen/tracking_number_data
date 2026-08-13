<script>
  import { decode } from "../lib/decode.js"
  import { definitionByKey } from "../lib/dataset.js"
  import { describeMissingChecksum, describeRequirements } from "../lib/format.js"
  import { describe, describeField } from "../lib/glossary.js"
  import { labelFor } from "../lib/segments.js"
  import { pathFor, route } from "../lib/router.svelte.js"
  import { labelFor as algorithmLabel } from "../lib/algorithms.js"
  import { follow } from "../lib/links.js"
  import { templateFor } from "../lib/template.js"
  import Schematic from "./Schematic.svelte"
  import Swatch from "./Swatch.svelte"
  import Source from "./Source.svelte"

  /** @type {{ definitionKey: string }} */
  let { definitionKey } = $props()

  const definition = $derived(definitionByKey(definitionKey))
  const template = $derived(definition && templateFor(definition))

  // Every group the pattern names, not just the ones the example number happens to
  // carry: USPS 91's routing prefix and destination are optional, and a page about the
  // format should list them even when the number it drew does not have them.
  // What a part means, said where the part is listed rather than in a separate block
  // of facts above it.
  const algorithm = $derived(definition?.spec.validation?.checksum?.name)

  const parts = $derived(
    (definition?.groupNames ?? []).map((name) => ({
      name,
      label: labelFor(name, definition),
      width: template?.parts.find((field) => field.name === name),
      meaning: describeField(definition, name),
    }))
  )

  const examples = $derived.by(() => {
    if (!definition) return []

    const { valid = [], invalid = [] } = definition.spec.test_numbers ?? {}

    return [
      ...valid.map((number) => ({ number, expected: true })),
      ...invalid.map((number) => ({ number, expected: false })),
    ].map((example) => {
      const match = decode(definition, example.number)

      return { ...example, match, accepted: match?.valid ?? false }
    })
  })

  const disagreements = $derived(examples.filter((example) => example.accepted !== example.expected))
  const lists = $derived([
    { title: "Should be accepted", examples: examples.filter((example) => example.expected) },
    { title: "Should be rejected", examples: examples.filter((example) => !example.expected) },
  ].filter((list) => list.examples.length))

  // Listed twice in the file, which is worth saying out loud rather than hiding.
  const repeated = $derived(
    [...new Set(examples.map((example) => example.number))].filter(
      (number) => examples.filter((example) => example.number === number).length > 1
    )
  )

  const why = (example) => {
    if (!example.match) return "no match for the pattern"
    if (example.match.valid) return "matches, and the check digit is right"
    if (example.match.checksumValid === false) {
      return `check digit is ${example.match.checkDigit}, expected ${example.match.expectedCheckDigit}`
    }

    return "matched but failed a required lookup"
  }

  const pick = (event, number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return

    event.preventDefault()
    route.visit(number)
  }
</script>

{#if !definition}
  <p class="empty">No format called <code>{definitionKey}</code>.</p>
{:else}
  <article class="definition">
    <p class="courier-of">{definition.courier.name}</p>
    <h1>{definition.name}</h1>

    {#if definition.spec.description}
      <p class="says">{definition.spec.description}</p>
    {/if}

    {#if template}
      <Schematic {template} />
    {/if}

    <dl class="format-facts">
      {#if describeMissingChecksum(definition)}
        <div><dt>No Check Digit!</dt><dd>{describeMissingChecksum(definition)}</dd></div>
      {/if}
      {#if describeRequirements(definition.spec.validation)}
        <div><dt>Also</dt><dd>{describeRequirements(definition.spec.validation)}</dd></div>
      {/if}
      {#if definition.id}
        <div>
          <dt>Defined as</dt>
          <dd><code>{definition.id}</code></dd>
        </div>
      {/if}
      <div>
        <dt>Pattern</dt>
        <dd><pre class="pattern">{definition.pattern}</pre></dd>
      </div>
    </dl>

    <h2>Parts</h2>
    <table class="parts-list">
      <tbody>
        {#each parts as part (part.name)}
          <tr>
            <th><Swatch name={part.name} />{part.label}</th>
            <td class="width">
              {#if part.width}{part.width.variable ? `${part.width.min}–${part.width.max}` : part.width.min}{:else}optional{/if}
            </td>
            <td class="meaning" class:undocumented={!part.meaning}>
              {part.meaning ?? "Unknown use."}
              {#if part.name === "CheckDigit" && algorithm}
                <a
                  class="algorithm-link"
                  href={pathFor.algorithm(algorithm, examples[0]?.number.replace(/\s+/g, ""))}
                  onclick={follow(() => route.explain(algorithm, examples[0]?.number.replace(/\s+/g, "")))}
                >How {algorithmLabel(algorithm)} works</a>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <h2>Test numbers</h2>
    <p class="lede">
      Every example the dataset records for this format, run through the decoder.
      {#if disagreements.length}
        <strong>{disagreements.length} disagree with what the dataset expects.</strong>
      {:else}
        All {examples.length} behave as documented.
      {/if}
      {#if repeated.length}
        <span class="repeated">{repeated.join(", ")} appears twice in the file.</span>
      {/if}
    </p>

    <table class="examples">
      <tbody>
        {#each lists as list}
          <tr class="section"><th colspan="3">{list.title}</th></tr>

          {#each list.examples as example, index (`${list.title}-${index}`)}
            <tr class:ok={example.accepted === example.expected} class:bad={example.accepted !== example.expected}>
              <td class="mark">{example.accepted === example.expected ? "✓" : "✗"}</td>
              <td>
                <a class="tracking-number" href={pathFor.decode(example.number)} onclick={(event) => pick(event, example.number)}>
                  {example.number}
                </a>
              </td>
              <td class="why">{why(example)}</td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>

    <Source {definition} />
  </article>
{/if}
