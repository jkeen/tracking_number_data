<script>
  import { clear, highlight, light } from "../lib/highlight.svelte.js"
  import { noteFor } from "../lib/annotations.js"
  import { labelFor } from "../lib/algorithms.js"
  import { describeVariant } from "../lib/format.js"
  import { pathFor, route } from "../lib/router.svelte.js"
  import { follow } from "../lib/links.js"
  import CheckDigitRow from "./CheckDigitRow.svelte"
  import PartLabel from "./PartLabel.svelte"

  /** @type {{ match: import("../lib/shapes.js").Match }} */
  let { match } = $props()

  const parts = $derived(match.parts)

  const ordered = $derived([...parts].sort((a, b) => a.start - b.start || a.depth - b.depth))

  const checksum = $derived(match.definition.spec.validation?.checksum)


  const rule = $derived(describeVariant(checksum) ? ` checksum (${describeVariant(checksum)})` : " checksum")
</script>

<table class="groups">
  <tbody>
    {#each ordered as field (field.name)}
      {@const note = noteFor(field, match)}
      <tr class:lit={highlight.name === field.name} onmouseenter={() => light(field.name)} onmouseleave={clear}>
        <th>
          <PartLabel definition={match.definition} name={field.name} label={field.label} />
        </th>
        <td>
          <code>{field.text}</code>
          {#if field.name === "CheckDigit" && checksum}
            <span class="note">
              {match.checksumValid ? "Verified with" : "Does not match"}
              <a
                href={pathFor.algorithm(checksum.name, match.number)}
                onclick={follow(() => route.explain(checksum.name, match.number))}
              >
                {labelFor(checksum.name)}
              </a>
              {rule}
            </span>
          {:else if note}
            <span class="note">{note.text}</span>
            {#if note.detail}<span class="detail">{note.detail}</span>{/if}
          {/if}
        </td>
      </tr>

      {#if field.name === "CheckDigit"}
        <CheckDigitRow {match} />
      {/if}
    {/each}
  </tbody>
</table>
